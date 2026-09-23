"""
High-performance Pose Similarity and Scoring Engine.
Vectorized implementation of:
  1. OKS (Object Keypoint Similarity) per COCO specification.
  2. Anatomy-weighted Cosine Similarity on joint angle vectors.
  3. Real-time directional feedback generator.
"""
from __future__ import annotations

from typing import Any
import numpy as np

from config import settings

# Standard COCO per-keypoint standard deviations (sigma)
# Smaller sigma = higher penalty for error (e.g. eyes/nose vs shoulders/hips)
COCO_SIGMAS = np.array([
    0.026, 0.025, 0.025, 0.035, 0.035,  # nose, eyes, ears
    0.079, 0.079,                        # shoulders
    0.072, 0.072,                        # elbows
    0.062, 0.062,                        # wrists
    0.107, 0.107,                        # hips
    0.087, 0.087,                        # knees
    0.089, 0.089                         # ankles
], dtype=np.float32)

# Anatomy weights for artistic pose match (hands, head and shoulders matter most for photography)
ANATOMY_WEIGHTS = np.array([
    1.2, 1.0, 1.0, 0.8, 0.8,  # head/face
    1.4, 1.4,                 # shoulders
    1.5, 1.5,                 # elbows
    1.6, 1.6,                 # wrists/hands
    1.0, 1.0,                 # hips
    1.1, 1.1,                 # knees
    1.1, 1.1                  # ankles
], dtype=np.float32)
ANATOMY_WEIGHTS /= np.sum(ANATOMY_WEIGHTS)

# Joint angle triples for body kinematic analysis: (vertex, pt1, pt2, joint_name)
KINEMATIC_JOINTS = [
    (5, 7, 11, "left_shoulder_angle"),
    (6, 8, 12, "right_shoulder_angle"),
    (7, 5, 9,  "left_elbow_angle"),
    (8, 6, 10, "right_elbow_angle"),
    (11, 5, 13, "left_hip_angle"),
    (12, 6, 14, "right_hip_angle"),
    (13, 11, 15, "left_knee_angle"),
    (14, 12, 16, "right_knee_angle"),
]


class SimilarityScorer:
    """Vectorized pose matching and OKS similarity service."""

    @staticmethod
    def calculate_oks(
        user_coords: np.ndarray,
        target_coords: np.ndarray,
        visibility: np.ndarray | None = None,
        scale: float = 1.0,
    ) -> float:
        """
        Object Keypoint Similarity (OKS) formulation:
        OKS = sum(exp(-d_i^2 / (2 * s^2 * sigma_i^2)) * v_i) / sum(v_i)
        """
        if user_coords.shape != target_coords.shape:
            return 0.0

        num_kps = len(user_coords)
        sigmas = COCO_SIGMAS[:num_kps]
        if visibility is None:
            v = np.ones(num_kps, dtype=np.float32)
        else:
            v = (visibility > 0.3).astype(np.float32)

        if np.sum(v) == 0:
            return 0.0

        # Euclidean distance squared between corresponding keypoints
        d_sq = np.sum((user_coords - target_coords) ** 2, axis=1)

        # Scale factor normalized by person area
        variance = 2.0 * (scale ** 2) * (sigmas ** 2)
        e = d_sq / np.maximum(variance, 1e-6)

        oks = np.sum(np.exp(-e) * v) / np.sum(v)
        return float(np.clip(oks, 0.0, 1.0))

    @staticmethod
    def calculate_anatomy_weighted_score(
        user_coords: np.ndarray,
        target_coords: np.ndarray,
        visibility: np.ndarray | None = None,
    ) -> float:
        """
        Calculates position similarity normalized to torso scale with anatomical weighting.
        """
        num_kps = min(len(user_coords), len(target_coords))
        weights = ANATOMY_WEIGHTS[:num_kps]

        # Calculate bounding box scale of target pose to ensure scale-invariance
        min_pt = np.min(target_coords, axis=0)
        max_pt = np.max(target_coords, axis=0)
        box_size = np.maximum(np.linalg.norm(max_pt - min_pt), 0.1)

        distances = np.linalg.norm(user_coords[:num_kps] - target_coords[:num_kps], axis=1)
        normalized_distances = distances / box_size

        # Exponential decay similarity per joint
        joint_scores = np.exp(-normalized_distances * 2.5)

        if visibility is not None:
            v = (visibility[:num_kps] > 0.3).astype(np.float32)
            denom = np.sum(weights * v)
            if denom > 0:
                weighted_score = np.sum(joint_scores * weights * v) / denom
            else:
                weighted_score = 0.0
        else:
            weighted_score = np.sum(joint_scores * weights)

        return float(np.clip(weighted_score, 0.0, 1.0))

    @staticmethod
    def generate_directional_feedback(
        user_coords: np.ndarray,
        target_coords: np.ndarray,
    ) -> list[str]:
        """
        Analyzes discrepancy between user and target limbs to generate actionable directions.
        """
        feedback: list[str] = []

        if len(user_coords) < 17 or len(target_coords) < 17:
            return ["Di chuyển toàn thân vào giữa khung hình"]

        # Left Wrist / Hand
        lw_diff = user_coords[9] - target_coords[9]
        if abs(lw_diff[1]) > 0.08:
            feedback.append("Nâng tay trái lên cao hơn" if lw_diff[1] > 0 else "Hạ tay trái xuống một chút")
        elif abs(lw_diff[0]) > 0.08:
            feedback.append("Đưa tay trái sang phải" if lw_diff[0] > 0 else "Đưa tay trái sang trái")

        # Right Wrist / Hand
        rw_diff = user_coords[10] - target_coords[10]
        if abs(rw_diff[1]) > 0.08:
            feedback.append("Nâng tay phải lên cao hơn" if rw_diff[1] > 0 else "Hạ tay phải xuống một chút")
        elif abs(rw_diff[0]) > 0.08:
            feedback.append("Đưa tay phải sang phải" if rw_diff[0] > 0 else "Đưa tay phải sang trái")

        # Head / Tilt
        head_tilt_user = user_coords[0][0] - user_coords[5][0]
        head_tilt_target = target_coords[0][0] - target_coords[5][0]
        if abs(head_tilt_user - head_tilt_target) > 0.06:
            feedback.append("Nghiêng đầu nhẹ theo hướng mẫu")

        # Shoulders balance
        user_shoulder_slope = user_coords[6][1] - user_coords[5][1]
        target_shoulder_slope = target_coords[6][1] - target_coords[5][1]
        if abs(user_shoulder_slope - target_shoulder_slope) > 0.07:
            feedback.append("Căn chỉnh hai vai cân đối hơn")

        if not feedback:
            feedback.append("Dáng cực chuẩn! Giữ yên để chụp.")

        return feedback[:3]


def score_pose_pair(
    user_kps: list[dict[str, Any]],
    target_kps: list[dict[str, Any]] | list[list[float]],
) -> dict[str, Any]:
    """
    Main entry point for scoring a user's pose against a target pose.
    Returns composite score (0-100), OKS score, feedback directives, and match quality.
    """
    # Parse user coords
    u_coords = np.array([[kp.get("x", 0.0), kp.get("y", 0.0)] for kp in user_kps], dtype=np.float32)
    u_vis = np.array([kp.get("confidence", 0.8) for kp in user_kps], dtype=np.float32)

    # Parse target coords
    if len(target_kps) > 0 and isinstance(target_kps[0], (list, tuple)):
        t_coords = np.array([[pt[0], pt[1]] for pt in target_kps], dtype=np.float32)
    else:
        t_coords = np.array([[kp.get("x", 0.0), kp.get("y", 0.0)] for kp in target_kps], dtype=np.float32)

    # Calculate metrics
    oks = SimilarityScorer.calculate_oks(u_coords, t_coords, visibility=u_vis)
    anatomy_sim = SimilarityScorer.calculate_anatomy_weighted_score(u_coords, t_coords, visibility=u_vis)

    # Hybrid final score (0 - 100)
    final_score = int(round((oks * 0.45 + anatomy_sim * 0.55) * 100))
    final_score = max(0, min(100, final_score))

    # Match classification
    if final_score >= 90:
        match_level = "excellent"
        message = "Hoàn hảo! Dáng khớp xuất sắc."
    elif final_score >= 75:
        match_level = "good"
        message = "Rất tốt! Chỉ cần chỉnh nhẹ theo hướng dẫn."
    elif final_score >= 50:
        match_level = "fair"
        message = "Khá ổn, tiếp tục điều chỉnh thêm khớp tay/chân."
    else:
        match_level = "poor"
        message = "Chưa khớp, hãy quan sát dáng mẫu và điều chỉnh lại."

    feedback = SimilarityScorer.generate_directional_feedback(u_coords, t_coords)

    return {
        "score": final_score,
        "oks_score": round(oks * 100, 1),
        "anatomy_score": round(anatomy_sim * 100, 1),
        "match_level": match_level,
        "message": message,
        "feedback": feedback,
        "profile_active": settings.AI_PROFILE,
    }
