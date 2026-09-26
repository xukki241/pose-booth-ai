# Pose-Booth AI

Photobooth local-first đang phát triển cho pilot một người mỗi phiên trên RTX 3060. Frontend chuẩn là **apps/web (Next.js)**; frontend Vite ở root là legacy, không phát triển hai UI độc lập.

## Bắt đầu

- [Quickstart sản phẩm và vận hành](docs/QUICKSTART.md)
- [Learn AI / Data / Research / Colab](docs/RESEARCH.md)
- [Tiến độ và cổng nghiệm thu còn thiếu](docs/IMPLEMENTATION_STATUS.md)
- [Design authority Prismo](DESIGN.md)
- [Attribution bên thứ ba](THIRD_PARTY_NOTICES.md)

```powershell
# Tại repo root; tạo secrets chỉ lần đầu
py -3.11 scripts/init-pilot.py
docker --context desktop-linux compose --env-file .env.pilot up -d --build
```

Mở **http://localhost:8080/booth**. Cần weights local được phép dùng và model MediaPipe theo Quickstart. Không tự upload ảnh khách lên cloud, không tự chạy training.

## Đường dùng thử

Chọn dáng / khung → mở camera → countdown → xem lại ảnh gốc và ảnh ghép → tải xuống → tùy chọn đồng ý lưu local / QR. Thời hạn gallery 24 giờ tính từ lúc tạo phiên. QR chỉ đọc và có thể thu hồi. Training consent tách biệt, hiện chưa bật thu thập từ khách.

Prismo semantic theme có system/light/dark, Zustand lưu lựa chọn. Model pose trên browser dùng assets local đã ghim package lock; scoring dùng API, không sinh điểm ngẫu nhiên. Đường viền pose hiện vẫn là hình dựng từ keypoints, **chưa phải segmentation mask từ ảnh tham chiếu**.

## Kiến trúc đã triển khai

Web → Nginx cùng origin → Product API → AI runtime riêng (một process CUDA).
Product API → PostgreSQL + Redis rate limits; outbox → RabbitMQ → background worker.
Assets local trong Docker volume. Worker hiện làm thumbnail và cleanup; các tác vụ template/import khác chưa hoàn tất.

Legacy routes giữ nguyên: `/api/pose/analyze`, `/api/pose/score`, `/api/pose/suggest`, `/health`.
Routes sản phẩm mới ở `/api/v1`. Xem OpenAPI từ service API; không dùng ví dụ DTO cũ trong tài liệu lịch sử.
`engine_ready` và `fp16_enabled` phản ánh runtime; HTTP 200 không đủ xác nhận readiness.

## Kiểm tra

```powershell
# repo root
.\apps\api\.venv\Scripts\python.exe -m unittest discover -s ai/tests -v
.\apps\api\.venv\Scripts\python.exe scripts/smoke-pilot.py
# apps/api
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
# apps/web
node --experimental-strip-types --test tests/camera-transform.test.mjs
npm run build
```

Số đo GPU theo từng lần chạy nằm trong notebook, không phải cam kết FPS. Không lấy fixture trống làm bằng chứng độ chính xác; không lấy mAP làm độ hoàn thiện sản phẩm.

## Research không chặn sản phẩm

Pretrained chạy pilot. Dataset mới đi qua inventory → quyền sử dụng → annotation QA → split theo người/session → release bất biến → baseline → fine-tune → so sánh → candidate → review thủ công.

Code dùng chung nằm tại `ai/research`; CLI training mặc định dry-run. Năm notebook tiếng Việt là hướng dẫn gọi code này. Chưa có dataset thật thì không nhận là đã fine-tune thành công.

## Giới hạn hiện tại

Chưa nghiệm thu ba camera thật / soak test, TLS LAN và trust trên hai điện thoại, silhouette editor có segmentation/mask editing, admin đầy đủ, model promotion UI, frontend types sinh OpenAPI, và audit toàn bundle skills. Theo dõi chi tiết trong Implementation Status. Không gọi đây là production-ready.

Không chạy training đồng thời với kiosk. Không nhân bản GPU runtime để tăng số uvicorn workers. Không tắt browser secure-origin hoặc mở public tunnel để né TLS.

## License

Code app theo LICENSE của repository; Prismo attribution theo THIRD_PARTY_NOTICES. License app không thay license của Ultralytics, model weights, MediaPipe, dataset hoặc frame. Rà soát từng thành phần trước phát hành thương mại/mã nguồn mở.
