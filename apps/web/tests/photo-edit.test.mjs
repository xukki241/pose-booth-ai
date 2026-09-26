import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PHOTO_EDIT, editGeometry, renderPhotoEdit } from '../lib/photo-edit.ts';

test('original geometry preserves aspect, caps output, and does not enlarge small images', () => {
  assert.deepEqual(editGeometry(800, 600, DEFAULT_PHOTO_EDIT), {
    outputWidth: 800, outputHeight: 600, scale: 1, offsetX: 0, offsetY: 0,
  });
  const large = editGeometry(4000, 3000, DEFAULT_PHOTO_EDIT);
  assert.equal(large.outputWidth, 1600); assert.equal(large.outputHeight, 1200);
});

test('quarter turns swap dimensions and square crop is bounded at both pan extremes', () => {
  const rotated = editGeometry(800, 600, { ...DEFAULT_PHOTO_EDIT, rotation: 90 });
  assert.equal(rotated.outputWidth, 600); assert.equal(rotated.outputHeight, 800);
  for (const panX of [-1, 1]) {
    const crop = editGeometry(800, 600, { ...DEFAULT_PHOTO_EDIT, aspect: 'square', zoom: 2, panX });
    assert.equal(crop.outputWidth, 600); assert.equal(crop.outputHeight, 600);
    assert.equal(Math.abs(crop.offsetX), (800 * crop.scale - 600) / 2);
  }
});

test('invalid edit parameters cannot enter canvas transforms or filters', () => {
  for (const patch of [{ zoom: NaN }, { rotation: 45 }, { aspect: 'unknown' },
    { contrast: 900 }, { panX: 2 }, { saturation: -1 }, { mirror: 'yes' }]) {
    assert.throws(() => editGeometry(800, 600, { ...DEFAULT_PHOTO_EDIT, ...patch }), /Thông số/);
  }
});

test('preview renderer applies orientation and color together and restores context', () => {
  const calls = [];
  const ctx = {
    filter: 'none', fillRect() {}, save() {}, restore() { calls.push(['restore']); },
    translate(...args) { calls.push(['translate', ...args]); },
    scale(...args) { calls.push(['scale', ...args]); },
    rotate(...args) { calls.push(['rotate', ...args]); },
    drawImage() { calls.push(['draw', this.filter]); },
  };
  const canvas = { getContext: () => ctx };
  renderPhotoEdit(canvas, { naturalWidth: 800, naturalHeight: 600 },
    { ...DEFAULT_PHOTO_EDIT, rotation: 90, mirror: true, brightness: 110 });
  assert.equal(canvas.width, 600); assert.equal(canvas.height, 800);
  assert.deepEqual(calls[1], ['scale', -1, 1]);
  assert.deepEqual(calls[2], ['rotate', Math.PI / 2]);
  assert.deepEqual(calls.at(-2), ['draw', 'brightness(110%) contrast(100%) saturate(100%)']);
  assert.deepEqual(calls.at(-1), ['restore']);
  delete ctx.filter;
  assert.throws(() => renderPhotoEdit(canvas, { naturalWidth: 800, naturalHeight: 600 },
    { ...DEFAULT_PHOTO_EDIT, contrast: 120 }), /chưa hỗ trợ/);
});
