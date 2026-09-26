"""
Pose Analysis Router
POST /api/pose/analyze — analyze pose from base64 image using YOLOv8PoseEngine.
"""
from __future__ import annotations

import base64
import io
import time
import logging
from typing import Any
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from PIL import Image
from services.images import decode_image

router = APIRouter()


class PoseAnalyzeRequest(BaseModel):
    image: str = Field(..., max_length=11_184_850, description="Base64 encoded image (JPEG/PNG)")
    max_persons: int = Field(default=4, ge=1, le=10)


class KeypointResponse(BaseModel):
    x: float
    y: float
    confidence: float
    name: str
    visible: bool


class PersonPoseResponse(BaseModel):
    person_id: int
    keypoints: list[KeypointResponse]
    bbox: list[float] | None
    confidence: float


class PoseAnalyzeResponse(BaseModel):
    persons: list[PersonPoseResponse]
    person_count: int
    processing_time_ms: float
    profile_active: str


@router.post("/analyze", response_model=PoseAnalyzeResponse)
def analyze_pose(request: Request, body: PoseAnalyzeRequest) -> PoseAnalyzeResponse:
    """
    Analyze pose from a base64 encoded image using the active AI engine.
    Supports FP16 hardware acceleration on NVIDIA GPUs.
    """
    engine = request.app.state.pose_engine
    if engine is None or not engine.is_ready():
        raise HTTPException(status_code=503, detail="AI engine not initialized")

    if not body.image:
        raise HTTPException(status_code=400, detail="Image data is required")

    try:
        pil_image = decode_image(body.image)

        start = time.perf_counter()
        persons_raw = engine.predict(pil_image)
        elapsed_ms = (time.perf_counter() - start) * 1000

        persons_raw = persons_raw[: body.max_persons]

        formatted_persons = []
        for p in persons_raw:
            formatted_persons.append(PersonPoseResponse(
                person_id=p["person_id"],
                keypoints=[KeypointResponse(**kp) for kp in p["keypoints"]],
                bbox=p.get("bbox"),
                confidence=p.get("confidence", 0.9),
            ))

        from config import settings
        return PoseAnalyzeResponse(
            persons=formatted_persons,
            person_count=len(formatted_persons),
            processing_time_ms=round(elapsed_ms, 2),
            profile_active=settings.AI_PROFILE,
        )

    except BlockingIOError as e:
        raise HTTPException(status_code=429, detail="AI busy; discard stale frames", headers={"Retry-After": "1"}) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.getLogger(__name__).exception("Pose inference failed")
        raise HTTPException(status_code=503, detail="AI inference unavailable") from e
