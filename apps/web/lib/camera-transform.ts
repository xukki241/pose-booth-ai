/** Centered object-cover transform shared by preview landmarks and exported pixels. */
export function coverRect(sw: number, sh: number, dw: number, dh: number) {
  if (Math.min(sw, sh, dw, dh) <= 0) throw new Error('Camera chưa có khung hình');
  const scale = Math.max(dw / sw, dh / sh);
  const width = dw / scale, height = dh / scale;
  return { x: (sw - width) / 2, y: (sh - height) / 2, width, height };
}

export function mapCoverPoints<T extends { x: number; y: number }>(
  points: T[], sw: number, sh: number, dw: number, dh: number, mirror: boolean,
): T[] {
  if (!sw || !sh) return [];
  const crop = coverRect(sw, sh, dw, dh);
  return points.map(point => {
    const x = (point.x * sw - crop.x) / crop.width;
    return { ...point, x: mirror ? 1 - x : x, y: (point.y * sh - crop.y) / crop.height };
  });
}

export function captureVideo(video: HTMLVideoElement, mirror: boolean): string {
  if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) throw new Error('Camera chưa sẵn sàng');
  const bounds = video.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = Math.round(1280 * bounds.height / bounds.width);
  const crop = coverRect(video.videoWidth, video.videoHeight, canvas.width, canvas.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không thể tạo ảnh');
  if (mirror) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(video, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.92);
}
