"use client";

import { FRAMES } from "@/lib/frames";
import { ArrowRight, Layers, Plus } from "lucide-react";
import Link from "next/link";

export default function FramesPage() {
  const displayFrames = FRAMES.filter((f) => f.id !== "none");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              PB
            </span>
            <span className="font-semibold text-sm tracking-tight text-slate-900">
              Pose-Booth AI
            </span>
          </Link>

          <nav className="flex items-center gap-5 text-xs font-medium text-slate-600">
            <Link href="/booth" className="hover:text-slate-900 transition-colors">Photobooth</Link>
            <Link href="/pose-studio" className="hover:text-slate-900 transition-colors">Pose Studio</Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">Hệ Thống</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full flex flex-col gap-8">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>Mẫu Khung Photobooth</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Thư viện khung in ảnh
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Các mẫu khung chuẩn hoá dành cho dải in 3 ảnh strip và lưới 4 ảnh, tối ưu hoá cho máy in ảnh nhiệt và xuất file lưu niệm.
          </p>
        </div>

        {/* Frames Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFrames.map((frame) => (
            <div
              key={frame.id}
              className="studio-card-interactive p-4 flex flex-col bg-white"
            >
              <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden mb-4 relative flex items-center justify-center p-4 border border-slate-200">
                {frame.thumbnailPath ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={frame.thumbnailPath}
                    alt={frame.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Layers className="w-10 h-10 text-slate-300" />
                )}
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-900">{frame.name}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono border border-slate-200">
                    {frame.category || "Standard"}
                  </span>
                </div>

                <Link
                  href="/booth"
                  className="btn-primary text-xs w-full py-2"
                >
                  <span>Chọn khung này</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}

          {/* Add custom frame placeholder card */}
          <div className="studio-card p-6 flex flex-col items-center justify-center text-center border-dashed border-slate-300 bg-white min-h-[300px] gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-1">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Tuỳ Chỉnh Khung Mới</h3>
            <p className="text-xs text-slate-500 max-w-[220px]">
              Tải lên file PNG trong suốt độ phân giải 1200x1800 chuẩn photobooth.
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
