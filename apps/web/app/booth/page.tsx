"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Camera, Eye, EyeOff, RotateCcw, Download, Check, RefreshCw } from "lucide-react";
import { usePoseDetection } from "@/lib/mediapipe/usePoseDetection";
import { PoseSkeleton } from "@/components/pose/PoseSkeleton";
import { usePhotoBooth, CountdownDisplay } from "@/components/booth/PhotoBoothController";
import type { ShotMode, CapturedShot } from "@/types/pose";

const SHOT_MODES: { mode: ShotMode; label: string; desc: string }[] = [
  { mode: "single", label: "1 Ảnh", desc: "Chụp 1 ảnh đơn" },
  { mode: "triple", label: "3 Strip", desc: "Dải 3 ảnh photobooth" },
  { mode: "quad", label: "4 Grid", desc: "Lưới 4 ảnh 2x2" },
  { mode: "video", label: "GIF 3s", desc: "Video lặp ngắn" },
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

  // Photobooth state machine
  const { state, countdown, shots, currentShot, totalShots, start, reset } = usePhotoBooth({
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
      alert("Không thể truy cập camera. Vui lòng cấp quyền truy cập camera trong trình duyệt.");
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                PB
              </span>
              <span className="font-semibold text-sm tracking-tight text-slate-900">
                Photobooth Studio
              </span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs text-slate-500 font-mono">
              {cameraReady ? `${fps} FPS · ${Math.round(confidence * 100)}% CONF` : "STANDBY"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              {showSkeleton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Khung xương: {showSkeleton ? "Bật" : "Tắt"}</span>
            </button>
            <Link href="/pose-studio" className="btn-secondary text-xs py-1.5 px-3">
              Pose Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Camera Stage & Controls */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Viewport Frame */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video shadow-sm border border-slate-300">
            {!cameraReady ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
                <Camera className="w-10 h-10 text-slate-500 stroke-[1.5]" />
                <div className="text-center">
                  <p className="font-medium text-sm text-white">Camera chưa được kích hoạt</p>
                  <p className="text-xs text-slate-400 mt-0.5">Nhấn nút bên dưới để mở webcam cục bộ</p>
                </div>
                <button
                  onClick={startCamera}
                  className="btn-primary text-xs px-5 py-2.5 mt-2 bg-blue-600 hover:bg-blue-700"
                >
                  Bật Camera Web
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
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                    <CountdownDisplay countdown={countdown} total={3} />
                  </div>
                )}

                {/* Flash capture animation */}
                {state === "capturing" && (
                  <div className="absolute inset-0 bg-white opacity-80 transition-opacity duration-150 pointer-events-none" />
                )}

                {/* Status Bar inside viewport */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {isLoading && (
                    <div className="bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 font-mono">
                      <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                      <span>Loading MediaPipe...</span>
                    </div>
                  )}
                  {state !== "idle" && state !== "review" && (
                    <div className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-mono font-semibold">
                      SHOT {currentShot + 1} / {totalShots}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Studio Control Toolbar */}
          <div className="studio-card p-4 flex flex-wrap items-center justify-between gap-4 bg-white">
            {/* Mode selection buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
              {SHOT_MODES.map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => {
                    setShotMode(mode);
                    reset();
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    shotMode === mode
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Shutter actions */}
            <div className="flex items-center gap-3">
              {state === "review" ? (
                <>
                  <button onClick={downloadAll} className="btn-accent text-xs">
                    <Download className="w-3.5 h-3.5" /> Tải tất cả ảnh
                  </button>
                  <button onClick={reset} className="btn-secondary text-xs">
                    <RotateCcw className="w-3.5 h-3.5" /> Chụp lại
                  </button>
                </>
              ) : (
                <button
                  onClick={cameraReady ? start : startCamera}
                  disabled={state === "countdown" || state === "capturing"}
                  className="btn-primary text-xs px-6 py-2.5 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {!cameraReady
                      ? "Bật camera"
                      : state === "idle"
                      ? "Bấm chụp"
                      : "Đang chụp..."}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Rail: Photo Strip & Review */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="studio-card p-4 flex items-center justify-between bg-white">
            <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
              Dải Ảnh Photobooth
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {completedShots.length} / {totalShots}
            </span>
          </div>

          <div className="studio-card p-3 flex-1 flex flex-col gap-3 min-h-[400px] max-h-[680px] overflow-y-auto bg-white">
            {completedShots.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Camera className="w-8 h-8 stroke-[1.5] text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-500">Chưa có ảnh nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ảnh chụp sẽ hiển thị ở đây sau khi hoàn thành lượt chụp
                </p>
              </div>
            ) : (
              completedShots.map((shot, idx) => (
                <div
                  key={shot.id}
                  className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
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
                      className="p-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
                      title="Tải ảnh này về"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
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
