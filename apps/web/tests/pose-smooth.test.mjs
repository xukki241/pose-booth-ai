import test from 'node:test';
import assert from 'node:assert/strict';
import { lerpLandmarks } from '../lib/pose-smooth.ts';

test('lerpLandmarks returns next when lengths differ', () => {
  const next = [{ x: 1, y: 1, z: 0, visibility: 1 }];
  assert.equal(lerpLandmarks([], next, 0.5), next);
});

test('lerpLandmarks blends halfway', () => {
  const previous = [{ x: 0, y: 0, z: 0, visibility: 1 }];
  const next = [{ x: 1, y: 1, z: 2, visibility: 0.9 }];
  const mixed = lerpLandmarks(previous, next, 0.5);
  assert.equal(mixed[0].x, 0.5);
  assert.equal(mixed[0].y, 0.5);
  assert.equal(mixed[0].z, 1);
  assert.equal(mixed[0].visibility, 0.9);
});

test('lerpLandmarks clamps amount', () => {
  const previous = [{ x: 0, y: 0, z: 0, visibility: 1 }];
  const next = [{ x: 10, y: 0, z: 0, visibility: 1 }];
  assert.equal(lerpLandmarks(previous, next, 2)[0].x, 10);
  assert.equal(lerpLandmarks(previous, next, -1)[0].x, 0);
});
