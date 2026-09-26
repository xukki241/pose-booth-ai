import test from 'node:test';
import assert from 'node:assert/strict';
import { coverRect, mapCoverPoints } from '../lib/camera-transform.ts';

test('cover crop matches portrait object-cover and centered landmarks', () => {
  const crop = coverRect(1280, 720, 720, 960);
  assert.deepEqual(crop, { x: 370, y: 0, width: 540, height: 720 });
  assert.deepEqual(mapCoverPoints([{ x: .5, y: .5, visibility: .8 }], 1280, 720, 720, 960, true), [{ x: .5, y: .5, visibility: .8 }]);
});
test('mirror changes x only and does not swap anatomical keypoint IDs', () => {
  const points = [{ x: .2, y: .3, name: 'left_wrist' }];
  assert.deepEqual(mapCoverPoints(points, 640, 480, 640, 480, true), [{ x: .8, y: .3, name: 'left_wrist' }]);
});
test('unready camera is not assigned synthetic landmarks', () => {
  assert.deepEqual(mapCoverPoints([{ x: .5, y: .5 }], 0, 0, 720, 960, true), []);
  assert.throws(() => coverRect(0, 720, 720, 960));
});
