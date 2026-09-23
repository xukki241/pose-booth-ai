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
from pydantic import BaseModel, Field

try:
    import torch
    CUDA_AVAILABLE = torch.cuda.is_available()
    DEVICE_NAME = torch.cuda.get_device_name(0) if CUDA_AVAILABLE else "CPU"
except ImportError:
    CUDA_AVAILABLE = False
    DEVICE_NAME = "CPU"


class Settings(BaseModel):
    # Profile selection: 'edge' (Laptop RTX 4050) vs 'studio' (Desktop RTX 3060)
    AI_PROFILE: Literal["edge", "studio"] = Field(
        default=os.getenv("AI_PROFILE", "edge"),
        description="Active AI pipeline profile: 'edge' for laptop / 'studio' for desktop"
    )

    # Server settings
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = False

    # AI Model Settings
    MODEL_PATH: str = Field(
        default=str(Path(__file__).parent / "yolov8s-pose.pt"),
        description="Path to YOLOv8 pose weights"
    )
    CONF_THRESHOLD: float = 0.45
    IOU_THRESHOLD: float = 0.65

    # Device & Precision config
    DEVICE: str = Field(
        default="cuda:0" if CUDA_AVAILABLE else "cpu",
        description="Inference device: 'cuda:0' or 'cpu'"
    )
    USE_FP16: bool = Field(
        default=CUDA_AVAILABLE,
        description="Enable FP16 half precision for 2x faster inference on RTX GPUs"
    )

    # Profile-specific parameters
    EDGE_MAX_PERSONS: int = 2
    EDGE_IMG_SIZE: int = 640
    EDGE_OKS_SIGMA: float = 0.08

    STUDIO_MAX_PERSONS: int = 6
    STUDIO_IMG_SIZE: int = 640
    STUDIO_OKS_SIGMA: float = 0.05

    # In-memory vector library cache
    POSE_LIBRARY_DIR: str = str(Path(__file__).parent / "data" / "pose_library")


settings = Settings()
