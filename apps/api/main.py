"""
Pose-Booth AI FastAPI Backend
Dual-Profile AI Server:
  - Profile 1 (Edge): Laptop RTX 4050 6GB / CPU, FP16 Autocast, in-memory cache, <8ms inference.
  - Profile 2 (Studio): Desktop RTX 3060 12GB+, multi-person tracking, deep OKS refinement.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from core.engine import YOLOv8PoseEngine
from services.library import pose_library_service
from routers import pose, suggest, score

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("api_main")

# Global engine instance
pose_engine: YOLOv8PoseEngine | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: initializes AI engine and pre-computed vector cache."""
    global pose_engine
    logger.info(f"=== Starting Pose-Booth AI API in [{settings.AI_PROFILE.upper()}] profile ===")
    logger.info(f"Hardware Target: Device={settings.DEVICE} | FP16={settings.USE_FP16}")

    pose_engine = YOLOv8PoseEngine()
    app.state.pose_engine = pose_engine

    # Ensure pose vector cache is loaded
    pose_library_service.load_library()
    app.state.pose_library = pose_library_service

    yield

    logger.info("=== Shutting down Pose-Booth AI API ===")


app = FastAPI(
    title=f"Pose-Booth AI API [{settings.AI_PROFILE.upper()}]",
    description="Dual-Profile AI Pose Estimation & Similarity Scoring Backend",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(pose.router, prefix="/api/pose", tags=["Pose Analysis"])
app.include_router(suggest.router, prefix="/api/pose", tags=["Pose Library"])
app.include_router(score.router, prefix="/api/pose", tags=["Pose Scoring"])


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint displaying active profile and engine status."""
    return {
        "status": "ok",
        "profile": settings.AI_PROFILE,
        "device": settings.DEVICE,
        "fp16_enabled": settings.USE_FP16,
        "engine_ready": pose_engine.is_ready() if pose_engine else False,
        "library_poses_cached": len(pose_library_service.poses),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
