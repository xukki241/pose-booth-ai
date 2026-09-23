---
name: pikpose-ai-pose
description: |
  PikPose project skill for AI pose analysis, photobooth, and pose scoring workflows.
  
  Use this skill when:
  1. Writing or debugging MediaPipe Pose integration in browser (WASM)
  2. Writing or debugging YOLOv8-Pose FastAPI endpoints
  3. Implementing pose similarity scoring (cosine similarity algorithm)
  4. Building photobooth features (countdown, multi-shot, GIF export)
  5. Debugging GSAP animations for skeleton overlay or page transitions
  6. Setting up COCO dataset download and YOLOv8 training pipeline
  7. Adding new poses to the pose library JSON

  Do NOT use when:
  1. General React/Next.js work unrelated to pose or photobooth
  2. Non-pose AI tasks
license: MIT
metadata:
  version: v1
  project: PikPose
  author: project-team
---

# PikPose AI Pose Skill

This skill covers the complete AI pose analysis pipeline for the PikPose photobooth project.

## Architecture

```
Browser (Next.js)                    Server (FastAPI)
─────────────────                    ────────────────
MediaPipe Pose WASM                  YOLOv8-Pose (GPU)
    ↓ 33 landmarks                       ↓ 17 keypoints
Pose Normalizer (JS)                 Pose Response (JSON)
    ↓ normalized vectors
Similarity Engine (JS)
    ↓ score 0-100
Score Display + Skeleton Overlay
```

## Step 1: MediaPipe Integration

Read `apps/web/lib/mediapipe/usePoseDetection.ts` for the custom hook.

Key patterns:
```typescript
// Always initialize inside useEffect, cleanup on unmount
const { landmarks, confidence } = usePoseDetection(videoRef);

// Filter by visibility before drawing
const visibleLandmarks = landmarks.filter(lm => lm.visibility > 0.3);
```

Landmark indices (COCO-compatible subset):
- 0: nose, 11-12: shoulders, 13-14: elbows, 15-16: wrists
- 23-24: hips, 25-26: knees, 27-28: ankles

## Step 2: YOLOv8-Pose Backend

FastAPI endpoint pattern:
```python
@router.post("/analyze")
async def analyze_pose(request: PoseAnalyzeRequest) -> PoseAnalyzeResponse:
    # Decode base64 → numpy array
    # Run model.predict(frame, conf=0.5)
    # Return keypoints as [[x, y, conf], ...]
```

Always use `conf=0.5` threshold minimum.

## Step 3: Pose Scoring Algorithm

```typescript
function scorePoses(userPose: Keypoint[], targetPose: Keypoint[]): number {
  // 1. Normalize both poses (center at hips, scale by torso)
  const userNorm = normalizePose(userPose);
  const targetNorm = normalizePose(targetPose);
  
  // 2. Compute limb angle vectors (8 limb pairs)
  const userAngles = computeLimbAngles(userNorm);
  const targetAngles = computeLimbAngles(targetNorm);
  
  // 3. Cosine similarity → 0-100
  return Math.round(cosineSimilarity(userAngles, targetAngles) * 100);
}
```

## Step 4: Photobooth Workflow

State machine: `idle → countdown → capture → (next_shot | review) → export`

```typescript
type BoothState = 'idle' | 'countdown' | 'capturing' | 'review' | 'exporting';

// Shot modes
type ShotMode = 'single' | 'triple' | 'quad' | 'video';
```

GSAP countdown animation pattern:
```typescript
gsap.to(counter, {
  textContent: 0,
  duration: 3,
  snap: { textContent: 1 },
  ease: 'power1.inOut'
});
```

## Step 5: GIF Export

```typescript
import GIF from 'gif.js';

function exportGif(frames: ImageData[]): Promise<Blob> {
  return new Promise((resolve) => {
    const gif = new GIF({ workers: 2, quality: 10, width: 640 });
    frames.forEach(frame => gif.addFrame(frame, { delay: 100 }));
    gif.on('finished', resolve);
    gif.render();
  });
}
```

## Training Pipeline

To fine-tune YOLOv8-Pose on COCO:
```bash
cd ai/training
python download_coco.py        # Downloads ~18GB COCO 2017
python prepare_dataset.py      # Converts to YOLOv8 YAML format
python train.py                # Fine-tune (~4-8h on 3060 12GB)
```

To evaluate:
```bash
python ai/evaluation/benchmark.py --model yolov8s-pose --data test
```

## Pose Library Format

```json
{
  "id": "power_pose",
  "name": "Power Pose",
  "category": "standing",
  "difficulty": "easy",
  "description": "Đứng thẳng, hai tay chống hông",
  "keypoints": [[x, y], ...],  // 17 COCO keypoints, normalized
  "thumbnail_prompt": "person standing with hands on hips, confident pose"
}
```

## Common Issues

**MediaPipe not loading**: Ensure `@mediapipe/pose` is imported with correct CDN path in next.config.js
**YOLOv8 CUDA OOM**: Reduce `imgsz` from 640 to 480, or use `yolov8n-pose` (nano)
**GIF too large**: Cap frames at 20, resize to max 640px width
**GSAP cleanup leak**: Always use `useGSAP(() => { ... }, { scope: containerRef })`
