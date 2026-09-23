"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Camera, Eye, EyeOff, RotateCcw, Download, Sparkles, RefreshCw, Layers } from "lucide-react";
import confetti from "canvas-confetti";
import { usePoseDetection } from "@/lib/mediapipe/usePoseDetection";
import { PoseSkeleton } from "@/components/pose/PoseSkeleton";
import { usePhotoBooth, CountdownDisplay } from "@/components/booth/PhotoBoothController";
import type { ShotMode, CapturedShot } from "@/types/pose";

const SHOT_MODES: { mode: ShotMode; label: string; badge: string }[] = [
  { mode: "single", label: "1 Ảnh Đơn", badge: "Nhanh" },
  { mode: "triple", label: "3 Dải Strip", badge: "Phổ Biến" },
  { mode: "quad", label: "4 Ảnh Grid", badge: "Collage" },
  { mode: "video", label: "GIF 3 Giây", badge: "Động" },
];

const FRAME_COLORS = [
  { id: "white", name: "Trắng Studio", bg: "bg-white", border: "border-slate-300" },
  { id: "rose", name: "Hồng Pastel", bg: "bg-rose-50", border: "border-rose-200" },
  { id: "mint", name: "Xanh Bạc Hà", bg: "bg-emerald-50", border: "border-emerald-200" },
  { id: "sky", name: "Xanh Da Trời", bg: "bg-sky-50", border: "border-sky-200" },
  { id: "dark", name: "Đen Điện Ảnh", bg: "bg-slate-900", border: "border-slate-800", text: "text-white" },
];

export default function BoothPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shotMode, setShotMode] = useState<ShotMode>("triple");
  const [completedShots, setCompletedShots] = useState<CapturedShot[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [activeFrame, setActiveFrame] = useState(FRAME_COLORS[0]);

  // AI Pose detection
  const { landmarks, confidence, isLoading, fps } = usePoseDetection(
    videoRef,
    cameraReady && showSkeleton
  );

  // Completion trigger with confetti celebration
  const handleShotsComplete = useCallback((shots: CapturedShot[]) => {
    setCompletedShots(shots);
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#f43f5e", "#3b82f6", "#10b981", "#fbbf24"],
    });
  }, []);

  // Photobooth state machine
  const { state, countdown, currentShot, totalShots, start, reset } = usePhotoBooth({
    videoRef,
    mode: shotMode,
    onComplete: handleShotsComplete,
  });

  // Start webcam stream
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch {
      alert("Không thể mở camera. Vui lòng cấp quyền truy cập camera trong trình duyệt.");
    }
  }, []);

  const downloadShot = useCallback((shot: CapturedShot, index: number) => {
    const a = document.createElement("a");
    a.href = shot.imageData;
    a.download = `posebooth_shot_${index + 1}.jpg`;
    a.click();
  }, []);

  const downloadAll = useCallback(() => {
    completedShots.forEach((shot, i) => downloadShot(shot, i));
  }, [completedShots, downloadShot]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col">
      {/* Studio Header */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-15 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Photobooth Studio
              </span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {cameraReady ? `${fps} FPS · ${Math.round(confidence * 100)}% CONF` : "SẴN SÀNG"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className="btn-secondary text-xs py-2 px-3"
            >
              {showSkeleton ? <Eye className="w-3.5 h-3.5 text-rose-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>Khung xương: {showSkeleton ? "Bật" : "Tắt"}</span>
            </button>
            <Link href="/pose-studio" className="btn-secondary text-xs py-2 px-3">
              Pose Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Camera Stage */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Viewport Box */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video shadow-md border border-slate-300">
            {!cameraReady ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-rose-400 mb-1">
                  <Camera className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-base text-white">Camera Studio Sẵn Sàng</p>
                  <p className="text-xs text-slate-400 mt-1">Bấm nút bên dưới để kết nối camera máy tính</p>
                </div>
                <button
                  onClick={startCamera}
                  className="btn-shutter text-xs px-6 py-2.5 mt-2"
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Bật Camera Ngay
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  muted
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="skeleton-canvas"
                  width={1280}
                  height={720}
                />
                <PoseSkeleton
                  landmarks={landmarks}
                  canvasRef={canvasRef}
                  width={1280}
                  height={720}
                />

                {/* Animated GSAP Countdown Overlay */}
                {state === "countdown" && (
                  <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] flex items-center justify-center">
                    <CountdownDisplay countdown={countdown} total={3} />
                  </div>
                )}

                {/* Shutter Flash Animation */}
                {state === "capturing" && (
                  <div className="absolute inset-0 bg-white opacity-90 transition-opacity duration-150 pointer-events-none" />
                )}

                {/* Studio Live Badges */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  {isLoading && (
                    <div className="bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-white border border-slate-700 flex items-center gap-2 font-mono">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      <span>Đang nạp AI Pose...</span>
                    </div>
                  )}
                  {state !== "idle" && state !== "review" && (
                    <div className="bg-gradient-to-r from-rose-600 to-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold shadow-sm">
                      ẢNH SỐ {currentShot + 1} / {totalShots}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Studio Control Toolbar */}
          <div className="studio-card p-4 flex flex-wrap items-center justify-between gap-4 bg-white">
            {/* Mode Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {SHOT_MODES.map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => {
                    setShotMode(mode);
                    reset();
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    shotMode === mode
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Shutter Button & Review Actions */}
            <div className="flex items-center gap-3">
              {state === "review" ? (
                <>
                  <button onClick={downloadAll} className="btn-shutter text-xs">
                    <Download className="w-3.5 h-3.5" /> Tải Toàn Bộ Ảnh
                  </button>
                  <button onClick={reset} className="btn-secondary text-xs">
                    <RotateCcw className="w-3.5 h-3.5" /> Chụp Lại
                  </button>
                </>
              ) : (
                <button
                  onClick={cameraReady ? start : startCamera}
                  disabled={state === "countdown" || state === "capturing"}
                  className="btn-shutter text-xs px-7 py-3 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {!cameraReady
                      ? "Kích hoạt Camera"
                      : state === "idle"
                      ? "Bấm Chụp Ảnh"
                      : "Đang Chụp..."}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Photo Strip Console */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="studio-card p-4 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Dải Khung Ảnh Strip
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {completedShots.length} / {totalShots}
            </span>
          </div>

          {/* Frame Theme Picker */}
          <div className="studio-card p-3.5 bg-white flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Màu Khung Ảnh:</span>
            </span>
            <div className="flex items-center gap-2">
              {FRAME_COLORS.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setActiveFrame(frame)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${frame.bg} ${
                    activeFrame.id === frame.id ? "scale-110 ring-2 ring-rose-500 ring-offset-2" : "border-slate-300 opacity-80"
                  }`}
                  title={frame.name}
                />
              ))}
            </div>
          </div>

          {/* Film Strip View */}
          <div className={`studio-card p-4 flex-1 flex flex-col gap-3 min-h-[420px] max-h-[660px] overflow-y-auto ${activeFrame.bg} border-2 ${activeFrame.border}`}>
            {completedShots.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Camera className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-xs font-bold text-slate-600">Dải ảnh đang chờ chụp</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                  Bấm chụp để ảnh xuất hiện trong dải khung photobooth
                </p>
              </div>
            ) : (
              completedShots.map((shot, idx) => (
                <div
                  key={shot.id}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.imageData}
                    alt={`Shot ${idx + 1}`}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => downloadShot(shot, idx)}
                      className="p-2 rounded-full bg-white text-slate-900 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-md"
                      title="Tải ảnh này về"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    SHOT #{idx + 1}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
