'use client';
import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';
import { FRAMES } from '@/lib/frames';
import { Button, buttonVariants } from 'c-comic-ui';
import { Camera } from 'lucide-react';

export default function FramesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(".animate-stagger > *", {
      y: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)"
    });
    gsap.from(".animate-fade", {
      opacity: 0, scale: 0.98, duration: 0.6, ease: "power2.out"
    });
  }, { scope: containerRef });

  const [category, setCategory] = useState('all');
  const frames = FRAMES.filter(frame => frame.overlayPath);
  const categories = ['all', ...new Set(frames.map(frame => frame.category ?? 'Standard'))];
  const visible = category === 'all' ? frames : frames.filter(frame => frame.category === category);
  return <main ref={containerRef} className="mx-auto min-h-dvh max-w-6xl px-5">
    <nav aria-label="Điều hướng khung ảnh" className="flex flex-wrap items-center justify-between gap-4 border-b border-black border-4 shadow-[4px_4px_0_0_#000] py-5 animate-fade">
      <Link href="/" className="flex items-center gap-2 text-lg font-extrabold"><Camera className="size-6 text-primary" />Pose-Booth AI</Link>
      <Link href="/booth" className={buttonVariants({ variant: 'outline' })}>Mở phòng chụp</Link>
    </nav>
    <header className="py-10"><h1 className="text-4xl font-extrabold tracking-tight">Khung nhỏ, kỷ niệm lớn.</h1><p className="mt-4 max-w-xl leading-relaxed text-black/80 font-bold">Chọn khung dọc bốn ảnh, rồi chụp mới hoặc dùng ảnh có sẵn. Màu filter chỉ đổi ảnh, không đổi họa tiết khung.</p></header>
    <div className="mb-8 flex flex-wrap gap-2" aria-label="Lọc khung">{categories.map(item => <Button key={item} variant={category === item ? 'default' : 'outline'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === 'all' ? 'Tất cả' : item}</Button>)}</div>
    <section aria-label="Khung có sẵn" className="grid gap-6 pb-12 sm:grid-cols-2">
      {visible.map(frame => <article key={frame.id} className="overflow-hidden rounded-none border border-black border-4 shadow-[4px_4px_0_0_#000] bg-white">
        <div className="flex h-96 items-center justify-center bg-[#FFD166] p-6"><img src={frame.thumbnailPath!} alt={frame.name} className="h-full w-auto max-w-full object-contain" /></div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5"><h2 className="text-lg font-bold">{frame.name}</h2><Link href={`/booth?frame=${frame.id}`} className={buttonVariants()}>Dùng khung này</Link></div>
      </article>)}
      {!visible.length && <p className="text-black/80 font-bold">Chưa có khung trong nhóm này.</p>}
    </section>
  </main>;
}
