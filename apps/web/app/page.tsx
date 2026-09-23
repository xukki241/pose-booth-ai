"use client";

import Link from "next/link";
import { Camera, Compass, Layers, CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Precision Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
              PB
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-slate-900 leading-none">
                Pose-Booth AI
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-0.5">
                Studio Edition
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/booth" className="hover:text-slate-900 transition-colors">
              Photobooth
            </Link>
            <Link href="/pose-studio" className="hover:text-slate-900 transition-colors">
              Pose Studio
            </Link>
            <Link href="/frames" className="hover:text-slate-900 transition-colors">
              Khung Ảnh
            </Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">
              Hệ Thống
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/booth" className="btn-primary text-xs">
              Mở Photobooth <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col gap-16">
        {/* Asymmetric Split Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4 pb-6">
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              EXE101 Startup Project — Local AI Inference
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Hệ thống Photobooth <br />
              <span className="text-blue-600">định hướng tư thế AI</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Tích hợp thị giác máy tính trực tiếp trên trình duyệt qua WebAssembly và GPU local.
              Phân tích 17 điểm khớp cơ thể trong thời gian thực, gợi ý dáng chụp chuẩn và tự động ghép khung in ảnh chất lượng cao.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/booth" className="btn-primary text-sm px-6 py-3">
                Bắt đầu chụp ngay <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link href="/pose-studio" className="btn-secondary text-sm px-5 py-3">
                Phòng phân tích Pose
              </Link>
            </div>

            {/* Hardware badge */}
            <div className="flex items-center gap-6 pt-4 text-xs text-slate-500 font-mono border-t border-slate-200 w-full">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-slate-700" />
                <span>Zero Latency WASM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                <span>100% Client Privacy</span>
              </div>
            </div>
          </div>

          {/* Right Visual Specimen (Simulated Studio Viewport) */}
          <div className="lg:col-span-5">
            <div className="studio-card p-4 bg-white border border-slate-200 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">VIEWFINDER MONITOR</span>
                </div>
                <span className="num-mono text-[11px] text-slate-400">30 FPS · 1280x720</span>
              </div>

              {/* Viewport Frame */}
              <div className="aspect-[4/3] bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center mt-3">
                {/* Visual Skeleton Grid Specimen */}
                <svg className="w-full h-full opacity-80" viewBox="0 0 400 300">
                  {/* Subtle Grid */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Body wireframe */}
                  <line x1="200" y1="90" x2="160" y2="130" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="200" y1="90" x2="240" y2="130" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="160" y1="130" x2="140" y2="180" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="240" y1="130" x2="260" y2="180" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="200" y1="90" x2="200" y2="190" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="200" y1="190" x2="175" y2="250" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="200" y1="190" x2="225" y2="250" stroke="#3b82f6" strokeWidth="2.5" />

                  {/* Joints */}
                  <circle cx="200" cy="65" r="14" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" />
                  <circle cx="160" cy="130" r="5" fill="#60a5fa" />
                  <circle cx="240" cy="130" r="5" fill="#60a5fa" />
                  <circle cx="140" cy="180" r="4.5" fill="#10b981" />
                  <circle cx="260" cy="180" r="4.5" fill="#10b981" />
                  <circle cx="175" cy="250" r="5" fill="#60a5fa" />
                  <circle cx="225" cy="250" r="5" fill="#60a5fa" />
                </svg>

                {/* Realtime telemetry HUD */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <div className="bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[11px] font-mono text-emerald-400 border border-slate-700">
                    MATCH: 94.2%
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-slate-300 border border-slate-700">
                    POSE: POWER_01
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-700">
                  GPU ACCELERATED
                </div>
              </div>

              {/* Sub-bar */}
              <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
                <span>17 COCO Keypoints</span>
                <span className="font-semibold text-slate-700">Cosine Similarity Engine</span>
              </div>
            </div>
          </div>
        </section>

        {/* Studio Architecture Matrix (2-column clean layout) */}
        <section className="flex flex-col gap-8 pt-4 border-t border-slate-200">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Kiến trúc kỹ thuật hệ thống
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Phân tách rõ ràng giữa xử lý client-side và inference backend
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="studio-card p-6 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">1. MediaPipe WASM</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chạy trực tiếp trong luồng WebWorker của trình duyệt ở tốc độ 30 FPS. Dựng khung xương ảo theo thời gian thực mà không tiêu tốn băng thông mạng.
              </p>
            </div>

            <div className="studio-card p-6 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">2. Vector Cosine Scoring</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chuẩn hoá toạ độ theo tỷ lệ khoảng cách hông-vai và so sánh vector góc chi với mẫu tiêu chuẩn, trả về chỉ số khớp 0-100 và hướng dẫn điều chỉnh.
              </p>
            </div>

            <div className="studio-card p-6 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">3. Multi-shot Strip Export</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hỗ trợ chụp đơn, dải strip 3 ảnh dọc, lưới 4 ảnh và video lặp 3 giây. Kết xuất file in định dạng chuẩn hoặc ảnh động GIF ngay tại client.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Access Action Bar */}
        <section className="studio-card p-8 bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h3 className="font-bold text-lg text-slate-900">Sẵn sàng trải nghiệm thử?</h3>
            <p className="text-sm text-slate-500">Mở phòng Photobooth để bắt đầu chụp ảnh với hướng dẫn AI.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/booth" className="btn-primary w-full sm:w-auto text-sm px-6 py-2.5">
              Vào Photobooth
            </Link>
            <Link href="/frames" className="btn-secondary w-full sm:w-auto text-sm px-5 py-2.5">
              Xem khung ảnh
            </Link>
          </div>
        </section>
      </main>

      {/* Discrete Studio Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Pose-Booth AI — Dự án môn học EXE101 · FPT University (2026)
          </div>
          <div className="flex items-center gap-6">
            <Link href="/booth" className="hover:text-slate-900 transition-colors">Photobooth</Link>
            <Link href="/pose-studio" className="hover:text-slate-900 transition-colors">Pose Studio</Link>
            <Link href="/frames" className="hover:text-slate-900 transition-colors">Khung ảnh</Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">Kiến trúc hệ thống</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
