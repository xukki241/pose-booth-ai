'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PinnedScrollytellingShowcase } from '@/components/hero/PinnedScrollytellingShowcase';
import { ArrowUpRight, Camera, Cpu, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const BENTO_FEATURES = [
  {
    colSpan: 'lg:col-span-8',
    rowSpan: 'row-span-1',
    title: 'Huawei Camera AR Contour Engine',
    subtitle: 'Đường Viền Lụa Thay Thế Hoàn Toàn Stickman',
    desc: 'Không còn khung que xương thô kệch che mặt. Thuật toán tạo đường viền silhouette mờ mịn (opacity 30-50%) phát quang màu vàng Champagne khi người dùng khớp tư thế mẫu.',
    tag: 'AR Silhouette',
    icon: Sparkles,
    gradient: 'from-amber-500/10 via-violet-500/5 to-transparent',
    borderGlow: 'border-amber-500/20',
  },
  {
    colSpan: 'lg:col-span-4',
    rowSpan: 'row-span-1',
    title: 'Dual-Profile AI Engine',
    subtitle: 'Laptop 4050 & Desktop 3060',
    desc: 'Kiến trúc 2 cấu hình: Edge Profile (FP16 Autocast, <8ms, VRAM <1.5GB) và Studio Profile (YOLOv8x, multi-person tracking 2-4 người).',
    tag: 'Hardware Accelerated',
    icon: Cpu,
    gradient: 'from-cyan-500/10 to-transparent',
    borderGlow: 'border-cyan-500/20',
  },
  {
    colSpan: 'lg:col-span-4',
    rowSpan: 'row-span-1',
    title: 'Vectorized OKS Scoring',
    subtitle: 'Chuẩn Đo COCO 17 Khớp',
    desc: 'Tính toán khoảng cách Euclidean chuẩn hóa và ma trận trọng số giải phẫu học anatomy-weighted cosine bằng NumPy C-level trong 0.24ms.',
    tag: 'Zero Latency Math',
    icon: Sliders,
    gradient: 'from-violet-500/10 to-transparent',
    borderGlow: 'border-violet-500/20',
  },
  {
    colSpan: 'lg:col-span-8',
    rowSpan: 'row-span-1',
    title: 'Native Mobile & Kiosk Photobooth',
    subtitle: 'Công Thái Học Tràn Viền Tỷ Lệ 3:4',
    desc: 'Khung ngắm tỷ lệ 3:4 chuẩn nhiếp ảnh chân dung, dải carousel vuốt chọn dáng ảnh mẫu thật ở đáy, thanh trượt Ghost Opacity và nút chụp xúc giác tròn.',
    tag: 'Studio Kiosk Ready',
    icon: Camera,
    gradient: 'from-emerald-500/10 via-cyan-500/5 to-transparent',
    borderGlow: 'border-emerald-500/20',
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Cinematic Hero entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-headline', {
      y: 40,
      opacity: 0,
      duration: 1.1,
    })
      .from(
        '.hero-subtext',
        {
          y: 20,
          opacity: 0,
          duration: 0.8,
        },
        '-=0.6'
      )
      .from(
        '.hero-actions',
        {
          y: 20,
          opacity: 0,
          duration: 0.7,
        },
        '-=0.5'
      );

    // Bento cards stagger reveal
    gsap.from('.bento-item', {
      scrollTrigger: {
        trigger: '.bento-container',
        start: 'top 80%',
      },
      y: 40,
      opacity: 0,
      scale: 0.97,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power2.out',
    });
  }, { scope: heroRef });

  return (
    <main className="overflow-x-hidden w-full max-w-full bg-[#0A0A0F] text-[#F8FAFC] min-h-screen">
      {/* Floating Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <Link href="/" className="flex items-center gap-2.5 text-decoration-none group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
              <Camera size={16} className="text-cyan-300" />
            </div>
          </div>
          <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-300 transition">
            Pose-Booth <span className="text-violet-400">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/booth" className="text-xs font-mono text-slate-300 hover:text-white transition hidden sm:block">
            PHOTOBOOTH
          </Link>
          <Link href="/pose-studio" className="text-xs font-mono text-slate-300 hover:text-white transition hidden sm:block">
            POSE STUDIO
          </Link>
          <Link href="/about" className="text-xs font-mono text-slate-300 hover:text-white transition hidden sm:block">
            ARCHITECTURE
          </Link>
          <Link
            href="/booth"
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs tracking-tight hover:bg-slate-200 transition shadow-lg shadow-white/10 flex items-center gap-1.5"
          >
            <span>Trải Nghiệm Ngay</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section — Strict 2-Line Iron Rule & Wide Container */}
      <section ref={heroRef} className="pt-36 sm:pt-44 pb-20 px-6 max-w-7xl mx-auto text-center relative z-10">
        {/* Subtle Brand Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-slate-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>HUAWEI CAMERA AR CONTOUR + DUAL-PROFILE AI</span>
        </div>

        {/* 2-Line Ultra-Wide H1 */}
        <h1 className="hero-headline text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.08] mb-6">
          Định Hình Dáng Chụp Hoàn Hảo{' '}
          <span className="bg-gradient-to-r from-violet-400 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
            Bằng Thị Giác AI
          </span>
        </h1>

        {/* Crisp Subtitle */}
        <p className="hero-subtext text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Xóa bỏ que xương stickman thô kệch. Trải nghiệm đường viền lụa AR thanh mảnh, so khớp dáng thời gian thực với độ trễ dưới 8ms trên card đồ họa RTX.
        </p>

        {/* High-Contrast Dual CTAs */}
        <div className="hero-actions flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/booth"
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold text-sm tracking-tight shadow-xl shadow-violet-500/25 hover:brightness-110 transition flex items-center gap-2"
          >
            <Camera size={18} />
            <span>Mở Photobooth Kiosk</span>
          </Link>
          <Link
            href="/pose-studio"
            className="px-7 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white font-medium text-sm tracking-tight backdrop-blur-md transition"
          >
            Phòng Tập Tư Thế Mẫu
          </Link>
        </div>
      </section>

      {/* Pinned Scrollytelling Showcase (Apple Pro Display / Huawei Mate Experience) */}
      <PinnedScrollytellingShowcase />

      {/* Gapless Bento Grid Section (Awwwards standard: mathematically interlocked) */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-14 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Đột Phá Công Nghệ Nhiếp Ảnh AI
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Tối ưu hóa toàn diện từ lõi suy luận mô hình đến giao diện xúc giác công thái học cho người dùng.
          </p>
        </div>

        <div className="bento-container grid grid-cols-1 lg:grid-cols-12 grid-flow-dense gap-6">
          {BENTO_FEATURES.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div
                key={i}
                className={`bento-item ${item.colSpan} ${item.rowSpan} rounded-3xl p-8 border ${item.borderGlow} bg-gradient-to-br ${item.gradient} backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/30 transition-all duration-300`}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(10,10,15,0.8) 100%)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-mono text-slate-300">
                      {item.tag}
                    </span>
                    <IconComponent className="text-slate-400 group-hover:text-white transition" size={20} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <div className="text-xs font-mono text-cyan-400 mb-3 tracking-wide">
                    {item.subtitle}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>EXE101 ENGINE READY</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={14} /> ACTIVE
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-white/[0.08] py-12 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div>
          POSE-BOOTH AI © 2026 · EXE101 CAPSTONE PROJECT · FPT UNIVERSITY
        </div>
        <div className="flex gap-6">
          <Link href="/about" className="hover:text-white transition">HỆ THỐNG KIẾN TRÚC</Link>
          <Link href="/booth" className="hover:text-white transition">PHÒNG CHỤP</Link>
          <Link href="/pose-studio" className="hover:text-white transition">TẬP DÁNG</Link>
        </div>
      </footer>
    </main>
  );
}
