import test from 'node:test';
import assert from 'node:assert/strict';
import { PHOTO_FILTERS, photoFilter } from '../lib/photo-filters.ts';
import { importPhoto } from '../lib/photo-import.ts';
import { compositePhotos } from '../lib/photo-composite.ts';

test('24 distinct color presets plus original, no geometry or blur changes', () => {
  assert.equal(PHOTO_FILTERS.length, 24);
  assert.equal(new Set(PHOTO_FILTERS.map(item => item.id)).size, 24);
  assert.equal(new Set(PHOTO_FILTERS.map(item => item.css)).size, 24);
  for (const item of PHOTO_FILTERS) assert.doesNotMatch(item.css, /blur|url|drop-shadow/);
  assert.equal(photoFilter('original'), 'none');
  assert.throws(() => photoFilter('missing'));
});

test('import rejects SVG and oversized input before decoding', async () => {
  await assert.rejects(importPhoto({ type: 'image/svg+xml', size: 100 }), /JPEG/);
  await assert.rejects(importPhoto({ type: 'image/jpeg', size: 13 * 1024 * 1024 }), /12 MB/);
  await assert.rejects(importPhoto({ type: 'image/png', size: 0 }), /12 MB/);
});

test('import releases decoded bitmap even when image is beyond pixel limit', async () => {
  let closed = false;
  const old = globalThis.createImageBitmap;
  globalThis.createImageBitmap = async () => ({ width: 6000, height: 5000, close: () => { closed = true; } });
  try {
    await assert.rejects(importPhoto({ type: 'image/jpeg', size: 100 }), /24 megapixel/);
    assert.equal(closed, true);
  } finally { globalThis.createImageBitmap = old; }
});

test('composite filters photo pixels but not frame artwork or caption', async () => {
  const previousImage = globalThis.Image, previousDocument = globalThis.document;
  const draws = [];
  const context = { filter: 'none', fillRect() {}, fillText() { assert.fail('Export must not add a watermark'); }, drawImage(image) { draws.push({ source: image.source, filter: this.filter }); } };
  globalThis.Image = class {
    width = 800; height = 600;
    set src(value) { this.source = value; queueMicrotask(() => this.onload()); }
  };
  globalThis.document = { createElement: () => ({ getContext: () => context, toDataURL: () => 'data:image/jpeg;base64,fixture' }) };
  try {
    await compositePhotos(['one', 'two', 'three', 'four'], '#fff', 'frame', photoFilter('mono'));
    assert.equal(draws.length, 5);
    assert.equal(draws.slice(0, 4).every(draw => draw.filter === 'grayscale(1)'), true);
    assert.deepEqual(draws[4], { source: 'frame', filter: 'none' });
    assert.equal(context.filter, 'none');
    await compositePhotos(['one'], '#fff', null, 'none', ['sticker']);
    assert.deepEqual(draws.at(-1), { source: 'sticker', filter: 'none' });
    await compositePhotos(['one'], '#fff', null, 'none');
    delete context.filter;
    await assert.rejects(compositePhotos(['one'], '#fff', null, photoFilter('mono')), /chưa hỗ trợ/);
  } finally { globalThis.Image = previousImage; globalThis.document = previousDocument; }
});
