# Comic motion + smooth camera Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (this session) or subagent-driven-development.

**Goal:** C-Comic hover-press, stamp page transitions, nav+CTA shared morph (B+C), smoother pose overlay and filter switching; camera video itself stays still.

**Architecture:** CSS `comic-press` + View Transitions (`booth-nav`, `booth-cta`) via `ComicLink`. Pose landmarks lerp in `lerpLandmarks` before React state. Flutter Home + Hero + stamp `PageRouteBuilder`.

**Tech Stack:** Next.js 16, React 19, CSS View Transitions, GSAP bounded only, Flutter Hero.

## Global Constraints

- No scroll-driven React state, full-screen blur, or perpetual decorative rendering.
- GSAP only bounded, `useGSAP` cleanup, honor `prefers-reduced-motion`.
- Camera/skeleton/video not in view transitions. One owner per stream.
- Filter pixels only, not frame artwork. Do not fabricate FPS.
- Canonical frontend `apps/web`. Flutter `apps/mobile`.

### Task 1: Landmark lerp + tests

**Files:** Create `apps/web/lib/pose-smooth.ts`, `apps/web/tests/pose-smooth.test.mjs`. Modify `apps/web/lib/mediapipe/usePoseDetection.ts`.

- [ ] Implement lerp and wire into detection; throttle FPS state.

### Task 2: Motion CSS + ComicLink/ComicNav

**Files:** `apps/web/app/globals.css`, `apps/web/components/motion/ComicLink.tsx`, `apps/web/components/motion/ComicNav.tsx`. Wire landing, booth, frames, about, pose-studio, gallery. Filter CSS transition on live video.

### Task 3: Flutter Home Hero stamp

**Files:** `apps/mobile/lib/features/home/home_page.dart`, `apps/mobile/lib/core/motion/stamp_route.dart`, `apps/mobile/lib/main.dart`, `apps/mobile/lib/features/booth/booth_page.dart`.

### Task 4: Verify build/tests and push
