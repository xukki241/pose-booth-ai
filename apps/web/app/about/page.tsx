"use client";

/**
 * About Page
 * Project overview + tech stack + team info
 * GSAP scroll reveal animations
 */
import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TECH_STACK = [
  { icon: "⚛️",  name: "Next.js 16",       desc: "React framework, App Router, TypeScript" },
  { icon: "🎨",  name: "Tailwind CSS 4",    desc: "Utility-first CSS, dark glassmorphism" },
  { icon: "🪄",  name: "GSAP 3",            desc: "ScrollTrigger, smooth page transitions" },
  { icon: "🤖",  name: "MediaPipe",         desc: "Browser WASM pose detection, 30fps" },
  { icon: "🎯",  name: "YOLOv8-Pose",       desc: "Server-side AI, CUDA 12.1, 17 keypoints" },
  { icon: "⚡",  name: "FastAPI",            desc: "Python backend, async, Pydantic v2" },
  { icon: "📐",  name: "Cosine Similarity", desc: "Pose scoring algorithm, 0-100 score" },
  { icon: "🌐",  name: "Nginx",             desc: "SPA routing, API proxy, HTTPS" },
];

const TIMELINE = [
  { week: "Tuần 1", status: "done",    title: "Setup & Backend",   desc: "Project structure, FastAPI + YOLOv8, pose library 20 poses, security scan skills" },
  { week: "Tuần 2", status: "active",  title: "Frontend Core",     desc: "Next.js SPA, MediaPipe hook, skeleton overlay, photobooth state machine" },
  { week: "Tuần 3", status: "pending", title: "Polish & Export",   desc: "GIF export, GSAP page transitions, mobile responsive" },
  { week: "Tuần 4", status: "pending", title: "Integration & Demo", desc: "End-to-end test, AI training, final demo" },
];

const STATUS_COLOR: Record<string, string> = {
  done:    "bg-emerald-400/20 text-emerald-400 border-emerald-400/30",
  active:  "bg-violet-400/20 text-violet-400 border-violet-400/30",
  pending: "bg-white/5 text-white/40 border-white/10",
};

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".reveal-up",
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: ".reveal-up", start: "top 85%" },
        }
      );
    },
    { scope: pageRef }
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <section className="py-24 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-violet-500/30 text-sm text-violet-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          EXE101 — FPT University
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Pose-Booth <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">AI</span>
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          Dự án môn học EXE101 xây dựng AI Photobooth với pose detection realtime,
          gợi ý tư thế mẫu và hệ thống chấm điểm thông minh.
        </p>
      </section>

      {/* Tech Stack */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center reveal-up">Công Nghệ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 reveal-up">
          {TECH_STACK.map((t) => (
            <div key={t.name} className="glass glass-hover rounded-xl p-4 flex flex-col gap-2">
              <span className="text-2xl">{t.icon}</span>
              <span className="font-bold text-sm">{t.name}</span>
              <span className="text-white/40 text-xs">{t.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center reveal-up">Kế Hoạch Phát Triển</h2>
        <div className="flex flex-col gap-4 reveal-up">
          {TIMELINE.map((item) => (
            <div key={item.week} className="flex items-start gap-4 glass rounded-xl p-5">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLOR[item.status]} whitespace-nowrap`}>
                {item.week}
              </span>
              <div>
                <div className="font-bold">{item.title}</div>
                <div className="text-white/50 text-sm mt-1">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reference */}
      <section className="py-12 px-4 max-w-3xl mx-auto text-center reveal-up">
        <p className="text-white/40 text-sm">
          UI reference:{" "}
          <a href="https://github.com/yunkhngn/prismo-photo" className="text-violet-400 hover:underline" target="_blank" rel="noopener noreferrer">
            prismo-photo by @yunkhngn
          </a>
          {" "}· Refactored với TypeScript + GSAP + dark glassmorphism
        </p>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <Link
          href="/booth"
          className="px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-lg transition-all hover:scale-105"
        >
          Thử Photobooth →
        </Link>
      </section>
    </div>
  );
}
