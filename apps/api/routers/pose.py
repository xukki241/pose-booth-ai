"""
Pose Analysis Router
POST /api/pose/analyze — analyze pose from image
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

router = APIRouter()


class PoseAnalyzeRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image (JPEG/PNG)")
    max_persons: int = Field(default=4, ge=1, le=10)


class KeypointResponse(BaseModel):
    x: float
    y: float
    confidence: float
    name: str
    visible: bool


class BboxResponse(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class PersonPoseResponse(BaseModel):
    person_id: int
    keypoints: list[KeypointResponse]
    bbox: BboxResponse | None
    overall_confidence: float


class PoseAnalyzeResponse(BaseModel):
    persons: list[PersonPoseResponse]
    person_count: int
    processing_time_ms: float


@router.post("/analyze", response_model=PoseAnalyzeResponse)
async def analyze_pose(request: Request, body: PoseAnalyzeRequest) -> PoseAnalyzeResponse:
    """
    Analyze pose from a base64 encoded image using YOLOv8-Pose.
    Returns keypoints for all detected persons.
    """
    import time

    model = request.app.state.pose_model
    if model is None:
        raise HTTPException(status_code=503, detail="AI model not initialized")

    if not body.image:
        raise HTTPException(status_code=400, detail="Image data is required")

    try:
        start = time.perf_counter()
        persons_raw = model.predict_from_base64(body.image)
        elapsed_ms = (time.perf_counter() - start) * 1000

        # Limit to max_persons
        persons_raw = persons_raw[: body.max_persons]

        return PoseAnalyzeResponse(
            persons=[PersonPoseResponse(**p) for p in persons_raw],
            person_count=len(persons_raw),
            processing_time_ms=round(elapsed_ms, 2),
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
