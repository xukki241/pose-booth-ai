"""
Configuration settings for Pose-Booth AI Backend.
Supports Dual-Profile:
  - 'edge': Optimized for Laptop (RTX 4050 6GB / CPU), FP16 Autocast, low VRAM (<1.5GB), <8ms inference.
  - 'studio': Optimized for Workstation (RTX 3060 12GB+), multi-person tracking, deep OKS refinement.
Zero external settings dependencies — runs with base Pydantic.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field
from dotenv import load_dotenv

API_DIR = Path(__file__).resolve().parent
RUNTIME_DIR = API_DIR / ".runtime"
os.environ.setdefault("YOLO_CONFIG_DIR", str(RUNTIME_DIR / "ultralytics"))
os.environ.setdefault("MPLCONFIGDIR", str(RUNTIME_DIR / "matplotlib"))
os.environ["YOLO_AUTOINSTALL"] = "false"
load_dotenv(API_DIR / ".env")

try:
    import torch
    CUDA_AVAILABLE = torch.cuda.is_available()
    DEVICE_NAME = torch.cuda.get_device_name(0) if CUDA_AVAILABLE else "CPU"
except ImportError:
    CUDA_AVAILABLE = False
    DEVICE_NAME = "CPU"


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ValueError(f"{name} must be a boolean value")


class Settings(BaseModel):
    model_config = ConfigDict(validate_default=True)
    # Profile selection: 'edge' (Laptop RTX 4050) vs 'studio' (Desktop RTX 3060)
    AI_PROFILE: Literal["edge", "studio"] = Field(
        default_factory=lambda: os.getenv("AI_PROFILE", "edge"),
        description="Active AI pipeline profile: 'edge' for laptop / 'studio' for desktop"
    )

    # Server settings
    HOST: str = Field(default_factory=lambda: os.getenv("HOST", "127.0.0.1"))
    PORT: int = Field(default_factory=lambda: int(os.getenv("PORT", "8000")))
    DEBUG: bool = Field(default_factory=lambda: _env_bool("DEBUG", False))

    # AI Model Settings
    MODEL_PATH: str = Field(
        default_factory=lambda: os.getenv(
            "MODEL_PATH",
            str(API_DIR / ("yolov8x-pose.pt" if os.getenv("AI_PROFILE", "edge") == "studio" else "yolov8s-pose.pt")),
        ),
        description="Path to YOLOv8 pose weights"
    )
    CONF_THRESHOLD: float = Field(default_factory=lambda: float(os.getenv("CONF_THRESHOLD", "0.45")), ge=0, le=1)
    IOU_THRESHOLD: float = Field(default_factory=lambda: float(os.getenv("IOU_THRESHOLD", "0.65")), ge=0, le=1)

    # Device & Precision config
    DEVICE: str = Field(
        default_factory=lambda: os.getenv("DEVICE", "cuda:0" if CUDA_AVAILABLE else "cpu"),
        description="Inference device: 'cuda:0' or 'cpu'"
    )
    USE_FP16: bool = Field(
        default_factory=lambda: _env_bool("USE_FP16", CUDA_AVAILABLE),
        description="Enable FP16 half precision for 2x faster inference on RTX GPUs"
    )

    # Profile-specific parameters
    EDGE_MAX_PERSONS: int = Field(default_factory=lambda: int(os.getenv("EDGE_MAX_PERSONS", "2")), ge=1)
    EDGE_IMG_SIZE: int = Field(default_factory=lambda: int(os.getenv("EDGE_IMG_SIZE", "640")), ge=320)
    EDGE_OKS_SIGMA: float = Field(default_factory=lambda: float(os.getenv("EDGE_OKS_SIGMA", "0.08")), gt=0)

    STUDIO_MAX_PERSONS: int = Field(default_factory=lambda: int(os.getenv("STUDIO_MAX_PERSONS", "6")), ge=1)
    STUDIO_IMG_SIZE: int = Field(default_factory=lambda: int(os.getenv("STUDIO_IMG_SIZE", "640")), ge=320)
    STUDIO_OKS_SIGMA: float = Field(default_factory=lambda: float(os.getenv("STUDIO_OKS_SIGMA", "0.05")), gt=0)

    # In-memory vector library cache
    POSE_LIBRARY_DIR: str = Field(
        default_factory=lambda: os.getenv("POSE_LIBRARY_DIR", str(API_DIR / "data" / "pose_library"))
    )
    CORS_ORIGINS: list[str] = Field(
        default_factory=lambda: [
            origin.strip()
            for origin in os.getenv(
                "CORS_ORIGINS",
                "http://localhost:3000,http://127.0.0.1:3000",
            ).split(",")
            if origin.strip()
        ]
    )


settings = Settings()
