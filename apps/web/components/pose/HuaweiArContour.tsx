'use client';

import React, { useEffect, useCallback } from 'react';
import type { MediaPipeLandmark } from '@/types/pose';

export type ViewfinderOrientation = 'landscape' | 'portrait';

interface HuaweiArContourProps {
  landmarks?: MediaPipeLandmark[];
  targetLandmarks?: MediaPipeLandmark[] | Array<[number, number]>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  opacity?: number; // 0.1 to 1.0 (Ghost contour opacity)
  score?: number; // 0 to 100
  showScoreHud?: boolean;
  guidanceText?: string;
  orientation?: ViewfinderOrientation;
  showGrid?: boolean;
}

// Huawei Camera AR color palette
const COLOR_NEUTRAL_STROKE = 'rgba(255, 255, 255, 0.65)';
const COLOR_NEUTRAL_FILL = 'rgba(255, 255, 255, 0.08)';
const COLOR_GOLD_STROKE = '#FCD34D'; // Champagne gold on pose match
const COLOR_GOLD_FILL = 'rgba(252, 211, 77, 0.16)';
const COLOR_CYAN = '#06B6D4'; // Micro-radar joint tracking nodes

export function HuaweiArContour({
  landmarks,
  targetLandmarks,
  canvasRef,
  width,
  height,
  opacity = 0.55,
  score = 0,
  showScoreHud = true,
  guidanceText,
  orientation = 'portrait',
  showGrid = false,
}: HuaweiArContourProps) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // 0. Optional Rule of Thirds Camera Grid
    if (showGrid) {
      drawRuleOfThirdsGrid(ctx, width, height);
    }

    // 1. Draw Target Human Silhouette (The Organic Reference Pose)
    if (targetLandmarks && targetLandmarks.length >= 17) {
      drawOrganicHumanSilhouette(
        ctx,
        targetLandmarks,
        width,
        height,
        opacity,
        score,
        orientation
      );
    }

    // 2. Draw Live User Keypoint Alignment Nodes (PikPose Micro-Radars)
    if (landmarks && landmarks.length > 0) {
      drawLiveJointRadars(ctx, landmarks, targetLandmarks, width, height, score);
    }

    // 3. Draw Clean Minimalist Camera HUD
    if (showScoreHud) {
      drawMinimalistHud(ctx, score, width, height, guidanceText, orientation);
    }
  }, [landmarks, targetLandmarks, canvasRef, width, height, opacity, score, showScoreHud, guidanceText, orientation, showGrid]);

  useEffect(() => {
    draw();
  }, [draw]);

  return null;
}

/**
 * Draws Rule of Thirds camera grid lines
 */
function drawRuleOfThirdsGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);

  // Horizontal lines
  ctx.beginPath();
  ctx.moveTo(0, height / 3);
  ctx.lineTo(width, height / 3);
  ctx.moveTo(0, (height * 2) / 3);
  ctx.lineTo(width, (height * 2) / 3);

  // Vertical lines
  ctx.moveTo(width / 3, 0);
  ctx.lineTo(width / 3, height);
  ctx.moveTo((width * 2) / 3, 0);
  ctx.lineTo((width * 2) / 3, height);
  ctx.stroke();

  ctx.restore();
}

/**
 * Helper to draw a capsule/volumetric limb between two points
 */
function drawCapsuleLimb(
  ctx: CanvasRenderingContext2D,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  r1: number,
  r2: number
) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return;

  const nx = -dy / dist;
  const ny = dx / dist;

  const a1 = { x: p1.x + nx * r1, y: p1.y + ny * r1 };
  const a2 = { x: p1.x - nx * r1, y: p1.y - ny * r1 };
  const b1 = { x: p2.x + nx * r2, y: p2.y + ny * r2 };
  const b2 = { x: p2.x - nx * r2, y: p2.y - ny * r2 };

  ctx.beginPath();
  ctx.moveTo(a1.x, a1.y);
  ctx.lineTo(b1.x, b1.y);
  ctx.arc(p2.x, p2.y, r2, Math.atan2(ny, nx), Math.atan2(-ny, -nx));
  ctx.lineTo(a2.x, a2.y);
  ctx.arc(p1.x, p1.y, r1, Math.atan2(-ny, -nx), Math.atan2(ny, nx));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * Draws a REAL volumetric, organic human body silhouette
 * (PikPose / Huawei Camera Portrait AR style)
 */
function drawOrganicHumanSilhouette(
  ctx: CanvasRenderingContext2D,
  points: MediaPipeLandmark[] | Array<[number, number]>,
  width: number,
  height: number,
  opacity: number,
  score: number,
  orientation: ViewfinderOrientation
) {
  // Extract normalized coordinates into pixel coordinates
  const pts: Array<{ x: number; y: number }> = points.map((p) => {
    if (Array.isArray(p)) {
      return { x: p[0] * width, y: p[1] * height };
    }
    return { x: p.x * width, y: p.y * height };
  });

  if (pts.length < 17) return;

  const isMatched = score >= 85;
  const strokeColor = isMatched ? COLOR_GOLD_STROKE : COLOR_NEUTRAL_STROKE;
  const fillColor = isMatched ? COLOR_GOLD_FILL : COLOR_NEUTRAL_FILL;
  const glowBlur = isMatched ? 16 : 8;

  // Key joints mapping:
  // 0: nose, 1: l_eye, 2: r_eye, 3: l_ear, 4: r_ear
  // 5: l_shoulder, 6: r_shoulder, 7: l_elbow, 8: r_elbow
  // 9: l_wrist, 10: r_wrist, 11: l_hip, 12: r_hip
  // 13: l_knee, 14: r_knee, 15: l_ankle, 16: r_ankle
  const nose = pts[0];
  const lEye = pts[1];
  const rEye = pts[2];
  const lShoulder = pts[5];
  const rShoulder = pts[6];
  const lElbow = pts[7];
  const rElbow = pts[8];
  const lWrist = pts[9];
  const rWrist = pts[10];
  const lHip = pts[11];
  const rHip = pts[12];
  const lKnee = pts[13];
  const rKnee = pts[14];
  const lAnkle = pts[15];
  const rAnkle = pts[16];

  // Scale limb thickness based on shoulder width
  const shoulderWidth = Math.max(Math.hypot(rShoulder.x - lShoulder.x, rShoulder.y - lShoulder.y), 40);
  const headRadius = Math.max(shoulderWidth * 0.28, 22);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  ctx.lineWidth = isMatched ? 2.2 : 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = glowBlur;

  // 1. HEAD & HAIR SILHOUETTE
  ctx.beginPath();
  const headCenterX = (lShoulder.x + rShoulder.x) / 2;
  const headCenterY = Math.min(nose.y, (lShoulder.y + rShoulder.y) / 2 - headRadius * 1.25);
  ctx.ellipse(headCenterX, headCenterY, headRadius * 0.85, headRadius * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. NECK
  const neckTopY = headCenterY + headRadius * 0.9;
  const neckBottomY = (lShoulder.y + rShoulder.y) / 2;
  ctx.beginPath();
  ctx.moveTo(headCenterX - headRadius * 0.35, neckTopY);
  ctx.lineTo(headCenterX + headRadius * 0.35, neckTopY);
  ctx.lineTo(headCenterX + headRadius * 0.45, neckBottomY);
  ctx.lineTo(headCenterX - headRadius * 0.45, neckBottomY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. TORSO (Natural Curved Contour)
  ctx.beginPath();
  ctx.moveTo(lShoulder.x, lShoulder.y);
  // Collarbone curve
  ctx.quadraticCurveTo(headCenterX, (lShoulder.y + rShoulder.y) / 2 + 8, rShoulder.x, rShoulder.y);
  // Right ribcage & waist
  const rWaistX = (rShoulder.x + rHip.x) / 2 + 10;
  const rWaistY = (rShoulder.y + rHip.y) / 2;
  ctx.quadraticCurveTo(rWaistX, rWaistY, rHip.x, rHip.y);
  // Pelvis curve
  const hipCenterX = (lHip.x + rHip.x) / 2;
  const hipCenterY = (lHip.y + rHip.y) / 2 + 10;
  ctx.quadraticCurveTo(hipCenterX, hipCenterY, lHip.x, lHip.y);
  // Left ribcage & waist
  const lWaistX = (lShoulder.x + lHip.x) / 2 - 10;
  const lWaistY = (lShoulder.y + lHip.y) / 2;
  ctx.quadraticCurveTo(lWaistX, lWaistY, lShoulder.x, lShoulder.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. VOLUMETRIC ARMS (Upper Arm & Forearm Capsules)
  const upperArmR = shoulderWidth * 0.12;
  const forearmR = shoulderWidth * 0.09;
  const wristR = shoulderWidth * 0.07;

  // Left Arm
  drawCapsuleLimb(ctx, lShoulder, lElbow, upperArmR, forearmR);
  drawCapsuleLimb(ctx, lElbow, lWrist, forearmR, wristR);
  // Left Hand oval
  ctx.beginPath();
  ctx.ellipse(lWrist.x, lWrist.y, wristR * 1.3, wristR * 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Arm
  drawCapsuleLimb(ctx, rShoulder, rElbow, upperArmR, forearmR);
  drawCapsuleLimb(ctx, rElbow, rWrist, forearmR, wristR);
  // Right Hand oval
  ctx.beginPath();
  ctx.ellipse(rWrist.x, rWrist.y, wristR * 1.3, wristR * 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. VOLUMETRIC LEGS (Thighs & Calves)
  const thighTopR = shoulderWidth * 0.16;
  const kneeR = shoulderWidth * 0.12;
  const ankleR = shoulderWidth * 0.08;

  // Left Leg
  drawCapsuleLimb(ctx, lHip, lKnee, thighTopR, kneeR);
  drawCapsuleLimb(ctx, lKnee, lAnkle, kneeR, ankleR);
  // Left Foot
  ctx.beginPath();
  ctx.ellipse(lAnkle.x, lAnkle.y + 6, ankleR * 1.6, ankleR * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Leg
  drawCapsuleLimb(ctx, rHip, rKnee, thighTopR, kneeR);
  drawCapsuleLimb(ctx, rKnee, rAnkle, kneeR, ankleR);
  // Right Foot
  ctx.beginPath();
  ctx.ellipse(rAnkle.x, rAnkle.y + 6, ankleR * 1.6, ankleR * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 6. JOINT TARGET RINGS (PikPose Alignment Guides)
  const keyJoints = [lWrist, rWrist, lElbow, rElbow, lShoulder, rShoulder, lKnee, rKnee];
  keyJoints.forEach((pt) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, isMatched ? 5 : 4, 0, Math.PI * 2);
    ctx.fillStyle = isMatched ? '#FCD34D' : 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draws live user joint alignment nodes (micro radars) with pulsing rings
 */
function drawLiveJointRadars(
  ctx: CanvasRenderingContext2D,
  landmarks: MediaPipeLandmark[],
  targetPoints: MediaPipeLandmark[] | Array<[number, number]> | undefined,
  width: number,
  height: number,
  score: number
) {
  const isMatched = score >= 85;
  const nodeColor = isMatched ? COLOR_GOLD_STROKE : COLOR_CYAN;

  ctx.save();

  // Major tracking joints in COCO order
  const jointsToTrack = [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  jointsToTrack.forEach((idx) => {
    const lm = landmarks[idx];
    if (!lm || (lm.visibility && lm.visibility < 0.35)) return;

    const x = lm.x * width;
    const y = lm.y * height;

    // Glowing core node
    ctx.beginPath();
    ctx.arc(x, y, isMatched ? 4.5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor;
    ctx.shadowColor = nodeColor;
    ctx.shadowBlur = 10;
    ctx.fill();

    // Outer subtle radar pulse ring
    ctx.beginPath();
    ctx.arc(x, y, isMatched ? 10 : 8, 0, Math.PI * 2);
    ctx.strokeStyle = isMatched ? 'rgba(252, 211, 77, 0.5)' : 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Minimalist Camera HUD Pill
 */
function drawMinimalistHud(
  ctx: CanvasRenderingContext2D,
  score: number,
  width: number,
  height: number,
  guidanceText?: string,
  orientation?: ViewfinderOrientation
) {
  const isMatched = score >= 85;
  const hudWidth = orientation === 'portrait' ? Math.min(width - 32, 340) : 360;
  const hudHeight = 44;
  const x = (width - hudWidth) / 2;
  const y = height - hudHeight - 20;

  ctx.save();

  // Frosted Glass Pill
  ctx.fillStyle = isMatched ? 'rgba(20, 16, 8, 0.85)' : 'rgba(8, 8, 14, 0.82)';
  ctx.strokeStyle = isMatched ? 'rgba(252, 211, 77, 0.6)' : 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.roundRect(x, y, hudWidth, hudHeight, 22);
  ctx.fill();
  ctx.stroke();

  // Match Indicator Dot
  const dotX = x + 20;
  const dotY = y + hudHeight / 2;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = isMatched ? COLOR_GOLD_STROKE : score >= 60 ? '#38BDF8' : '#94A3B8';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 8;
  ctx.fill();

  // Score Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${score}%`, dotX + 12, dotY);

  // Guidance Hint or Status Text
  const textX = dotX + 54;
  const displayText =
    guidanceText ||
    (isMatched
      ? 'Dáng chuẩn tuyệt đối! Giữ nguyên'
      : score >= 65
      ? 'Gần khớp! Điều chỉnh tay chân theo viền'
      : 'Đứng vào vị trí đường viền lụa');

  ctx.fillStyle = isMatched ? COLOR_GOLD_STROKE : '#CBD5E1';
  ctx.font = '500 11px system-ui, sans-serif';
  // Truncate text if needed
  const maxTextWidth = hudWidth - 90;
  let truncated = displayText;
  if (ctx.measureText(truncated).width > maxTextWidth) {
    while (ctx.measureText(truncated + '...').width > maxTextWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    truncated += '...';
  }
  ctx.fillText(truncated, textX, dotY);

  ctx.restore();
}
