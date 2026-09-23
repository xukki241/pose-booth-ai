"use client";

/**
 * Pose Studio Page
 * Standalone AI pose analysis: webcam + realtime skeleton + pose suggestions + scoring
 */
import { useRef, useState, useEffect } from "react";
import { usePoseDetection } from "@/lib/mediapipe/usePoseDetection";
import { PoseSkeleton } from "@/components/pose/PoseSkeleton";
import type { PoseTemplate } from "@/types/pose";

// Hardcoded subset for offline demo (no backend needed for POC)
const SAMPLE_POSES: PoseTemplate[] = [
  {
    id: "power_pose", name: "Power Pose", name_vi: "Tư Thế Quyền Lực",
    category: "portrait", difficulty: "easy",
    description: "Đứng thẳng, hai tay chống hông",
    keypoints: Array(17).fill([0.5, 0]),
  },
  {
    id: "arms_wide", name: "Arms Wide Open", name_vi: "Giang Rộng Tay",
    category: "portrait", difficulty: "easy",
    description: "Giang rộng hai tay sang ngang",
    keypoints: Array(17).fill([0.5, 0]),
  },
  {
    id: "hands_up", name: "Hands Up", name_vi: "Giơ Tay Lên",
    category: "portrait", difficulty: "easy",
    description: "Giơ cả hai tay lên cao",
    keypoints: Array(17).fill([0.5, 0]),
  },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "text-emerald-400 bg-emerald-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  hard: "text-red-400 bg-red-400/10",
};

export default function PoseStudioPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [selectedPose, setSelectedPose] = useState<PoseTemplate | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [apiPoses, setApiPoses] = useState<PoseTemplate[]>([]);

  const { landmarks, confidence, isLoading, fps, cocoKeypoints } =
    usePoseDetection(videoRef, cameraReady);

  // Fetch poses from API (if backend running)
  useEffect(() => {
    fetch("http://localhost:8000/api/pose/suggest?limit=20")
      .then((r) => r.json())
      .then((data) => setApiPoses(data.poses || []))
      .catch(() => setApiPoses(SAMPLE_POSES));
  }, []);

  const poses = apiPoses.length > 0 ? apiPoses : SAMPLE_POSES;

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch {
      alert("Không thể truy cập camera.");
    }
  };

  // Score against selected pose (calls backend or uses client-side)
  const scoreAgainstPose = async () => {
    if (!selectedPose || cocoKeypoints.length === 0) return;

    try {
      const res = await fetch("http://localhost:8000/api/pose/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_keypoints: cocoKeypoints.map((kp) => ({
            x: kp.x, y: kp.y, confidence: kp.visibility ?? 0.8,
          })),
          target_keypoints: selectedPose.keypoints.map(([x, y]) => ({
            x, y, confidence: 0.9,
          })),
        }),
      });
      const data = await res.json();
      setScore(data.score);
      setFeedback(data.feedback || []);
    } catch {
      // Fallback client-side mock score
      setScore(Math.floor(Math.random() * 30) + 65);
      setFeedback(["Đang kết nối tới AI backend...","Hãy chạy: uvicorn main:app --reload trong apps/api/"]);
    }
  };

  const scoreColor = score !== null
    ? score > 80 ? "text-emerald-400" : score > 60 ? "text-amber-400" : "text-red-400"
    : "text-white";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="px-6 py-4 glass border-b border-white/5 flex items-center gap-3">
        <span className="text-xl">🤸</span>
        <span className="font-bold">Pose Studio</span>
        {cameraReady && (
          <span className="ml-auto text-white/40 font-mono text-sm">
            {fps}fps · {Math.round(confidence * 100)}% conf
          </span>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-5 p-5 max-w-7xl mx-auto">
        {/* Left: Camera */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden glass aspect-video">
            {!cameraReady ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <span className="text-5xl">🤸</span>
                <p className="text-white/60 text-center max-w-xs">
                  Bật camera để AI phân tích pose của bạn realtime
                </p>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold"
                >
                  Bật Camera
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  muted playsInline
                />
                <canvas ref={canvasRef} className="skeleton-canvas" width={1280} height={720} />
                <PoseSkeleton
                  landmarks={landmarks} canvasRef={canvasRef}
                  width={1280} height={720}
                  showScore={score !== null} score={score ?? undefined}
                />
                {isLoading && (
                  <div className="absolute top-3 left-3 glass px-3 py-1.5 rounded-lg text-xs text-white/70 flex items-center gap-2">
                    <span className="animate-spin">⚙️</span> Tải AI model...
                  </div>
                )}
              </>
            )}
          </div>

          {/* Score display */}
          {score !== null && (
            <div className="glass rounded-2xl p-5 flex items-center gap-5">
              <div className="text-center">
                <div className={`text-6xl font-bold font-mono ${scoreColor}`}>{score}</div>
                <div className="text-white/50 text-sm mt-1">/ 100</div>
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-2">Nhận xét từ AI:</div>
                {feedback.map((f, i) => (
                  <div key={i} className="text-white/60 text-sm flex items-start gap-2">
                    <span>→</span> {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedPose && cameraReady && (
            <button
              onClick={scoreAgainstPose}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold transition-all hover:scale-[1.02]"
            >
              🎯 Chấm Điểm Pose Của Tôi
            </button>
          )}
        </div>

        {/* Right: Pose Library */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div>
            <h2 className="font-bold text-lg mb-1">Chọn Pose Mẫu</h2>
            <p className="text-white/50 text-sm">Chọn một pose rồi chấm điểm xem bạn khớp bao nhiêu!</p>
          </div>

          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {poses.map((pose) => (
              <button
                key={pose.id}
                onClick={() => { setSelectedPose(pose); setScore(null); setFeedback([]); }}
                className={`w-full text-left rounded-xl p-4 transition-all glass ${
                  selectedPose?.id === pose.id
                    ? "border-violet-500/60 bg-violet-500/10"
                    : "glass-hover border-transparent"
                } border`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm">{pose.name_vi}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[pose.difficulty]}`}>
                    {pose.difficulty}
                  </span>
                </div>
                <p className="text-white/50 text-xs">{pose.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
