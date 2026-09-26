/**
 * Pose types — shared across frontend and API responses
 */

export interface Keypoint {
  x: number;        // Normalized 0-1
  y: number;        // Normalized 0-1
  confidence: number;
  name: string;
  visible: boolean;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PersonPose {
  person_id: number;
  keypoints: Keypoint[];
  bbox: number[] | null;
  confidence: number;
}

export interface PoseAnalyzeResponse {
  persons: PersonPose[];
  person_count: number;
  processing_time_ms: number;
  profile_active: string;
}

export interface JointError {
  joint_name: string;
  angle_diff_degrees: number;
  needs_correction: boolean;
}

export interface PoseScoreResponse {
  score: number;        // 0-100
  similarity: number;   // 0-1
  oks_score: number;
  anatomy_score: number;
  match_level: string;
  message: string;
  profile_active: string;
  feedback: string[];
}

export interface PoseTemplate {
  id: string;
  name: string;
  name_vi: string;
  category: "portrait" | "group" | "dynamic" | "casual" | "fun" | string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  keypoints: [number, number][];  // 17x2 normalized
}

export interface PoseSuggestResponse {
  poses: PoseTemplate[];
  total: number;
}

// MediaPipe landmark (33 points)
export interface MediaPipeLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// Photobooth types
export type ShotMode = "single" | "triple" | "quad" | "video";
export type BoothState = "idle" | "countdown" | "capturing" | "review" | "exporting";

export interface CapturedShot {
  id: string;
  imageData: string;  // base64 PNG
  timestamp: number;
  poseScore?: number;
}
