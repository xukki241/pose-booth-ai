'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Sparkles, Scan, Target, Camera, Film, Play, Pause, ChevronRight } from 'lucide-react';

const CHAPTERS = [
  {
    id: 1,
    chapter: 'Chapter I // Inspiration',
    title: 'Chọn Dáng Mẫu Thời Trang',
    desc: 'Lựa chọn tư thế yêu thích từ Lookbook phong cách K-Pop, Runway hoặc tải lên bức ảnh tạo dáng chuẩn bạn mong muốn.',
    icon: Sparkles,
    badge: 'Lookbook Mẫu',
    accentColor: '#A855F7',
  },
  {
    id: 2,
    chapter: 'Chapter II // AR Contour',
    title: 'Bóc Tách Viền Lụa Silhouette',
    desc: 'Xóa bỏ stickman que diêm. AI tự động trích xuất đường viền lụa ôm trọn dáng người thanh mảnh, lấy cảm hứng từ camera AR cao cấp Huawei.',
    icon: Scan,
    badge: 'Huawei AR Silk',
    accentColor: '#06B6D4',
  },
  {
    id: 3,
    chapter: 'Chapter III // Live Guidance',
    title: 'So Khớp Dáng Thời Gian Thực',
    desc: 'Đứng trước ống kính, đường viền ghost mờ hướng dẫn góc đặt cơ thể. Hệ thống hiển thị micro-radar đo đạc góc tay và hướng nghiêng đầu chuẩn xác.',
    icon: Target,
    badge: 'Micro-Radar HUD',
    accentColor: '#38BDF8',
  },
  {
    id: 4,
    chapter: 'Chapter IV // Target Lock',
    title: 'Khóa Mục Tiêu & Tự Động Chụp',
    desc: 'Khi hai dáng khớp chuẩn trên 90%, viền phát quang chuyển sang vàng Champagne ấm áp, tự động khóa khung hình và chớp màn trập không chạm.',
    icon: Camera,
    badge: 'Champagne Lock',
    accentColor: '#FCD34D',
  },
  {
    id: 5,
    chapter: 'Chapter V // Kiosk Export',
    title: 'Xuất Dải Film Life4Cuts',
    desc: 'Bức ảnh được tự động dàn trang vào layout photobooth 4 ô dọc điện ảnh kèm bảng điểm OKS chuẩn quốc tế và mã QR lưu tức thì về điện thoại.',
    icon: Film,
    badge: 'Life4Cuts Strip',
    accentColor: '#10B981',
  },
];

export function PinnedScrollytellingShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Transition to a specific stage with GSAP animation
  const goToStage = useCallback((stage: number) => {
    setActiveStage(stage);
    setProgress(0);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Subtle 3D tilt reaction on smartphone frame
    if (phoneRef.current) {
      tl.fromTo(
        phoneRef.current,
        { scale: 0.97, rotateY: stage % 2 === 0 ? 3 : -3 },
        { scale: 1, rotateY: 0, duration: 0.7 }
      );
    }

    // Reset and animate phone screen layers based on stage
    // Stage 1: Editorial Photo
    if (stage === 1) {
      tl.to('.stage-1-photo', { opacity: 1, scale: 1, duration: 0.5 }, 0)
        .to('.laser-beam', { opacity: 0, duration: 0.2 }, 0)
        .to('.stage-2-contour', { opacity: 0, duration: 0.3 }, 0)
        .to('.stage-3-viewfinder', { opacity: 0, duration: 0.3 }, 0)
        .to('.film-strip-printout', { y: '100%', opacity: 0, duration: 0.4 }, 0);
    }
    // Stage 2: Laser Scan & AR Contour
    else if (stage === 2) {
      tl.to('.stage-1-photo', { opacity: 0.2, scale: 0.95, duration: 0.5 }, 0)
        .fromTo('.laser-beam', { y: 0, opacity: 1 }, { y: 280, opacity: 1, duration: 1.2, ease: 'power1.inOut' }, 0)
        .to('.stage-2-contour', { opacity: 1, stroke: 'rgba(255,255,255,0.7)', duration: 0.6 }, 0.3)
        .to('.stage-3-viewfinder', { opacity: 0, duration: 0.3 }, 0)
        .to('.film-strip-printout', { y: '100%', opacity: 0, duration: 0.4 }, 0);
    }
    // Stage 3: Live Viewfinder HUD
    else if (stage === 3) {
      tl.to('.stage-1-photo', { opacity: 0.1, duration: 0.4 }, 0)
        .to('.laser-beam', { opacity: 0, duration: 0.2 }, 0)
        .to('.stage-2-contour', { opacity: 0.5, stroke: '#06B6D4', duration: 0.5 }, 0)
        .to('.stage-3-viewfinder', { opacity: 1, duration: 0.5 }, 0)
        .fromTo('.live-alignment-node', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.04, duration: 0.5 }, 0.2)
        .to('.target-lock-ring', { opacity: 0, scale: 1.3, duration: 0.3 }, 0)
        .to('.film-strip-printout', { y: '100%', opacity: 0, duration: 0.4 }, 0);
    }
    // Stage 4: Champagne Lock & Shutter Flash
    else if (stage === 4) {
      tl.to('.stage-1-photo', { opacity: 0.1, duration: 0.3 }, 0)
        .to('.stage-2-contour', { opacity: 0.95, stroke: '#FCD34D', duration: 0.4 }, 0)
        .to('.live-alignment-node', { fill: '#FCD34D', duration: 0.4 }, 0)
        .to('.stage-3-viewfinder', { opacity: 1, duration: 0.3 }, 0)
        .to('.target-lock-ring', { opacity: 1, scale: 1, duration: 0.5 }, 0)
        .fromTo('.shutter-flash', { opacity: 0.9 }, { opacity: 0, duration: 0.45 }, 0.2)
        .to('.film-strip-printout', { y: '100%', opacity: 0, duration: 0.4 }, 0);
    }
    // Stage 5: Film Strip Printout
    else if (stage === 5) {
      tl.to('.stage-1-photo', { opacity: 0.05, duration: 0.3 }, 0)
        .to('.stage-2-contour', { opacity: 0.2, duration: 0.3 }, 0)
        .to('.stage-3-viewfinder', { opacity: 0.3, duration: 0.3 }, 0)
        .to('.film-strip-printout', { y: '0%', opacity: 1, duration: 0.8, ease: 'back.out(1.2)' }, 0);
    }
  }, []);

  // Auto-play timer with smooth 4.5s cycle
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 60; // 60ms tick
    const totalDuration = 4500; // 4.5 seconds per stage
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          const next = activeStage >= 5 ? 1 : activeStage + 1;
          goToStage(next);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, activeStage, goToStage]);

  const currentChapter = CHAPTERS.find((c) => c.id === activeStage) || CHAPTERS[0];

  return (
    <section ref={containerRef} className="w-full relative py-20 bg-[#08080E] border-y border-white/[0.06] overflow-hidden">
      {/* Ambient Lighting Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Section Header & Stage Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-cyan-300 mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>INTERACTIVE PRODUCT WALKTHROUGH</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Quy Trình Tạo Dáng AI Trong 5 Bước
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">
              Khám phá cách hệ thống nhận diện, hướng dẫn bằng viền lụa và tự động chụp ảnh chất lượng cao.
            </p>
          </div>

          {/* Play/Pause Control */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2 transition"
              title={isPlaying ? 'Tạm dừng tự động chuyển' : 'Tiếp tục tự động chuyển'}
            >
              {isPlaying ? <Pause size={13} className="text-amber-400" /> : <Play size={13} className="text-emerald-400" />}
              <span>{isPlaying ? 'Tự Động: BẬT' : 'Tự Động: DỪNG'}</span>
            </button>
          </div>
        </div>

        {/* Horizontal Chapter Stepper Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-10">
          {CHAPTERS.map((ch) => {
            const isActive = ch.id === activeStage;
            const Icon = ch.icon;
            return (
              <button
                key={ch.id}
                onClick={() => goToStage(ch.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-300 relative overflow-hidden group ${
                  isActive
                    ? 'bg-white/[0.08] border-white/30 shadow-lg shadow-white/5'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15'
                }`}
              >
                {/* Progress bar inside active button */}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400 via-cyan-400 to-violet-400 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    0{ch.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {ch.badge}
                  </span>
                </div>
                <div className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                  {ch.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* 3-Column Interactive Stage Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-black/40 rounded-3xl p-6 sm:p-10 border border-white/[0.08] backdrop-blur-xl">

          {/* Left Column: Narrative Explanation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono"
                style={{
                  background: `${currentChapter.accentColor}15`,
                  color: currentChapter.accentColor,
                  border: `1px solid ${currentChapter.accentColor}30`,
                }}
              >
                <span>{currentChapter.chapter}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                {currentChapter.title}
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {currentChapter.desc}
              </p>
            </div>

            {/* Stage Quick Facts */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400 block text-[11px] mb-1">Công Nghệ AI:</span>
                <span className="text-cyan-300 font-bold">
                  {activeStage === 1 && 'Lookbook Embeddings'}
                  {activeStage === 2 && 'Huawei Silk Contour'}
                  {activeStage === 3 && 'Vectorized OKS 60FPS'}
                  {activeStage === 4 && 'Zero-Touch Shutter'}
                  {activeStage === 5 && 'Life4Cuts High-Res'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400 block text-[11px] mb-1">Độ Trễ Phản Hồi:</span>
                <span className="text-emerald-400 font-bold">&lt; 8.2 ms</span>
              </div>
            </div>

            {/* Next Chapter Shortcut */}
            <button
              onClick={() => goToStage(activeStage >= 5 ? 1 : activeStage + 1)}
              className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition group pt-2"
            >
              <span>Xem bước tiếp theo (0{activeStage >= 5 ? 1 : activeStage + 1})</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Center Column: Realistic Smartphone Mockup */}
          <div className="lg:col-span-4 flex justify-center">
            <div
              ref={phoneRef}
              className="relative w-[270px] sm:w-[300px] aspect-[9/18.5] rounded-[44px] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.9)] border border-slate-700/60"
              style={{
                background: 'linear-gradient(145deg, #1E1E28 0%, #0F0F16 50%, #151520 100%)',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.08), 0 30px 80px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.2)',
              }}
            >
              {/* Dynamic Island / Punch Hole */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800" />
              </div>

              {/* Phone Display Screen */}
              <div className="w-full h-full rounded-[34px] overflow-hidden relative bg-black flex items-center justify-center border border-white/5">

                {/* Stage 1: Lookbook Editorial Photo */}
                <div
                  className="stage-1-photo absolute inset-0 bg-cover bg-center transition-all duration-500"
                  style={{
                    backgroundImage: `radial-gradient(ellipse at center, rgba(168,85,247,0.2) 0%, transparent 70%), linear-gradient(180deg, #131320 0%, #08080C 100%)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <svg viewBox="0 0 100 150" className="w-44 h-60 opacity-80" fill="none">
                      <circle cx="50" cy="24" r="10" stroke="#E2E8F0" strokeWidth="1.2" />
                      <path
                        d="M32 48 C36 40 64 40 68 48 L76 80 L62 82 L58 55 L52 55 L53 125 L47 125 L48 55 L42 55 L38 82 L24 80 Z"
                        stroke="#94A3B8"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </div>
                  <div className="absolute bottom-5 inset-x-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-[10px] font-mono text-white">
                      LOOKBOOK #04 · POWER VOGUE
                    </span>
                  </div>
                </div>

                {/* Laser Sweep Beam (Stage 2) */}
                <div
                  className="laser-beam absolute inset-x-0 top-0 h-1 opacity-0 z-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #06B6D4, #FCD34D, transparent)',
                    boxShadow: '0 0 20px #06B6D4, 0 0 10px #FCD34D',
                  }}
                />

                {/* Stage 2: Huawei AR Contour Outline (Ghost silhouette) */}
                <svg
                  className="stage-2-contour absolute inset-0 w-full h-full pointer-events-none opacity-0 z-10"
                  viewBox="0 0 100 150"
                  fill="none"
                >
                  <ellipse cx="50" cy="24" rx="8" ry="10" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                  <path
                    d="M32 48 Q50 42 68 48 Q74 80 62 82 Q56 56 50 56 Q44 56 38 82 Q26 80 32 48 Z"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.2"
                    fill="rgba(255,255,255,0.03)"
                  />
                  <path d="M32 48 L22 75 L18 100" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                  <path d="M68 48 L78 75 L82 100" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                  <path d="M44 80 L42 110 L40 140" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                  <path d="M56 80 L58 110 L60 140" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                </svg>

                {/* Stage 3: Live Viewfinder HUD & Alignment Nodes */}
                <div className="stage-3-viewfinder absolute inset-0 pointer-events-none opacity-0 z-15 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 pt-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      LIVE HUD
                    </span>
                    <span>60 FPS</span>
                  </div>

                  {/* Micro Radar Tracking Nodes */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 150">
                    {[
                      [32, 48], [68, 48], [22, 75], [78, 75], [18, 100], [82, 100]
                    ].map(([cx, cy], i) => (
                      <circle
                        key={i}
                        className="live-alignment-node opacity-0"
                        cx={cx}
                        cy={cy}
                        r="2.5"
                        fill="#06B6D4"
                        style={{ filter: 'drop-shadow(0 0 5px #06B6D4)' }}
                      />
                    ))}
                  </svg>

                  {/* Target Lock Reticle Ring (Stage 4) */}
                  <div className="target-lock-ring opacity-0 scale-125 absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-32 rounded-full border border-amber-400/60 flex items-center justify-center animate-pulse">
                      <div className="w-24 h-24 rounded-full border border-amber-400" />
                    </div>
                  </div>

                  <div className="text-center pb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/80 border border-white/20 text-[10px] font-mono text-amber-300">
                      MATCHING POSE 98.4%
                    </span>
                  </div>
                </div>

                {/* Shutter Flash Light Burst */}
                <div className="shutter-flash absolute inset-0 bg-white opacity-0 z-30 pointer-events-none" />

                {/* Stage 5: Film Strip Printout sliding out */}
                <div
                  className="film-strip-printout absolute inset-x-3 bottom-0 h-4/5 translate-y-full opacity-0 z-25 rounded-t-2xl p-2.5 border-t border-x border-white/20 shadow-2xl flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(180deg, #1A1A28 0%, #0E0E18 100%)',
                  }}
                >
                  <div className="text-center font-mono text-[9px] text-slate-400 tracking-wider border-b border-white/10 pb-1">
                    POSE-BOOTH AI // 2026
                  </div>
                  <div className="grid grid-cols-2 gap-1 flex-1 py-1.5">
                    {[1, 2, 3, 4].map((idx) => (
                      <div key={idx} className="rounded bg-black/70 border border-white/10 flex items-center justify-center">
                        <span className="text-[8px] font-mono text-slate-500">0{idx}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-white/10 text-[9px] font-mono">
                    <span className="text-amber-400 font-bold">SCORE: 98.4</span>
                    <span className="text-slate-400">QR READY</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Technical Spec & Telemetry */}
          <div className="lg:col-span-3 space-y-4 font-mono text-xs text-slate-400">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="text-white font-sans font-bold text-sm tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Pipeline Telemetry
              </div>
              <div className="space-y-2 text-[11px] pt-1 border-t border-white/10">
                <div className="flex justify-between">
                  <span>Inference Latency:</span>
                  <span className="text-cyan-400 font-bold">&lt; 8.2 ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Profile:</span>
                  <span className="text-white">Edge (RTX 4050 / FP16)</span>
                </div>
                <div className="flex justify-between">
                  <span>Scoring Engine:</span>
                  <span className="text-violet-400">Vectorized OKS</span>
                </div>
                <div className="flex justify-between">
                  <span>Contour Line:</span>
                  <span className="text-amber-300">Bezier Silk (Huawei)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-[11px] leading-relaxed">
              <span className="text-slate-200 block font-sans font-semibold mb-1">
                Công thái học không điểm mù:
              </span>
              Người dùng không bị che khuất tầm nhìn bởi que xương thô kệch. Toàn bộ quá trình tạo dáng giữ trọn nét tự nhiên và thẩm mỹ.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
