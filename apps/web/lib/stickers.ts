export const STICKERS = [
  { id: 'heart', name: 'Tim', src: '/stickers/heart.svg' },
  { id: 'star', name: 'Sao', src: '/stickers/star.svg' },
  { id: 'sparkle', name: 'Lấp lánh', src: '/stickers/sparkle.svg' },
  { id: 'bow', name: 'Nơ', src: '/stickers/bow.svg' },
  { id: 'camera', name: 'Máy ảnh', src: '/stickers/camera.svg' },
  { id: 'flower', name: 'Hoa', src: '/stickers/flower.svg' },
] as const;

export type StickerId = (typeof STICKERS)[number]['id'];
