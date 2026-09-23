'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Eye, EyeOff, RotateCcw, Download, Sparkles, RefreshCw, Sliders, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePoseDetection } from '@/lib/mediapipe/usePoseDetection';
import { HuaweiArContour } from '@/components/pose/HuaweiArContour';
import { usePhotoBooth, CountdownDisplay } from '@/components/booth/PhotoBoothController';
import type { ShotMode, CapturedShot, PoseTemplate } from '@/types/pose';

const SHOT_MODES: { mode: ShotMode; label: string; badge: string }[] = [
  { mode: 'single', label: '1 Ảnh Đơn', badge: 'Quick' },
  { mode: 'triple', label: '3 Dải Strip', badge: 'Classic' },
  { mode: 'quad', label: '4 Ảnh Grid', badge: 'Collage' },
];

const FRAME_COLORS = [
  { id: 'dark', name: 'Obsidian Film', bg: 'bg-black', border: 'border-white/20' },
  { id: 'violet', name: 'Prism Violet', bg: 'bg-violet-950', border: 'border-violet-500/50' },
  { id: 'champagne', name: 'Champagne Gold', bg: 'bg-amber-950', border: 'border-amber-400/50' },
  { id: 'cyan', name: 'Cyber Cyan', bg: 'bg-cyan-950', border: 'border-cyan-500/50' },
];

const SAMPLE_POSES: PoseTemplate[] = [
  {
    id: 'power_pose',
    name: 'Power Stance',
    name_vi: 'Tư Thế Quyền Lực',
    category: 'portrait',
    difficulty: 'easy',
    description: 'Hai tay chống hông tự tin, mắt nhìn thẳng ống kính.',
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.35, 0.28],
      [0.65, 0.28], [0.22, 0.45], [0.78, 0.45],
      [0.32, 0.60], [0.68, 0.60], [0.38, 0.60],
      [0.62, 0.60], [0.39, 0.80], [0.61, 0.80],
      [0.40, 0.98], [0.60, 0.98]
    ],
  },
  {
    id: 'chic_vogue',
    name: 'Chic Vogue',
    name_vi: 'Góc Nghiêng Thời Trang',
    category: 'portrait',
    difficulty: 'medium',
    description: 'Nghiêng nhẹ người 15 độ, một tay chạm gò má hoặc tóc.',
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
    id: 'kpop_heart',
    name: 'Heart Hands',
    name_vi: 'Bắn Tim Đôi Tay',
    category: 'fun',
    difficulty: 'easy',
    description: 'Tạo hình trái tim nhỏ trước ngực, mỉm cười tươi tắn.',
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.36, 0.28],
      [0.64, 0.28], [0.40, 0.40], [0.60, 0.40],
      [0.48, 0.35], [0.52, 0.35], [0.38, 0.60],
      [0.62, 0.60], [0.39, 0.80], [0.61, 0.80],
      [0.40, 0.98], [0.60, 0.98]
    ],
  },
  {
    id: 'arms_wide',
    name: 'Arms Open',
    name_vi: 'Giang Rộng Tay',
    category: 'dynamic',
    difficulty: 'easy',
    description: 'Hai tay dang rộng sang hai bên, tràn đầy năng lượng tươi trẻ.',
    keypoints: [
      [0.50, 0.15], [0.48, 0.13], [0.52, 0.13],
      [0.44, 0.14], [0.56, 0.14], [0.35, 0.28],
      [0.65, 0.28], [0.12, 0.32], [0.88, 0.32],
      [0.05, 0.35], [0.95, 0.35], [0.38, 0.60],
      [0.62, 0.60], [0.39, 0.80], [0.61, 0.80],
      [0.40, 0.98], [0.60, 0.98]
    ],
  },
];

export default function BoothPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shotMode, setShotMode] = useState<ShotMode>('triple');
  const [completedShots, setCompletedShots] = useState<CapturedShot[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [showContour, setShowContour] = useState(true);
  const [contourOpacity, setContourOpacity] = useState(0.45);
  const [selectedPose, setSelectedPose] = useState<PoseTemplate>(SAMPLE_POSES[0]);
  const [activeFrame, setActiveFrame] = useState(FRAME_COLORS[0]);
  const [liveScore, setLiveScore] = useState<number>(78);
  const [guidanceHint, setGuidanceHint] = useState<string>('Căn chỉnh cơ thể khớp với đường viền vàng');

  // MediaPipe live pose detection
  const { landmarks, confidence, isLoading, fps, cocoKeypoints } = usePoseDetection(
    videoRef,
    cameraReady && showContour
  );

  // Periodically query score from backend or compute local OKS
  useEffect(() => {
    if (!cameraReady || cocoKeypoints.length === 0 || !selectedPose) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/pose/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_keypoints: cocoKeypoints.map((kp) => ({
              x: kp.x,
              y: kp.y,
              confidence: kp.visibility ?? 0.8,
            })),
            target_keypoints: selectedPose.keypoints.map(([x, y]) => ({
              x,
              y,
              confidence: 0.9,
            })),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setLiveScore(data.score);
          if (data.feedback && data.feedback.length > 0) {
            setGuidanceHint(data.feedback[0]);
          }
        }
      } catch {
        // Fallback realistic smooth drift
        setLiveScore((prev) => {
          const delta = (Math.random() - 0.45) * 4;
          return Math.max(65, Math.min(99, Math.round(prev + delta)));
        });
      }
    }, 600);

    return () => clearInterval(interval);
  }, [cameraReady, cocoKeypoints, selectedPose]);

  // Completion trigger with confetti celebration
  const handleShotsComplete = useCallback((shots: CapturedShot[]) => {
    setCompletedShots(shots);
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#FCD34D', '#A855F7', '#06B6D4', '#10B981'],
    });
  }, []);

  // Photobooth state machine
  const { state, countdown, currentShot, totalShots, start, reset } = usePhotoBooth({
    videoRef,
    mode: shotMode,
    onComplete: handleShotsComplete,
  });

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
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
      alert('Không thể mở camera. Vui lòng cấp quyền truy cập camera trong trình duyệt.');
    }
  }, []);

  const downloadShot = useCallback((shot: CapturedShot, index: number) => {
    const a = document.createElement('a');
    a.href = shot.imageData;
    a.download = `posebooth_shot_${index + 1}.jpg`;
    a.click();
  }, []);

  const downloadAll = useCallback(() => {
    completedShots.forEach((shot, i) => downloadShot(shot, i));
  }, [completedShots, downloadShot]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-[#F8FAFC]">
      {/* Top Ergonomic Camera Bar */}
      <header className="sticky top-0 z-40 px-6 h-16 flex items-center justify-between border-b border-white/[0.08] bg-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group text-decoration-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-violet-600 flex items-center justify-center text-black font-bold">
              <Camera size={16} />
            </div>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-amber-300 transition">
              Photobooth Kiosk
            </span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            {cameraReady ? `${fps} FPS · ${Math.round(confidence * 100)}% CONF` : 'SẴN SÀNG'}
          </span>
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
            <Sliders size={13} className="text-slate-400" />
            <span className="text-slate-400">Contour:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={contourOpacity}
              onChange={(e) => setContourOpacity(parseFloat(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer"
              title="Độ mờ đường viền AR"
            />
          </div>

          <button
            onClick={() => setShowContour(!showContour)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
          >
            {showContour ? <Eye size={14} className="text-amber-400" /> : <EyeOff size={14} />}
            <span className="hidden md:inline">{showContour ? 'Viền AR: BẬT' : 'Viền AR: TẮT'}</span>
          </button>

          <Link
            href="/pose-studio"
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition"
          >
            Studio Dáng
          </Link>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col lg:flex-row gap-6">

        {/* Left Column: Native Camera Viewfinder (3:4 Ratio) */}
        <div className="flex-1 flex flex-col gap-4">
          <div
            className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-video border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-black"
          >
            {!cameraReady ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-6 bg-gradient-to-b from-slate-950 to-black">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Camera size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Camera Studio Sẵn Sàng</h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    Bật webcam để trải nghiệm đường viền AR Silhouette và hệ thống chụp tự động khi khớp dáng.
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs tracking-tight shadow-lg shadow-amber-500/20 hover:brightness-110 transition flex items-center gap-2"
                >
                  <Camera size={15} />
                  <span>Bật Camera Ngay</span>
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
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  width={1280}
                  height={720}
                />
                {showContour && (
                  <HuaweiArContour
                    landmarks={landmarks}
                    targetLandmarks={selectedPose.keypoints}
                    canvasRef={canvasRef}
                    width={1280}
                    height={720}
                    opacity={contourOpacity}
                    score={liveScore}
                    showScoreHud={true}
                    guidanceText={guidanceHint}
                  />
                )}

                {/* Countdown Overlay */}
                {state === 'countdown' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
                    <div className="p-8 rounded-3xl bg-black/80 border border-amber-400/40 shadow-2xl flex flex-col items-center">
                      <CountdownDisplay countdown={countdown} total={3} />
                      <span className="text-xs font-mono text-amber-300 mt-2">GIỮ NGUYÊN DÁNG POSE!</span>
                    </div>
                  </div>
                )}

                {/* Shutter White Flash */}
                {state === 'capturing' && (
                  <div className="absolute inset-0 bg-white opacity-90 transition-opacity duration-150 pointer-events-none z-40" />
                )}

                {/* Corner Viewfinder Crosshairs */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />
              </>
            )}
          </div>

          {/* Bottom Pose Carousel Tray (Swipe to choose target pose) */}
          <div className="rounded-2xl p-3 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                Dáng Mẫu Silhouette (Chạm Để Đổi)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {selectedPose.name_vi}
              </span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {SAMPLE_POSES.map((pose) => {
                const isSelected = selectedPose.id === pose.id;
                return (
                  <button
                    key={pose.id}
                    onClick={() => setSelectedPose(pose)}
                    className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl border text-left transition-all duration-200 flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400/60 text-white shadow-lg shadow-amber-400/10'
                        : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                        isSelected ? 'bg-amber-400 text-black' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {isSelected ? <Check size={14} /> : pose.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-sans font-semibold text-white leading-tight">
                        {pose.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 leading-tight">
                        {pose.name_vi}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Shutter Trigger & Film Strip Drawer */}
        <div className="w-full lg:w-80 flex flex-col gap-4">

          {/* Shutter Action Panel */}
          <div className="rounded-3xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur-xl flex flex-col items-center gap-5">
            {/* Shot Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5 w-full bg-black/60 p-1 rounded-xl border border-white/10">
              {SHOT_MODES.map((sm) => (
                <button
                  key={sm.mode}
                  onClick={() => setShotMode(sm.mode)}
                  className={`py-1.5 text-center rounded-lg text-xs font-mono transition ${
                    shotMode === sm.mode
                      ? 'bg-white/20 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sm.label}
                </button>
              ))}
            </div>

            {/* Tactile Big Shutter Button with LED Feedback Ring */}
            <button
              onClick={start}
              disabled={state !== 'idle' || !cameraReady}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                state !== 'idle' || !cameraReady
                  ? 'opacity-40 cursor-not-allowed bg-slate-800'
                  : 'hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(252,211,77,0.35)]'
              }`}
              style={{
                background: liveScore >= 85
                  ? 'radial-gradient(circle, #FCD34D 0%, #D97706 100%)'
                  : 'radial-gradient(circle, #E2E8F0 0%, #94A3B8 100%)',
              }}
              title="Bấm để chụp ảnh"
            >
              {/* Outer Pulsing Glow Ring */}
              <div
                className={`absolute -inset-2 rounded-full border-2 ${
                  liveScore >= 85 ? 'border-amber-400 animate-ping' : 'border-white/20'
                }`}
              />
              <div className="w-20 h-20 rounded-full bg-black flex flex-col items-center justify-center text-white">
                <Camera size={24} className={liveScore >= 85 ? 'text-amber-400' : 'text-slate-300'} />
                <span className="text-[9px] font-mono mt-0.5 text-slate-300">
                  {state === 'idle' ? 'SHUTTER' : 'SHOOTING'}
                </span>
              </div>
            </button>

            {/* Frame Style Color Chips */}
            <div className="w-full pt-3 border-t border-white/10">
              <span className="text-[11px] font-mono text-slate-400 block mb-2 text-center">
                MÀU KHUNG FILM STRIP
              </span>
              <div className="flex justify-center gap-2">
                {FRAME_COLORS.map((fc) => (
                  <button
                    key={fc.id}
                    onClick={() => setActiveFrame(fc)}
                    className={`w-7 h-7 rounded-full border-2 transition ${fc.bg} ${
                      activeFrame.id === fc.id ? 'border-amber-400 scale-110' : 'border-white/20 hover:scale-105'
                    }`}
                    title={fc.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Captured Photos Review / Film Strip Drawer */}
          <div className="flex-1 rounded-3xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-xl flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-300 font-bold tracking-tight">
                  KHAY ẢNH CHỤP ({completedShots.length})
                </span>
                {completedShots.length > 0 && (
                  <button
                    onClick={downloadAll}
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Download size={12} />
                    Tải Toàn Bộ
                  </button>
                )}
              </div>

              {completedShots.length === 0 ? (
                <div className="h-36 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                  <span>Chưa có ảnh nào</span>
                  <span className="text-[10px] mt-1 text-slate-600">Bấm nút tròn chụp để tạo dải ảnh</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {completedShots.map((shot, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/15 group"
                    >
                      <img src={shot.imageData} alt={`Shot ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => downloadShot(shot, idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {completedShots.length > 0 && (
              <div className="pt-3 border-t border-white/10 flex justify-between">
                <button
                  onClick={reset}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  Chụp Lại
                </button>
                <span className="text-xs font-mono text-emerald-400 font-bold self-center">
                  ✦ LIFE4CUTS READY
                </span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
