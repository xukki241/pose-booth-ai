# Pose-Booth AI — Web Client

Next.js 16 SPA Frontend cho hệ thống **Pose-Booth AI**, tích hợp nhận diện tư thế bằng MediaPipe Tasks Vision WASM và hiệu ứng đường viền lụa **Huawei AR Contour**.

## 🛠️ Công Nghệ Chính

- **Framework**: Next.js 16.3 (Turbopack) & React 19
- **Ngôn ngữ**: TypeScript 5
- **Tạo kiểu (Styling)**: Tailwind CSS v4 & Clay UI Glassmorphism
- **Hoạt ảnh & Chuyển động**: GSAP 3 + `@gsap/react` (Interactive 5-Stage Tour)
- **Thị giác máy tính trên trình duyệt**: `@mediapipe/tasks-vision` (chạy trên GPU/WASM với model cục bộ `pose_landmarker_lite.task`)
- **Hiệu ứng & Chụp ảnh**: `canvas-confetti`, `html2canvas`

## 🚀 Khởi Chạy Nhanh

```bash
# Cài đặt dependencies
npm install

# Chạy server phát triển (Port 3000)
npm run dev

# Build kiểm thử production
npm run build

# Khởi chạy production server
npm run start
```

## 📱 Các Trang Chính (Routes)

- `/` — **Landing Page**: Giới thiệu công nghệ với 5-Stage Interactive Tour và Bento Grid tính năng.
- `/booth` — **Photobooth Kiosk**: Giao diện phòng chụp phong cách kiosk công thái học tỷ lệ 3:4, đường viền AR Silhouette thời gian thực, chụp 1/3/4 ảnh và đổi camera trước/sau.
- `/pose-studio` — **Phòng Tập Dáng**: Chế độ so khớp tư thế với thư viện 20 dáng mẫu, chấm điểm OKS trực tiếp từ backend AI.
- `/about` — **Kiến Trúc Hệ Thống**: Sơ đồ phân tầng và tài liệu hướng dẫn kỹ thuật.

## 🔧 Cấu Hình Camera

Thành phần Camera sử dụng bộ lọc thích ứng 3 tầng (`Adaptive Constraints`):
1. Thử độ phân giải lý tưởng: `width: { ideal: 1280 }, height: { ideal: 720 }` kèm `facingMode: 'user' | 'environment'`.
2. Fallback cho điện thoại dọc (Portrait mode).
3. Fallback cấp 2 cho webcam thông thường (`{ video: true }`).

> **Lưu ý bảo mật:** Trình duyệt trên thiết bị di động (Safari iOS, Chrome Android) bắt buộc kết nối qua **HTTPS** hoặc **localhost** để cấp quyền Camera.
