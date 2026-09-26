/** Non-destructive local edits. The caller retains the original photo. */
export type PhotoEdit = {
  rotation: 0 | 90 | 180 | 270;
  mirror: boolean;
  aspect: 'original' | 'square' | 'portrait' | 'landscape';
  zoom: number;
  panX: number;
  panY: number;
  brightness: number;
  contrast: number;
  saturation: number;
};

export const DEFAULT_PHOTO_EDIT: PhotoEdit = {
  rotation: 0, mirror: false, aspect: 'original', zoom: 1, panX: 0, panY: 0,
  brightness: 100, contrast: 100, saturation: 100,
};

export function editGeometry(width: number, height: number, edit: PhotoEdit) {
  if (![width, height].every(value => Number.isFinite(value) && value > 0) ||
      ![0, 90, 180, 270].includes(edit.rotation) ||
      !['original', 'square', 'portrait', 'landscape'].includes(edit.aspect) ||
      typeof edit.mirror !== 'boolean') throw new Error('Thông số chỉnh ảnh không hợp lệ.');
  for (const [value, min, max] of [
    [edit.zoom, 1, 3], [edit.panX, -1, 1], [edit.panY, -1, 1],
    [edit.brightness, 50, 150], [edit.contrast, 50, 150], [edit.saturation, 0, 200],
  ]) {
    if (!Number.isFinite(value) || value < min || value > max) throw new Error('Thông số chỉnh ảnh ngoài giới hạn.');
  }
  const rotated = edit.rotation === 90 || edit.rotation === 270;
  const sourceWidth = rotated ? height : width;
  const sourceHeight = rotated ? width : height;
  const ratio = edit.aspect === 'original' ? sourceWidth / sourceHeight :
    edit.aspect === 'square' ? 1 : edit.aspect === 'portrait' ? 3 / 4 : 4 / 3;
  const cropWidth = Math.min(sourceWidth, sourceHeight * ratio);
  const cropHeight = cropWidth / ratio;
  const outputScale = Math.min(1, 1600 / Math.max(cropWidth, cropHeight));
  const outputWidth = Math.max(1, Math.round(cropWidth * outputScale));
  const outputHeight = Math.max(1, Math.round(cropHeight * outputScale));
  const scale = Math.max(outputWidth / sourceWidth, outputHeight / sourceHeight) * edit.zoom;
  return {
    outputWidth, outputHeight, scale,
    offsetX: (sourceWidth * scale - outputWidth) / 2 * edit.panX,
    offsetY: (sourceHeight * scale - outputHeight) / 2 * edit.panY,
  };
}

/** Preview and saved edit use this exact same canvas, including crop and orientation. */
export function renderPhotoEdit(canvas: HTMLCanvasElement, image: HTMLImageElement, edit: PhotoEdit) {
  const geometry = editGeometry(image.naturalWidth, image.naturalHeight, edit);
  canvas.width = geometry.outputWidth;
  canvas.height = geometry.outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không tạo được trình chỉnh ảnh.');
  const hasColorEdit = edit.brightness !== 100 || edit.contrast !== 100 || edit.saturation !== 100;
  if (hasColorEdit && !('filter' in ctx)) throw new Error('Trình duyệt chưa hỗ trợ chỉnh màu. Hãy dùng Chrome hoặc Edge.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  try {
    ctx.translate(canvas.width / 2 + geometry.offsetX, canvas.height / 2 + geometry.offsetY);
    ctx.scale(edit.mirror ? -1 : 1, 1);
    ctx.rotate(edit.rotation * Math.PI / 180);
    ctx.scale(geometry.scale, geometry.scale);
    ctx.filter = hasColorEdit ? `brightness(${edit.brightness}%) contrast(${edit.contrast}%) saturate(${edit.saturation}%)` : 'none';
    ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  } finally { ctx.restore(); }
}
