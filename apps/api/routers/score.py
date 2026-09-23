"""
Pose Scoring Router
POST /api/pose/score — compute similarity between two poses using vectorized OKS and anatomy similarity.
"""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.scoring import score_pose_pair

router = APIRouter()


class KeypointInput(BaseModel):
    x: float
    y: float
    confidence: float = 1.0


class PoseScoreRequest(BaseModel):
    user_keypoints: list[KeypointInput] = Field(
        ..., min_length=17, max_length=17,
        description="17 COCO keypoints from user's pose"
    )
    target_keypoints: list[KeypointInput] = Field(
        ..., min_length=17, max_length=17,
        description="17 COCO keypoints from reference pose"
    )


class PoseScoreResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    similarity: float  # Normalized 0-1
    oks_score: float
    anatomy_score: float
    match_level: str
    message: str
    feedback: list[str]
    profile_active: str


@router.post("/score", response_model=PoseScoreResponse)
async def score_pose(request: PoseScoreRequest) -> dict[str, Any]:
    """
    Computes pose alignment score using vectorized OKS and anatomy weighting.
    Runs in <0.5ms with in-memory NumPy operations.
    """
    user_kps = [kp.model_dump() for kp in request.user_keypoints]
    target_kps = [kp.model_dump() for kp in request.target_keypoints]

    result = score_pose_pair(user_kps, target_kps)
    result["similarity"] = round(result["score"] / 100.0, 4)

    return result
