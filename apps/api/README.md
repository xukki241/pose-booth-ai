# Pose-Booth AI — FastAPI Backend Service

Hệ thống AI Backend hiệu năng cao cho Pose-Booth AI, hỗ trợ **Dual-Profile** (Laptop RTX 4050 vs Máy Trạm RTX 3060) và chấm điểm **Vectorized OKS** trong **0.24ms**.

## 🛠️ Công Nghệ Chính

- **Framework**: FastAPI 0.115 + Uvicorn (Asynchronous ASGI)
- **Mô hình AI**: Ultralytics YOLOv8-Pose (PyTorch 2.2+)
- **Độ chính xác**: FP16 Half Precision Autocast (Tự động kích hoạt khi có CUDA)
- **Thuật toán so khớp**: Vectorized OKS (Object Keypoint Similarity) + Anatomy-Weighted Cosine
- **Bộ nhớ đệm**: In-Memory RAM Vector Cache (20 mẫu tư thế chuẩn COCO)

## 🚀 Khởi Chạy Nhanh

```powershell
# 1. Tạo môi trường ảo
python -m venv .venv

# 2. Kích hoạt môi trường ảo:
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

# 3. Cài đặt dependencies
pip install -r requirements.txt

# 4. Kiểm tra hiệu năng bộ tính toán OKS
python benchmark.py

# 5. Khởi chạy máy chủ FastAPI (Port 8000)
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## ⚙️ Biến Môi Trường (`.env`)

Tạo file `.env` tại thư mục này với các tùy chọn:

```ini
# Chế độ: 'edge' (Laptop RTX 4050 / CPU) hoặc 'studio' (Máy trạm RTX 3060)
AI_PROFILE=edge

# Thiết bị tính toán: 'cuda' hoặc 'cpu' (tự động nhận diện)
DEVICE=cuda

# Sử dụng FP16 Half-precision
USE_FP16=true

# Ngưỡng tin cậy phát hiện khớp xương (0.0 - 1.0)
CONF_THRESHOLD=0.45
```

## 📡 API Endpoints

- `GET /health` — Kiểm tra phần cứng, profile đang bật và số lượng pose đã cache.
- `POST /api/pose/score` — Chấm điểm OKS và trả về gợi ý điều chỉnh tư thế.
- `POST /api/pose/analyze` — Phân tích ảnh tải lên để trích xuất 17 điểm khớp xương.
- `GET /api/pose/suggest` — Lấy danh sách 20 tư thế mẫu từ RAM.
- `GET /docs` — Swagger UI tương tác trực tiếp trên trình duyệt.
