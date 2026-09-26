# Chạy pilot local

## Đường khuyên dùng: Docker Desktop + NVIDIA

Chạy từ thư mục gốc repo bằng PowerShell. Cần Docker Desktop Linux/WSL2 hoạt động, driver NVIDIA tương thích, weights tin cậy tại `apps/api/models/yolov8x-pose.pt`, và MediaPipe asset tại `apps/web/public/models/pose_landmarker_lite.task`.

```powershell
# Chỉ lần đầu; script từ chối ghi đè secrets đã có
.\apps\api\.venv\Scripts\python.exe scripts/init-pilot.py
docker --context desktop-linux compose --env-file .env.pilot up -d --build
Invoke-RestMethod http://localhost:8080/health
```

Nếu chưa có venv, dùng Python 3.11 x64: `py -3.11 scripts/init-pilot.py`. Script này chỉ dùng standard library.

Mở `http://localhost:8080/booth`. Bấm Mở camera, cấp quyền, chọn dáng/khung và chụp. Gallery chỉ lưu sau khi người dùng đồng ý. Không dùng root Vite để phát triển UI mới.

Health cần có `profile=studio`, `device=cuda:0`, `fp16_enabled=true`, `engine_ready=true`. HTTP 200 riêng lẻ không chứng minh GPU đã sẵn sàng.

```powershell
# Test với ảnh màu được sinh tại chỗ, không đọc ảnh khách
.\apps\api\.venv\Scripts\python.exe scripts/smoke-pilot.py
docker --context desktop-linux compose --env-file .env.pilot ps
docker --context desktop-linux compose --env-file .env.pilot logs --tail 60 ai api worker
```

Không chạy `compose config` rồi đăng toàn bộ output: cấu hình resolve chứa secrets. Dùng `config --quiet` để kiểm syntax.

## Thành phần và trách nhiệm

| Thành phần | Trách nhiệm | Không làm |
|---|---|---|
| web | Camera, MediaPipe, preview, capture/export, gallery UI | Không giữ secret quản trị trong bundle |
| api | Session, scoring, gallery, token, quota, job outbox | Không load CUDA model |
| ai | Một process inference GPU, từ chối frame khi bận | Không train trong giờ phục vụ |
| worker | Thumbnail, retry tối đa 3 lần, expiry cleanup | Không giữ video frame trong queue |
| PostgreSQL | Dữ liệu phiên, assets, trạng thái job/outbox | Không lưu base64 ảnh |
| RabbitMQ | Phân phối job ID, confirm/ack và dead-letter queue | Không là nguồn trạng thái job duy nhất |
| Redis | Rate limit tạm thời | Không là nơi lưu gallery bền vững |
| Nginx | Cùng origin web/API | Không phục vụ Next.js bằng SPA fallback |

Worker hiện xử lý thumbnail và cleanup; các loại job import/template/export khác còn trong backlog. Không gọi sự hiện diện của container là đã hoàn thiện mọi tính năng.

## Lưu trữ và quyền truy cập

- Ảnh nằm trong volume `posebooth_assets`; database và broker có volume riêng.
- Phiên hết hạn 24 giờ kể từ tạo phiên. Read/download chặn ngay khi hết hạn; worker xóa file theo chu kỳ khoảng 60 giây khi đang chạy.
- Khi worker dừng, hết hạn vẫn chặn truy cập nhưng xóa vật lý đợi worker hoạt động trở lại. Không cam kết secure erase trên SSD/backup.
- QR là bearer link chỉ đọc; người có QR xem được ảnh trong phiên. Tạo QR mới thay token QR cũ. Token chủ phiên được giữ trong memory UI, không ghi vào URL/log.
- Thu hồi phiên chặn quyền truy cập, worker xóa ảnh. Không lưu ảnh khách để training; schema hiện khóa training consent thành false.
- `.env.pilot` và weights không commit. Không dùng `down -v` nếu chưa xác nhận muốn mất database/gallery.

## Chạy native để debug

```powershell
cd apps/api
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-gpu-cu128.txt
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
# Chỉ tạo .env từ .env.example nếu chưa có; không ghi đè cấu hình local
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Một terminal khác, tại `apps/web`: `npm ci`, `npm run dev`, mở `http://localhost:3000/booth`. Rewrite mặc định API đến `127.0.0.1:8000`. Native inference đơn lẻ không có gallery nếu chưa cấu hình Product API/database. Không chạy nhiều uvicorn workers cho GPU.

## Hai điện thoại qua LAN

Mặc định gateway **chỉ bind loopback** `127.0.0.1:8080`, không vô tình mở ảnh lên LAN/Internet. Để pilot điện thoại cần:

1. Hostname/IP LAN ổn định, TLS certificate đúng SAN và được hai điện thoại tin cậy.
2. Nginx TLS listener, bind chỉ interface LAN cần dùng; firewall hạn chế mạng/thiết bị quản lý.
3. `PUBLIC_ORIGIN=https://<hostname>` đúng địa chỉ điện thoại truy cập, không dùng localhost.
4. Kiểm tra từ từng điện thoại, camera permission, QR expiry, ba phiên độc lập và soak test.

TLS LAN và tin cậy certificate trên thiết bị thật **chưa được nghiệm thu**. Không tắt bảo vệ secure-origin của trình duyệt hoặc tự mở public tunnel để né bước này.

## Xử lý lỗi

| Hiện tượng | Kiểm tra |
|---|---|
| Chờ camera | Cho phép trong browser; nút Hủy yêu cầu đóng lượt chờ; sau 20s có lỗi rõ ràng |
| Không tìm thấy camera | Kết nối webcam, đóng Zoom/Teams, chọn thiết bị khác |
| Không có điểm | Model MediaPipe chưa tải, ít khớp nhìn thấy, hoặc API lỗi; không hiển thị điểm giả |
| AI 429 | GPU đang xử lý ảnh khác; client bỏ frame cũ và gửi mẫu mới theo lịch |
| AI 503 | Xem weights, CUDA và readiness trong log ai; không tự fallback cloud |
| Upload 507 | Dung lượng trống dưới mức dự phòng 20 GiB; giải phóng dữ liệu có kiểm soát |
| Upload 413 | Ảnh quá lớn hoặc vượt quota phiên 50 ảnh/200 MiB |
| Gallery 401/404 | Phiên hết hạn/thu hồi, token QR cũ hoặc ảnh không thuộc phiên |

## Dừng

`docker --context desktop-linux compose --env-file .env.pilot stop` giữ nguyên volumes. Khởi động lại bằng `up -d`. Kiểm tra health và chạy smoke sau thay đổi dependency/model.
