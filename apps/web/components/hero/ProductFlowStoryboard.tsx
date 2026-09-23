'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Play, Pause, RotateCcw, ChevronRight, Sparkles, Camera, Cpu, Target, Award } from 'lucide-react';

export const STORYBOARD_STEPS = [
  {
    id: 0,
    title: 'Inspiration Scan',
    label: '01 // REF SCAN',
    icon: Sparkles,
    desc: 'Chọn ảnh mẫu hoặc dáng pose mong muốn từ thư viện phong cách.',
    badge: 'YOLOv8 Vision',
  },
  {
    id: 1,
    title: 'AI Skeleton Extraction',
    label: '02 // VECTOR MAP',
    icon: Cpu,
    desc: 'Hệ thống AI bóc tách 17 điểm khớp xương và vector góc độ chuẩn xác.',
    badge: '17 Keypoints',
  },
  {
    id: 2,
    title: 'Real-time Camera Match',
    label: '03 // LIVE ALIGN',
    icon: Target,
    desc: 'Người dùng đứng trước camera, AI so khớp dáng thời gian thực với độ trễ <15ms.',
    badge: 'Live Guidance',
  },
  {
    id: 3,
    title: 'Pose Lock & Shutter',
    label: '04 // LOCK & SNAP',
    icon: Camera,
    desc: 'Khi hai khung xương khớp trên 95%, hệ thống tự động khóa mục tiêu và chớp màn trập.',
    badge: 'Auto Shutter',
  },
  {
    id: 4,
    title: 'Film Strip & AI Score',
    label: '05 // STUDIO PRINT',
    icon: Award,
    desc: 'Tự động dàn layout film strip 4 ô với filter điện ảnh và bảng điểm chi tiết.',
    badge: 'Export 4K',
  },
];

export function ProductFlowStoryboard() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const STEP_DURATION = 4000; // 4 seconds per step
  const TICK_INTERVAL = 40; // 40ms update

  // Auto-play progress loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK_INTERVAL / STEP_DURATION) * 100;
        if (next >= 100) {
          setActiveStep((curr) => (curr + 1) % STORYBOARD_STEPS.length);
          return 0;
        }
        return next;
      });
    }, TICK_INTERVAL);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [isPlaying, activeStep]);

  // Jump to step
  const handleSelectStep = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setActiveStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  // GSAP animation on step change
  useGSAP(() => {
    gsap.fromTo(
      '.stage-content',
      { opacity: 0, scale: 0.96, filter: 'blur(4px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }
    );
  }, { scope: containerRef, dependencies: [activeStep] });

  return (
    <div
      ref={containerRef}
      className="glass-card w-full max-w-4xl mx-auto overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      style={{
        background: 'linear-gradient(180deg, rgba(15,15,26,0.85) 0%, rgba(10,10,15,0.95) 100%)',
        backdropFilter: 'blur(30px)',
      }}
    >
      {/* Top Header / Viewport Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-black/40">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-slate-400 tracking-wider flex items-center gap-1.5 border-l border-white/10 pl-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            WORKFLOW SIMULATOR // EXE101
          </span>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 font-mono"
            title={isPlaying ? 'Tạm dừng mô phỏng' : 'Tiếp tục mô phỏng'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden sm:inline">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Bắt đầu lại từ bước 1"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Step Selector Ribbon */}
      <div className="grid grid-cols-5 border-b border-white/[0.06] bg-black/20 text-xs font-mono">
        {STORYBOARD_STEPS.map((step) => {
          const isActive = activeStep === step.id;
          const isPassed = activeStep > step.id;
          const StepIcon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => handleSelectStep(step.id)}
              className={`py-2.5 px-2 text-left relative transition-all duration-200 flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2 ${
                isActive
                  ? 'bg-white/[0.06] text-white'
                  : isPassed
                  ? 'text-slate-400 hover:bg-white/[0.02]'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <StepIcon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
              <div className="truncate">
                <span className="block text-[10px] text-slate-500 leading-none mb-0.5 hidden sm:block">
                  {step.label}
                </span>
                <span className="font-sans font-medium text-xs truncate block">{step.title}</span>
              </div>
              {/* Active step indicator line */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-cyan-400 to-pink-400"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Viewport Screen (Stage Display) */}
      <div className="relative min-h-[380px] sm:min-h-[420px] p-6 sm:p-8 flex items-center justify-center bg-radial from-slate-900/40 via-black/80 to-[#0A0A0F]">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Dynamic Stage Render based on activeStep */}
        <div className="stage-content w-full h-full flex flex-col items-center justify-center relative z-10">
          {activeStep === 0 && <StageInspirationScan />}
          {activeStep === 1 && <StageAiSkeletonExtraction />}
          {activeStep === 2 && <StageLiveCameraAlignment />}
          {activeStep === 3 && <StageTargetLockShutter />}
          {activeStep === 4 && <StageFilmStripOutput />}
        </div>

        {/* Viewfinder crosshairs at corners */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40" />
      </div>

      {/* Footer / Context Card & Step Progress Bar */}
      <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-violet-500/20 border border-violet-500/30 text-violet-300 font-mono text-xs">
            {STORYBOARD_STEPS[activeStep].badge}
          </span>
          <p className="text-sm text-slate-300 font-sans">
            {STORYBOARD_STEPS[activeStep].desc}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="w-24 sm:w-32 bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-400 min-w-[32px]">
            {activeStep + 1}/{STORYBOARD_STEPS.length}
          </span>
          <button
            onClick={() => handleSelectStep((activeStep + 1) % STORYBOARD_STEPS.length)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center"
            title="Bước tiếp theo"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SCENE SUB-COMPONENTS (Minimalist Dark Tech)
// ==========================================

/* 1. Inspiration Scan */
function StageInspirationScan() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 max-w-lg w-full">
      {/* Photo card with sweeping laser */}
      <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-xl overflow-hidden border border-white/20 bg-slate-900 shadow-2xl group">
        {/* Silhouette Vector */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-800 to-black p-4">
          <svg viewBox="0 0 100 130" className="w-full h-full opacity-80" fill="none">
            <circle cx="50" cy="22" r="10" fill="#94A3B8" />
            <path
              d="M30 46 C35 38 65 38 70 46 L78 78 L66 80 L62 52 L54 52 L54 116 L46 116 L46 52 L38 52 L34 80 L22 78 Z"
              fill="#64748B"
            />
          </svg>
        </div>

        {/* Sweeping Laser Line */}
        <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#06B6D4] animate-[scan_2.5s_ease-in-out_infinite]" />

        {/* Scanning Badge Overlay */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-cyan-400/40 text-[10px] font-mono text-cyan-300">
          SCANNING REF #04
        </div>
        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/80 backdrop-blur text-[10px] font-mono text-slate-300 flex justify-between">
          <span>K-Pop Heart Style</span>
          <span className="text-emerald-400">99% Clarity</span>
        </div>
      </div>

      {/* Telemetry info */}
      <div className="flex-1 space-y-3 font-mono text-xs text-left">
        <div className="inline-block px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px]">
          [AUTO_DETECT_PROMPT]
        </div>
        <h4 className="text-base font-sans font-bold text-white tracking-tight">
          Bức Ảnh Mẫu Định Hướng
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed font-sans">
          Người dùng chọn mẫu pose chuẩn từ thư viện hoặc tự tải lên ảnh cảm hứng. Hệ thống phân tích không gian và tỷ lệ cơ thể.
        </p>
        <div className="space-y-1.5 pt-2 border-t border-white/10 text-slate-400 text-[11px]">
          <div className="flex justify-between">
            <span>Subject Detection:</span>
            <span className="text-white">1 Human Silhouette</span>
          </div>
          <div className="flex justify-between">
            <span>Orientation:</span>
            <span className="text-cyan-400">Front Standing 0°</span>
          </div>
          <div className="flex justify-between">
            <span>Target Confidence:</span>
            <span className="text-emerald-400">High Precision</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. AI Skeleton Extraction */
function StageAiSkeletonExtraction() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 max-w-lg w-full">
      {/* 17-Keypoint Vector Skeleton Node Graph */}
      <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-xl overflow-hidden border border-violet-500/40 bg-black/90 shadow-[0_0_30px_rgba(168,85,247,0.2)] p-2 flex items-center justify-center">
        <svg viewBox="0 0 100 140" className="w-full h-full" fill="none">
          {/* Connecting Bones */}
          <line x1="50" y1="20" x2="50" y2="40" stroke="#A855F7" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="50" y1="40" x2="28" y2="55" stroke="#A855F7" strokeWidth="1.5" />
          <line x1="50" y1="40" x2="72" y2="55" stroke="#A855F7" strokeWidth="1.5" />
          <line x1="28" y1="55" x2="20" y2="80" stroke="#06B6D4" strokeWidth="1.5" />
          <line x1="72" y1="55" x2="80" y2="80" stroke="#06B6D4" strokeWidth="1.5" />
          <line x1="50" y1="40" x2="50" y2="75" stroke="#A855F7" strokeWidth="1.5" />
          <line x1="50" y1="75" x2="38" y2="105" stroke="#A855F7" strokeWidth="1.5" />
          <line x1="50" y1="75" x2="62" y2="105" stroke="#A855F7" strokeWidth="1.5" />
          <line x1="38" y1="105" x2="35" y2="132" stroke="#06B6D4" strokeWidth="1.5" />
          <line x1="62" y1="105" x2="65" y2="132" stroke="#06B6D4" strokeWidth="1.5" />

          {/* Keypoints Nodes */}
          {[
            [50, 20, 4, '#F0ABFC'], // Head
            [50, 40, 3, '#A855F7'], // Neck
            [28, 55, 3, '#06B6D4'], // L Shoulder
            [72, 55, 3, '#06B6D4'], // R Shoulder
            [20, 80, 3, '#06B6D4'], // L Wrist
            [80, 80, 3, '#06B6D4'], // R Wrist
            [50, 75, 3, '#A855F7'], // Pelvis
            [38, 105, 3, '#A855F7'], // L Knee
            [62, 105, 3, '#A855F7'], // R Knee
            [35, 132, 3, '#06B6D4'], // L Ankle
            [65, 132, 3, '#06B6D4'], // R Ankle
          ].map(([cx, cy, r, color], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill={color as string}
              className="animate-pulse"
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          ))}

          {/* Angle Callout overlay */}
          <text x="24" y="70" fill="#06B6D4" fontSize="5" fontFamily="monospace">118°</text>
          <text x="70" y="70" fill="#06B6D4" fontSize="5" fontFamily="monospace">118°</text>
        </svg>

        {/* Vector HUD Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-violet-950/80 border border-violet-500/50 text-[10px] font-mono text-violet-300">
          YOLOv8 SKELETON MAP
        </div>
      </div>

      {/* Telemetry info */}
      <div className="flex-1 space-y-3 font-mono text-xs text-left">
        <div className="inline-block px-2 py-1 rounded bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[11px]">
          [VECTOR_EXTRACTION_COMPLETED]
        </div>
        <h4 className="text-base font-sans font-bold text-white tracking-tight">
          Bóc Tách Toạ Độ 17 Khớp
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed font-sans">
          Mô hình YOLOv8s-pose trích xuất toạ độ chuẩn hoá (x, y, visibility) cùng các góc xoay khớp nối, tạo thành lớp ghost silhouette sẵn sàng cho camera.
        </p>
        <div className="space-y-1.5 pt-2 border-t border-white/10 text-slate-400 text-[11px]">
          <div className="flex justify-between">
            <span>Inference Time:</span>
            <span className="text-emerald-400 font-bold">12.4 ms</span>
          </div>
          <div className="flex justify-between">
            <span>Topology:</span>
            <span className="text-white">COCO-17 Keypoint</span>
          </div>
          <div className="flex justify-between">
            <span>Guide Overlay:</span>
            <span className="text-violet-300">Translucent Ghost</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 3. Real-time Camera Alignment */
function StageLiveCameraAlignment() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 max-w-lg w-full">
      {/* Live Viewfinder Frame */}
      <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-2xl p-2 flex items-center justify-center">
        {/* Rule of Thirds Grid */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
          <div className="border-r border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-b border-white" />
          <div className="border-r border-white" />
          <div className="border-r border-white" />
          <div />
        </div>

        {/* Target Ghost Skeleton (Violet) + User's Live Skeleton (Cyan) */}
        <svg viewBox="0 0 100 140" className="w-full h-full" fill="none">
          {/* Target Ghost (dashed violet) */}
          <line x1="50" y1="20" x2="50" y2="75" stroke="#A855F7" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <line x1="50" y1="40" x2="25" y2="55" stroke="#A855F7" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <line x1="50" y1="40" x2="75" y2="55" stroke="#A855F7" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

          {/* User Live Bones (Solid Cyan moving into place) */}
          <line x1="51" y1="21" x2="50" y2="76" stroke="#06B6D4" strokeWidth="2" />
          <line x1="50" y1="41" x2="27" y2="54" stroke="#06B6D4" strokeWidth="2" />
          <line x1="50" y1="41" x2="73" y2="56" stroke="#06B6D4" strokeWidth="2" />
          <line x1="27" y1="54" x2="22" y2="78" stroke="#06B6D4" strokeWidth="2" />
          <line x1="73" y1="56" x2="78" y2="78" stroke="#06B6D4" strokeWidth="2" />

          {/* Live tracking dots */}
          {[[51, 21], [50, 41], [27, 54], [73, 56], [22, 78], [78, 78]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#06B6D4" style={{ filter: 'drop-shadow(0 0 5px #06B6D4)' }} />
          ))}
        </svg>

        {/* Live Correction Tag in Viewport */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-cyan-400/40 text-[9px] font-mono text-cyan-300">
          FPS: 60 | LATENCY: 14ms
        </div>
        <div className="absolute bottom-2 inset-x-2 px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono text-amber-300 flex items-center justify-between">
          <span>⟵ RAISE LEFT ELBOW +5°</span>
          <span className="text-white font-bold">88%</span>
        </div>
      </div>

      {/* Telemetry info */}
      <div className="flex-1 space-y-3 font-mono text-xs text-left">
        <div className="inline-block px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
          [LIVE_ALIGNMENT_ACTIVE]
        </div>
        <h4 className="text-base font-sans font-bold text-white tracking-tight">
          Camera Viewfinder & Chỉ Dẫn Dáng
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed font-sans">
          Màn hình camera hiển thị khung xương mẫu (ghost) và khung xương thật của bạn. Thuật toán so sánh góc khớp và đưa ra chỉ dẫn điều chỉnh ngay tức thì.
        </p>
        <div className="space-y-1.5 pt-2 border-t border-white/10 text-slate-400 text-[11px]">
          <div className="flex justify-between">
            <span>Cos Similarity:</span>
            <span className="text-amber-400 font-bold">0.887</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-amber-300">Nâng khuỷu tay trái nhẹ</span>
          </div>
          <div className="flex justify-between">
            <span>Match Threshold:</span>
            <span className="text-white">Goal ≥ 95%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 4. Pose Lock & Shutter */
function StageTargetLockShutter() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 max-w-lg w-full">
      {/* Viewfinder with Lock Reticle & Flash Trigger */}
      <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-xl overflow-hidden border-2 border-emerald-400 bg-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.3)] p-2 flex items-center justify-center">
        {/* Skeleton perfectly matched */}
        <svg viewBox="0 0 100 140" className="w-full h-full" fill="none">
          <line x1="50" y1="20" x2="50" y2="75" stroke="#10B981" strokeWidth="2.5" />
          <line x1="50" y1="40" x2="25" y2="55" stroke="#10B981" strokeWidth="2.5" />
          <line x1="50" y1="40" x2="75" y2="55" stroke="#10B981" strokeWidth="2.5" />
          <line x1="25" y1="55" x2="20" y2="80" stroke="#10B981" strokeWidth="2.5" />
          <line x1="75" y1="55" x2="80" y2="80" stroke="#10B981" strokeWidth="2.5" />

          {/* Pulsing Lock Rings */}
          <circle cx="50" cy="55" r="30" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 2" className="animate-spin" />
          <circle cx="50" cy="55" r="24" stroke="#06B6D4" strokeWidth="1" opacity="0.6" />

          {[[50, 20], [50, 40], [25, 55], [75, 55], [20, 80], [80, 80]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill="#10B981" style={{ filter: 'drop-shadow(0 0 8px #10B981)' }} />
          ))}
        </svg>

        {/* Shutter Flash Animation Overlay */}
        <div className="absolute inset-0 bg-white/40 animate-[ping_1.8s_ease-out_infinite] pointer-events-none" />

        {/* Target Lock Badge */}
        <div className="absolute top-2 inset-x-2 px-2 py-1 rounded bg-emerald-950/90 border border-emerald-400 text-[10px] font-mono text-emerald-300 text-center font-bold">
          ✦ TARGET LOCKED 98.4%
        </div>
        <div className="absolute bottom-2 inset-x-2 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-center text-white">
          SHUTTER FIRED 📸
        </div>
      </div>

      {/* Telemetry info */}
      <div className="flex-1 space-y-3 font-mono text-xs text-left">
        <div className="inline-block px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
          [AUTO_CAPTURE_TRIGGERED]
        </div>
        <h4 className="text-base font-sans font-bold text-white tracking-tight">
          Khóa Khớp & Chớp Màn Trập
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed font-sans">
          Độ tương đồng đạt 98.4%, hệ thống phát hiệu ứng khóa mục tiêu và tự động đếm ngược chụp mà không cần người dùng chạm vào máy!
        </p>
        <div className="space-y-1.5 pt-2 border-t border-white/10 text-slate-400 text-[11px]">
          <div className="flex justify-between">
            <span>Match Score:</span>
            <span className="text-emerald-400 font-bold text-sm">98.4 / 100</span>
          </div>
          <div className="flex justify-between">
            <span>Trigger Mode:</span>
            <span className="text-white">Auto-Pose Match</span>
          </div>
          <div className="flex justify-between">
            <span>Shutter Delay:</span>
            <span className="text-cyan-400">0.00s Zero Shutter Lag</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 5. Film Strip & Score Output */
function StageFilmStripOutput() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 max-w-lg w-full">
      {/* Photobooth Film Strip (Life4Cuts Style) */}
      <div className="relative w-40 sm:w-44 bg-slate-900/90 rounded-lg p-2 border border-white/20 shadow-2xl space-y-1.5">
        {/* Brand header */}
        <div className="text-center font-mono text-[9px] text-slate-400 tracking-widest border-b border-white/10 pb-1">
          POSE-BOOTH AI // 2026
        </div>

        {/* 4 Vertical Frames */}
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="w-full aspect-[4/3] rounded bg-slate-800/80 border border-white/10 overflow-hidden relative flex items-center justify-center"
          >
            <div className="text-[10px] font-mono text-slate-500">FRAME 0{idx}</div>
            {idx === 4 && (
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 to-cyan-500/30 flex items-center justify-center">
                <span className="text-xs">✦</span>
              </div>
            )}
          </div>
        ))}

        {/* Footer with AI Score & QR */}
        <div className="pt-1 border-t border-white/10 flex items-center justify-between px-1">
          <div className="text-[9px] font-mono text-emerald-400 font-bold">
            SCORE: 98.4
          </div>
          <div className="w-5 h-5 bg-white/20 rounded-sm flex items-center justify-center text-[7px] font-mono text-white">
            QR
          </div>
        </div>
      </div>

      {/* Telemetry info */}
      <div className="flex-1 space-y-3 font-mono text-xs text-left">
        <div className="inline-block px-2 py-1 rounded bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[11px]">
          [COMPOSITE_COMPLETE]
        </div>
        <h4 className="text-base font-sans font-bold text-white tracking-tight">
          Xuất Dải Film & Bảng Điểm
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed font-sans">
          Bức ảnh được tự động ghép vào layout dải film Life4Cuts phong cách Minimalist Dark Tech kèm mã QR để tải về điện thoại tức thì.
        </p>
        <div className="space-y-1.5 pt-2 border-t border-white/10 text-slate-400 text-[11px]">
          <div className="flex justify-between">
            <span>Layout:</span>
            <span className="text-white">4-Shot Vertical Strip</span>
          </div>
          <div className="flex justify-between">
            <span>Color Profile:</span>
            <span className="text-cyan-300">Prismo Cinematic Monochrome</span>
          </div>
          <div className="flex justify-between">
            <span>Export Quality:</span>
            <span className="text-emerald-400">Ultra HD 300 DPI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
