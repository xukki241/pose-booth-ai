"""
Pose Suggestion Router
GET /api/pose/suggest — get pose suggestions from the in-memory vector library.
"""
from __future__ import annotations

from typing import Literal
from fastapi import APIRouter, Query
from pydantic import BaseModel

from services.library import pose_library_service

router = APIRouter()


class PoseTemplate(BaseModel):
    id: str
    name: str
    name_vi: str
    category: str
    difficulty: str
    description: str
    keypoints: list[list[float]]


class PoseSuggestResponse(BaseModel):
    poses: list[PoseTemplate]
    total: int


@router.get("/suggest", response_model=PoseSuggestResponse)
async def suggest_poses(
    category: str | None = Query(None, description="Filter by category: portrait, group, dynamic, casual, fun"),
    difficulty: Literal["easy", "medium", "hard"] | None = Query(None),
    limit: int = Query(default=20, ge=1, le=100),
) -> PoseSuggestResponse:
    """Return pose templates from the in-memory pose library."""
    all_poses = pose_library_service.list_poses(category=category, limit=len(pose_library_service.poses))

    if difficulty:
        all_poses = [p for p in all_poses if p.get("difficulty") == difficulty]

    return PoseSuggestResponse(
        poses=[PoseTemplate(**p) for p in all_poses[:limit]],
        total=len(all_poses),
    )
