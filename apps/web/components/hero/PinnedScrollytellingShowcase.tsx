'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function PinnedScrollytellingShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      // Main 350vh pinned timeline
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSectionRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // 0% -> 20%: Stage 1 (Editorial Photo) -> Stage 2 (Laser Scan & Contour)
      mainTl
        .to('.stage-1-photo', { opacity: 0.15, scale: 0.96, duration: 1 })
        .to('.laser-beam', { y: 380, opacity: 1, duration: 1 }, '<')
        .to('.stage-2-contour', { opacity: 1, scale: 1, duration: 1 }, '-=0.5')
        .to('.story-text-1', { opacity: 0, y: -20, duration: 0.6 }, '<')
        .to('.story-text-2', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')

        // 20% -> 50%: Stage 2 -> Stage 3 (Live Viewfinder Alignment)
        .to('.laser-beam', { opacity: 0, duration: 0.4 })
        .to('.stage-2-contour', { opacity: 0.4, duration: 0.8 }, '-=0.2')
        .to('.stage-3-viewfinder', { opacity: 1, duration: 0.8 }, '<')
        .to('.live-alignment-node', { opacity: 1, x: 0, y: 0, stagger: 0.05, duration: 0.8 }, '<')
        .to('.story-text-2', { opacity: 0, y: -20, duration: 0.6 }, '<')
        .to('.story-text-3', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')

        // 50% -> 75%: Stage 3 -> Stage 4 (Pose Lock & Champagne Gold Shutter Flash)
        .to('.stage-2-contour', { stroke: '#FCD34D', opacity: 0.9, duration: 0.6 })
        .to('.live-alignment-node', { fill: '#FCD34D', duration: 0.6 }, '<')
        .to('.target-lock-ring', { scale: 1, opacity: 1, duration: 0.6 }, '<')
        .to('.shutter-flash', { opacity: 1, duration: 0.15 })
        .to('.shutter-flash', { opacity: 0, duration: 0.4 })
        .to('.story-text-3', { opacity: 0, y: -20, duration: 0.6 }, '<')
        .to('.story-text-4', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')

        // 75% -> 100%: Stage 4 -> Stage 5 (Film Strip slides out from phone bottom)
        .to('.film-strip-printout', { y: 0, opacity: 1, duration: 1.2, ease: 'power2.out' })
        .to(phoneRef.current, { y: -40, scale: 0.94, duration: 1.2 }, '<')
        .to('.story-text-4', { opacity: 0, y: -20, duration: 0.6 }, '<')
        .to('.story-text-5', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3');
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Pinned Scrollytelling Container (350vh trigger space) */}
      <div
        ref={pinSectionRef}
        className="w-full h-screen flex items-center justify-center overflow-hidden relative"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, #10101A 0%, #06060A 100%)',
        }}
      >
        {/* Subtle Ambient Light Gradients */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        {/* 3-Column Layout: Left Narrative | Titanium Smartphone Frame | Right Narrative */}
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

          {/* Left Editorial Narrative Column */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            <div className="relative min-h-[220px]">
              {/* Story 1 */}
              <div className="story-text-1 transition-opacity duration-300">
                <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase block mb-2">
                  Chapter I // Inspiration
                </span>
                <h3 className="text-3xl font-bold tracking-tight text-white mb-3">
                  Chọn Dáng Mẫu Thời Trang
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Lựa chọn tư thế yêu thích từ thư viện Lookbook phong cách K-Pop, Runway hoặc tải lên bức ảnh tạo dáng chuẩn bạn mong muốn.
                </p>
              </div>

              {/* Story 2 */}
              <div className="story-text-2 opacity-0 absolute inset-0 transition-opacity duration-300">
                <span className="text-xs font-mono text-violet-400 tracking-widest uppercase block mb-2">
                  Chapter II // AR Contour
                </span>
                <h3 className="text-3xl font-bold tracking-tight text-white mb-3">
                  Bóc Tách Viền Silhouette
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Không còn stickman que diêm. AI tự động trích xuất đường viền lụa ôm trọn dáng người thanh mảnh, tinh tế như camera AR cao cấp của Huawei.
                </p>
              </div>

              {/* Story 3 */}
              <div className="story-text-3 opacity-0 absolute inset-0 transition-opacity duration-300">
                <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase block mb-2">
                  Chapter III // Live Guidance
                </span>
                <h3 className="text-3xl font-bold tracking-tight text-white mb-3">
                  So Khớp Dáng Thời Gian Thực
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Đứng trước ống kính, đường viền ghost mờ hướng dẫn vị trí cơ thể. Hệ thống hiển thị micro-radar đo đạc góc tay và hướng nghiêng đầu chuẩn xác.
                </p>
              </div>

              {/* Story 4 */}
              <div className="story-text-4 opacity-0 absolute inset-0 transition-opacity duration-300">
                <span className="text-xs font-mono text-amber-400 tracking-widest uppercase block mb-2">
                  Chapter IV // Target Lock
                </span>
                <h3 className="text-3xl font-bold tracking-tight text-white mb-3">
                  Khóa Mục Tiêu & Tự Động Chụp
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Khi hai dáng khớp chuẩn trên 95%, viền phát quang chuyển sang vàng Champagne ấm áp, tự động khóa khung hình và chớp màn trập không cần chạm tay.
                </p>
              </div>

              {/* Story 5 */}
              <div className="story-text-5 opacity-0 absolute inset-0 transition-opacity duration-300">
                <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase block mb-2">
                  Chapter V // Kiosk Export
                </span>
                <h3 className="text-3xl font-bold tracking-tight text-white mb-3">
                  Xuất Dải Film Life4Cuts
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bức ảnh được tự động dàn trang vào layout photobooth 4 ô dọc điện ảnh kèm bảng điểm OKS chuẩn quốc tế và mã QR lưu tức thì về điện thoại.
                </p>
              </div>
            </div>
          </div>

          {/* Center Column: Titanium Smartphone Hardware Frame */}
          <div className="col-span-1 lg:col-span-4 flex justify-center">
            <div
              ref={phoneRef}
              className="relative w-[280px] sm:w-[320px] aspect-[9/19] rounded-[48px] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.9)] border border-slate-700/60"
              style={{
                background: 'linear-gradient(145deg, #1E1E28 0%, #0F0F16 50%, #151520 100%)',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.08), 0 30px 80px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2)',
              }}
            >
              {/* Dynamic Island / Punch hole camera */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2">
                <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
              </div>

              {/* Phone Screen Display */}
              <div className="w-full h-full rounded-[38px] overflow-hidden relative bg-black flex items-center justify-center border border-white/5">

                {/* Stage 1: Lookbook Editorial Photo */}
                <div className="stage-1-photo absolute inset-0 bg-cover bg-center transition-transform duration-700"
                  style={{
                    backgroundImage: `radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%), linear-gradient(180deg, #131320 0%, #08080C 100%)`,
                  }}
                >
                  {/* Chic Stylized Model Silhouette Outline */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <svg viewBox="0 0 100 150" className="w-48 h-64 opacity-75" fill="none">
                      <circle cx="50" cy="24" r="10" stroke="#E2E8F0" strokeWidth="1.2" />
                      {/* Chic pose body path */}
                      <path
                        d="M32 48 C36 40 64 40 68 48 L76 80 L62 82 L58 55 L52 55 L53 125 L47 125 L48 55 L42 55 L38 82 L24 80 Z"
                        stroke="#94A3B8"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </div>
                  <div className="absolute bottom-6 inset-x-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-[11px] font-mono text-white">
                      EDITORIAL CHIC #04
                    </span>
                  </div>
                </div>

                {/* Laser Sweep Beam (Stage 2) */}
                <div
                  className="laser-beam absolute inset-x-0 top-0 h-1.5 opacity-0 z-20 pointer-events-none"
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
                  {/* Smooth Bezier Body Outline */}
                  <ellipse cx="50" cy="24" rx="8" ry="10" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                  <path
                    d="M32 48 Q50 42 68 48 Q74 80 62 82 Q56 56 50 56 Q44 56 38 82 Q26 80 32 48 Z"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1.2"
                    fill="rgba(255,255,255,0.02)"
                  />
                  {/* Limbs Silk Contour */}
                  <path d="M32 48 L22 75 L18 100" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                  <path d="M68 48 L78 75 L82 100" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                  <path d="M44 80 L42 110 L40 140" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                  <path d="M56 80 L58 110 L60 140" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                </svg>

                {/* Stage 3: Live Viewfinder HUD & Alignment Nodes */}
                <div className="stage-3-viewfinder absolute inset-0 pointer-events-none opacity-0 z-15 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 pt-3">
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
                    <div className="w-36 h-36 rounded-full border border-amber-400/50 flex items-center justify-center animate-pulse">
                      <div className="w-28 h-28 rounded-full border border-amber-400" />
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
                  className="film-strip-printout absolute inset-x-3 bottom-0 h-4/5 translate-y-full opacity-0 z-25 bg-slate-900 rounded-t-2xl p-2.5 border-t border-x border-white/20 shadow-2xl flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(180deg, #1A1A28 0%, #0E0E18 100%)',
                  }}
                >
                  <div className="text-center font-mono text-[9px] text-slate-400 tracking-wider border-b border-white/10 pb-1">
                    POSE-BOOTH AI // 2026
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 flex-1 py-1.5">
                    {[1, 2, 3, 4].map((idx) => (
                      <div key={idx} className="rounded bg-black/60 border border-white/10 flex items-center justify-center">
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

          {/* Right Architecture Telemetry Column */}
          <div className="hidden lg:block lg:col-span-4 space-y-4 font-mono text-xs text-slate-400">
            <div className="glass-card p-5 border border-white/10 space-y-3">
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
                  <span>OKS Matrix Sigma:</span>
                  <span className="text-violet-400">COCO Standard</span>
                </div>
                <div className="flex justify-between">
                  <span>Contour Resolution:</span>
                  <span className="text-amber-300">Smooth Bezier Silk</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 border border-white/10 text-[11px] leading-relaxed">
              <span className="text-slate-300 block font-sans font-medium mb-1">Công thái học không điểm mù:</span>
              Người dùng không bị che khuất tầm nhìn bởi que xương stickman. Dáng chụp giữ trọn nét tự nhiên và thẩm mỹ.
            </div>
          </div>

        </div>

        {/* Scroll Indicator at bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60">
          <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
            Cuộn chuột để trải nghiệm
          </span>
          <div className="w-4 h-7 rounded-full border border-slate-500 flex justify-center pt-1">
            <div className="w-1 h-2 rounded-full bg-cyan-400 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
