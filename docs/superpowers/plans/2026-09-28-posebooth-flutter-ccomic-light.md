# PoseBooth Flutter + C-Comic Light Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Chạy PoseBooth trên Poco bằng Flutter, UI C-Comic light-only (kit 1.2.0 đã merge PR #2), FastAPI Docker CPU, soi camera qua Android Studio Device Mirroring.

**Architecture:** Base git = `origin/main` (`9d8fd06` merge C-Comic). Web kiosk giữ Next.js + `c-comic-ui@1.2.0`. Mobile = `apps/mobile` Flutter, cùng token, không dark theme. Live pose = ML Kit; API = score/suggest/analyze.

**Tech Stack:** c-comic-ui 1.2.0, Next.js 16, Flutter 3.x, FastAPI, Docker Compose dev CPU, ML Kit, camera.

## Global Constraints

- UI kit: `c-comic-ui@1.2.0` (npm latest tại 2026-09-28). Không thêm kit song song.
- Light-only: nền trắng, ink `#171717`, primary `#B42355`. Cấm `.dark`, `ThemeMode.dark`, `color-scheme: dark`.
- Live camera: on-device only. Cấm YOLO từng frame.
- Flutter API: `--dart-define=API_BASE=http://127.0.0.1:8000` + `adb reverse tcp:8000 tcp:8000`.
- Test phone: Android Studio Open `apps/mobile` + Running Devices mirroring Poco. Không emulator.
- Compose test: `docker compose -f docker-compose.dev.yml up --build` (không bắt buộc postgres/GPU).
