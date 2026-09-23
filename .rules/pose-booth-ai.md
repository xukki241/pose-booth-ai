# PikPose Project Rules

## Project Overview
PikPose là web app AI Photobooth: phân tích pose realtime qua webcam, gợi ý pose mẫu, chấm điểm độ khớp, và chụp ảnh photobooth multi-shot + export GIF/video.

## Stack
- **Frontend**: Next.js 14 (App Router), TypeScript strict, Tailwind CSS, shadcn/ui, GSAP 3
- **Backend**: FastAPI (Python 3.11+), Uvicorn, CORS cho localhost
- **AI**: MediaPipe Pose (browser WASM) + YOLOv8-Pose (FastAPI backend, GPU)
- **Exports**: html2canvas (PNG), gif.js (GIF), ffmpeg.wasm (MP4)

## Code Style Rules

### TypeScript / React
- TypeScript strict mode bắt buộc (`strict: true` trong tsconfig)
- Không dùng `any` type — dùng `unknown` nếu cần
- Mọi GSAP animation PHẢI dùng `useGSAP()` hook để tự cleanup
- React components: function components + hooks only (không class components)
- Tên file components: PascalCase (VD: `PoseSkeleton.tsx`)
- Tên file hooks: camelCase bắt đầu bằng `use` (VD: `usePoseDetection.ts`)
- Custom hooks phải cleanup mọi side effects trong return function

### Python / FastAPI
- Type hints bắt buộc cho tất cả function parameters và return values
- Pydantic models cho tất cả request/response schemas
- Async/await cho tất cả I/O operations
- Error handling: trả về HTTPException với message tiếng Anh rõ ràng

### GSAP Animation Rules
- Dùng `gsap.context()` hoặc `useGSAP()` — KHÔNG dùng bare `gsap.to()` trong useEffect
- ScrollTrigger phải có `scroller` prop hoặc dùng default
- Page transitions: dùng clip-path wipe, KHÔNG dùng opacity-only (quá đơn giản)
- Animation duration: landing elements 0.8-1.2s, micro-interactions 0.15-0.3s

## AI Pipeline Rules
- Không bao giờ expose raw model weights qua API endpoint
- Confidence threshold tối thiểu: **0.5** trước khi vẽ keypoint
- Visibility threshold: **0.3** để ẩn occluded joints
- Frame rate cap: **30fps** cho MediaPipe để tránh CPU overload
- YOLOv8 inference: **batch_size=1** cho realtime, **batch_size=8+** cho offline processing

## Security Rules
- Validate base64 image input: max **10MB**, chỉ accept `image/jpeg` và `image/png`
- CORS: trong dev chỉ accept `http://localhost:3000`
- Không lưu ảnh người dùng server-side nếu không có explicit consent UI
- API keys / secrets: chỉ trong `.env` file, KHÔNG hardcode, KHÔNG commit

## Performance
- MediaPipe: chạy trong Web Worker nếu có thể để không block UI thread
- Canvas overlay: dùng `requestAnimationFrame` không dùng `setInterval`
- GIF export: compress xuống 640px width trước khi tạo GIF
- Lazy load GSAP plugins (ScrollTrigger, DrawSVG) chỉ khi cần

## File Structure
```
apps/web/         # Next.js frontend
apps/api/         # FastAPI backend  
ai/training/      # Training scripts
ai/evaluation/    # Benchmark scripts
ai/models/        # Model weights
docs/             # Documentation
.rules/           # Antigravity rules (file này)
skills/           # Custom project skills
```

## Naming Conventions
- Pose keypoints: dùng COCO 17-keypoint format (0=nose, 1=left_eye, ... 16=right_ankle)
- Score: 0-100 integer, không dùng float
- Similarity: cosine similarity nhân 100, round về integer
- Pose IDs: snake_case (VD: `power_pose`, `arms_wide`, `sitting_cross`)

## Git Commit Format
```
feat(scope): description
fix(scope): description  
docs(scope): description
style(scope): description
```
