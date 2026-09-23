'use client';

import React, { useEffect, useCallback } from 'react';
import type { MediaPipeLandmark } from '@/types/pose';

interface HuaweiArContourProps {
  landmarks: MediaPipeLandmark[];
  targetLandmarks?: MediaPipeLandmark[] | Array<[number, number]>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  opacity?: number; // 0.1 to 1.0 (Ghost contour opacity)
  score?: number; // 0 to 100
  showScoreHud?: boolean;
  guidanceText?: string;
}

// Huawei Camera AR color palette
const COLOR_NEUTRAL = 'rgba(255, 255, 255, 0.45)';
const COLOR_GOLD = '#FCD34D'; // Champagne gold on pose match
const COLOR_CYAN = '#06B6D4'; // Subtle technical radar highlight

export function HuaweiArContour({
  landmarks,
  targetLandmarks,
  canvasRef,
  width,
  height,
  opacity = 0.5,
  score,
  showScoreHud = true,
  guidanceText,
}: HuaweiArContourProps) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Target Ghost AR Contour (The Reference Pose)
    if (targetLandmarks && targetLandmarks.length > 0) {
      drawContourSilhouette(ctx, targetLandmarks, width, height, opacity, score ?? 0);
    }

    // 2. Draw Live User Keypoint Alignment Nodes (Micro Radar, NO Stickman!)
    if (landmarks && landmarks.length > 0) {
      drawLiveAlignmentNodes(ctx, landmarks, width, height, score ?? 0);
    }

    // 3. Draw Clean Minimalist Camera HUD
    if (showScoreHud && score !== undefined) {
      drawMinimalistHud(ctx, score, width, height, guidanceText);
    }
  }, [landmarks, targetLandmarks, canvasRef, width, height, opacity, score, showScoreHud, guidanceText]);

  useEffect(() => {
    draw();
  }, [draw]);

  return null;
}

/**
 * Draws smooth organic body contours (Huawei Camera AR style)
 * rather than rigid mechanical stick lines.
 */
function drawContourSilhouette(
  ctx: CanvasRenderingContext2D,
  points: MediaPipeLandmark[] | Array<[number, number]>,
  width: number,
  height: number,
  opacity: number,
  score: number
) {
  // Extract normalized coords
  const pts: Array<{ x: number; y: number }> = points.map((p) => {
    if (Array.isArray(p)) return { x: p[0] * width, y: p[1] * height };
    return { x: p.x * width, y: p.y * height };
  });

  if (pts.length < 17) return;

  const isMatched = score >= 85;
  const strokeColor = isMatched ? COLOR_GOLD : COLOR_NEUTRAL;
  const glowBlur = isMatched ? 14 : 6;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isMatched ? 2.5 : 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = glowBlur;

  // --- Head & Oval Halo ---
  const nose = pts[0];
  const lEye = pts[1];
  const rEye = pts[2];
  const headRadius = Math.max(Math.hypot(lEye.x - rEye.x, lEye.y - rEye.y) * 2.5, 20);

  ctx.beginPath();
  ctx.ellipse(nose.x, nose.y, headRadius * 0.85, headRadius * 1.1, 0, 0, Math.PI * 2);
  ctx.stroke();

  // --- Upper Body Silk Contour (Torso & Shoulders) ---
  const lShoulder = pts[5];
  const rShoulder = pts[6];
  const lHip = pts[11];
  const rHip = pts[12];

  ctx.beginPath();
  ctx.moveTo(lShoulder.x, lShoulder.y);
  // Neck arc
  ctx.quadraticCurveTo((lShoulder.x + rShoulder.x) / 2, (lShoulder.y + rShoulder.y) / 2 - 12, rShoulder.x, rShoulder.y);
  // Right side torso curve
  ctx.quadraticCurveTo((rShoulder.x + rHip.x) / 2 + 8, (rShoulder.y + rHip.y) / 2, rHip.x, rHip.y);
  // Waist bottom arc
  ctx.quadraticCurveTo((lHip.x + rHip.x) / 2, (lHip.y + rHip.y) / 2 + 6, lHip.x, lHip.y);
  // Left side torso curve
  ctx.quadraticCurveTo((lShoulder.x + lHip.x) / 2 - 8, (lShoulder.y + lHip.y) / 2, lShoulder.x, lShoulder.y);
  ctx.closePath();
  ctx.stroke();

  // Subtle interior contour fill
  ctx.fillStyle = isMatched ? 'rgba(252, 211, 77, 0.04)' : 'rgba(255, 255, 255, 0.02)';
  ctx.fill();

  // --- Arms Silk Contour (Left Arm: 5 -> 7 -> 9) ---
  const lElbow = pts[7];
  const lWrist = pts[9];
  ctx.beginPath();
  ctx.moveTo(lShoulder.x, lShoulder.y);
  ctx.lineTo(lElbow.x, lElbow.y);
  ctx.lineTo(lWrist.x, lWrist.y);
  ctx.stroke();

  // --- Right Arm: 6 -> 8 -> 10 ---
  const rElbow = pts[8];
  const rWrist = pts[10];
  ctx.beginPath();
  ctx.moveTo(rShoulder.x, rShoulder.y);
  ctx.lineTo(rElbow.x, rElbow.y);
  ctx.lineTo(rWrist.x, rWrist.y);
  ctx.stroke();

  // --- Legs Silk Contour (Left Leg: 11 -> 13 -> 15) ---
  const lKnee = pts[13];
  const lAnkle = pts[15];
  ctx.beginPath();
  ctx.moveTo(lHip.x, lHip.y);
  ctx.lineTo(lKnee.x, lKnee.y);
  ctx.lineTo(lAnkle.x, lAnkle.y);
  ctx.stroke();

  // --- Right Leg: 12 -> 14 -> 16 ---
  const rKnee = pts[14];
  const rAnkle = pts[16];
  ctx.beginPath();
  ctx.moveTo(rHip.x, rHip.y);
  ctx.lineTo(rKnee.x, rKnee.y);
  ctx.lineTo(rAnkle.x, rAnkle.y);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws ultra-fine radar tracking nodes on user's live position (NO tacky stickman lines!)
 */
function drawLiveAlignmentNodes(
  ctx: CanvasRenderingContext2D,
  landmarks: MediaPipeLandmark[],
  width: number,
  height: number,
  score: number
) {
  const isMatched = score >= 85;
  const nodeColor = isMatched ? COLOR_GOLD : COLOR_CYAN;

  ctx.save();
  // Essential alignment nodes: wrists, elbows, shoulders
  const activeIndices = [5, 6, 7, 8, 9, 10];

  for (const idx of activeIndices) {
    const lm = landmarks[idx];
    if (!lm || (lm.visibility ?? 0) < 0.3) continue;

    const x = lm.x * width;
    const y = lm.y * height;

    // Outer subtle pulsing reticle ring
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.strokeStyle = `${nodeColor}40`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Solid micro core point (radius 2.5px)
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor;
    ctx.shadowColor = nodeColor;
    ctx.shadowBlur = 6;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Minimalist Camera HUD pill inspired by Huawei/Apple Camera Pro
 */
function drawMinimalistHud(
  ctx: CanvasRenderingContext2D,
  score: number,
  width: number,
  height: number,
  guidanceText?: string
) {
  const isMatched = score >= 85;
  const accentColor = isMatched ? COLOR_GOLD : score >= 65 ? '#06B6D4' : '#94A3B8';

  ctx.save();

  // Top Right Match Ring Badge
  const badgeW = 100;
  const badgeH = 34;
  const badgeX = width - badgeW - 16;
  const badgeY = 16;

  // Frosted dark pill background
  ctx.fillStyle = 'rgba(10, 10, 15, 0.75)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 17);
  ctx.fill();
  ctx.stroke();

  // Match indicator dot
  ctx.beginPath();
  ctx.arc(badgeX + 16, badgeY + badgeH / 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 6;
  ctx.fill();

  // Match percentage text
  ctx.font = '600 12px "Space Mono", monospace';
  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(`${score}% MATCH`, badgeX + 28, badgeY + 21);

  // Directional Guidance Hint at bottom
  if (guidanceText) {
    ctx.font = '500 12px "Space Grotesk", sans-serif';
    const textMetrics = ctx.measureText(guidanceText);
    const pillW = Math.max(textMetrics.width + 32, 160);
    const pillH = 32;
    const pillX = (width - pillW) / 2;
    const pillY = height - pillH - 24;

    ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
    ctx.strokeStyle = isMatched ? 'rgba(252, 211, 77, 0.4)' : 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isMatched ? COLOR_GOLD : '#E2E8F0';
    ctx.fillText(guidanceText, pillX + 16, pillY + 20);
  }

  ctx.restore();
}
