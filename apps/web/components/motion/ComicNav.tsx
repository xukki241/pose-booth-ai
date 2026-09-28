'use client';

import { Camera } from 'lucide-react';
import { ComicLink } from '@/components/motion/ComicLink';

const LINKS = [
  { href: '/frames', label: 'Khung Ảnh' },
  { href: '/pose-studio', label: 'Tập Dáng' },
  { href: '/about', label: 'Giới Thiệu' },
] as const;

export function ComicNav({
  ctaHref,
  ctaLabel,
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <nav
      aria-label="Main Navigation"
      className="booth-nav mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b-8 border-border bg-background px-6 py-5 shadow-[0_8px_0_0_var(--border)]"
    >
      <ComicLink href="/" className="comic-press flex items-center gap-2 font-black text-2xl uppercase tracking-tighter">
        <Camera className="size-8 stroke-[3]" />
        Pose-Booth <span className="text-primary">AI</span>
      </ComicLink>
      <div className="flex flex-wrap items-center gap-4 text-base font-bold uppercase tracking-tight sm:gap-6">
        {LINKS.map(item => (
          <ComicLink key={item.href} href={item.href} className="comic-press hover:text-primary underline-offset-4 hover:underline decoration-4">
            {item.label}
          </ComicLink>
        ))}
        {ctaHref && ctaLabel && (
          <ComicLink href={ctaHref} className="booth-cta comic-press border-4 border-border bg-primary px-3 py-2 text-primary-foreground shadow-[4px_4px_0_0_var(--border)]">
            {ctaLabel}
          </ComicLink>
        )}
      </div>
    </nav>
  );
}
