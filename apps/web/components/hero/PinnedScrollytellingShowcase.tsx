'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Scan, Target, Camera, Film, ChevronRight, ChevronDown, MousePointerClick } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const CHAPTERS = [
  {
    id: 1,
    chapter: 'Chapter I // Lookbook',
    title: 'Chọn Dáng Mẫu Thời Trang',
    desc: 'Lựa chọn tư thế yêu thích từ Lookbook phong cách K-Pop, Runway hoặc tải lên bức ảnh tạo dáng chuẩn bạn mong muốn.',
    icon: Sparkles,
    badge: 'Lookbook Mẫu',
    accentColor: '#A855F7',
    techDetail: 'Lookbook Embeddings',
    modelLatency: 'Đo trên thiết bị',
  },
  {
    id: 2,
    chapter: 'Chapter II // AR Silk',
    title: 'Bóc Tách Viền Lụa Silhouette',
    desc: 'Xóa bỏ stickman que diêm. AI tự động trích xuất đường viền lụa ôm trọn dáng người thanh mảnh, lấy cảm hứng từ camera AR cao cấp Huawei.',
    icon: Scan,
    badge: 'Huawei AR Silk',
    accentColor: '#06B6D4',
    techDetail: 'Volumetric Silk Contour',
    modelLatency: 'Đo trên thiết bị',
  },
  {
    id: 3,
    chapter: 'Chapter III // Live HUD',
    title: 'So Khớp Dáng Thời Gian Thực',
    desc: 'Đứng trước ống kính, đường viền ghost mờ hướng dẫn góc đặt cơ thể. Hệ thống hiển thị micro-radar đo đạc góc tay và hướng nghiêng đầu chuẩn xác.',
    icon: Target,
    badge: 'Micro-Radar HUD',
    accentColor: '#38BDF8',
    techDetail: 'Vectorized OKS',
    modelLatency: '27.47 ms AI',
  },
  {
    id: 4,
    chapter: 'Chapter IV // Champagne Lock',
    title: 'Khóa Mục Tiêu & Chớp Màn Trập',
    desc: 'Khi hai dáng khớp chuẩn trên 90%, viền phát quang chuyển sang vàng Champagne ấm áp, tự động khóa khung hình và chớp màn trập không chạm.',
    icon: Camera,
    badge: 'Champagne Lock',
    accentColor: '#FCD34D',
    techDetail: 'Zero-Touch Shutter',
    modelLatency: 'Đo trên thiết bị',
  },
  {
    id: 5,
    chapter: 'Chapter V // Film Strip',
    title: 'Xuất Dải Film Life4Cuts',
    desc: 'Bức ảnh được tự động dàn trang vào layout photobooth 4 ô dọc điện ảnh kèm bảng điểm OKS chuẩn quốc tế và mã QR lưu tức thì về điện thoại.',
    icon: Film,
    badge: 'Life4Cuts Strip',
    accentColor: '#10B981',
    techDetail: 'Life4Cuts High-Res',
    modelLatency: 'Đo trên thiết bị',
  },
];

export function PinnedScrollytellingShowcase() {
  const outerTrackRef = useRef<HTMLDivElement>(null);
  const stickyContentRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  const [activeStage, setActiveStage] = useState<number>(1);
  const activeStageRef = useRef<number>(1);
  const [progress, setProgress] = useState<number>(0);

  // Apply stage visual transitions inside phone & HUD
  const applyStageAnimation = useCallback((stage: number) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // Subtle 3D tilt reaction on smartphone frame
    if (phoneRef.current) {
      tl.fromTo(
        phoneRef.current,
        { scale: 0.98, rotateY: stage % 2 === 0 ? 2 : -2 },
        { scale: 1, rotateY: 0, duration: 0.6 }
      );
    }

    if (stage === 1) {
      tl.to('.stage-1-photo', { opacity: 1, scale: 1, duration: 0.4 }, 0)
        .to('.laser-beam', { opacity: 0, duration: 0.2 }, 0)
        .to('.stage-2-contour', { opacity: 0, duration: 0.3 }, 0)
        .to('.stage-3-viewfinder', { opacity: 0, duration: 0.3 }, 0)
        .to('.film-strip-printout', { y: '100%', opacity: 0, duration: 0.4 }, 0);
    } else if (stage === 2) {
      tl.to('.stage-1-photo', { opacity: 0.25, scale: 0.96, duration: 0.4 }, 0)
        .fromTo('.laser-beam', { y: 0, opacity: 1 }, { y: 320, opacity: 1, duration: 1.1, ease: 'power1.inOut' }, 0)
        .to('.stage-2-contour', { opacity: 0.9, duration: 0.5 }, 0.2)
        .to('.stage-3-viewfinder', { opacity: 0, duration: 0.3 }, 0)
        .to('.film-strip-printout', { y: '100%', opacity: 0, duration: 0.4 }, 0);
    } else if (stage === 3) {
      tl.to('.stage-1-photo', { opacity: 0.1, duration: 0.3 }, 0)
        .to('.laser-beam', { opacity: 0, duration: 0.2 }, 0)
        .to('.stage-2-contour', { opacity: 0.65, duration: 0.4 }, 0)
        .to('.stage-3-viewfinder', { opacity: 1, duration: 0.4 }, 0)
        .fromTo('.live-radar-node', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.05, duration: 0.4 }, 0.1)
        .to('.target-lock-ring', { opacity: 0, scale: 1.2, duration: 0.3 }, 0)
        .to('.film-strip-printout', { y: '100%', opacity: 0, duration: 0.4 }, 0);
    } else if (stage === 4) {
      tl.to('.stage-1-photo', { opacity: 0.1, duration: 0.3 }, 0)
        .to('.stage-2-contour', { opacity: 1, duration: 0.4 }, 0)
        .to('.stage-3-viewfinder', { opacity: 1, duration: 0.3 }, 0)
        .to('.target-lock-ring', { opacity: 1, scale: 1, duration: 0.4 }, 0)
        .fromTo('.shutter-flash', { opacity: 0.95 }, { opacity: 0, duration: 0.4 }, 0.15)
        .to('.film-strip-printout', { y: '100%', opacity: 0, duration: 0.4 }, 0);
    } else if (stage === 5) {
      tl.to('.stage-1-photo', { opacity: 0.05, duration: 0.3 }, 0)
        .to('.stage-2-contour', { opacity: 0.15, duration: 0.3 }, 0)
        .to('.stage-3-viewfinder', { opacity: 0.2, duration: 0.3 }, 0)
        .to('.film-strip-printout', { y: '0%', opacity: 1, duration: 0.7, ease: 'back.out(1.2)' }, 0);
    }
  }, []);

  // Set up buttery compositor-driven ScrollTrigger on the outer track
  useGSAP(
    () => {
      if (!outerTrackRef.current) return;

      const trigger = ScrollTrigger.create({
        trigger: outerTrackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = Math.max(0, Math.min(0.999, self.progress));
          // Divide 0..1 into 5 chapters
          const targetStage = Math.floor(p * 5) + 1;
          const stageProgress = Math.round(((p * 5) % 1) * 100);

          setProgress(stageProgress);

          if (targetStage !== activeStageRef.current) {
            activeStageRef.current = targetStage;
            setActiveStage(targetStage);
            applyStageAnimation(targetStage);
          }
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: outerTrackRef }
  );

  // Smooth scroll jump when clicking a chapter tab
  const handleTabClick = (stageId: number) => {
    if (!outerTrackRef.current) return;
    const rect = outerTrackRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const outerTop = rect.top + scrollTop;
    const scrollDistance = outerTrackRef.current.offsetHeight - window.innerHeight;

    // Center of stage range
    const targetProgress = (stageId - 1) / 5 + 0.1;
    const targetY = outerTop + targetProgress * scrollDistance;

    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const currentChapter = CHAPTERS.find((c) => c.id === activeStage) || CHAPTERS[0];

  return (
    // Outer scroll track: 320vh height gives ample natural scroll travel without jumping
    <section ref={outerTrackRef} className="relative w-full h-[320vh] bg-background">
      {/* Sticky Viewport Stage: Stuck to top 0, exactly 100vh height */}
      <div
        ref={stickyContentRef}
        className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden border-y border-border bg-background/95 backdrop-blur-2xl z-20"
      >
        {/* Ambient Lighting Accents */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/25 rounded-full blur-[130px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/25 rounded-full blur-[130px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 py-4 sm:py-6">
          {/* Header Row: Title & Scroll Indicator */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-cyan-300 mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>SCROLLYTELLING INTERACTIVE SHOWCASE</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                Quy Trình Tạo Dáng AI Trong 5 Bước
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                Cuộn chuột xuống để tự động lướt qua từng giai đoạn công nghệ thị giác máy tính.
              </p>
            </div>

            {/* Scroll Direction Prompt */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <MousePointerClick size={14} />
                Cuộn chuột hoặc bấm tab
              </span>
              <ChevronDown size={14} className="text-amber-400 animate-bounce" />
            </div>
          </div>

          {/* Chapter Stepper Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5 mb-6 sm:mb-8">
            {CHAPTERS.map((ch) => {
              const isActive = ch.id === activeStage;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleTabClick(ch.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl text-left border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.09] border-white/30 shadow-lg shadow-white/5'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15'
                  }`}
                >
                  {/* Progress bar inside active button driven by scroll */}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-amber-400 via-cyan-400 to-violet-400 transition-all duration-75 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                        isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      0{ch.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider truncate">
                      {ch.badge}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-semibold truncate ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {ch.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3-Column Interactive Stage Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center bg-card/85 rounded-3xl p-5 sm:p-8 border border-border backdrop-blur-xl">
            {/* Left Column: Narrative Explanation */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono"
                  style={{
                    background: `${currentChapter.accentColor}18`,
                    color: currentChapter.accentColor,
                    border: `1px solid ${currentChapter.accentColor}35`,
                  }}
                >
                  <span>{currentChapter.chapter}</span>
                </div>

                <h3 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight leading-snug">
                  {currentChapter.title}
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {currentChapter.desc}
                </p>
              </div>

              {/* Stage Quick Facts */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] mb-1">Công Nghệ AI:</span>
                  <span className="text-cyan-300 font-bold">{currentChapter.techDetail}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] mb-1">Độ Trễ Phản Hồi:</span>
                  <span className="text-emerald-400 font-bold">{currentChapter.modelLatency}</span>
                </div>
              </div>

              {/* Next Chapter Shortcut button */}
              <button
                onClick={() => handleTabClick(activeStage >= 5 ? 1 : activeStage + 1)}
                className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition group pt-1 cursor-pointer"
              >
                <span>Xem bước tiếp theo (0{activeStage >= 5 ? 1 : activeStage + 1})</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Center Column: Realistic Smartphone Mockup with Real Volumetric Silhouette */}
            <div className="lg:col-span-4 flex justify-center">
              <div
                ref={phoneRef}
                className="relative w-[240px] sm:w-[270px] aspect-[9/18.5] rounded-[42px] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.95)] border border-slate-700/60"
                style={{
                  background: 'linear-gradient(145deg, #1C1C26 0%, #0D0D14 50%, #151522 100%)',
                  boxShadow:
                    '0 0 0 2px rgba(255,255,255,0.08), 0 30px 80px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.2)',
                }}
              >
                {/* Dynamic Island / Punch Hole */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800" />
                </div>

                {/* Phone Display Screen */}
                <div className="w-full h-full rounded-[32px] overflow-hidden relative bg-[#06060A] flex items-center justify-center border border-white/10">
                  {/* Subtle Rule of Thirds camera grid lines */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 z-5 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div />
                  </div>

                  {/* Stage 1: Lookbook Editorial Photo Background */}
                  <div
                    className="stage-1-photo absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{
                      backgroundImage: `radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.3) 0%, transparent 65%), linear-gradient(180deg, #161625 0%, #090910 100%)`,
                    }}
                  >
                    <div className="absolute bottom-4 inset-x-3 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-[9px] font-mono text-white">
                        LOOKBOOK #04 · HIGH FASHION
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

                  {/* Stage 2 & 3 & 4: Volumetric Human Anatomy Silhouette (Huawei AR Silk) */}
                  <svg
                    className="stage-2-contour absolute inset-0 w-full h-full pointer-events-none opacity-0 z-10"
                    viewBox="0 0 100 160"
                    fill="none"
                  >
                    {/* Defs for soft volumetric glowing gradient */}
                    <defs>
                      <linearGradient id="silkFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#A855F7" stopOpacity="0.12" />
                      </linearGradient>
                      <linearGradient id="goldFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.30" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.18" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* 1. Volumetric Head & Hair Oval */}
                    <ellipse
                      cx="50"
                      cy="22"
                      rx="9.5"
                      ry="12"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="1.2"
                      filter="url(#glow)"
                    />
                    {/* Head core center node */}
                    <circle cx="50" cy="22" r="1.5" fill={activeStage === 4 ? '#FCD34D' : '#38BDF8'} />

                    {/* 2. Neck Cylinder */}
                    <path
                      d="M47 33 L47 40 L53 40 L53 33 Z"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="0.8"
                    />

                    {/* 3. Curved Volumetric Torso (Shoulders to Pelvis) */}
                    <path
                      d="M36 43 C42 40 58 40 64 43 C66 54 62 67 59 78 C54 81 46 81 41 78 C38 67 34 54 36 43 Z"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="1.2"
                      filter="url(#glow)"
                    />

                    {/* 4. Left Arm (Capsule Shoulder -> Elbow -> Wrist) */}
                    {/* Upper arm */}
                    <path
                      d="M36 43 C31 51 27 60 25 66 C28 68 31 67 33 65 C36 58 39 50 40 45 Z"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="1.1"
                    />
                    {/* Forearm angled to hip */}
                    <path
                      d="M25 66 C28 72 32 76 37 77 C38 74 38 72 36 70 C32 68 29 65 28 64 Z"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="1.1"
                    />

                    {/* 5. Right Arm (Graceful Long Runway Pose) */}
                    {/* Upper arm */}
                    <path
                      d="M64 43 C67 52 71 61 74 68 C71 70 68 69 66 67 C63 60 60 51 59 45 Z"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="1.1"
                    />
                    {/* Forearm to wrist */}
                    <path
                      d="M74 68 C76 77 78 86 78 95 C75 96 73 95 72 93 C71 85 69 76 67 68 Z"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="1.1"
                    />

                    {/* 6. Left Leg (Volumetric Thigh & Calf) */}
                    {/* Thigh */}
                    <path
                      d="M41 78 C39 88 38 100 39 112 C44 113 47 113 48 111 C47 99 47 88 46 78 Z"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="1.1"
                    />
                    {/* Calf & Foot */}
                    <path
                      d="M39 112 C38 123 37 135 36 146 C39 148 44 148 45 145 C46 135 47 123 48 111 Z"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="1.1"
                    />

                    {/* 7. Right Leg (Volumetric Thigh & Calf) */}
                    {/* Thigh */}
                    <path
                      d="M54 78 C54 88 54 99 53 111 C57 113 60 113 62 111 C62 99 61 88 59 78 Z"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="1.1"
                    />
                    {/* Calf & Foot */}
                    <path
                      d="M53 111 C54 123 55 135 56 146 C59 148 64 147 65 145 C64 135 63 123 62 111 Z"
                      fill={activeStage === 4 ? 'url(#goldFillGrad)' : 'url(#silkFillGrad)'}
                      stroke={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                      strokeWidth="1.1"
                    />
                  </svg>

                  {/* Stage 3: Live Viewfinder HUD & Alignment Nodes */}
                  <div className="stage-3-viewfinder absolute inset-0 pointer-events-none opacity-0 z-15 p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[9px] font-mono text-cyan-300 pt-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        AI VIEW categorizer
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/10">GPU READY</span>
                    </div>

                    {/* Micro Radar Tracking Nodes (PikPose Joint Target Rings) */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 160">
                      {[
                        [50, 22],
                        [36, 43],
                        [64, 43],
                        [25, 66],
                        [74, 68],
                        [37, 77],
                        [78, 95],
                        [41, 78],
                        [59, 78],
                        [39, 112],
                        [53, 111],
                        [36, 146],
                        [56, 146],
                      ].map(([cx, cy], i) => (
                        <g key={i} className="live-radar-node opacity-0">
                          <circle
                            cx={cx}
                            cy={cy}
                            r="2.2"
                            fill={activeStage === 4 ? '#FCD34D' : '#06B6D4'}
                            style={{ filter: `drop-shadow(0 0 4px ${activeStage === 4 ? '#FCD34D' : '#06B6D4'})` }}
                          />
                          <circle
                            cx={cx}
                            cy={cy}
                            r="4.2"
                            fill="none"
                            stroke={activeStage === 4 ? 'rgba(252,211,77,0.5)' : 'rgba(6,182,212,0.4)'}
                            strokeWidth="0.6"
                          />
                        </g>
                      ))}
                    </svg>

                    {/* Target Lock Reticle Ring (Stage 4) */}
                    <div className="target-lock-ring opacity-0 scale-125 absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-32 h-32 rounded-full border border-amber-400/60 flex items-center justify-center animate-pulse">
                        <div className="w-24 h-24 rounded-full border border-amber-400 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border border-dashed border-amber-300 animate-spin" />
                        </div>
                      </div>
                    </div>

                    <div className="text-center pb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono border backdrop-blur-md transition-all ${
                          activeStage === 4
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                            : 'bg-black/80 text-cyan-300 border-white/20'
                        }`}
                      >
                        {activeStage === 4 ? 'LOCKED · 98.4% MATCH' : 'ALIGNING POSE 86.2%'}
                      </span>
                    </div>
                  </div>

                  {/* Shutter Flash Light Burst (Stage 4) */}
                  <div className="shutter-flash absolute inset-0 bg-white opacity-0 z-30 pointer-events-none" />

                  {/* Stage 5: Film Strip Printout sliding out */}
                  <div
                    className="film-strip-printout absolute inset-x-3 bottom-0 h-4/5 translate-y-full opacity-0 z-25 rounded-t-2xl p-2.5 border-t border-x border-white/20 shadow-2xl flex flex-col justify-between"
                    style={{
                      background: 'linear-gradient(180deg, #181826 0%, #0C0C14 100%)',
                    }}
                  >
                    <div className="text-center font-mono text-[8px] text-slate-400 tracking-wider border-b border-white/10 pb-1">
                      POSE-BOOTH AI // LIFE4CUTS
                    </div>
                    <div className="grid grid-cols-2 gap-1 flex-1 py-1.5">
                      {[1, 2, 3, 4].map((idx) => (
                        <div
                          key={idx}
                          className="rounded bg-black/80 border border-white/10 flex flex-col items-center justify-center p-1 relative overflow-hidden"
                        >
                          <div className="w-6 h-10 rounded bg-gradient-to-t from-violet-600/40 to-cyan-500/30 border border-white/10 mb-0.5" />
                          <span className="text-[7px] font-mono text-cyan-300">#0{idx}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-white/10 text-[8px] font-mono">
                      <span className="text-amber-400 font-bold">OKS: 98.4</span>
                      <span className="text-emerald-400">QR SCAN READY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Technical Spec & Telemetry */}
            <div className="lg:col-span-3 space-y-3 font-mono text-xs text-slate-400">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="text-white font-sans font-bold text-xs tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  RTX Pipeline Telemetry
                </div>
                <div className="space-y-1.5 text-[10px] pt-1 border-t border-white/10">
                  <div className="flex justify-between">
                    <span>Measured Avg:</span>
                    <span className="text-cyan-400 font-bold">27.47 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPU Hardware:</span>
                    <span className="text-white">RTX 3060 12GB (CUDA)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scoring Model:</span>
                    <span className="text-violet-400">Vectorized OKS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contour Engine:</span>
                    <span className="text-amber-300">Huawei AR Silk</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-[10px] leading-relaxed">
                <span className="text-slate-200 block font-sans font-semibold mb-0.5">
                  Thị Giác Dáng Tự Nhiên:
                </span>
                Không còn que xương thô che khuất người dùng. Đường viền lụa ôm trọn vóc dáng giúp bạn tự tin canh chỉnh
                từng milimet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
