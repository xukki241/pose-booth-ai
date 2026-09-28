import type { MediaPipeLandmark } from '@/types/pose';

/** Blend previous pose into the next sample so overlay motion is not frame-jerky. */
export function lerpLandmarks(
  previous: MediaPipeLandmark[],
  next: MediaPipeLandmark[],
  amount: number,
): MediaPipeLandmark[] {
  const t = Math.min(1, Math.max(0, amount));
  if (!previous.length || previous.length !== next.length) return next;
  return next.map((point, index) => {
    const from = previous[index];
    return {
      ...point,
      x: from.x + (point.x - from.x) * t,
      y: from.y + (point.y - from.y) * t,
      z: (from.z ?? 0) + ((point.z ?? 0) - (from.z ?? 0)) * t,
    };
  });
}
