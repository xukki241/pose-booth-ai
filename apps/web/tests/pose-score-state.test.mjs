import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Test derived presentation states only; not a React renderer or scheduler integration test.
const source = ts.transpileModule(readFileSync(new URL('../lib/mediapipe/usePoseScore.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const pose = { keypoints: Array.from({ length: 17 }, () => [.5, .5]) };
const points = pose.keypoints.map(([x, y]) => ({ x, y, visibility: .9 }));
function state({ enabled = true, samples = points, result = null, error = null, contextKey = 'camera-a' } = {}) {
  let index = 0;
  const values = [result, error];
  const react = { useRef: current => ({ current }), useEffect() {},
    useState: () => [values[index++], () => {}] };
  const context = { exports: {}, require: () => react };
  vm.runInNewContext(source, context);
  return context.exports.usePoseScore(enabled, samples, pose, contextKey);
}
test('valid pose awaiting first result is loading, disabled or invisible pose is not', () => {
  assert.equal(state().isLoading, true);
  assert.equal(state({ enabled: false }).isLoading, false);
  assert.equal(state({ samples: [] }).isLoading, false);
});
test('old camera errors cannot replace loading for the current camera', () => {
  assert.equal(state({ error: { pose, contextKey: 'camera-old', message: 'old' } }).isLoading, true);
  const failed = state({ error: { pose, contextKey: 'camera-a', message: 'API unavailable' } });
  assert.equal(failed.isLoading, false); assert.equal(failed.feedback[0], 'API unavailable');
});
test('only a result from the selected pose and camera is shown', () => {
  const result = { pose, contextKey: 'camera-a', data: { score: 75, feedback: ['Đã chấm'] } };
  assert.equal(state({ result }).score, 75);
  assert.equal(state({ result }).isLoading, false);
  assert.equal(state({ result, contextKey: 'camera-b' }).score, null);
});
