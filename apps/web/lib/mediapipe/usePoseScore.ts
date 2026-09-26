"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaPipeLandmark, PoseScoreResponse, PoseTemplate } from "@/types/pose";

/** Single-flight scoring: changing frames never restarts the scheduler. */
export function usePoseScore(enabled: boolean, points: MediaPipeLandmark[], pose: PoseTemplate, contextKey = '') {
  const latest = useRef({ points, at: 0 });
  useEffect(() => { latest.current = { points, at: performance.now() }; }, [points]);
  const [result, setResult] = useState<{ pose: PoseTemplate; contextKey: string; data: PoseScoreResponse } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const valid = points.length === 17 && points.filter(p => (p.visibility ?? 0) > 0.3).length >= 6;

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let controller: AbortController | undefined;
    const tick = async () => {
      const sample = latest.current;
      if (performance.now() - sample.at > 1500 || sample.points.length !== 17 ||
          sample.points.filter(p => (p.visibility ?? 0) > 0.3).length < 6) {
        setResult(null);
      } else {
        controller = new AbortController();
        const deadline = setTimeout(() => controller?.abort(), 1500);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/pose/score`, {
            method: "POST", signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_keypoints: sample.points.map(p => ({ x: p.x, y: p.y, confidence: p.visibility ?? 0 })),
              target_keypoints: pose.keypoints.map(([x, y]) => ({ x, y, confidence: 1 })),
            }),
          });
          if (!response.ok) throw new Error(`API ${response.status}`);
          const data: PoseScoreResponse = await response.json();
          if (!Number.isFinite(data.score) || data.score < 0 || data.score > 100 || !Array.isArray(data.feedback)) {
            throw new Error("Invalid score response");
          }
          if (!stopped) {
            setResult(performance.now() - sample.at < 1500 ? { pose, contextKey, data } : null);
            setError(null);
          }
        } catch {
          if (!stopped) { setResult(null); setError("Chưa kết nối được dịch vụ chấm pose. Bạn vẫn có thể chụp thủ công."); }
        } finally { clearTimeout(deadline); }
      }
      if (!stopped) timer = setTimeout(tick, 600);
    };
    void tick();
    return () => { stopped = true; clearTimeout(timer); controller?.abort(); };
  }, [enabled, pose, contextKey]);

  const data = enabled && valid && result?.pose === pose && result.contextKey === contextKey ? result.data : null;
  return {
    score: data?.score ?? null,
    feedback: data?.feedback ?? [!enabled ? "Bật camera để bắt đầu" : !valid ? "Đưa các khớp cần chấm vào khung hình" : error ?? "Đang chờ kết quả chấm pose"],
  };
}
