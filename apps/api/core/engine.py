"""
Core AI Inference Engine.
Implements BasePoseEngine interface and YOLOv8PoseEngine with CUDA FP16 Autocast,
pre-warming, and normalized 17-keypoint extraction.
"""
from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod
from typing import Any

import numpy as np
from PIL import Image

try:
    import torch
    from ultralytics import YOLO
    HAS_TORCH_YOLO = True
except ImportError:
    HAS_TORCH_YOLO = False
    torch = None
    YOLO = None

from config import settings

logger = logging.getLogger("pose_engine")

COCO_KEYPOINTS = [
    "nose", "left_eye", "right_eye", "left_ear", "right_ear",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_hip", "right_hip",
    "left_knee", "right_knee", "left_ankle", "right_ankle"
]


class BasePoseEngine(ABC):
    """Abstract interface for pluggable Pose Estimation models."""

    @abstractmethod
    def predict(self, image: Image.Image | np.ndarray) -> list[dict[str, Any]]:
        """Extract detected persons and their keypoints from input image."""
        pass

    @abstractmethod
    def is_ready(self) -> bool:
        """Check if model is loaded and ready for inference."""
        pass


class YOLOv8PoseEngine(BasePoseEngine):
    """
    Optimized YOLOv8-Pose engine.
    Applies FP16 half precision on NVIDIA RTX GPUs, automated warm-up tensor,
    and profile-based tuning (edge vs studio).
    """

    def __init__(self):
        self.model: Any = None
        self.device = settings.DEVICE
        self.use_fp16 = settings.USE_FP16
        self.profile = settings.AI_PROFILE
        self._loaded = False
        self._load_and_warmup()

    def _load_and_warmup(self) -> None:
        if not HAS_TORCH_YOLO:
            logger.warning("PyTorch/Ultralytics not installed. Falling back to mock engine.")
            self._loaded = True
            return

        try:
            start_time = time.perf_counter()
            logger.info(f"Loading YOLOv8-pose weights from: {settings.MODEL_PATH}")
            self.model = YOLO(settings.MODEL_PATH)

            # Move to target device
            if "cuda" in self.device and torch.cuda.is_available():
                self.model.to(self.device)
                if self.use_fp16:
                    logger.info("Enabling FP16 half-precision on NVIDIA GPU for 2x inference speed.")
                    self.model.model.half()

            # Warm-up with a dummy input tensor so the first real request has 0 initial latency
            self._warmup()
            load_elapsed = (time.perf_counter() - start_time) * 1000
            logger.info(
                f"YOLOv8-pose loaded successfully in {load_elapsed:.1f}ms "
                f"[{self.profile.upper()} profile | {self.device} | FP16={self.use_fp16}]"
            )
            self._loaded = True
        except Exception as e:
            logger.error(f"Failed to load YOLOv8 model: {e}", exc_info=True)
            self._loaded = False

    def _warmup(self) -> None:
        """Run dummy inference to compile kernels and warm GPU memory."""
        if not self.model:
            return
        dummy_img = np.zeros((settings.EDGE_IMG_SIZE, settings.EDGE_IMG_SIZE, 3), dtype=np.uint8)
        try:
            self.model(
                dummy_img,
                device=self.device,
                verbose=False,
            )
            logger.debug("GPU Warm-up complete.")
        except Exception as e:
            logger.debug(f"Warm-up skipped: {e}")

    def is_ready(self) -> bool:
        return self._loaded

    def predict(self, image: Image.Image | np.ndarray) -> list[dict[str, Any]]:
        """
        Run inference on image and return detected persons with normalized keypoints.
        """
        if not self.model or not HAS_TORCH_YOLO:
            return self._mock_prediction()

        if isinstance(image, Image.Image):
            img_np = np.array(image)
        else:
            img_np = image

        h, w = img_np.shape[:2]

        with torch.inference_mode():
            results = self.model(
                img_np,
                device=self.device,
                conf=settings.CONF_THRESHOLD,
                iou=settings.IOU_THRESHOLD,
                verbose=False,
            )

        if not results or len(results) == 0:
            return []

        res = results[0]
        if res.keypoints is None or res.keypoints.data is None:
            return []

        keypoints_tensor = res.keypoints.data.cpu().numpy()
        boxes = res.boxes.xyxy.cpu().numpy() if res.boxes is not None else None
        scores = res.boxes.conf.cpu().numpy() if res.boxes is not None else None

        persons: list[dict[str, Any]] = []
        max_persons = settings.STUDIO_MAX_PERSONS if self.profile == "studio" else settings.EDGE_MAX_PERSONS

        for i, person_kps in enumerate(keypoints_tensor[:max_persons]):
            kps_list = []
            for idx, pt in enumerate(person_kps):
                px, py = float(pt[0]), float(pt[1])
                conf = float(pt[2]) if len(pt) > 2 else 0.8
                # Normalize coordinates to 0..1
                norm_x = px / w if w > 0 else px
                norm_y = py / h if h > 0 else py

                kps_list.append({
                    "name": COCO_KEYPOINTS[idx] if idx < len(COCO_KEYPOINTS) else f"pt_{idx}",
                    "x": round(float(norm_x), 4),
                    "y": round(float(norm_y), 4),
                    "confidence": round(float(conf), 4),
                    "visible": conf > 0.3,
                })

            bbox = None
            if boxes is not None and i < len(boxes):
                b = boxes[i]
                bbox = [round(float(b[0] / w), 4), round(float(b[1] / h), 4),
                        round(float(b[2] / w), 4), round(float(b[3] / h), 4)]

            overall_conf = float(scores[i]) if scores is not None and i < len(scores) else 0.9

            persons.append({
                "person_id": i + 1,
                "confidence": round(overall_conf, 4),
                "bbox": bbox,
                "keypoints": kps_list,
            })

        return persons

    def _mock_prediction(self) -> list[dict[str, Any]]:
        """Mock output when model is unavailable or in test mode."""
        return [{
            "person_id": 1,
            "confidence": 0.95,
            "bbox": [0.2, 0.1, 0.8, 0.9],
            "keypoints": [
                {"name": name, "x": 0.5, "y": 0.1 + (i * 0.05), "confidence": 0.9, "visible": True}
                for i, name in enumerate(COCO_KEYPOINTS)
            ]
        }]
