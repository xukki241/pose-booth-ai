"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Camera, Compass, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, Layers } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const DEMO_POSES = [
  {
    name: "Power Pose",
    score: 95,
    tag: "Chân dung",
    tagColor: "bg-rose-50 text-rose-700 border-rose-200",
    arms: { leftY: 130, rightY: 130, leftHandY: 170, rightHandY: 170 },
  },
  {
    name: "Arms Wide",
    score: 88,
    tag: "Năng động",
    tagColor: "bg-sky-50 text-sky-700 border-sky-200",
    arms: { leftY: 110, rightY: 110, leftHandY: 100, rightHandY: 100 },
  },
  {
    name: "Hands Up",
    score: 98,
    tag: "Vui vẻ",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    arms: { leftY: 80, rightY: 80, leftHandY: 45, rightHandY: 45 },
  },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePoseIdx, setActivePoseIdx] = useState(0);
  const currentPose = DEMO_POSES[activePoseIdx];

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".gsap-badge", { opacity: 0, y: -10, duration: 0.5 })
        .from(".gsap-headline", { opacity: 0, y: 20, duration: 0.6, stagger: 0.1 }, "-=0.3")
        .from(".gsap-desc", { opacity: 0, y: 15, duration: 0.5 }, "-=0.3")
        .from(".gsap-cta", { opacity: 0, scale: 0.95, duration: 0.4, stagger: 0.1 }, "-=0.2")
        .from(".gsap-card", { opacity: 0, x: 20, duration: 0.7, ease: "back.out(1.4)" }, "-=0.5")
        .from(".gsap-feature", { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 }, "-=0.3");
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900">
      {/* Studio Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-indigo-600 to-blue-600 flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Pose-Booth
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Smart Studio Experience</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link href="/booth" className="hover:text-rose-600 transition-colors">
              Photobooth
            </Link>
            <Link href="/pose-studio" className="hover:text-indigo-600 transition-colors">
              Pose Studio
            </Link>
            <Link href="/frames" className="hover:text-emerald-600 transition-colors">
              Khung Ảnh
            </Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">
              Hệ Thống
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/booth" className="btn-shutter text-xs">
              <Camera className="w-3.5 h-3.5" />
              <span>Chụp Ảnh Ngay</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col gap-16">
        {/* Vibrant Asymmetric Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-2 pb-4">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div className="gsap-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Thế Hệ Photobooth Định Hướng Dáng Chụp</span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="gsap-headline text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Tạo dáng tự tin, <br />
                <span className="bg-gradient-to-r from-rose-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  chụp ảnh đẹp tức thì.
                </span>
              </h1>
            </div>

            <p className="gsap-desc text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              Không còn loay hoay trước ống kính. Pose-Booth AI nhận diện 17 khớp xương theo thời gian thực, gợi ý góc dáng hoàn hảo và kết xuất dải ảnh lưu niệm rực rỡ sắc màu ngay trên máy bạn.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link href="/booth" className="gsap-cta btn-shutter text-sm px-6 py-3">
                <Camera className="w-4 h-4" />
                <span>Mở Photobooth Studio</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link href="/pose-studio" className="gsap-cta btn-secondary text-sm px-5 py-3">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Thử Phòng Tập Dáng</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Zap className="w-3 h-3" />
                </div>
                <span>30 FPS Trực Tiếp Trên Trình Duyệt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span>100% Cục Bộ — Không Lưu Trữ Ảnh</span>
              </div>
            </div>
          </div>

          {/* Right Column — Interactive Simulator Card */}
          <div className="lg:col-span-5 gsap-card">
            <div className="studio-card p-5 bg-white border border-slate-200/90 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-bold text-xs text-slate-800 tracking-wide uppercase">
                    Mô Phỏng Nhận Diện Pose
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentPose.tagColor}`}>
                  {currentPose.tag}
                </span>
              </div>

              {/* Viewport Simulation Box */}
              <div className="aspect-[4/3] rounded-xl bg-slate-900 relative overflow-hidden flex items-center justify-center p-4">
                {/* SVG Skeleton Simulation */}
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  {/* Subtle Grid */}
                  <defs>
                    <pattern id="hero-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hero-grid)" />

                  {/* Body Trunk */}
                  <line x1="200" y1="90" x2="200" y2="180" stroke="#3b82f6" strokeWidth="3" />
                  <line x1="160" y1="110" x2="240" y2="110" stroke="#6366f1" strokeWidth="3" />
                  <line x1="170" y1="180" x2="230" y2="180" stroke="#6366f1" strokeWidth="3" />

                  {/* Dynamic Arms */}
                  <line x1="160" y1="110" x2="135" y2={currentPose.arms.leftY} stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
                  <line x1="135" y1={currentPose.arms.leftY} x2="115" y2={currentPose.arms.leftHandY} stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
                  <line x1="240" y1="110" x2="265" y2={currentPose.arms.rightY} stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
                  <line x1="265" y1={currentPose.arms.rightY} x2="285" y2={currentPose.arms.rightHandY} stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />

                  {/* Legs */}
                  <line x1="170" y1="180" x2="160" y2="240" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <line x1="230" y1="180" x2="240" y2="240" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

                  {/* Joints with Vibrant Colors */}
                  <circle cx="200" cy="65" r="15" fill="#0f172a" stroke="#f43f5e" strokeWidth="2.5" />
                  <circle cx="160" cy="110" r="4.5" fill="#60a5fa" />
                  <circle cx="240" cy="110" r="4.5" fill="#60a5fa" />
                  <circle cx="135" cy={currentPose.arms.leftY} r="4.5" fill="#f43f5e" />
                  <circle cx="265" cy={currentPose.arms.rightY} r="4.5" fill="#f43f5e" />
                  <circle cx="115" cy={currentPose.arms.leftHandY} r="5" fill="#fbbf24" />
                  <circle cx="285" cy={currentPose.arms.rightHandY} r="5" fill="#fbbf24" />
                  <circle cx="170" cy="180" r="4.5" fill="#10b981" />
                  <circle cx="230" cy="180" r="4.5" fill="#10b981" />
                  <circle cx="160" cy="240" r="4.5" fill="#10b981" />
                  <circle cx="240" cy="240" r="4.5" fill="#10b981" />
                </svg>

                {/* Real-time telemetry HUD overlay */}
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="num-mono text-xs font-bold text-emerald-400">
                    MATCH: {currentPose.score}%
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-slate-300 border border-slate-700/80">
                  WASM Float16
                </div>
              </div>

              {/* Interactive Pose Toggles */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Chọn dáng thử nghiệm:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_POSES.map((pose, idx) => (
                    <button
                      key={pose.name}
                      onClick={() => setActivePoseIdx(idx)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-center transition-all ${
                        activePoseIdx === idx
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {pose.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Colorful Capabilities Showcase (4 Cards in Vibrant Palette) */}
        <section className="flex flex-col gap-8 pt-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trải Nghiệm Photobooth Toàn Diện</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Mọi tính năng cần thiết cho buổi chụp ảnh hoàn hảo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Rose Coral */}
            <div className="gsap-feature studio-card-interactive p-6 bg-white border border-slate-200/80 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">1. Photobooth Đa Dạng</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hỗ trợ 1 ảnh đơn, dải strip 3 ảnh dọc, lưới 4 ảnh hiện đại hoặc video ngắn 3 giây xuất file GIF sống động.
              </p>
            </div>

            {/* Card 2: Cobalt Blue */}
            <div className="gsap-feature studio-card-interactive p-6 bg-white border border-slate-200/80 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">2. Hướng Dẫn Góc Khớp</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Khung xương vẽ trực quan với màu sắc từng phân đoạn cơ thể, cảnh báo độ lệch góc khuỷu tay và khớp vai.
              </p>
            </div>

            {/* Card 3: Emerald Mint */}
            <div className="gsap-feature studio-card-interactive p-6 bg-white border border-slate-200/80 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">3. Chấm Điểm Thông Minh</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Giải thuật Cosine Similarity chuẩn hóa theo tâm hông, đưa ra điểm số 0-100 kèm lời khuyên chỉnh dáng tức thì.
              </p>
            </div>

            {/* Card 4: Indigo Purple */}
            <div className="gsap-feature studio-card-interactive p-6 bg-white border border-slate-200/80 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">4. Bộ Sưu Tập Khung</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nhiều chủ đề khung rực rỡ phong cách Pastel, Cyberpunk, Film Cổ Điển và tải về định dạng in tiêu chuẩn.
              </p>
            </div>
          </div>
        </section>

        {/* Direct Action Banner */}
        <section className="studio-card p-8 bg-gradient-to-r from-rose-50 via-white to-indigo-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h3 className="font-extrabold text-xl text-slate-900">
              Bắt đầu tạo những bức ảnh kỷ niệm tuyệt đẹp
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Mở ngay camera máy tính để khám phá các dáng chụp gợi ý và lưu lại khoảnh khắc đáng nhớ.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/booth" className="btn-shutter text-sm px-6 py-3 w-full sm:w-auto">
              <Camera className="w-4 h-4" />
              <span>Vào Photobooth</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Clean Studio Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Pose-Booth AI</span>
            <span>— Đồ án khởi nghiệp môn EXE101 · FPT University (2026)</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/booth" className="hover:text-rose-600 transition-colors">Photobooth</Link>
            <Link href="/pose-studio" className="hover:text-indigo-600 transition-colors">Pose Studio</Link>
            <Link href="/frames" className="hover:text-emerald-600 transition-colors">Khung Ảnh</Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">Thông Số Kỹ Thuật</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
