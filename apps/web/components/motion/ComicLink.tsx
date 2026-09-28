'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, type ComponentProps, type MouseEvent } from 'react';

type ComicLinkProps = ComponentProps<typeof Link>;

function hrefString(href: ComicLinkProps['href']): string {
  if (typeof href === 'string') return href;
  if (!href) return '';
  const path = href.pathname ?? '';
  const query = href.search ?? '';
  const hash = href.hash ?? '';
  return `${path}${query}${hash}`;
}

export function ComicLink({ href, onClick, ...props }: ComicLinkProps) {
  const router = useRouter();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const next = hrefString(href);
    if (!next || next.startsWith('http') || next.startsWith('mailto:')) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next === current) return;
    const doc = document as Document & { startViewTransition?: (callback: () => void) => void };
    if (!doc.startViewTransition) return;
    event.preventDefault();
    doc.startViewTransition(() => {
      startTransition(() => {
        router.push(next);
      });
    });
  };
  return <Link href={href} onClick={handleClick} {...props} />;
}
