import { cp, mkdir } from 'node:fs/promises';
// Copy the installed, lockfile-pinned WASM runtime; never fetch @latest at runtime.
await mkdir('public/mediapipe/wasm', { recursive: true });
await cp('node_modules/@mediapipe/tasks-vision/wasm', 'public/mediapipe/wasm', { recursive: true });
