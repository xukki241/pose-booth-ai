/**
 * Canvas Combiner Utility
 * Merges 4 snapshot images into a vertical 4-cut Korean Photobooth strip layout.
 * Applies theme colors, header text, timestamp, and decorative frames.
 */

export async function generatePhotoboothStrip(snapshots, theme, options = {}) {
  const canvas = document.createElement('canvas');
  const width = 600;  // Standard Korean 4-Cut Strip Width
  const height = 1800; // Standard Height
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  // Background Fill based on theme
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  if (theme.id === 'korean-pink') {
    grad.addColorStop(0, '#831843');
    grad.addColorStop(1, '#500724');
  } else if (theme.id === 'y2k-cyber') {
    grad.addColorStop(0, '#164e63');
    grad.addColorStop(1, '#083344');
  } else if (theme.id === 'vintage-sepia') {
    grad.addColorStop(0, '#451a03');
    grad.addColorStop(1, '#1c1917');
  } else if (theme.id === 'minimal-dark') {
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
  } else {
    // Default Korean Purple
    grad.addColorStop(0, '#3b0764');
    grad.addColorStop(1, '#1e1b4b');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Outer Border
  ctx.strokeStyle = theme.border || '#8b5cf6';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  // Header Title
  ctx.save();
  ctx.font = '800 28px Outfit, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('POSEBOOTH AI ★ EXE101', width / 2, 60);

  ctx.font = '600 13px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('Chụp ảnh đẹp ngay lần đầu — Kỷ niệm EXE101', width / 2, 85);
  ctx.restore();

  // Load and Draw 4 Snapshots
  const padding = 28;
  const photoW = width - padding * 2;
  const photoH = 340;
  const startY = 110;
  const gap = 20;

  for (let i = 0; i < 4; i++) {
    const dataUrl = snapshots[i];
    const y = startY + i * (photoH + gap);

    // Photo Box Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(padding, y, photoW, photoH);

    if (dataUrl) {
      const img = await loadImage(dataUrl);
      ctx.drawImage(img, padding, y, photoW, photoH);
    } else {
      // Placeholder illustration
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(padding, y, photoW, photoH);
      ctx.font = '600 14px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.textAlign = 'center';
      ctx.fillText(`Kiểu ${i + 1} (Trống)`, width / 2, y + photoH / 2);
    }

    // Photo frame inner border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, y, photoW, photoH);
  }

  // Footer Branding & Timestamp
  const footerY = startY + 4 * (photoH + gap) + 20;
  ctx.save();
  ctx.font = '700 18px Outfit, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('AI-POWERED PHOTOBOOTH', width / 2, footerY + 20);

  const dateStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  ctx.font = '500 12px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(`Hà Nội, Việt Nam • ${dateStr}`, width / 2, footerY + 42);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.95);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
