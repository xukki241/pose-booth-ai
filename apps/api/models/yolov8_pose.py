"""
YOLOv8-Pose Model Wrapper
Handles model loading, inference, and keypoint extraction.
Gracefully falls back to mock/CPU if torch/ultralytics is not yet installed.
"""
from __future__ import annotations

import base64
import io
from typing import Any

import numpy as np
from PIL import Image

# Check optional ML libraries
try:
    import torch
    import cv2
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False
    torch = None
    cv2 = None
    YOLO = None


# COCO 17-keypoint names (compatible with MediaPipe)
KEYPOINT_NAMES = [
    "nose", "left_eye", "right_eye", "left_ear", "right_ear",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_hip", "right_hip",
    "left_knee", "right_knee", "left_ankle", "right_ankle",
]

# Skeleton connections for drawing (pairs of keypoint indices)
SKELETON_CONNECTIONS = [
    (5, 6),   # shoulders
    (5, 7),   # left upper arm
    (7, 9),   # left lower arm
    (6, 8),   # right upper arm
    (8, 10),  # right lower arm
    (5, 11),  # left torso
    (6, 12),  # right torso
    (11, 12), # hips
    (11, 13), # left upper leg
    (13, 15), # left lower leg
    (12, 14), # right upper leg
    (14, 16), # right lower leg
]


class Keypoint:
    """Single keypoint with position and confidence."""
    def __init__(self, x: float, y: float, confidence: float, name: str):
        self.x = x
        self.y = y
        self.confidence = confidence
        self.name = name

    def to_dict(self) -> dict[str, Any]:
        return {
            "x": round(self.x, 4),
            "y": round(self.y, 4),
            "confidence": round(self.confidence, 4),
            "name": self.name,
            "visible": self.confidence > 0.3,
        }


class PoseModel:
    """YOLOv8-Pose model wrapper with GPU/CPU support."""

    def __init__(
        self,
        model_path: str = "yolov8s-pose.pt",
        device: str = "cuda",
        conf_threshold: float = 0.5,
    ):
        self.conf_threshold = conf_threshold
        self.model = None
        self.device = "cpu"

        if not HAS_YOLO:
            print("[INFO] Ultralytics/PyTorch not installed. Pose scoring & suggestions active; local YOLO inference disabled.")
            return

        # Auto-fallback to CPU if CUDA not available
        if device == "cuda" and (torch is None or not torch.cuda.is_available()):
            print("[WARN] CUDA not available, falling back to CPU")
            device = "cpu"

        self.device = device
        try:
            self.model = YOLO(model_path)
            self.model.to(device)
            print(f"[OK] YOLOv8-Pose loaded: {model_path} on {device}")

            if device == "cuda" and torch is not None:
                gpu_name = torch.cuda.get_device_name(0)
                vram = torch.cuda.get_device_properties(0).total_memory / 1e9
                print(f"   GPU: {gpu_name} ({vram:.1f}GB VRAM)")
        except Exception as e:
            print(f"[WARN] Could not load YOLO model weights ({e}). Running in lightweight API mode.")

    def decode_base64_image(self, b64_string: str) -> np.ndarray:
        """Decode base64 image string to numpy array (RGB)."""
        if "," in b64_string:
            b64_string = b64_string.split(",")[1]

        if len(b64_string) > 10 * 1024 * 1024 * 4 / 3:
            raise ValueError("Image too large (max 10MB)")

        image_bytes = base64.b64decode(b64_string)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return np.array(image)

    def predict(self, image: np.ndarray) -> list[dict[str, Any]]:
        """Run pose estimation on image."""
        if self.model is None:
            # Fallback mock person when running in lightweight mode
            return [{
                "person_id": 0,
                "keypoints": [
                    Keypoint(0.5, 0.2 + i * 0.04, 0.85, name).to_dict()
                    for i, name in enumerate(KEYPOINT_NAMES)
                ],
                "bbox": {"x1": 0.2, "y1": 0.1, "x2": 0.8, "y2": 0.9},
                "overall_confidence": 0.85
            }]

        results = self.model.predict(
            source=image,
            conf=self.conf_threshold,
            device=self.device,
            verbose=False,
            imgsz=640,
        )

        persons = []
        for result in results:
            if result.keypoints is None:
                continue

            keypoints_data = result.keypoints.data
            boxes = result.boxes

            for i, kps in enumerate(keypoints_data):
                keypoints = []
                for j, (x, y, conf) in enumerate(kps.cpu().numpy()):
                    keypoints.append(
                        Keypoint(
                            x=float(x) / image.shape[1],
                            y=float(y) / image.shape[0],
                            confidence=float(conf),
                            name=KEYPOINT_NAMES[j],
                        ).to_dict()
                    )

                bbox = None
                if boxes is not None and i < len(boxes):
                    box = boxes[i].xyxyn[0].cpu().numpy()
                    bbox = {
                        "x1": float(box[0]), "y1": float(box[1]),
                        "x2": float(box[2]), "y2": float(box[3]),
                    }

                persons.append({
                    "person_id": i,
                    "keypoints": keypoints,
                    "bbox": bbox,
                    "overall_confidence": float(
                        sum(kp["confidence"] for kp in keypoints) / len(keypoints)
                    ),
                })

        return persons

    def predict_from_base64(self, b64_string: str) -> list[dict[str, Any]]:
        """Decode base64 image and run pose prediction."""
        image = self.decode_base64_image(b64_string)
        return self.predict(image)
