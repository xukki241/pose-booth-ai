# PoseBooth AI — Project Coding Rules & Standards

## 1. Design & UI/UX Aesthetics (GenZ Modern Style)
- Sử dụng bảng màu HSL mượt mà (Dark mode chủ đạo `#0f172a`, neon violet/cyan accents `#8b5cf6`, `#06b6d4`, glassmorphism với `backdrop-blur-md bg-white/10`).
- Typography: Outfit / Inter (Google Fonts).
- Micro-animations: Sử dụng Framer Motion cho tất cả UI component (camera countdown, điểm số pose badge, modal và navigation tabs).
- Không dùng placeholder thô. Sử dụng Lucide Icons cho tất cả biểu tượng giao diện.

## 2. Frontend & State Architecture
- React 18+ với Vite.
- Global State: `zustand` quản lý phiên chụp (`usePhotoboothStore`), danh sách dáng chụp đã chọn, điểm số real-time, 4 ảnh snapshots và kết quả ghép khung.
- Data Fetching: `@tanstack/react-query` cho các tác vụ API giao tiếp với FastAPI & n8n webhook.
- Canvas / Camera Pipeline:
  - MediaPipe Pose Landmarker (`@mediapipe/tasks-vision`) khởi tạo dạng Singleton trong hook `usePoseDetector`.
  - Vòng lặp `requestAnimationFrame` render 33 điểm khớp trên Canvas đè (Overlay) đè lên luồng video camera.
  - Tốc độ tính toán điểm số & gợi ý tiếng Việt < 100ms.

## 3. Backend FastAPI & Clean Architecture
- Code style: PEP 8, Pydantic v2 cho Type Schema Validation.
- Endpoints:
  - `/api/v1/poses`: Thư viện tư thế mẫu (JSON + Landmark coordinates).
  - `/api/v1/storyboard`: Generator cho kịch bản video ngắn (kết nối n8n/AI).
  - `/api/v1/frames`: Thư viện khung ảnh nghệ thuật (Korean 4-cut, Y2K, Vintage).
  - `/api/v1/share`: Tạo temporary link & mã QR tải ảnh.

## 4. Security & Privacy
- Luồng video và xử lý Pose Landmarker chạy hoàn toàn ở phía client (Client-side browser GPU).
- Không tự động gửi dữ liệu camera riêng tư về server.
