"use client";

/**
 * Frames Library Page
 * Browse photobooth frames with glassmorphism UI & instant selection
 */
import { FRAMES } from "@/lib/frames";
import { Sparkles, ArrowRight, Palette } from "lucide-react";
import Link from "next/link";

export default function FramesPage() {
  const displayFrames = FRAMES.filter((f) => f.id !== "none");

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🎭</span>
            <span className="font-bold text-lg tracking-tight">Pose-Booth AI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <Link href="/booth" className="hover:text-white transition-colors">Photobooth</Link>
            <Link href="/pose-studio" className="hover:text-white transition-colors">Pose Studio</Link>
            <Link href="/about" className="hover:text-white transition-colors">Về chúng tôi</Link>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-violet-500/30 text-sm text-violet-300">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Bộ Sưu Tập Khung Ảnh</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Khung Ảnh <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Photobooth</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-base">
            Khám phá các mẫu khung ảnh độc đáo được thiết kế sẵn cho photobooth strip và collage.
          </p>
        </div>

        {/* Frames Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFrames.map((frame) => (
            <div
              key={frame.id}
              className="glass glass-hover rounded-2xl p-5 flex flex-col group transition-all duration-300 hover:scale-[1.02] border border-white/10"
            >
              <div className="aspect-[3/4] bg-zinc-900/60 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center p-4 border border-white/5">
                {frame.thumbnailPath ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={frame.thumbnailPath}
                    alt={frame.name}
                    className="max-h-full max-w-full object-contain drop-shadow-xl"
                  />
                ) : (
                  <Palette className="w-12 h-12 text-white/20" />
                )}
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">{frame.name}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 font-medium border border-violet-500/20">
                    {frame.category || "Standard"}
                  </span>
                </div>

                <Link
                  href="/booth"
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm text-center flex items-center justify-center gap-2 transition-colors glow-violet"
                >
                  Dùng Khung Này <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {/* Custom Frame Card */}
          <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center text-center border border-dashed border-white/20 min-h-[300px]">
            <span className="text-4xl mb-3">✨</span>
            <h3 className="font-bold text-lg mb-1">Thêm Khung Tuỳ Chỉnh</h3>
            <p className="text-white/50 text-xs max-w-xs mb-4">
              Hỗ trợ file PNG trong suốt kích thước chuẩn cho photobooth strip.
            </p>
            <Link
              href="/booth"
              className="px-4 py-2 rounded-lg glass glass-hover text-xs font-medium text-white/80"
            >
              Vào Booth Ngay →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
