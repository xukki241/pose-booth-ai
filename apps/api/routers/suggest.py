"""
Pose Suggestion Router
GET /api/pose/suggest — get pose suggestions from library
"""
import json
from pathlib import Path
from typing import Literal
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()

# Load pose library once at module load
POSE_LIBRARY_PATH = Path(__file__).parent.parent / "data" / "pose_library" / "poses.json"
_pose_cache: list[dict] | None = None


def get_pose_library() -> list[dict]:
    global _pose_cache
    if _pose_cache is None:
        if not POSE_LIBRARY_PATH.exists():
            return []
        with open(POSE_LIBRARY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            _pose_cache = data.get("poses", [])
    return _pose_cache


class PoseTemplate(BaseModel):
    id: str
    name: str
    name_vi: str
    category: str
    difficulty: str
    description: str
    keypoints: list[list[float]]  # 17x2 normalized keypoints


class PoseSuggestResponse(BaseModel):
    poses: list[PoseTemplate]
    total: int


@router.get("/suggest", response_model=PoseSuggestResponse)
async def suggest_poses(
    category: str | None = Query(None, description="Filter by category: portrait, group, dynamic, casual"),
    difficulty: Literal["easy", "medium", "hard"] | None = Query(None),
    limit: int = Query(default=10, ge=1, le=50),
) -> PoseSuggestResponse:
    """Return pose templates from the pose library."""
    poses = get_pose_library()

    if category:
        poses = [p for p in poses if p.get("category") == category]
    if difficulty:
        poses = [p for p in poses if p.get("difficulty") == difficulty]

    poses = poses[:limit]

    return PoseSuggestResponse(
        poses=[PoseTemplate(**p) for p in poses],
        total=len(poses),
    )
