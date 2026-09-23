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
  { id: "dark",    name: "Đen Điện Ảnh",  bg: "bg-slate-900",   border: "border-slate-700" },
  { id: "violet",  name: "Tím Prism",      bg: "bg-violet-950",  border: "border-violet-800" },
  { id: "cyan",    name: "Xanh Neon",      bg: "bg-cyan-950",    border: "border-cyan-800" },
  { id: "slate",   name: "Xám Tro",        bg: "bg-slate-800",   border: "border-slate-600" },
  { id: "black",   name: "Đen Tuyệt Đối",  bg: "bg-black",       border: "border-slate-900" },
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
      colors: ["#A855F7", "#06B6D4", "#F0ABFC", "#10b981"],
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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ── Navigation Bar ── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(10,10,15,0.85)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                style={{ background: "linear-gradient(135deg,#A855F7,#06B6D4)" }}
              >
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
                Photobooth Studio
              </span>
            </Link>

            <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />

            <span
              className="glass-pill text-xs font-mono font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              {cameraReady ? `${fps} FPS · ${Math.round(confidence * 100)}% CONF` : "SẴN SÀNG"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className="btn-glass text-xs py-2 px-3"
            >
              {showSkeleton
                ? <Eye className="w-3.5 h-3.5" style={{ color: "#A855F7" }} />
                : <EyeOff className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />}
              <span>Khung xương: {showSkeleton ? "Bật" : "Tắt"}</span>
            </button>
            <Link href="/pose-studio" className="btn-glass text-xs py-2 px-3">
              Pose Studio
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Studio Area ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col lg:flex-row gap-6">

        {/* Left Column: Camera Stage */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Camera Viewport */}
          <div
            className="relative rounded-2xl overflow-hidden aspect-video"
            style={{
              background: "#050508",
              border: "1px solid rgba(168,85,247,0.3)",
              boxShadow: "0 0 40px -8px rgba(168,85,247,0.35), 0 8px 32px -4px rgba(0,0,0,0.7)",
            }}
          >
            {!cameraReady ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ color: "var(--text-secondary)" }}>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
                  style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}
                >
                  <Camera className="w-8 h-8 stroke-[1.5]" style={{ color: "#A855F7" }} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Camera Studio Sẵn Sàng</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    Bấm nút bên dưới để kết nối camera máy tính
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="btn-prism-primary text-xs px-6 py-2.5 mt-1"
                >
                  <Camera className="w-4 h-4" />
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

                {/* Countdown Overlay */}
                {state === "countdown" && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: "rgba(10,10,15,0.7)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <div
                      className="glass-card p-8 flex flex-col items-center gap-2"
                      style={{ border: "1px solid rgba(168,85,247,0.4)" }}
                    >
                      <CountdownDisplay countdown={countdown} total={3} />
                    </div>
                  </div>
                )}

                {/* Shutter Flash */}
                {state === "capturing" && (
                  <div className="absolute inset-0 bg-white opacity-80 transition-opacity duration-150 pointer-events-none" />
                )}

                {/* Live Badges */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  {isLoading && (
                    <div
                      className="backdrop-blur px-3 py-1.5 rounded-lg text-xs border flex items-center gap-2 font-mono"
                      style={{
                        background: "rgba(10,10,15,0.9)",
                        borderColor: "rgba(168,85,247,0.3)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: "#A855F7" }} />
                      <span>Đang nạp AI Pose...</span>
                    </div>
                  )}
                  {state !== "idle" && state !== "review" && (
                    <div
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
                      style={{
                        background: "linear-gradient(135deg,#A855F7,#06B6D4)",
                        color: "#F8FAFC",
                      }}
                    >
                      ẢNH SỐ {currentShot + 1} / {totalShots}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Studio Control Toolbar */}
          <div
            className="glass-card p-4 flex flex-wrap items-center justify-between gap-4"
          >
            {/* Mode Selector */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {SHOT_MODES.map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => {
                    setShotMode(mode);
                    reset();
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={
                    shotMode === mode
                      ? {
                          background: "rgba(168,85,247,0.2)",
                          border: "1px solid rgba(168,85,247,0.5)",
                          color: "var(--text-primary)",
                        }
                      : {
                          background: "transparent",
                          border: "1px solid transparent",
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Shutter & Review Actions */}
            <div className="flex items-center gap-3">
              {state === "review" ? (
                <>
                  <button onClick={downloadAll} className="btn-prism-primary text-xs">
                    <Download className="w-3.5 h-3.5" /> Tải Toàn Bộ Ảnh
                  </button>
                  <button onClick={reset} className="btn-glass text-xs">
                    <RotateCcw className="w-3.5 h-3.5" /> Chụp Lại
                  </button>
                </>
              ) : (
                <button
                  onClick={cameraReady ? start : startCamera}
                  disabled={state === "countdown" || state === "capturing"}
                  className="btn-prism-primary text-xs px-7 py-3 disabled:opacity-50"
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

          {/* Header */}
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: "#A855F7" }} />
              <span
                className="font-bold text-xs uppercase tracking-wider"
                style={{ color: "var(--text-primary)" }}
              >
                Dải Khung Ảnh Strip
              </span>
            </div>
            <span className="glass-pill text-xs font-mono font-bold">
              {completedShots.length} / {totalShots}
            </span>
          </div>

          {/* Frame Theme Picker */}
          <div className="glass-card p-3.5 flex flex-col gap-2">
            <span
              className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Màu Khung Ảnh:</span>
            </span>
            <div className="flex items-center gap-2">
              {FRAME_COLORS.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setActiveFrame(frame)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${frame.bg}`}
                  style={
                    activeFrame.id === frame.id
                      ? {
                          borderColor: "#A855F7",
                          transform: "scale(1.15)",
                          boxShadow: "0 0 0 2px rgba(168,85,247,0.4)",
                        }
                      : { borderColor: "rgba(255,255,255,0.15)", opacity: 0.75 }
                  }
                  title={frame.name}
                />
              ))}
            </div>
          </div>

          {/* Film Strip View */}
          <div
            className={`glass-card p-4 flex-1 flex flex-col gap-3 min-h-[420px] max-h-[660px] overflow-y-auto film-strip ${activeFrame.bg} border-2 ${activeFrame.border}`}
          >
            {completedShots.length === 0 ? (
              <div
                className="flex-1 flex flex-col items-center justify-center text-center p-6"
                style={{ color: "var(--text-muted)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{
                    background: "rgba(168,85,247,0.08)",
                    border: "1px solid rgba(168,85,247,0.2)",
                  }}
                >
                  <Camera className="w-6 h-6 stroke-[1.5]" style={{ color: "#A855F7" }} />
                </div>
                <p className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                  Dải ảnh đang chờ chụp
                </p>
                <p
                  className="text-[11px] mt-1 max-w-[180px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Bấm chụp để ảnh xuất hiện trong dải khung photobooth
                </p>
              </div>
            ) : (
              completedShots.map((shot, idx) => (
                <div
                  key={shot.id}
                  className="group relative rounded-xl overflow-hidden"
                  style={{
                    border: "1px solid rgba(168,85,247,0.2)",
                    background: "rgba(0,0,0,0.4)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.imageData}
                    alt={`Shot ${idx + 1}`}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => downloadShot(shot, idx)}
                      className="p-2 rounded-full transition-colors shadow-md"
                      style={{
                        background: "rgba(168,85,247,0.85)",
                        color: "#F8FAFC",
                      }}
                      title="Tải ảnh này về"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <div
                    className="absolute bottom-1.5 left-1.5 text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(10,10,15,0.85)",
                      color: "var(--text-secondary)",
                      border: "1px solid rgba(168,85,247,0.25)",
                    }}
                  >
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
