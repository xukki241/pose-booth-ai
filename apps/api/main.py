"""
Pose-Booth AI FastAPI Backend
AI Pose Analysis Server — YOLOv8-Pose + Pose Scoring
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import pose, suggest, score
from models.yolov8_pose import PoseModel

load_dotenv()

# Global model instance (loaded once at startup)
pose_model: PoseModel | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load AI model at startup, cleanup at shutdown."""
    global pose_model
    print("[INIT] Loading YOLOv8-Pose model...")
    pose_model = PoseModel(
        model_path=os.getenv("MODEL_PATH", "yolov8s-pose.pt"),
        device=os.getenv("DEVICE", "cuda"),  # Falls back to CPU if no GPU
        conf_threshold=float(os.getenv("CONF_THRESHOLD", "0.5")),
    )
    print(f"[READY] Model loaded on device: {pose_model.device}")
    app.state.pose_model = pose_model
    yield
    print("[SHUTDOWN] Shutting down Pose-Booth API")


app = FastAPI(
    title="Pose-Booth AI API",
    description="AI Pose Analysis Backend for Pose-Booth AI Photobooth",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — restrict to localhost in dev
allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pose.router, prefix="/api/pose", tags=["Pose Analysis"])
app.include_router(suggest.router, prefix="/api/pose", tags=["Pose Suggestions"])
app.include_router(score.router, prefix="/api/pose", tags=["Pose Scoring"])


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {
        "status": "ok",
        "model_loaded": pose_model is not None,
        "device": str(pose_model.device) if pose_model else "not loaded",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
