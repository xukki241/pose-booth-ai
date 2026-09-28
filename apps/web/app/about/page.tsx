"use client";

import React, { useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ComicNav } from "@/components/motion/ComicNav";

export default function AboutPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(".animate-hero", { y: 12, opacity: 0.92, duration: 0.35, stagger: 0.08, ease: "power2.out" });
    gsap.from(".animate-section", { y: 10, duration: 0.35, stagger: 0.08, ease: "power2.out" });
  }, { scope: container });

  return (
    <main ref={container} className="min-h-dvh bg-white font-sans overflow-x-hidden border-4 border-black">
      {/* Navigation */}
      <ComicNav ctaHref="/booth" ctaLabel="Về phòng chụp" />

      <div className="mx-auto max-w-5xl px-6">
        <header className="max-w-3xl py-16">
          <h1 className="animate-hero text-4xl md:text-5xl font-black tracking-tight text-black">
            <span className="text-black drop-shadow-none">Ảnh vui.</span><br/>
            Cách dùng <span className="text-[#B42355]">rõ ràng.</span>
          </h1>
          <p className="animate-hero mt-8 text-xl font-bold leading-relaxed text-black/80 bg-white p-6 border-4 border-black shadow-[6px_6px_0_0_#000] -rotate-1">
            Pose-Booth là dự án thử nghiệm photobooth có hướng dẫn dáng. Bạn có thể chụp từ camera hoặc ghép ảnh có sẵn trên thiết bị.
          </p>
        </header>

        <div className="grid gap-8 py-10 md:grid-cols-2">

          <section className="animate-section group border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300">
            <h2 className="text-3xl font-black uppercase mb-4 text-[#B42355]">Ảnh của bạn đi đâu?</h2>
            <div className="space-y-4 font-bold text-black/80 text-lg">
              <p>Preview, bộ lọc và ghép ảnh chạy trong trình duyệt. Ảnh chỉ gửi tới máy studio khi bạn chọn lưu gallery và đồng ý điều khoản hiển thị.</p>
              <p>Gallery hết hạn sau 24 giờ. Người có QR có thể xem ảnh của phiên. Ảnh khách không tự chuyển thành dữ liệu training.</p>
            </div>
          </section>

          <section className="animate-section group border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300">
            <h2 className="text-3xl font-black uppercase mb-4 text-[#118AB2]">AI giúp gì khi chụp?</h2>
            <div className="space-y-4 font-bold text-black/80 text-lg">
              <p>MediaPipe tìm các điểm cơ thể trên thiết bị. API so sánh điểm với dáng tham khảo; điểm số không phải đánh giá cơ thể hay sức khỏe.</p>
              <p>Đường hướng dẫn hiện dáng từ keypoints. Tách mask từ ảnh tham chiếu và chỉnh silhouette vẫn đang phát triển.</p>
            </div>
          </section>

          <section className="animate-section group border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300">
            <h2 className="text-3xl font-black uppercase mb-4 text-primary">Nền tảng local</h2>
            <div className="space-y-4 font-bold text-black/80 text-lg">
              <p>Next.js phục vụ giao diện. FastAPI xử lý nghiệp vụ; AI runtime riêng chạy model. PostgreSQL lưu phiên, RabbitMQ chạy tác vụ nền và Redis giới hạn request.</p>
            </div>
          </section>

          <section className="animate-section group border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300">
            <h2 className="text-3xl font-black uppercase mb-4 text-primary">Giới hạn bản thử nghiệm</h2>
            <div className="space-y-4 font-bold text-black/80 text-lg">
              <p>Mỗi phiên hướng tới một người. Chưa nghiệm thu ba camera đồng thời, chưa hỗ trợ thanh toán, máy in hoặc chụp nhóm. Hiệu năng cần đo trên thiết bị thực tế.</p>
            </div>
          </section>

        </div>
      </div>

      <footer className="border-t-4 border-black bg-white px-6 py-8 text-center">
        <p className="font-semibold text-black text-sm">
          Pose-Booth AI. Dự án EXE101 tại FPT University.
        </p>
      </footer>
    </main>
  );
}
