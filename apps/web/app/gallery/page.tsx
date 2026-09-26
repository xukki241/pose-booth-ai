'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [message, setMessage] = useState('Đang mở phiên…');
  const token = useRef<string | null>(null);
  useEffect(() => {
    const secret = token.current ?? window.location.hash.slice(1);
    token.current = secret;
    history.replaceState(null, '', location.pathname);
    const controller = new AbortController();
    const urls: string[] = [];
    async function load() {
      if (!secret) { setMessage('Mở lại QR được cấp bởi studio. Trang này không lưu token sau khi tải lại.'); return; }
      try {
        const headers = { Authorization: `Bearer ${secret}` };
        const response = await fetch('/api/v1/gallery', { headers, signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('Phiên đã hết hạn, bị thu hồi hoặc QR đã được thay thế.');
        const data = await response.json();
        const items: { id: string; url: string }[] = [];
        for (const item of data.assets) {
          const image = await fetch(`/api/v1/assets/${item.id}`, { headers, signal: controller.signal, cache: 'no-store' });
          if (!image.ok) throw new Error('Không tải được ảnh. Mở lại QR để thử lại.');
          const blob = await image.blob();
          if (controller.signal.aborted) return;
          const url = URL.createObjectURL(blob); urls.push(url); items.push({ id: item.id, url });
        }
        if (!controller.signal.aborted) {
          setPhotos(items); setMessage(`Hết hạn: ${new Date(data.expires_at).toLocaleString('vi-VN')}. Ảnh không được dùng để training.`);
        }
      } catch (error) { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : 'Không mở được gallery'); }
    }
    void load();
    return () => { controller.abort(); urls.forEach(url => URL.revokeObjectURL(url)); };
  }, []);
  return <main className="mx-auto max-w-5xl space-y-6 p-6">
    <Link href="/" className="text-primary underline">Pose-Booth</Link>
    <h1 className="text-3xl font-bold">Ảnh của bạn</h1>
    <p role="status" className="text-muted-foreground">{message}</p>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{photos.map(photo => <figure key={photo.id} className="rounded-xl border border-border bg-card p-4">
      <img src={photo.url} alt="Ảnh chụp Pose-Booth" className="mx-auto max-h-96" />
      <figcaption className="mt-4"><a className="text-primary underline" href={photo.url} download={`posebooth-${photo.id}.jpg`}>Tải ảnh</a></figcaption>
    </figure>)}</div>
  </main>;
}
