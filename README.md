# Pose-Booth AI

> AI-powered photobooth với pose detection realtime, gợi ý tư thế mẫu, chấm điểm độ khớp và export GIF.  
> Dự án môn học — FPT University · Xukki241

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Pose-blue?logo=ultralytics)](https://ultralytics.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## ✨ Tính Năng

| Tính năng | Mô tả |
|---|---|
| 🦴 Realtime Skeleton | MediaPipe 33-keypoint, 30fps, chạy trên browser WASM |
| 🎯 Pose Analysis | YOLOv8-Pose backend (CUDA/CPU), 17 COCO keypoints |
| 💡 Pose Suggestions | 20+ pose templates: portrait, dynamic, casual, group |
| 🏆 Score Engine | Cosine similarity 0-100, feedback tiếng Việt per joint |
| 📸 Photobooth | 1/3/4-shot strip, countdown GSAP, video 3s → GIF |
| 🎞️ Export | PNG/JPEG download, GIF browser-side, no backend storage |
| 🎨 Design | Dark glassmorphism + GSAP smooth transitions |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/xukki241/pose-booth-ai.git
cd pose-booth-ai

# Frontend
cd apps/web
npm install
npm run dev
# → http://localhost:3000

# Backend (optional — needed for scoring & YOLOv8)
cd apps/api
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
# → http://localhost:8000/docs
```

## 🏗️ Architecture

```
pose-booth-ai/
├── apps/
│   ├── web/              # Next.js 16 SPA (TypeScript + Tailwind + GSAP)
│   │   ├── app/          # App Router pages
│   │   │   ├── page.tsx           # Landing hero + GSAP animations
│   │   │   ├── booth/page.tsx     # Photobooth (multi-shot + countdown)
│   │   │   └── pose-studio/page.tsx # Realtime pose analysis + scoring
│   │   ├── components/
│   │   │   ├── pose/PoseSkeleton.tsx  # Canvas skeleton overlay
│   │   │   ├── booth/PhotoBoothController.tsx  # State machine
│   │   │   └── ui/                   # shadcn + clay-ui components
│   │   └── lib/
│   │       ├── mediapipe/usePoseDetection.ts  # MediaPipe hook
│   │       └── api/                  # FastAPI client
│   │
│   └── api/              # FastAPI + YOLOv8-Pose
│       ├── main.py                # App entry + CORS
│       ├── routers/
│       │   ├── pose.py            # POST /api/pose/analyze
│       │   ├── score.py           # POST /api/pose/score
│       │   └── suggest.py         # GET /api/pose/suggest
│       ├── models/yolov8_pose.py  # YOLOv8 wrapper
│       └── data/pose_library/poses.json  # 20 pose templates
│
├── ai/
│   ├── training/
│   │   ├── download_coco.py   # COCO 2017 dataset downloader
│   │   └── train.py           # YOLOv8-Pose fine-tune (RTX 3060 optimized)
│   └── evaluation/benchmark.py
│
├── nginx/pose-booth.conf   # SPA routing + API proxy + HTTPS-ready
├── docs/DATA_LABELING.md   # Label Studio guide for custom data
├── .rules/pose-booth-ai.md # Antigravity coding rules
└── DEPLOY.md               # Production deployment guide
```

## 🤖 AI Pipeline

```
Browser (localhost:3000)          Backend (localhost:8000)
────────────────────────          ────────────────────────
MediaPipe Tasks Vision            YOLOv8s-Pose (GPU)
  → 33 landmarks @ 30fps    POST /api/pose/analyze
  → Canvas skeleton draw         → 17 COCO keypoints

Cosine Similarity (JS)     POST /api/pose/score
  → Score 0-100                  → Normalized scoring + feedback

                           GET /api/pose/suggest
                                → 20+ pose templates
```

## 🎓 Training Pipeline (tuỳ chọn)

> Pretrained `yolov8s-pose.pt` đủ dùng cho demo. Training chỉ cần khi muốn tăng accuracy thêm.

```bash
# Tải COCO 2017 (~20GB)
python ai/training/download_coco.py

# Fine-tune qua đêm trên RTX 3060 12GB
python ai/training/train.py --epochs 50 --batch 16 --amp

# Benchmark
python ai/evaluation/benchmark.py --model ai/models/runs/.../best.pt
```

## 🌐 Deploy (Production)

Xem [DEPLOY.md](DEPLOY.md) để biết cách:
- Build Next.js SPA + nginx SPA routing (`try_files $uri /index.html`)
- FastAPI với systemd hoặc PM2
- HTTPS với Let's Encrypt
- Mở rộng sub-apps với nginx location blocks

## 🛠️ Tech Stack

| | Technology |
|---|---|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS 4 |
| **UI** | shadcn/ui + Clay UI components |
| **Animation** | GSAP 3 + ScrollTrigger |
| **AI Browser** | MediaPipe Tasks Vision (WASM, GPU delegate) |
| **AI Server** | YOLOv8-Pose via Ultralytics, CUDA 12.1 |
| **Backend** | FastAPI, Uvicorn, Pydantic v2 |
| **Canvas** | fabric.js (photo editing) |
| **State** | Zustand |
| **Export** | gif.js, html2canvas |
| **Deploy** | nginx + systemd / PM2 |

## 📖 Tài Liệu

- [Hướng dẫn label data](docs/DATA_LABELING.md)
- [Deployment guide](DEPLOY.md)
- [API Docs](http://localhost:8000/docs) (khi chạy backend)

## License

MIT — xukki241 / FPT University EXE101
