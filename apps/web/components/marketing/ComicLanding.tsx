"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Camera, ImagePlus, ArrowUpRight } from "lucide-react";
import { Button } from "c-comic-ui";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function ComicLanding() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Entrance transition loading sequence
    const tl = gsap.timeline();
    
    // Initial state setup
    gsap.set(".animate-hero", { y: 50, opacity: 0 });
    gsap.set(".animate-nav", { y: -20, opacity: 0 });
    gsap.set(".animate-card", { scale: 0.8, opacity: 0, rotation: 5 });

    tl.to(".animate-nav", { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" })
      .to(".animate-hero", { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power3.out" }, "-=0.3")
      .to(".animate-card", { scale: 1, opacity: 1, rotation: (i) => i === 0 ? -6 : 6, duration: 0.7, stagger: 0.1, ease: "elastic.out(1, 0.5)" }, "-=0.4");
  }, { scope: container });

  return (
    <div ref={container} className="min-h-dvh bg-background text-foreground font-sans overflow-x-hidden border-4 border-border">
      {/* Navigation */}
      <nav aria-label="Main Navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b-8 border-border bg-background px-6 py-6 shadow-[0_8px_0_0_var(--border)]">
        <Link href="/" className="animate-nav flex items-center gap-2 font-black text-2xl uppercase tracking-tighter">
          <Camera className="size-8 stroke-[3] text-black" />
          Pose-Booth <span className="text-[#B42355]">AI</span>
        </Link>
        <div className="flex items-center gap-6 text-lg font-bold uppercase tracking-tight">
          <Link href="/frames" className="animate-nav hover:text-[#B42355] hover:underline decoration-4 underline-offset-4 transition-all">Khung Ảnh</Link>
          <Link href="/pose-studio" className="animate-nav hover:text-[#B42355] hover:underline decoration-4 underline-offset-4 transition-all">Tập Dáng</Link>
          <Link href="/about" className="animate-nav hover:text-[#B42355] hover:underline decoration-4 underline-offset-4 transition-all">Giới Thiệu</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
        <div className="space-y-8">
          <h1 className="animate-hero text-4xl font-black leading-[1.15] tracking-tight md:text-5xl text-black">
            <span className="text-black drop-shadow-none">Một chút</span> tạo dáng.<br />
            <span className="text-[#B42355]">Một đời</span> kỷ niệm.
          </h1>
          <p className="animate-hero max-w-md text-xl font-bold leading-relaxed text-black/80 bg-white p-4 border-4 border-black shadow-[4px_4px_0_0_#000] rotate-1">
            Chụp ảnh mới hoặc chọn ảnh có sẵn. Thêm màu yêu thích, ghép khung và lưu về máy!
          </p>
          <div className="animate-hero flex flex-wrap gap-4 pt-4">
            <Button size="lg" className="border-4 border-black bg-[#B42355] text-white hover:bg-[#FFE4EC] hover:text-black font-black uppercase text-xl shadow-[6px_6px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_#000] transition-all" asChild>
              <Link href="/booth">
                <Camera className="mr-2 size-6 stroke-[3]" /> Mở phòng chụp
              </Link>
            </Button>
            <Button size="lg" className="border-4 border-black bg-white text-black hover:bg-gray-200 font-black uppercase text-xl shadow-[6px_6px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_#000] transition-all" asChild>
              <Link href="/booth#import-photos">
                <ImagePlus className="mr-2 size-6 stroke-[3]" /> Dùng ảnh có sẵn
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Visual Cards showing neo-brutalism */}
        <div className="flex min-h-[400px] items-center justify-center gap-6 rounded-3xl border-8 border-black bg-[#58C4F6] p-8 shadow-[8px_8px_0_0_#000]" aria-label="Khung ảnh minh họa">
          <img src="/frames/frame-strawberry.svg" alt="Khung Dâu hồng bốn ảnh" className="animate-card h-80 w-28 object-contain shadow-[8px_8px_0_0_#000] border-4 border-black bg-white" />
          <img src="/frames/frame-cherry.svg" alt="Khung Cherry bốn ảnh" className="animate-card h-80 w-28 object-contain shadow-[8px_8px_0_0_#000] border-4 border-black bg-white" />
        </div>
      </section>

      {/* Feature Section */}
      <section className="border-t-8 border-black bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-black uppercase tracking-tight mb-12 inline-block border-b-8 border-[#B42355] pb-2">Chọn cách lưu khoảnh khắc</h2>
          <div className="grid gap-8 md:grid-cols-2">
            
            <div className="group border-4 border-black bg-[#FFD166] p-8 shadow-[8px_8px_0_0_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300">
              <h3 className="text-3xl font-black uppercase mb-4 text-black">Chụp ngay tại đây!</h3>
              <p className="text-lg font-bold leading-relaxed text-black/80 mb-6 bg-white p-4 border-2 border-black">
                Chọn dáng tham khảo, đặt đếm ngược và chụp 1, 3 hoặc 4 ảnh. Bạn quyết định lúc bấm máy!
              </p>
              <Link className="inline-flex items-center gap-2 font-black text-2xl text-black bg-white px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_#000] group-hover:bg-[#B42355] group-hover:text-white transition-colors" href="/pose-studio">
                TẬP DÁNG <ArrowUpRight className="size-6 stroke-[3]" />
              </Link>
            </div>

            <div className="group border-4 border-black bg-[#06D6A0] p-8 shadow-[8px_8px_0_0_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300">
              <h3 className="text-3xl font-black uppercase mb-4 text-black">Ghép ảnh có sẵn!</h3>
              <p className="text-lg font-bold leading-relaxed text-black/80 mb-6 bg-white p-4 border-2 border-black">
                Không cần bật camera. Chọn ảnh trên thiết bị, thêm bộ lọc và tải khung ảnh về máy!
              </p>
              <Link className="inline-flex items-center gap-2 font-black text-2xl text-black bg-white px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_#000] group-hover:bg-[#B42355] group-hover:text-white transition-colors" href="/frames">
                KHUNG ẢNH <ArrowUpRight className="size-6 stroke-[3]" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white px-6 py-8 text-center">
        <p className="font-semibold text-black text-sm">
          Ảnh xử lý trên thiết bị. Chỉ gửi tới gallery khi bạn chủ động chọn lưu.
        </p>
      </footer>
    </div>
  );
}
