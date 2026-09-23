"""
Pose Library Service with In-Memory Vector Caching.
Loads and caches pre-computed normalized keypoints for fast retrieval.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import numpy as np

from config import settings

logger = logging.getLogger("pose_library")


class PoseLibraryService:
    """Manages pose templates and pre-computed in-memory numpy coordinate matrices."""

    def __init__(self, data_dir: str | None = None):
        self.data_dir = Path(data_dir or settings.POSE_LIBRARY_DIR)
        self.poses: list[dict[str, Any]] = []
        self._pose_map: dict[str, dict[str, Any]] = {}
        self._vector_cache: dict[str, np.ndarray] = {}
        self.load_library()

    def load_library(self) -> None:
        json_file = self.data_dir / "poses.json"
        if not json_file.exists():
            logger.warning(f"Pose library file not found at {json_file}. Initializing with defaults.")
            self._load_fallback_poses()
            return

        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            self.poses = data.get("poses", [])
            self._pose_map.clear()
            self._vector_cache.clear()

            for p in self.poses:
                pid = p.get("id")
                if pid:
                    self._pose_map[pid] = p
                    kps = p.get("keypoints", [])
                    if kps:
                        self._vector_cache[pid] = np.array(kps, dtype=np.float32)

            logger.info(f"Loaded {len(self.poses)} pose templates into vector cache from {json_file.name}")
        except Exception as e:
            logger.error(f"Error loading pose library: {e}", exc_info=True)
            self._load_fallback_poses()

    def get_pose(self, pose_id: str) -> dict[str, Any] | None:
        return self._pose_map.get(pose_id)

    def get_pose_vector(self, pose_id: str) -> np.ndarray | None:
        return self._vector_cache.get(pose_id)

    def list_poses(self, category: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
        if not category or category == "all":
            return self.poses[:limit]
        return [p for p in self.poses if p.get("category") == category][:limit]

    def _load_fallback_poses(self) -> None:
        fallback = [
            {
                "id": "power_pose",
                "name": "Power Pose",
                "name_vi": "Tư Thế Tự Tin",
                "category": "portrait",
                "difficulty": "easy",
                "description": "Đứng thẳng, hai tay chống hông tự tin.",
                "keypoints": [[0.5, 0.2 + (i * 0.04)] for i in range(17)]
            }
        ]
        self.poses = fallback
        self._pose_map = {p["id"]: p for p in fallback}
        self._vector_cache = {p["id"]: np.array(p["keypoints"], dtype=np.float32) for p in fallback}


# Global singleton instance
pose_library_service = PoseLibraryService()
