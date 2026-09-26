"""
Core AI Inference Engine.
Implements BasePoseEngine interface and YOLOv8PoseEngine with CUDA FP16 Autocast,
pre-warming, and normalized 17-keypoint extraction.
"""
from __future__ import annotations

import logging
import time
import threading
from pathlib import Path
from abc import ABC, abstractmethod
from typing import Any

import numpy as np
from PIL import Image
from config import settings

try:
    import torch
    from ultralytics import YOLO
    HAS_TORCH_YOLO = True
except ImportError:
    HAS_TORCH_YOLO = False
    torch = None
    YOLO = None

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
        self.img_size = settings.STUDIO_IMG_SIZE if self.profile == "studio" else settings.EDGE_IMG_SIZE
        self.max_persons = settings.STUDIO_MAX_PERSONS if self.profile == "studio" else settings.EDGE_MAX_PERSONS
        self._loaded = False
        self._inference_lock = threading.Lock()
        self.fp16_enabled = False
        self.load_error: str | None = None
        self._load_and_warmup()

    def _load_and_warmup(self) -> None:
        if not HAS_TORCH_YOLO:
            self.load_error = "PyTorch/Ultralytics is not installed"
            logger.error(self.load_error)
            return

        if "cuda" in self.device and not torch.cuda.is_available():
            self.load_error = f"CUDA device requested ({self.device}) but torch.cuda.is_available() is false"
            logger.error(self.load_error)
            return

        try:
            start_time = time.perf_counter()
            if not Path(settings.MODEL_PATH).is_file():
                raise FileNotFoundError('Approved local model weights are missing; automatic download is disabled')
            logger.info(f"Loading YOLOv8-pose weights from: {settings.MODEL_PATH}")
            self.model = YOLO(settings.MODEL_PATH)

            # Move to target device
            if "cuda" in self.device and torch.cuda.is_available():
                self.model.to(self.device)

            # Warm-up uses the actual predictor, which owns a separate model copy.
            self._warmup()
            backend = self.model.predictor.model
            self.fp16_enabled = bool(backend.fp16) and next(backend.model.parameters()).dtype == torch.float16
            if self.use_fp16 and 'cuda' in self.device and not self.fp16_enabled:
                raise RuntimeError('FP16 was requested but the inference backend is not FP16')
            load_elapsed = (time.perf_counter() - start_time) * 1000
            logger.info(
                f"YOLOv8-pose loaded successfully in {load_elapsed:.1f}ms "
                f"[{self.profile.upper()} profile | {self.device} | FP16={self.use_fp16}]"
            )
            self._loaded = True
        except Exception as e:
            self.load_error = str(e)
            logger.error(f"Failed to load YOLOv8 model: {e}", exc_info=True)
            self._loaded = False

    def _warmup(self) -> None:
        """Run dummy inference to compile kernels and warm GPU memory."""
        if not self.model:
            return
        dummy_img = np.zeros((self.img_size, self.img_size, 3), dtype=np.uint8)
        self.model(
            dummy_img,
            device=self.device,
            imgsz=self.img_size,
            quantize=16 if self.use_fp16 and "cuda" in self.device else None,
            verbose=False,
        )
        logger.debug("GPU warm-up complete.")

    def is_ready(self) -> bool:
        return self._loaded

    def predict(self, image: Image.Image | np.ndarray) -> list[dict[str, Any]]:
        """
        Run inference on image and return detected persons with normalized keypoints.
        """
        if not self._loaded or not self.model or not HAS_TORCH_YOLO:
            raise RuntimeError(self.load_error or "AI engine is not ready")

        # Ultralytics accepts PIL RGB directly, but interprets NumPy input as BGR.
        # Preserve the PIL object rather than accidentally swapping red and blue.
        source = image

        w, h = image.size if isinstance(image, Image.Image) else (image.shape[1], image.shape[0])

        if not self._inference_lock.acquire(blocking=False):
            raise BlockingIOError("AI engine is busy; submit a newer frame later")
        try:
            return self._predict_locked(source, h, w)
        finally:
            self._inference_lock.release()

    def _predict_locked(self, source, h: int, w: int) -> list[dict[str, Any]]:
        with torch.inference_mode():
            results = self.model(
                source,
                device=self.device,
                conf=settings.CONF_THRESHOLD,
                iou=settings.IOU_THRESHOLD,
                imgsz=self.img_size,
                quantize=16 if self.use_fp16 and "cuda" in self.device else None,
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
        for i, person_kps in enumerate(keypoints_tensor[:self.max_persons]):
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
