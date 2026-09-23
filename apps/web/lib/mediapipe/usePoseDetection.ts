"use client";

/**
 * usePoseDetection — MediaPipe Pose realtime hook
 * Processes webcam frames at ~30fps using MediaPipe Tasks Vision WASM.
 *
 * Usage:
 *   const videoRef = useRef<HTMLVideoElement>(null);
 *   const { landmarks, confidence, isLoading } = usePoseDetection(videoRef);
 */
import { useEffect, useRef, useState, useCallback } from "react";
import type { MediaPipeLandmark } from "@/types/pose";

// COCO-compatible indices from MediaPipe 33-landmark set
// MediaPipe 33 → COCO 17 mapping
export const MP_TO_COCO_MAP: Record<number, number> = {
  0: 0,   // nose
  2: 1,   // left_eye
  5: 2,   // right_eye
  7: 3,   // left_ear
  8: 4,   // right_ear
  11: 5,  // left_shoulder
  12: 6,  // right_shoulder
  13: 7,  // left_elbow
  14: 8,  // right_elbow
  15: 9,  // left_wrist
  16: 10, // right_wrist
  23: 11, // left_hip
  24: 12, // right_hip
  25: 13, // left_knee
  26: 14, // right_knee
  27: 15, // left_ankle
  28: 16, // right_ankle
};

// Skeleton connections for drawing (MediaPipe indices)
export const SKELETON_CONNECTIONS: [number, number][] = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso sides
  [23, 24], // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
];

interface UsePoseDetectionReturn {
  landmarks: MediaPipeLandmark[];
  cocoKeypoints: MediaPipeLandmark[];  // COCO 17-keypoint subset
  confidence: number;
  isLoading: boolean;
  isDetecting: boolean;
  fps: number;
  error: string | null;
}

export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean = true
): UsePoseDetectionReturn {
  const [landmarks, setLandmarks] = useState<MediaPipeLandmark[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const poseLandmarkerRef = useRef<unknown>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef<number[]>([]);

  const initMediaPipe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Dynamic import to avoid SSR issues
      const { PoseLandmarker, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Prioritize local static model file for zero latency
      const modelAssetPath = typeof window !== "undefined"
        ? `${window.location.origin}/models/pose_landmarker_lite.task`
        : "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseLandmarkerRef.current = poseLandmarker;
      setIsLoading(false);
      setIsDetecting(true);
    } catch (err) {
      console.error("MediaPipe init error:", err);
      setError("Could not load AI model. Check internet connection.");
      setIsLoading(false);
    }
  }, []);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const landmarker = poseLandmarkerRef.current as { detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks: MediaPipeLandmark[][] } } | null;

    if (!video || !landmarker || !enabled || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();

    // Cap at 30fps
    if (now - lastTimeRef.current < 33) {
      animFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    lastTimeRef.current = now;

    try {
      const results = landmarker.detectForVideo(video, now);

      if (results.landmarks && results.landmarks.length > 0) {
        const lms = results.landmarks[0] as MediaPipeLandmark[];
        setLandmarks(lms);

        // Compute overall confidence
        const visibleLms = lms.filter((lm) => (lm.visibility ?? 0) > 0.3);
        const avgConf =
          visibleLms.reduce((sum, lm) => sum + (lm.visibility ?? 0), 0) /
          Math.max(visibleLms.length, 1);
        setConfidence(avgConf);
      } else {
        setLandmarks([]);
        setConfidence(0);
      }

      // FPS tracking
      fpsCounterRef.current.push(now);
      fpsCounterRef.current = fpsCounterRef.current.filter(
        (t) => now - t < 1000
      );
      setFps(fpsCounterRef.current.length);
    } catch {
      // Silent fail on individual frames
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [videoRef, enabled]);

  useEffect(() => {
    initMediaPipe();
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [initMediaPipe]);

  useEffect(() => {
    if (isDetecting && enabled) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isDetecting, enabled, processFrame]);

  // Convert MediaPipe 33 landmarks to COCO 17 keypoints
  const cocoKeypoints = Object.entries(MP_TO_COCO_MAP)
    .sort(([, a], [, b]) => a - b)
    .map(([mpIdx]) => landmarks[Number(mpIdx)] ?? { x: 0, y: 0, z: 0, visibility: 0 });

  return { landmarks, cocoKeypoints, confidence, isLoading, isDetecting, fps, error };
}
