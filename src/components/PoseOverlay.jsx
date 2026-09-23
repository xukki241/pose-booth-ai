import React, { useEffect, useRef } from 'react';

// MediaPipe Pose Skeleton Connections
const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
  [11, 23], [12, 24], [23, 24],                    // Torso
  [23, 25], [25, 27], [24, 26], [26, 28]            // Lower body
];

export function PoseOverlay({ landmarks, width = 640, height = 480, targetScore = 80 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Draw Target Silhouette Guide (Overlay 50% opacity)
    drawTargetSilhouette(ctx, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Draw Connections (Skeleton lines)
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#06b6d4'; // Glowing Cyan
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;

    POSE_CONNECTIONS.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && p1.x && p2.x) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    });

    // Draw Keypoint Joints
    ctx.shadowBlur = 12;
    landmarks.forEach((pt, idx) => {
      if (!pt || !pt.x) return;
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, idx < 11 ? 4 : 6, 0, 2 * Math.PI);
      ctx.fillStyle = idx === 15 || idx === 16 ? '#ec4899' : '#8b5cf6'; // Pink for hands, Purple for body
      ctx.shadowColor = ctx.fillStyle;
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  }, [landmarks, width, height, targetScore]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-2xl"
    />
  );
}

function drawTargetSilhouette(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillStyle = 'rgba(139, 92, 246, 0.12)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);

  // Head target guide circle
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.28, w * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fill();

  // Shoulder & Body target guide polygon
  ctx.beginPath();
  ctx.moveTo(w * 0.35, h * 0.44);
  ctx.lineTo(w * 0.65, h * 0.44);
  ctx.lineTo(w * 0.72, h * 0.85);
  ctx.lineTo(w * 0.28, h * 0.85);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  // Text label guide
  ctx.font = '600 13px Outfit, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'center';
  ctx.fillText('KHUNG DÁNG MẪU (FIT HERE)', w * 0.5, h * 0.16);

  ctx.restore();
}
