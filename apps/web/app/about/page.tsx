"use client";

import Link from "next/link";
import { Cpu, Eye, Layers, Server, Shield, ArrowRight } from "lucide-react";

const SYSTEM_PILLARS = [
  {
    icon: Eye,
    title: "Thị giác máy tính cục bộ",
    desc: "Sử dụng MediaPipe Tasks Vision WebAssembly với GPU delegate trên trình duyệt, xử lý 33 landmarks ở tốc độ 30 FPS không cần GPU máy chủ.",
  },
  {
    icon: Server,
    title: "Backend AI linh hoạt",
    desc: "FastAPI tích hợp YOLOv8-Pose và giải thuật Cosine Similarity chuẩn hoá theo tâm hông và chiều cao thân, độ trễ phản hồi dưới 20ms.",
  },
  {
    icon: Cpu,
    title: "Tối ưu phần cứng cá nhân",
    desc: "Được thiết kế để chạy mượt mà trên laptop cá nhân (RTX 4050 6GB / CPU 14 nhân) hoặc máy bàn (RTX 3060 12GB), không phụ thuộc cloud API đắt đỏ.",
  },
  {
    icon: Shield,
    title: "Bảo mật & Quyền riêng tư",
    desc: "Hình ảnh từ camera xử lý trực tiếp trong bộ nhớ RAM trình duyệt, không lưu trữ ngầm hoặc gửi hình ảnh cá nhân lên máy chủ khi không có sự đồng ý.",
  },
];

const SPECS = [
  { label: "Frontend Framework", value: "Next.js 16 (React 19, TypeScript)" },
  { label: "Styling & Tokens", value: "Tailwind CSS 4 (Deterministic Light Studio System)" },
  { label: "Client-side Vision", value: "MediaPipe Vision Tasks (WASM Float16 GPU Delegate)" },
  { label: "Server Architecture", value: "FastAPI + Uvicorn Async Workers" },
  { label: "AI Pose Engine", value: "YOLOv8s-Pose (17 COCO Keypoints) + Cosine Distance" },
  { label: "Production Gateway", value: "Nginx Reverse Proxy with SPA Fallback & COEP Headers" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Studio Header */}
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
            <Link href="/frames" className="hover:text-slate-900 transition-colors">Khung Ảnh</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full flex flex-col gap-12">
        {/* Intro */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 tracking-wider uppercase">
            <span>Dự án khởi nghiệp môn học EXE101 · FPT University</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Tổng quan kiến trúc & kỹ thuật
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
            Pose-Booth AI là giải pháp photobooth thông minh kết hợp công nghệ thị giác máy tính trực tiếp trên client và máy chủ cục bộ. Dự án nhằm giải quyết bài toán người chụp thường bối rối khi tạo dáng trước ống kính, cung cấp phản hồi hình thể thời gian thực và tự động dàn trang in ảnh lưu niệm.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SYSTEM_PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="studio-card p-6 flex flex-col gap-2.5 bg-white">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Technical Specifications Table */}
        <div className="studio-card p-6 bg-white flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Thông số kỹ thuật triển khai
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            {SPECS.map((spec) => (
              <div key={spec.label} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-medium text-slate-600">{spec.label}</span>
                <span className="font-mono text-slate-900 font-semibold">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* References and Notes */}
        <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-500 leading-relaxed">
          <p>
            Mã nguồn mở và tham chiếu thiết kế cấu trúc buồng chụp ảnh từ đồ án công khai <code className="font-mono text-slate-700">yunkhngn/prismo-photo</code>, được tái cấu trúc hoàn toàn trên nền tảng TypeScript, Next.js 16 và quy chuẩn thiết kế xác định (Deterministic Design).
          </p>
        </div>

        {/* Navigation Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
            ← Quay lại trang chủ
          </Link>
          <Link href="/booth" className="btn-primary text-xs">
            <span>Mở Photobooth</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </main>
    </div>
  );
}
