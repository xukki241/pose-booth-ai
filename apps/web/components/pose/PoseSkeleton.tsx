"use client";

import { useEffect, useCallback } from "react";
import type { MediaPipeLandmark } from "@/types/pose";
import { SKELETON_CONNECTIONS } from "@/lib/mediapipe/usePoseDetection";

// Cyan joint — uniform across all confidence levels
const JOINT_COLOR = "rgba(6,182,212,0.95)";   // prism-cyan
const LIMB_COLOR  = "rgba(168,85,247,0.8)";   // prism-violet

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

    // Draw limbs with violet glow
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#A855F7";
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
    ctx.restore();

    // Draw joints with cyan glow
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#06B6D4";

    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      if (!lm || (lm.visibility ?? 0) < 0.3) continue;

      const x = lm.x * scaleX;
      const y = lm.y * scaleY;

      // Filled joint dot
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = JOINT_COLOR;
      ctx.fill();

      // Dark outline for legibility
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.stroke();
    }
    ctx.restore();

    // Telemetry Score badge on HUD
    if (showScore && score !== undefined) {
      const scoreColor =
        score > 80 ? "#10b981" : score > 60 ? "#F59E0B" : "#ef4444";

      // Semi-transparent dark HUD card
      ctx.fillStyle = "rgba(10,10,15,0.88)";
      ctx.beginPath();
      ctx.roundRect(16, 16, 120, 64, 10);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(168,85,247,0.4)";
      ctx.stroke();

      // Label
      ctx.font = '600 10px "Inter", sans-serif';
      ctx.fillStyle = "#94A3B8";
      ctx.fillText("MATCH SCORE", 28, 36);

      // Value with glow
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = scoreColor;
      ctx.font = '700 26px "JetBrains Mono", monospace';
      ctx.fillStyle = scoreColor;
      ctx.fillText(`${score}%`, 28, 66);
      ctx.restore();
    }
  }, [landmarks, canvasRef, width, height, showScore, score]);

  useEffect(() => {
    draw();
  }, [draw]);

  return null;
}
