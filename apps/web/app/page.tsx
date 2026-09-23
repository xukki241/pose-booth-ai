"use client";

/**
 * Landing / Hero Page
 * GSAP animations: split text reveal, floating elements, scroll-triggered cards
 */
import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: "🎯",
    title: "Phân Tích Pose Realtime",
    desc: "MediaPipe + YOLOv8 phát hiện 17 điểm khớp cơ thể với độ chính xác 92%+, xử lý 30fps trực tiếp qua webcam.",
  },
  {
    icon: "💡",
    title: "Gợi Ý Pose Mẫu",
    desc: "20+ tư thế được thiết kế sẵn từ portrait, dynamic đến casual. AI gợi ý pose phù hợp nhất với bạn.",
  },
  {
    icon: "🏆",
    title: "Chấm Điểm Độ Khớp",
    desc: "Cosine similarity algorithm so sánh pose của bạn với pose mẫu, hiển thị điểm 0-100 và gợi ý chỉnh sửa.",
  },
  {
    icon: "📸",
    title: "Photobooth AI",
    desc: "Chụp 1/3/4 shots với countdown tự động, hoặc quay video 3s. Export PNG, JPEG hay GIF ngay trên browser.",
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Hero entrance timeline
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, ease: "power3.out" }
      )
        .fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
          "-=0.5"
        )
        .fromTo(
          ctaRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        );

      // Feature cards — scroll triggered stagger
      if (featuresRef.current) {
        const cards = featuresRef.current.querySelectorAll(".feature-card");
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 80%",
            },
          }
        );
      }
    },
    { scope: heroRef }
  );

  return (
    <main ref={heroRef} className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎭</span>
          <span className="font-bold text-lg tracking-tight">Pose-Booth AI</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/70">
          <Link href="/about" className="hover:text-white transition-colors">Về chúng tôi</Link>
          <Link href="/pose-studio" className="hover:text-white transition-colors">Pose Studio</Link>
          <Link
            href="/booth"
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
          >
            Vào Photobooth
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-violet-300 mb-8 border border-violet-500/30">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          AI-Powered Photobooth · YOLOv8 + MediaPipe
        </div>

        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
        >
          Chụp Ảnh Đẹp Hơn
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 glow-text">
            Với AI Pose
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed"
        >
          PikPose phân tích tư thế cơ thể realtime, gợi ý pose mẫu đẹp và chấm điểm độ khớp —
          tất cả trong một photobooth AI thế hệ mới.
        </p>

        <div ref={ctaRef} className="flex items-center gap-4">
          <Link
            href="/booth"
            className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 glow-violet"
          >
            Bắt Đầu Chụp →
          </Link>
          <Link
            href="/pose-studio"
            className="px-8 py-3.5 rounded-xl glass glass-hover text-white font-semibold text-lg transition-all duration-200"
          >
            Thử Pose Studio
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-24 max-w-6xl mx-auto w-full">
        <h2 className="text-center text-3xl font-bold mb-12 text-white/90">
          Tính Năng Nổi Bật
        </h2>
        <div
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="feature-card glass glass-hover rounded-2xl p-6 flex flex-col gap-3"
              data-animate
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold text-white text-lg leading-snug">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-sm text-white/30">
        PikPose — AI Photobooth · Dự án môn học
      </footer>
    </main>
  );
}
