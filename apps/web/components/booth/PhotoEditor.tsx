'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'c-comic-ui';
import { DEFAULT_PHOTO_EDIT, renderPhotoEdit, type PhotoEdit } from '@/lib/photo-edit';

export function PhotoEditor({ source, onApply, onCancel }: {
  source: string;
  onApply: (image: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [edit, setEdit] = useState<PhotoEdit>({ ...DEFAULT_PHOTO_EDIT });
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let disposed = false;
    const photo = new Image();
    photo.onload = () => { if (!disposed) setImage(photo); };
    photo.onerror = () => { if (!disposed) setError('Không đọc được ảnh. Đóng trình sửa và thử lại.'); };
    photo.src = source;
    return () => { disposed = true; photo.onload = null; photo.onerror = null; };
  }, [source]);
  useEffect(() => {
    setReady(false);
    if (!image || !canvasRef.current) return;
    try {
      renderPhotoEdit(canvasRef.current, image, edit);
      setError(null); setReady(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không chỉnh được ảnh.'); }
  }, [image, edit]);

  const sliders = [
    { key: 'zoom', label: 'Phóng to', min: 1, max: 3, step: .05 },
    { key: 'panX', label: 'Dịch ngang', min: -1, max: 1, step: .05 },
    { key: 'panY', label: 'Dịch dọc', min: -1, max: 1, step: .05 },
    { key: 'brightness', label: 'Độ sáng', min: 50, max: 150, step: 1 },
    { key: 'contrast', label: 'Tương phản', min: 50, max: 150, step: 1 },
    { key: 'saturation', label: 'Bão hòa màu', min: 0, max: 200, step: 1 },
  ] as const;
  return <section aria-label="Chỉnh ảnh thủ công" className="mt-5 space-y-4 border-2 border-black bg-white p-4">
    <h3 className="text-lg font-bold">Chỉnh ảnh thủ công</h3>
    <p className="text-sm">Chỉnh từ ảnh gốc. Chỉ thay đổi bản ghép sau khi bấm Áp dụng; ảnh gốc không bị ghi đè.</p>
    {!image && !error && <p role="status">Đang chuẩn bị ảnh để chỉnh…</p>}
    <canvas ref={canvasRef} aria-label="Xem trước ảnh đã chỉnh" className="mx-auto max-h-96 max-w-full border border-black" />
    <fieldset disabled={!image} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">Tỉ lệ cắt
          <select className="min-h-11 border-2 border-black bg-white px-3" value={edit.aspect} onChange={event => setEdit({ ...edit, aspect: event.target.value as PhotoEdit['aspect'] })}>
            <option value="original">Giữ tỉ lệ gốc</option><option value="square">Vuông 1:1</option>
            <option value="portrait">Dọc 3:4</option><option value="landscape">Ngang 4:3</option>
          </select>
        </label>
        <Button variant="outline" onClick={() => setEdit({ ...edit, rotation: ((edit.rotation + 90) % 360) as PhotoEdit['rotation'] })}>Xoay 90°</Button>
        <Button variant="outline" aria-pressed={edit.mirror} onClick={() => setEdit({ ...edit, mirror: !edit.mirror })}>Lật ngang</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sliders.map(item => <label key={item.key} className="grid gap-2 text-sm font-semibold">
          <span>{item.label}: <output>{edit[item.key]}</output></span>
          <input aria-label={item.label} type="range" min={item.min} max={item.max} step={item.step} value={edit[item.key]}
            onChange={event => setEdit({ ...edit, [item.key]: Number(event.target.value) })} className="min-h-8 w-full accent-primary" />
        </label>)}
      </div>
      <p className="text-xs">Dịch ảnh chỉ có tác dụng ở phần còn dư sau khi cắt hoặc phóng to.</p>
    </fieldset>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-3">
      <Button disabled={!ready} onClick={() => {
        try {
          if (canvasRef.current) onApply(canvasRef.current.toDataURL('image/jpeg', .92));
        } catch { setError('Không lưu được ảnh đã chỉnh. Thử ảnh nhỏ hơn.'); }
      }}>Áp dụng</Button>
      <Button variant="outline" onClick={() => setEdit({ ...DEFAULT_PHOTO_EDIT })}>Đặt lại</Button>
      <Button variant="ghost" onClick={onCancel}>Hủy chỉnh</Button>
    </div>
  </section>;
}
