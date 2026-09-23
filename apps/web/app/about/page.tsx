"use client";

import Link from "next/link";
import { Cpu, Eye, Layers, Server, Shield, ArrowRight, Camera, Sparkles, CheckCircle2 } from "lucide-react";

const SYSTEM_PILLARS = [
  {
    icon: Eye,
    color: "bg-blue-100 text-blue-600",
    title: "Thị giác máy tính cục bộ",
    desc: "Sử dụng MediaPipe Tasks Vision WebAssembly với GPU delegate trên trình duyệt, xử lý 33 landmarks ở tốc độ 30 FPS không cần GPU máy chủ.",
  },
  {
    icon: Server,
    color: "bg-rose-100 text-rose-600",
    title: "Backend AI linh hoạt",
    desc: "FastAPI tích hợp YOLOv8-Pose và giải thuật Cosine Similarity chuẩn hoá theo tâm hông và chiều cao thân, độ trễ phản hồi dưới 20ms.",
  },
  {
    icon: Cpu,
    color: "bg-emerald-100 text-emerald-600",
    title: "Tối ưu phần cứng cá nhân",
    desc: "Được thiết kế để chạy mượt mà trên laptop cá nhân (RTX 4050 6GB / CPU 14 nhân) hoặc máy bàn (RTX 3060 12GB), không phụ thuộc cloud API đắt đỏ.",
  },
  {
    icon: Shield,
    color: "bg-indigo-100 text-indigo-600",
    title: "Bảo mật & Quyền riêng tư",
    desc: "Hình ảnh từ camera xử lý trực tiếp trong bộ nhớ RAM trình duyệt, không lưu trữ ngầm hoặc gửi hình ảnh cá nhân lên máy chủ khi không có sự đồng ý.",
  },
];

const HARDWARE_PROFILES = [
  {
    device: "Laptop Hiện Tại (Đang Dùng)",
    specs: "NVIDIA RTX 4050 (6GB VRAM) + Intel Core i5 13500HX (14 Cores / 20 Threads)",
    capability: "Chạy trơn tru MediaPipe 30 FPS trên trình duyệt + YOLOv8s-Pose inference 80–120 FPS cục bộ",
    vramUsed: "~1.5 GB / 6 GB VRAM",
    status: "Rất Tốt",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    device: "Máy Bàn AI (RTX 3060)",
    specs: "NVIDIA RTX 3060 (12GB VRAM) + AMD Ryzen 7 5700X (8 Cores / 16 Threads)",
    capability: "Fine-tune lại mô hình YOLOv8 trên tập dữ liệu COCO mở rộng và phục vụ đồng thời nhiều booth",
    vramUsed: "~2.2 GB / 12 GB VRAM",
    status: "Mạnh Mẽ",
    statusColor: "bg-blue-100 text-blue-700",
  },
];

const SPECS = [
  { label: "Frontend Framework", value: "Next.js 16 (React 19, TypeScript)" },
  { label: "Styling & Tokens", value: "Tailwind CSS 4 (Vibrant Studio Light Theme)" },
  { label: "Client-side Vision", value: "MediaPipe Vision Tasks (WASM Float16 GPU Delegate)" },
  { label: "Server Architecture", value: "FastAPI + Uvicorn Async Workers" },
  { label: "AI Pose Engine", value: "YOLOv8s-Pose (17 COCO Keypoints) + Cosine Distance" },
  { label: "Production Gateway", value: "Nginx Reverse Proxy with SPA Fallback & COEP Headers" },
];

export default function AboutPage() {
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
            <Link href="/frames" className="hover:text-emerald-600 transition-colors">Khung Ảnh</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full flex flex-col gap-12">
        {/* Intro */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dự án khởi nghiệp môn học EXE101 · FPT University</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Kiến trúc hệ thống & Khả năng vận hành
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
            Pose-Booth AI là giải pháp photobooth thông minh giải quyết rào cản người dùng bối rối khi tạo dáng trước máy ảnh. Hệ thống phân tách tính toán: trình duyệt xử lý nhận diện cơ thể tức thì, trong khi backend cục bộ đảm nhận chấm điểm chuẩn hóa và xuất khung ảnh độ phân giải cao.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SYSTEM_PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="studio-card p-6 flex flex-col gap-3 bg-white border border-slate-200/90 shadow-sm">
                <div className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center font-bold`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Hardware Compatibility Profiles */}
        <div className="studio-card p-6 bg-white border border-slate-200/90 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Đánh giá cấu hình phần cứng triển khai</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HARDWARE_PROFILES.map((prof) => (
              <div key={prof.device} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{prof.device}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prof.statusColor}`}>
                    {prof.status}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-600">{prof.specs}</p>
                <p className="text-xs text-slate-600 mt-1">{prof.capability}</p>
                <div className="mt-auto pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>VRAM ước tính:</span>
                  <span className="font-bold text-slate-800">{prof.vramUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specifications Table */}
        <div className="studio-card p-6 bg-white border border-slate-200/90 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Thông số kỹ thuật phần mềm
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

        {/* Clean Architecture Note */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 leading-relaxed flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p>
            Hệ thống Pose-Booth AI đã sẵn sàng hoạt động độc lập không cần internet sau khi tải mô hình lần đầu. Mọi tương tác trực quan đều được phản hồi tức thì với độ trễ dưới 33ms.
          </p>
        </div>

        {/* Navigation Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            ← Quay lại trang chủ
          </Link>
          <Link href="/booth" className="btn-shutter text-xs">
            <Camera className="w-3.5 h-3.5" />
            <span>Mở Photobooth</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
