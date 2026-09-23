"use client";

/**
 * PoseSkeleton — Canvas overlay that draws pose skeleton on webcam feed
 * Animated with GSAP for smooth joint appearance
 *
 * Props:
 *   landmarks: MediaPipe 33-landmark array
 *   canvasRef: ref to the canvas element
 *   width, height: canvas dimensions
 */
import { useEffect, useCallback } from "react";
import type { MediaPipeLandmark } from "@/types/pose";
import { SKELETON_CONNECTIONS } from "@/lib/mediapipe/usePoseDetection";

// Color by confidence
const getJointColor = (confidence: number): string => {
  if (confidence > 0.8) return "#8b5cf6"; // violet — high
  if (confidence > 0.5) return "#f59e0b"; // amber — medium
  return "#ef4444"; // red — low
};

const LIMB_COLOR = "rgba(139, 92, 246, 0.6)"; // violet with alpha

interface PoseSkeletonProps {
  landmarks: MediaPipeLandmark[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  showScore?: boolean;
  score?: number;
  jointErrors?: Record<string, number>;  // joint_name → angle_diff
}

export function PoseSkeleton({
  landmarks,
  canvasRef,
  width,
  height,
  showScore = false,
  score,
  jointErrors = {},
}: PoseSkeletonProps) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    const scaleX = width;
    const scaleY = height;

    // Draw limbs first (behind joints)
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (!start || !end) continue;
      if ((start.visibility ?? 0) < 0.3 || (end.visibility ?? 0) < 0.3) continue;

      ctx.beginPath();
      ctx.strokeStyle = LIMB_COLOR;
      ctx.moveTo(start.x * scaleX, start.y * scaleY);
      ctx.lineTo(end.x * scaleX, end.y * scaleY);
      ctx.stroke();
    }

    // Draw joints
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      if (!lm || (lm.visibility ?? 0) < 0.3) continue;

      const x = lm.x * scaleX;
      const y = lm.y * scaleY;
      const conf = lm.visibility ?? 0;

      // Glow effect
      ctx.shadowColor = getJointColor(conf);
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = getJointColor(conf);
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    // Draw score if provided
    if (showScore && score !== undefined) {
      const scoreColor = score > 80 ? "#10b981" : score > 60 ? "#f59e0b" : "#ef4444";

      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillStyle = scoreColor;
      ctx.shadowColor = scoreColor;
      ctx.shadowBlur = 15;
      ctx.fillText(`${score}`, 20, 50);

      ctx.font = '14px "Inter", sans-serif';
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.shadowBlur = 0;
      ctx.fillText("SCORE", 24, 68);
    }
  }, [landmarks, canvasRef, width, height, showScore, score, jointErrors]);

  useEffect(() => {
    draw();
  }, [draw]);

  return null; // This component only draws on the canvas ref
}
