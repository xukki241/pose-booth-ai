"""
Pose Scoring Router
POST /api/pose/score — compute similarity between two poses
"""
import math
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

# Limb pairs used for angle computation (COCO 17-keypoint indices)
# Each tuple: (joint_a, joint_b) forms a limb vector
LIMB_PAIRS = [
    (5, 7),   # left upper arm
    (7, 9),   # left lower arm
    (6, 8),   # right upper arm
    (8, 10),  # right lower arm
    (11, 13), # left upper leg
    (13, 15), # left lower leg
    (12, 14), # right upper leg
    (14, 16), # right lower leg
    (5, 11),  # left torso
    (6, 12),  # right torso
    (5, 6),   # shoulders
    (11, 12), # hips
]

KEYPOINT_NAMES = [
    "nose", "left_eye", "right_eye", "left_ear", "right_ear",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_hip", "right_hip",
    "left_knee", "right_knee", "left_ankle", "right_ankle",
]


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


class JointError(BaseModel):
    joint_name: str
    angle_diff_degrees: float
    needs_correction: bool  # True if diff > 25 degrees


class PoseScoreResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    similarity: float  # Raw cosine similarity 0-1
    joint_errors: list[JointError]
    feedback: list[str]  # Human-readable correction hints


def normalize_pose(keypoints: list[KeypointInput]) -> np.ndarray:
    """
    Normalize pose keypoints:
    1. Translate: subtract hip center (avg of left_hip idx=11, right_hip idx=12)
    2. Scale: divide by torso height (distance shoulder_center to hip_center)
    Returns: numpy array of shape [17, 2]
    """
    kps = np.array([[kp.x, kp.y] for kp in keypoints])

    # Hip center (indices 11, 12)
    left_hip = kps[11]
    right_hip = kps[12]
    hip_center = (left_hip + right_hip) / 2

    # Shoulder center (indices 5, 6)
    left_shoulder = kps[5]
    right_shoulder = kps[6]
    shoulder_center = (left_shoulder + right_shoulder) / 2

    # Torso height for scale normalization
    torso_height = np.linalg.norm(shoulder_center - hip_center)
    if torso_height < 1e-6:
        torso_height = 1.0  # Avoid division by zero

    # Normalize
    kps_normalized = (kps - hip_center) / torso_height
    return kps_normalized


def compute_limb_angles(normalized_kps: np.ndarray) -> np.ndarray:
    """
    Compute angle vectors for all limb pairs.
    Returns: numpy array of shape [num_limbs, 2] (unit direction vectors)
    """
    angles = []
    for (a, b) in LIMB_PAIRS:
        vec = normalized_kps[b] - normalized_kps[a]
        norm = np.linalg.norm(vec)
        if norm < 1e-6:
            angles.append([0.0, 0.0])
        else:
            angles.append(vec / norm)
    return np.array(angles).flatten()  # Shape: [num_limbs * 2]


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a < 1e-6 or norm_b < 1e-6:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def compute_joint_angle_diff(
    user_kps: np.ndarray,
    target_kps: np.ndarray,
) -> list[tuple[str, float]]:
    """
    Compute angle difference (degrees) for each limb pair.
    Returns list of (joint_name, angle_diff_degrees)
    """
    errors = []
    for (a, b) in LIMB_PAIRS:
        vec_user = user_kps[b] - user_kps[a]
        vec_target = target_kps[b] - target_kps[a]

        norm_u = np.linalg.norm(vec_user)
        norm_t = np.linalg.norm(vec_target)

        if norm_u < 1e-6 or norm_t < 1e-6:
            diff_deg = 0.0
        else:
            cos_angle = np.clip(
                np.dot(vec_user / norm_u, vec_target / norm_t), -1.0, 1.0
            )
            diff_deg = math.degrees(math.acos(cos_angle))

        joint_name = KEYPOINT_NAMES[b]
        errors.append((joint_name, diff_deg))

    return errors


def generate_feedback(joint_errors: list[JointError]) -> list[str]:
    """Generate human-readable correction hints based on joint errors."""
    feedback = []
    problematic = [e for e in joint_errors if e.needs_correction]

    correction_map = {
        "left_elbow": "Điều chỉnh khuỷu tay trái",
        "right_elbow": "Điều chỉnh khuỷu tay phải",
        "left_wrist": "Điều chỉnh cổ tay trái",
        "right_wrist": "Điều chỉnh cổ tay phải",
        "left_knee": "Điều chỉnh đầu gối trái",
        "right_knee": "Điều chỉnh đầu gối phải",
        "left_ankle": "Điều chỉnh cổ chân trái",
        "right_ankle": "Điều chỉnh cổ chân phải",
        "left_shoulder": "Điều chỉnh vai trái",
        "right_shoulder": "Điều chỉnh vai phải",
        "left_hip": "Điều chỉnh hông trái",
        "right_hip": "Điều chỉnh hông phải",
    }

    for err in problematic[:3]:  # Max 3 hints at a time
        hint = correction_map.get(err.joint_name, f"Điều chỉnh {err.joint_name}")
        feedback.append(hint)

    if not feedback:
        feedback.append("Pose hoàn hảo! 🎉")

    return feedback


@router.post("/score", response_model=PoseScoreResponse)
async def score_pose(body: PoseScoreRequest) -> PoseScoreResponse:
    """
    Compute similarity score between user's pose and a reference pose.
    Uses cosine similarity on normalized limb angle vectors.
    Score: 0-100 (100 = perfect match)
    """
    try:
        # Normalize both poses
        user_norm = normalize_pose(body.user_keypoints)
        target_norm = normalize_pose(body.target_keypoints)

        # Compute limb angle vectors
        user_angles = compute_limb_angles(user_norm)
        target_angles = compute_limb_angles(target_norm)

        # Cosine similarity → score
        similarity = (cosine_similarity(user_angles, target_angles) + 1) / 2  # Map -1..1 to 0..1
        score = int(round(similarity * 100))

        # Per-joint errors for visual feedback
        raw_errors = compute_joint_angle_diff(user_norm, target_norm)
        joint_errors = [
            JointError(
                joint_name=name,
                angle_diff_degrees=round(diff, 1),
                needs_correction=diff > 25.0,
            )
            for name, diff in raw_errors
        ]

        # Generate feedback hints
        feedback = generate_feedback(joint_errors)

        return PoseScoreResponse(
            score=score,
            similarity=round(similarity, 4),
            joint_errors=joint_errors,
            feedback=feedback,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(e)}")
