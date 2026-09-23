"use client";

import { FRAMES } from "@/lib/frames";
import { ArrowRight, Layers, Sparkles, Plus, Camera } from "lucide-react";
import Link from "next/link";

const COLORFUL_THEMES = [
  { id: "all", label: "Tất Cả Mẫu" },
  { id: "pastel", label: "Pastel Dịu Mắt" },
  { id: "vintage", label: "Film Cổ Điển" },
  { id: "modern", label: "Tối Giản Hiện Đại" },
];

export default function FramesPage() {
  const displayFrames = FRAMES.filter((f) => f.id !== "none");

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col">
      {/* Studio Header */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-15 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Pose-Booth AI
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/booth" className="hover:text-rose-600 transition-colors">Photobooth</Link>
            <Link href="/pose-studio" className="hover:text-indigo-600 transition-colors">Pose Studio</Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">Thông Số Hệ Thống</Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bộ Sưu Tập Khung In Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Thư viện khung in ảnh nghệ thuật
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Tuyển tập các mẫu khung ảnh được thiết kế riêng cho dải in 3 ảnh strip và lưới 4 ảnh, tối ưu màu sắc cho việc in ấn hoặc chia sẻ lên mạng xã hội.
          </p>
        </div>

        {/* Frames Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFrames.map((frame) => (
            <div
              key={frame.id}
              className="studio-card-interactive p-5 flex flex-col bg-white border border-slate-200 shadow-sm"
            >
              <div className="aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center p-4 border border-slate-200/80">
                {frame.thumbnailPath ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={frame.thumbnailPath}
                    alt={frame.name}
                    className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <Layers className="w-12 h-12 text-slate-300" />
                )}
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{frame.name}</h3>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                    {frame.category || "Standard"}
                  </span>
                </div>

                <Link
                  href="/booth"
                  className="btn-shutter text-xs w-full py-2.5"
                >
                  <span>Sử dụng khung này</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}

          {/* Add Custom Frame Card */}
          <div className="studio-card p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-300 bg-white min-h-[320px] gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Thiết Kế Khung Riêng</h3>
            <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
              Hỗ trợ định dạng file PNG trong suốt chuẩn 1200x1800 cho sự kiện của bạn.
            </p>
            <Link href="/booth" className="btn-secondary text-xs mt-3">
              Mở Booth Ngay
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
