"use client";

/**
 * Photobooth Page — Main feature page
 * Webcam + AI skeleton overlay + countdown + multi-shot + export
 */
import { useRef, useState, useCallback } from "react";
import { usePoseDetection } from "@/lib/mediapipe/usePoseDetection";
import { PoseSkeleton } from "@/components/pose/PoseSkeleton";
import {
  usePhotoBooth,
  CountdownDisplay,
} from "@/components/booth/PhotoBoothController";
import type { ShotMode, CapturedShot } from "@/types/pose";

const SHOT_MODES: { mode: ShotMode; label: string; icon: string }[] = [
  { mode: "single", label: "1 Shot", icon: "1️⃣" },
  { mode: "triple", label: "3 Strip", icon: "3️⃣" },
  { mode: "quad",   label: "4 Grid", icon: "4️⃣" },
  { mode: "video",  label: "GIF 3s", icon: "🎞️" },
];

export default function BoothPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shotMode, setShotMode] = useState<ShotMode>("triple");
  const [completedShots, setCompletedShots] = useState<CapturedShot[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // AI Pose detection
  const { landmarks, confidence, isLoading, fps } = usePoseDetection(
    videoRef,
    cameraReady && showSkeleton
  );

  // Photobooth controller
  const { state, countdown, shots, currentShot, totalShots, start, reset } =
    usePhotoBooth({
      videoRef,
      mode: shotMode,
      onComplete: setCompletedShots,
    });

  // Start camera
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
      alert("Không thể truy cập camera. Vui lòng cho phép quyền camera.");
    }
  }, []);

  // Download shots
  const downloadShot = useCallback((shot: CapturedShot, index: number) => {
    const a = document.createElement("a");
    a.href = shot.imageData;
    a.download = `pikpose_shot_${index + 1}.jpg`;
    a.click();
  }, []);

  const downloadAll = useCallback(() => {
    completedShots.forEach((shot, i) => downloadShot(shot, i));
  }, [completedShots, downloadShot]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xl">📸</span>
          <span className="font-bold">PikPose Booth</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {cameraReady && (
            <span className="text-white/40 font-mono">
              {fps}fps · {Math.round(confidence * 100)}% conf
            </span>
          )}
          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className="px-3 py-1.5 rounded-lg glass glass-hover text-xs"
          >
            {showSkeleton ? "🦴 Skeleton ON" : "🦴 Skeleton OFF"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-5 p-5 max-w-7xl mx-auto w-full">
        {/* Left: Camera View */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Camera box */}
          <div className="relative rounded-2xl overflow-hidden glass aspect-video">
            {!cameraReady ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <span className="text-5xl">📷</span>
                <p className="text-white/60">Camera chưa bật</p>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold transition-colors"
                >
                  Bật Camera
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

                {/* Countdown overlay */}
                {state === "countdown" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <CountdownDisplay countdown={countdown} total={3} />
                  </div>
                )}

                {/* Capture flash */}
                {state === "capturing" && (
                  <div className="absolute inset-0 bg-white/30 animate-ping" />
                )}

                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 glass px-3 py-1.5 rounded-lg text-xs text-white/70">
                    <span className="animate-spin">⚙️</span>
                    Đang tải AI model...
                  </div>
                )}

                {/* Shot counter */}
                {state !== "idle" && state !== "review" && (
                  <div className="absolute top-3 right-3 glass px-3 py-1.5 rounded-lg text-sm font-mono">
                    Shot {currentShot + 1} / {totalShots}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Shot mode selector */}
            <div className="flex gap-2">
              {SHOT_MODES.map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  onClick={() => { setShotMode(mode); reset(); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    shotMode === mode
                      ? "bg-violet-600 text-white"
                      : "glass glass-hover text-white/60"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Action buttons */}
            {state === "review" ? (
              <div className="flex gap-3">
                <button
                  onClick={downloadAll}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition-colors"
                >
                  ⬇️ Tải Tất Cả
                </button>
                <button
                  onClick={reset}
                  className="px-5 py-2.5 rounded-xl glass glass-hover font-semibold"
                >
                  🔄 Chụp Lại
                </button>
              </div>
            ) : (
              <button
                onClick={cameraReady ? start : startCamera}
                disabled={state === "countdown" || state === "capturing"}
                className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all hover:scale-105 active:scale-95"
              >
                {!cameraReady ? "📷 Bật Camera" : state === "idle" ? "📸 Chụp!" : "⏳ Đang chụp..."}
              </button>
            )}
          </div>
        </div>

        {/* Right: Photo Strip */}
        {(completedShots.length > 0 || shots.length > 0) && (
          <div className="w-64 flex flex-col gap-3">
            <h3 className="font-semibold text-white/80 text-sm">Ảnh Đã Chụp</h3>
            <div className="photo-strip">
              {completedShots.map((shot, i) => (
                <div
                  key={shot.id}
                  className="relative group cursor-pointer"
                  onClick={() => downloadShot(shot, i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.imageData}
                    alt={`Shot ${i + 1}`}
                    className="w-full rounded-md object-cover transition-opacity group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-2xl">⬇️</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
