import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the hook's asynchronous ownership logic with controlled browser APIs.
// This is not a React renderer or a physical-camera integration test.
const source = ts.transpileModule(readFileSync(new URL('../lib/useCamera.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
function harness({ enumerate = async () => [], play = async () => {}, videoMissing = false } = {}) {
  const acquisition = deferred();
  const states = [], cleanups = [], timers = new Map();
  let stopped = 0, ended, timerId = 0;
  const track = { stop: () => stopped++, addEventListener: (_event, listener) => { ended = listener; } };
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] };
  const video = { play, srcObject: null, onloadedmetadata: null };
  const react = {
    useRef: current => ({ current }), useCallback: callback => callback,
    useEffect: callback => cleanups.push(callback()),
    useState: initial => { const index = states.push(initial) - 1; return [initial, value => { states[index] = value; }]; },
  };
  const context = {
    exports: {}, require: name => { assert.equal(name, 'react'); return react; }, DOMException,
    navigator: { mediaDevices: { getUserMedia: () => acquisition.promise, enumerateDevices: enumerate } },
    setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: id => timers.delete(id),
  };
  vm.runInNewContext(source, context);
  const camera = context.exports.useCamera({ current: videoMissing ? null : video });
  return { camera, video, states, stream, acquisition, timers, stopped: () => stopped,
    disconnect: () => ended(), unmount: () => cleanups.forEach(cleanup => cleanup?.()),
    connect: async () => { const started = camera.start(); acquisition.resolve(stream); await started; video.onloadedmetadata?.(); await flush(); },
  };
}

test('device enumeration failure must not stop a successfully playing camera', async () => {
  const h = harness({ enumerate: async () => { throw new Error('Device list unavailable'); } });
  await h.connect();
  assert.equal(h.states[0], true);
  assert.equal(h.states[1], false);
  assert.equal(h.states[2], null);
  assert.equal(h.stopped(), 0);
  assert.equal(h.video.srcObject, h.stream);
  h.camera.stop();
});

test('playback failure releases the stream and reports an error', async () => {
  const h = harness({ play: async () => { throw new Error('Playback rejected'); } });
  await h.connect();
  assert.equal(h.states[0], false);
  assert.equal(h.states[1], false);
  assert.match(h.states[2], /Không phát được camera/);
  assert.equal(h.stopped(), 1);
});

test('unmount while permission is pending stops late stream without attaching it', async () => {
  const h = harness();
  const started = h.camera.start();
  h.unmount();
  h.acquisition.resolve(h.stream);
  await started;
  assert.equal(h.stopped(), 1);
  assert.equal(h.video.srcObject, null);
  assert.equal(h.timers.size, 0);
});

test('timeout invalidates a pending permission result', async () => {
  const h = harness();
  const started = h.camera.start();
  [...h.timers.values()][0]();
  h.acquisition.resolve(h.stream);
  await started;
  assert.equal(h.states[0], false);
  assert.equal(h.states[1], false);
  assert.match(h.states[2], /Chưa nhận được camera/);
  assert.equal(h.stopped(), 1);
});

test('missing video element leaves no pending loading state or stream', async () => {
  const h = harness({ videoMissing: true });
  await h.connect();
  assert.equal(h.stopped(), 1);
  assert.equal(h.states[1], false);
});

test('device list resolving after stop cannot revive old devices or stream', async () => {
  const listing = deferred();
  const h = harness({ enumerate: () => listing.promise });
  await h.connect();
  h.camera.stop();
  listing.resolve([{ kind: 'videoinput', deviceId: 'old' }]);
  await flush();
  assert.equal(h.states[0], false);
  assert.equal(h.states[3].length, 0);
  assert.equal(h.video.srcObject, null);
});

test('ended track releases stream and exposes disconnected state', async () => {
  const h = harness();
  await h.connect();
  h.disconnect();
  assert.equal(h.states[0], false);
  assert.equal(h.stopped(), 1);
  assert.match(h.states[2], /ngắt kết nối/);
});
