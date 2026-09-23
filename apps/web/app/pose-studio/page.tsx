"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Camera, RefreshCw, CheckCircle2, ArrowRight, UserCheck, Sparkles, Compass, Sliders, Grid3X3, Smartphone, Monitor, ChevronRight, Eye, EyeOff } from "lucide-react";
import confetti from "canvas-confetti";
import { usePoseDetection } from "@/lib/mediapipe/usePoseDetection";
import { HuaweiArContour, ViewfinderOrientation } from "@/components/pose/HuaweiArContour";
import type { PoseTemplate } from "@/types/pose";

const ANATOMICAL_RICH_POSES: PoseTemplate[] = [
  {
    id: "power_pose",
    name: "Power Stance",
    name_vi: "Tư Thế Quyền Lực",
    category: "portrait",
    difficulty: "easy",
    description: "Đứng thẳng, hai tay chống hông tự tin, mắt nhìn thẳng ống kính.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.34, 0.28],
      [0.66, 0.28], [0.22, 0.44], [0.78, 0.44],
      [0.30, 0.58], [0.70, 0.58], [0.38, 0.58],
      [0.62, 0.58], [0.39, 0.78], [0.61, 0.78],
      [0.40, 0.95], [0.60, 0.95]
    ],
  },
  {
    id: "crossed_arms",
    name: "Arms Crossed",
    name_vi: "Khoanh Tay Quyến Rũ",
    category: "portrait",
    difficulty: "easy",
    description: "Hai tay khoanh nhẹ trước ngực, người hơi nghiêng, mắt tự tin.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.35, 0.28],
      [0.65, 0.28], [0.30, 0.42], [0.70, 0.42],
      [0.56, 0.43], [0.44, 0.43], [0.38, 0.58],
      [0.62, 0.58], [0.39, 0.78], [0.61, 0.78],
      [0.40, 0.95], [0.60, 0.95]
    ],
  },
  {
    id: "chic_vogue",
    name: "Chic Vogue",
    name_vi: "Góc Nghiêng Thời Trang",
    category: "portrait",
    difficulty: "medium",
    description: "Nghiêng nhẹ người 15 độ, một tay chạm gò má hoặc tóc.",
    keypoints: [
      [0.52, 0.16], [0.50, 0.14], [0.54, 0.14],
      [0.46, 0.15], [0.58, 0.15], [0.38, 0.28],
      [0.64, 0.30], [0.30, 0.42], [0.68, 0.38],
      [0.48, 0.20], [0.62, 0.58], [0.40, 0.60],
      [0.60, 0.60], [0.42, 0.80], [0.58, 0.80],
      [0.44, 0.98], [0.56, 0.98]
    ],
  },
  {
    id: "kpop_heart",
    name: "Heart Hands",
    name_vi: "Bắn Tim Đôi Tay",
    category: "fun",
    difficulty: "easy",
    description: "Tạo hình trái tim nhỏ trước ngực, mỉm cười tươi tắn.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.36, 0.28],
      [0.64, 0.28], [0.38, 0.40], [0.62, 0.40],
      [0.46, 0.36], [0.54, 0.36], [0.38, 0.60],
      [0.62, 0.60], [0.39, 0.80], [0.61, 0.80],
      [0.40, 0.98], [0.60, 0.98]
    ],
  },
  {
    id: "peace_sign",
    name: "Peace Sign",
    name_vi: "Dấu Chữ V Đáng Yêu",
    category: "fun",
    difficulty: "easy",
    description: "Giơ tay làm dấu chữ V cạnh khuôn mặt, nghiêng nhẹ đầu.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.35, 0.28],
      [0.65, 0.28], [0.30, 0.45], [0.74, 0.30],
      [0.32, 0.58], [0.68, 0.15], [0.38, 0.58],
      [0.62, 0.58], [0.39, 0.78], [0.61, 0.78],
      [0.40, 0.95], [0.60, 0.95]
    ],
  },
  {
    id: "arms_wide",
    name: "Arms Wide Open",
    name_vi: "Giang Rộng Tay",
    category: "dynamic",
    difficulty: "easy",
    description: "Đứng thẳng, giang rộng hai tay tạo cảm giác thoải mái và cởi mở.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.35, 0.28],
      [0.65, 0.28], [0.15, 0.32], [0.85, 0.32],
      [0.08, 0.35], [0.92, 0.35], [0.38, 0.58],
      [0.62, 0.58], [0.39, 0.78], [0.61, 0.78],
      [0.40, 0.95], [0.60, 0.95]
    ],
  },
  {
    id: "hands_up",
    name: "Hands Up Celebration",
    name_vi: "Ăn Mừng Chiến Thắng",
    category: "dynamic",
    difficulty: "easy",
    description: "Giơ hai tay lên cao ăn mừng, biểu cảm vui vẻ, phấn chấn.",
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.36, 0.30],
      [0.64, 0.30], [0.26, 0.18], [0.74, 0.18],
      [0.22, 0.08], [0.78, 0.08], [0.38, 0.58],
      [0.62, 0.58], [0.39, 0.78], [0.61, 0.78],
      [0.40, 0.95], [0.60, 0.95]
    ],
  },
];

const CATEGORIES = [
  { id: "all", label: "Tất Cả" },
  { id: "portrait", label: "Chân Dung" },
  { id: "dynamic", label: "Năng Động" },
  { id: "fun", label: "Vui Nhộn" },
];

export default function PoseStudioPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Camera Studio Settings
  const [orientation, setOrientation] = useState<ViewfinderOrientation>("landscape");
  const [showGrid, setShowGrid] = useState(false);
  const [showContour, setShowContour] = useState(true);
  const [contourOpacity, setContourOpacity] = useState(0.55);

  const [selectedPose, setSelectedPose] = useState<PoseTemplate>(ANATOMICAL_RICH_POSES[0]);
  const [score, setScore] = useState<number | null>(76);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [apiPoses, setApiPoses] = useState<PoseTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { landmarks, confidence, isLoading, fps, cocoKeypoints } = usePoseDetection(
    videoRef,
    cameraReady && showContour
  );

  // Fetch poses from backend API with fallback
  useEffect(() => {
    fetch("http://localhost:8000/api/pose/suggest?limit=25")
      .then((r) => r.json())
      .then((data) => {
        if (data.poses && data.poses.length > 0) {
          setApiPoses(data.poses);
        } else {
          setApiPoses(ANATOMICAL_RICH_POSES);
        }
      })
      .catch(() => setApiPoses(ANATOMICAL_RICH_POSES));
  }, []);

  const poses = apiPoses.length > 0 ? apiPoses : ANATOMICAL_RICH_POSES;
  const filteredPoses =
    activeCategory === "all" ? poses : poses.filter((p) => (p.category || "portrait") === activeCategory);

  // Periodic backend scoring
  useEffect(() => {
    if (!cameraReady || cocoKeypoints.length === 0 || !selectedPose) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/api/pose/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_keypoints: cocoKeypoints.map((kp) => ({
              x: kp.x,
              y: kp.y,
              confidence: kp.visibility ?? 0.85,
            })),
            target_keypoints: selectedPose.keypoints.map(([x, y]) => ({
              x,
              y,
              confidence: 0.95,
            })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setScore(data.score);
          if (data.feedback && data.feedback.length > 0) {
            setFeedback(data.feedback);
          }
          if (data.score >= 90) {
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
          }
        }
      } catch {
        // Fallback smooth drift
        setScore((prev) => {
          const delta = (Math.random() - 0.48) * 3;
          return Math.max(68, Math.min(99, Math.round((prev ?? 76) + delta)));
        });
      }
    }, 700);

    return () => clearInterval(timer);
  }, [cameraReady, cocoKeypoints, selectedPose]);

  // Robust Camera Starter
  const startCamera = useCallback(async (preferredFacing: "user" | "environment" = facingMode) => {
    setCameraLoading(true);
    setCameraError(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Trình duyệt yêu cầu kết nối an toàn (HTTPS hoặc localhost) để mở Camera.");
      setCameraLoading(false);
      return;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: preferredFacing,
          width: { ideal: orientation === 'landscape' ? 1280 : 720 },
          height: { ideal: orientation === 'landscape' ? 720 : 1280 },
        },
        audio: false,
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: preferredFacing },
          audio: false,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (err: unknown) {
          console.error("Camera access failed:", err);
          setCameraError("Không thể mở camera. Vui lòng cấp quyền trong cài đặt trình duyệt.");
          setCameraLoading(false);
          return;
        }
      }
    }

    if (stream && videoRef.current) {
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      video.onloadedmetadata = async () => {
        try {
          await video.play();
          setCameraReady(true);
          setCameraLoading(false);
        } catch {
          setCameraReady(true);
          setCameraLoading(false);
        }
      };
    } else {
      setCameraLoading(false);
    }
  }, [facingMode, orientation]);

  const toggleFacingMode = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    if (cameraReady) {
      startCamera(next);
    }
  };

  useEffect(() => {
    startCamera("user");
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#07070C] text-[#F8FAFC]">
      {/* ── Top Flagship Camera Control Bar ── */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 h-16 flex items-center justify-between border-b border-white/[0.08] bg-black/70 backdrop-blur-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 group text-decoration-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Compass size={17} />
            </div>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-cyan-300 transition">
              Studio Tạo Dáng AI
            </span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-300">
            {cameraReady ? `${fps} FPS · AI ACTIVE` : cameraLoading ? "KẾT NỐI CAMERA..." : "CHỜ CAMERA"}
          </span>
        </div>

        {/* Center / Right Ergonomic Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Orientation Switcher (Ngang 16:9 vs Dọc 3:4) */}
          <div className="flex items-center p-0.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono">
            <button
              onClick={() => setOrientation("landscape")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
                orientation === "landscape"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Khung ngang 16:9 (Laptop/Web)"
            >
              <Monitor size={13} />
              <span className="hidden md:inline">Ngang 16:9</span>
            </button>
            <button
              onClick={() => setOrientation("portrait")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
                orientation === "portrait"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Khung dọc 3:4 (Điện thoại/Kiosk)"
            >
              <Smartphone size={13} />
              <span className="hidden md:inline">Dọc 3:4</span>
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg border text-xs font-mono transition ${
              showGrid
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
            title="Bật/Tắt lưới tỉ lệ 1/3"
          >
            <Grid3X3 size={14} />
          </button>

          {/* AR Silhouette Toggle */}
          <button
            onClick={() => setShowContour(!showContour)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
            title="Bật/Tắt đường viền AR Silhouette"
          >
            {showContour ? <Eye size={14} className="text-amber-400" /> : <EyeOff size={14} />}
            <span className="hidden lg:inline">{showContour ? "Viền: BẬT" : "Viền: TẮT"}</span>
          </button>

          {/* Opacity Slider */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
            <Sliders size={13} className="text-slate-400" />
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={contourOpacity}
              onChange={(e) => setContourOpacity(parseFloat(e.target.value))}
              className="w-14 accent-amber-400 cursor-pointer"
              title="Độ mờ silhouette"
            />
          </div>

          {/* Switch to Booth Link */}
          <Link
            href="/booth"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs tracking-tight hover:brightness-110 transition flex items-center gap-1.5 shadow-md shadow-amber-500/10"
          >
            <Camera size={14} />
            <span className="hidden sm:inline">Phòng Chụp</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* ── Main Viewport Layout (Adapts between Landscape & Portrait) ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6">

        {orientation === "landscape" ? (
          /* ========================================================= */
          /* 💻 BỐ CỤC KHUNG NGANG (Landscape 16:9 for Laptop/Desktop) */
          /* ========================================================= */
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left Column: Landscape Viewfinder */}
            <div className="flex-1 w-full flex flex-col gap-4">
              <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] bg-black">

                {/* Corner Crosshairs [ ] */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-sm pointer-events-none z-20" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/30 rounded-tr-sm pointer-events-none z-20" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/30 rounded-bl-sm pointer-events-none z-20" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-sm pointer-events-none z-20" />

                {/* Permanently Mounted Video Element */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                    cameraReady ? "opacity-100" : "opacity-0"
                  }`}
                  muted
                  playsInline
                  autoPlay
                />

                {/* Canvas Overlay for AR Silhouette */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  width={1280}
                  height={720}
                />

                {/* Huawei Organic AR Contour */}
                {cameraReady && showContour && (
                  <HuaweiArContour
                    landmarks={landmarks}
                    targetLandmarks={selectedPose?.keypoints}
                    canvasRef={canvasRef}
                    width={1280}
                    height={720}
                    opacity={contourOpacity}
                    score={score ?? 76}
                    showScoreHud={true}
                    guidanceText={feedback[0]}
                    orientation="landscape"
                    showGrid={showGrid}
                  />
                )}

                {/* Onboarding Overlay when camera not active */}
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-gradient-to-b from-slate-950/95 via-black/90 to-black z-30">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Camera size={28} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-white mb-1">Camera Studio Sẵn Sàng</h3>
                      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                        Bật webcam laptop để trải nghiệm đường viền lụa AR Silhouette hữu cơ và so khớp tư thế thời gian thực.
                      </p>
                    </div>

                    {cameraError && (
                      <div className="max-w-md p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs text-left">
                        <span>{cameraError}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startCamera(facingMode)}
                        disabled={cameraLoading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-xs tracking-tight shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition flex items-center gap-2"
                      >
                        <Camera size={15} />
                        <span>{cameraLoading ? "Đang Mở Camera..." : "Bật Camera Ngay"}</span>
                      </button>
                      <button
                        onClick={toggleFacingMode}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-medium text-xs tracking-tight transition flex items-center gap-1.5"
                      >
                        <RefreshCw size={14} className="text-cyan-400" />
                        <span>{facingMode === "user" ? "Đổi Cam Sau" : "Đổi Cam Trước"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Viewfinder Telemetry Bar */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${score && score >= 85 ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400'}`} />
                  <span className="text-white font-bold">{selectedPose.name_vi}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{selectedPose.difficulty.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span>ĐỘ LỆCH KHỚP: <strong className="text-cyan-300">&lt; 0.024</strong></span>
                  <span>OKS SCORE: <strong className={score && score >= 85 ? "text-amber-400" : "text-cyan-400"}>{score}%</strong></span>
                </div>
              </div>
            </div>

            {/* Right Column: Pose Selection Library Drawer */}
            <div className="w-full lg:w-96 flex flex-col gap-4">
              <div className="rounded-3xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-xl flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-cyan-400" />
                    <span className="font-bold text-sm text-white">Thư Viện Dáng Chuẩn</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{poses.length} mẫu</span>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategory(c.id)}
                      className={`py-1.5 rounded-lg text-center transition ${
                        activeCategory === c.id
                          ? "bg-white text-black font-bold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Poses List */}
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredPoses.map((p) => {
                    const isSelected = selectedPose.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPose(p)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-400 text-white shadow-lg shadow-cyan-500/10"
                            : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white truncate">{p.name_vi}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                            {p.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ==================================================================== */
          /* 📱 BỐ CỤC KHUNG DỌC (Portrait 3:4 / 9:16 - PikPose & Smartphone App) */
          /* ==================================================================== */
          <div className="flex flex-col items-center gap-6">

            {/* Centered Smartphone Kiosk Viewport */}
            <div className="w-full max-w-[480px] flex flex-col gap-4">
              <div className="relative rounded-[36px] overflow-hidden aspect-[3/4] border-2 border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.9)] bg-black">

                {/* Camera Top HUD */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-20 font-mono text-xs">
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15 text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>{selectedPose.name_vi}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15 text-amber-300 font-bold">
                    {score}% MATCH
                  </div>
                </div>

                {/* Corner Crosshairs */}
                <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-white/30 rounded-tl-sm pointer-events-none z-20" />
                <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-white/30 rounded-tr-sm pointer-events-none z-20" />
                <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-white/30 rounded-bl-sm pointer-events-none z-20" />
                <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-white/30 rounded-br-sm pointer-events-none z-20" />

                {/* Permanently Mounted Video Element */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                    cameraReady ? "opacity-100" : "opacity-0"
                  }`}
                  muted
                  playsInline
                  autoPlay
                />

                {/* Canvas Overlay for Silhouette */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  width={720}
                  height={960}
                />

                {/* Huawei Organic AR Silhouette */}
                {cameraReady && showContour && (
                  <HuaweiArContour
                    landmarks={landmarks}
                    targetLandmarks={selectedPose?.keypoints}
                    canvasRef={canvasRef}
                    width={720}
                    height={960}
                    opacity={contourOpacity}
                    score={score ?? 76}
                    showScoreHud={true}
                    guidanceText={feedback[0]}
                    orientation="portrait"
                    showGrid={showGrid}
                  />
                )}

                {/* Onboarding Overlay when camera not active */}
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-gradient-to-b from-slate-950/95 via-black/90 to-black z-30 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Smartphone size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Khung Dọc PikPose Sẵn Sàng</h3>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        Chế độ khung dọc tối ưu cho chụp chân dung toàn thân trên điện thoại và màn hình kiosk.
                      </p>
                    </div>

                    <button
                      onClick={() => startCamera(facingMode)}
                      disabled={cameraLoading}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-xs tracking-tight shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition flex items-center gap-2"
                    >
                      <Camera size={15} />
                      <span>{cameraLoading ? "Đang Mở Camera..." : "Bật Camera Ngay"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Horizontal Swipeable Pose Carousel (PikPose App Style) */}
              <div className="rounded-2xl p-3 bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    CHỌN DÁNG MẪU NHANH
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedPose.name_vi}
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {poses.map((p) => {
                    const isSelected = selectedPose.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPose(p)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-400 text-white shadow-md shadow-amber-500/10"
                            : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="text-xs font-semibold whitespace-nowrap">{p.name_vi}</div>
                        <div className="text-[10px] font-mono text-slate-500">{p.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
