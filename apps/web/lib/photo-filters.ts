/** Color-only presets shared by live CSS preview and Canvas export. No face reshaping. */
export const PHOTO_FILTERS = [
  { id: 'original', name: 'Nguyên bản', css: 'none' },
  { id: 'milk', name: 'Sữa', css: 'brightness(1.08) contrast(0.92) saturate(0.9)' },
  { id: 'peach', name: 'Đào', css: 'sepia(0.16) saturate(1.12) brightness(1.06)' },
  { id: 'rose', name: 'Hồng', css: 'sepia(0.18) hue-rotate(320deg) saturate(1.15)' },
  { id: 'candy', name: 'Kẹo ngọt', css: 'saturate(1.4) brightness(1.06) contrast(0.94)' },
  { id: 'cream', name: 'Kem', css: 'sepia(0.24) contrast(0.9) brightness(1.08)' },
  { id: 'sunshine', name: 'Nắng', css: 'sepia(0.22) saturate(1.3) brightness(1.08)' },
  { id: 'honey', name: 'Mật ong', css: 'sepia(0.4) saturate(1.2) contrast(1.06)' },
  { id: 'latte', name: 'Latte', css: 'sepia(0.35) saturate(0.75) contrast(0.92)' },
  { id: 'cocoa', name: 'Cacao', css: 'sepia(0.45) brightness(0.92) contrast(1.12)' },
  { id: 'vintage', name: 'Hoài niệm', css: 'sepia(0.5) saturate(0.65) contrast(0.88)' },
  { id: 'film', name: 'Film', css: 'contrast(1.15) saturate(0.8) sepia(0.12)' },
  { id: 'faded', name: 'Phai màu', css: 'contrast(0.8) brightness(1.12) saturate(0.65)' },
  { id: 'cool', name: 'Trong veo', css: 'sepia(0.12) hue-rotate(170deg) brightness(1.06)' },
  { id: 'mint', name: 'Bạc hà', css: 'sepia(0.22) hue-rotate(70deg) saturate(0.9)' },
  { id: 'ocean', name: 'Biển', css: 'sepia(0.25) hue-rotate(160deg) saturate(1.1)' },
  { id: 'pop', name: 'Rực rỡ', css: 'saturate(1.65) contrast(1.12)' },
  { id: 'mono', name: 'Đen trắng', css: 'grayscale(1)' },
  { id: 'noir', name: 'Noir', css: 'grayscale(1) contrast(1.4) brightness(0.92)' },
  { id: 'silver', name: 'Bạc', css: 'grayscale(1) contrast(0.85) brightness(1.15)' },
  { id: 'sepia', name: 'Ảnh xưa', css: 'sepia(1) contrast(0.95)' },
] as const;

export function photoFilter(id: string): string {
  const preset = PHOTO_FILTERS.find(item => item.id === id);
  if (!preset) throw new Error('Bộ lọc không hợp lệ');
  return preset.css;
}
