
function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Không đọc được ảnh hoặc frame'));
    image.src = source;
  });
}

export async function compositePhotos(
  sources: string[],
  color: string,
  overlay?: string | null,
  filter = 'none',
  stickerSrcs: string[] = [],
): Promise<string> {
  if (!sources.length) throw new Error('Chưa có ảnh');
  if (overlay && sources.length !== 4) throw new Error('Frame này cần 4 ảnh');
  const images = await Promise.all(sources.map(loadImage));
  const canvas = document.createElement('canvas');
  const grid = !overlay && sources.length === 4;
  canvas.width = grid ? 1200 : 600;
  canvas.height = overlay ? 1800 : grid ? 1000 : sources.length * 425 + 100;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không tạo được ảnh xuất');
  if (filter !== 'none' && !('filter' in ctx)) throw new Error('Trình duyệt chưa hỗ trợ xuất bộ lọc. Chọn Nguyên bản hoặc mở bằng Chrome/Edge.');
  ctx.fillStyle = color; ctx.fillRect(0, 0, canvas.width, canvas.height);
  images.forEach((image, index) => {
    const x = grid ? 50 + (index % 2) * 550 : 50;
    const y = grid ? 50 + Math.floor(index / 2) * 425 : 50 + index * 425;
    // Preserve the preview crop; fit inside the frame slot without cropping again.
    const scale = Math.min(500 / image.width, 375 / image.height);
    const width = image.width * scale, height = image.height * scale;
    ctx.filter = filter;
    ctx.drawImage(image, x + (500 - width) / 2, y + (375 - height) / 2, width, height);
    ctx.filter = 'none';
  });
  if (stickerSrcs.length) {
    const stickers = await Promise.all(stickerSrcs.map(loadImage));
    const spots: Array<[number, number]> = [
      [40, 40],
      [canvas.width - 140, 60],
      [50, canvas.height - 140],
      [canvas.width - 140, canvas.height - 140],
      [canvas.width / 2 - 50, 40],
      [canvas.width - 180, canvas.height / 3],
    ];
    stickers.forEach((image, index) => {
      const [x, y] = spots[index % spots.length];
      ctx.drawImage(image, x, y, 100, 100);
    });
  }
  if (overlay) ctx.drawImage(await loadImage(overlay), 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.92);
}
