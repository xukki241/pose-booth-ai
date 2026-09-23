"use client";

import { useEffect, useCallback } from "react";
import type { MediaPipeLandmark } from "@/types/pose";
import { SKELETON_CONNECTIONS } from "@/lib/mediapipe/usePoseDetection";

// Clean, high-contrast joint colors by confidence
const getJointColor = (confidence: number): string => {
  if (confidence > 0.8) return "#60a5fa"; // Blue-400 — high
  if (confidence > 0.5) return "#fbbf24"; // Amber-400 — medium
  return "#f87171"; // Red-400 — low
};

const LIMB_COLOR = "rgba(59, 130, 246, 0.75)"; // Cobalt blue clean stroke

interface PoseSkeletonProps {
  landmarks: MediaPipeLandmark[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  showScore?: boolean;
  score?: number;
  jointErrors?: Record<string, number>;
}

export function PoseSkeleton({
  landmarks,
  canvasRef,
  width,
  height,
  showScore = false,
  score,
}: PoseSkeletonProps) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    const scaleX = width;
    const scaleY = height;

    // Draw limbs
    ctx.lineWidth = 2.5;
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

      // Outer ring for optical definition
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = getJointColor(conf);
      ctx.fill();

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#0f172a";
      ctx.stroke();
    }

    // Telemetry Score badge on HUD
    if (showScore && score !== undefined) {
      const scoreColor = score > 80 ? "#10b981" : score > 60 ? "#f59e0b" : "#ef4444";

      // Semi-transparent HUD card
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.beginPath();
      ctx.roundRect(16, 16, 110, 60, 8);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.stroke();

      // Label
      ctx.font = '600 10px "Inter", sans-serif';
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("MATCH SCORE", 26, 34);

      // Value
      ctx.font = '700 24px "JetBrains Mono", monospace';
      ctx.fillStyle = scoreColor;
      ctx.fillText(`${score}%`, 26, 62);
    }
  }, [landmarks, canvasRef, width, height, showScore, score]);

  useEffect(() => {
    draw();
  }, [draw]);

  return null;
}
