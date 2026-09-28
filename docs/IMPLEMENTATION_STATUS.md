# Trạng thái triển khai và release gates

Ngày cập nhật: 2026-09-28. Đây là tracking kỹ thuật, không phải chứng nhận hoàn thành toàn plan. Working tree gồm thay đổi có từ trước và thay đổi mới; chưa commit/push. Không có số FPS, điểm pose hay consent được bịa trong đợt này.

## Cập nhật hiện hành: Scalar /docs, C-Comic OS, sticker/filter/frame, Flutter, Docker CPU

Phần này ghi bằng chứng của đợt 2026-09-28. Không thay thế các mục chưa nghiệm thu bên dưới.

- Scalar: `apps/api/main.py` đặt `docs_url=None` và `GET /docs` trả `HTMLResponse` tải CDN `@scalar/api-reference` với `data-url="/openapi.json"`. Router `/api/pose/*` không đổi trong diff này. Sau `docker cp` + restart `pose-booth-api-dev`, `GET http://127.0.0.1:8000/docs` (2026-09-28) HTTP 200, HTML chứa `@scalar/api-reference`, không còn Swagger. `/health`: `status=ok`, `profile=edge`, `device=cpu`, `fp16_enabled=false`, `engine_ready=false`, `library_poses_cached=20`.
- C-Comic OS light/dark: `apps/web/app/globals.css` dùng `@media (prefers-color-scheme: dark)` với nền `#171717`, primary `#ff6b9d`, paper ink `#f5f0eb`; `html { color-scheme: light dark }`. `DESIGN.md` ghi token này. Flutter `apps/mobile/lib/main.dart` `themeMode: ThemeMode.system` + `comicLightTheme` / `comicDarkTheme`. Chưa có visual QA light/dark trên thiết bị trong đợt này.
- Web stickers/filters/frames: booth import `STICKERS` (6 SVG trong `apps/web/public/stickers/`), `PHOTO_FILTERS` (24 mục color-only trong `apps/web/lib/photo-filters.ts`, gồm Original), `FRAMES` (5 overlay SVG + none). Filter định nghĩa dùng chung preview/export; không có bằng chứng browser đợt này cho từng preset trên ảnh người.
- Flutter client: `apps/mobile` có `BoothPage`, `PoseApiClient`, C-Comic `ThemeMode.system`, 24 `ColorFilter` khớp id web, sticker emoji, 4 màu khung. `flutter test` 4/4 pass trên SDK local. Chưa cắm máy (`adb devices` chưa được chạy/ghi nhận trong đợt này).
- Docker CPU: `docker-compose.dev.yml` + `apps/api/Dockerfile.cpu`, `DEVICE=cpu`, `AI_PROFILE=edge`. `apps/api/.dockerignore` loại `*.pt`. Compose CPU không mount volume weights. Health `engine_ready=false` khớp engine: file weights local được duyệt là bắt buộc, không tự download — analyze chưa sẵn sàng trên stack đang chạy.
- QR: UI `SaveGallery` gọi `POST /api/v1/assets` và `POST /api/v1/share/qr` khi có `DATABASE_URL`; CPU compose hiện không gắn product DB. Print/GIF: không thấy implementation trong `apps/web/app` hay `apps/api/routers`. Có download JPEG composite trên booth.

### Cổng còn mở (đợt này)

| Hạng mục | Bằng chứng / việc còn lại |
|---|---|
| YOLO analyze | `engine_ready=false` trên API CPU đang chạy; `.dockerignore` loại `*.pt`; compose CPU không mount models. Có file `.pt` trên disk máy dev nhưng gitignored — không chứng minh analyze. |
| Ba camera | Chưa có soak/ba thiết bị; không có p50/p95/VRAM đo được. |
| Điện thoại adb | `docs/FLUTTER_ANDROID_STUDIO.md` mô tả Poco + `adb reverse`; chưa ghi nhận máy đã cắm trong đợt này. |
| QR / print / GIF | QR phụ thuộc product API + DB; print và GIF chưa có code booth/API tương ứng. Download JPEG không phải GIF/print. |
| Scalar live | Source + process `:8000` đã Scalar sau restart container từ `main.py` working tree. |

## Cập nhật trước: Comic UI trắng và chỉnh ảnh

Phần này thay thế các mô tả white-strawberry/shadcn/light-dark lịch sử bên dưới.

- Worktree hiện dùng c-comic-ui 1.2.0. Giữ nền trang trắng, thêm tokens Comic còn thiếu, sửa tiêu đề trắng khó đọc và nội dung privacy không đúng. Không tự gỡ/cài thêm package trong đợt này.
- Xóa component scrollytelling 320vh, theme provider/toggle/store và GlassCard/PrismText không còn caller; bỏ CSS compatibility/decorative loops. Các file tracked có thể phục hồi qua Git nếu cần, không xóa dữ liệu khách.
- GSAP entrance có kiểm reduced-motion trước khi chạy; countdown revert animation khi đổi số. Chưa có trace/FPS hoặc kiểm đổi reduced-motion giữa animation.
- Chỉnh ảnh local theo từng ảnh: aspect crop, zoom/pan, rotate/flip, brightness/contrast/saturation. Bản gốc tách khỏi bản chỉnh; preview canvas là nguồn khi Apply; Cancel/restore không ghi đè gốc.
- Bỏ watermark do compositor tự vẽ. Catalog chuyển sang hai SVG frame tự định nghĩa, không dùng PNG chứa logo Prismo trong UI; giữ ID cũ để link chọn frame không hỏng. Không xóa license nguồn hoặc sửa PNG bên thứ ba.
- Loading có nội dung rõ khi decode/import, ghép ảnh, khởi tạo model, chờ kết quả chấm pose. Error chấm điểm được scope theo pose/camera, không lấy lỗi của camera trước.
- Frontend: 21 tests pass (geometry/lifecycle/filter/import/edit/loading presentation), TypeScript pass. Tests hook dùng controlled APIs, không thay thế React integration.
- Product API: 12 tests pass trong image, network disabled và tests bind read-only. Native GPU venv thiếu redis/product dependencies nên bộ test product phải dùng image hoặc môi trường cài requirements-product.
- Research: 7 tests pass. GPU HTTP smoke pass inference fixture, session isolation/idempotency, RabbitMQ thumbnail, QR/revoke; không đo accuracy bằng fixture màu.
- Redis hiện chỉ rate limit; đã bảo đảm đóng client khi eval lỗi. Chưa nhận đã có cache model output. RabbitMQ đang thực thi thumbnail/outbox, không vận chuyển frame live.
- Browser xác nhận import PNG fixture không cần camera, square crop 533x533, rotate/mirror/apply, filter grayscale, restore về 533x1600; ở viewport 390px content width 384px và nền trắng. Chưa xác minh camera vật lý hoặc file download thực sự ghi trên thiết bị.
- Quy chuẩn mới ở DESIGN.md; chuẩn bị webcam/điện thoại ở docs/DEVICE_TESTING.md. LAN TLS/certificate tin cậy và ba camera soak vẫn chưa hoàn tất.

## Có code và đã kiểm

- Next.js build/type check thành công sau gallery và sau đợt chỉnh photobooth.
- 9 unit tests API: environment, CUDA/dependency unavailable readiness, decode màu RGB, input lỗi, visibility/score.
- 7 data/research tests: quyền sử dụng, archive traversal, chia nhóm subject/session, release bất biến/tái lập, nhãn NaN, dry-run không load model, chặn YAML execution hooks và protocol không tương thích.
- 3 frontend geometry tests: centered cover, mirror đúng tọa độ, camera chưa ready không tạo landmarks.
- 7 camera ownership regression tests pass bằng controlled browser APIs; đã tái hiện trước sửa lỗi enumeration làm tắt stream và thiếu video làm loading treo. Không phải test React renderer/camera vật lý.
- Docker images ai/api/worker/web build thành công; PostgreSQL/RabbitMQ/Redis/Nginx khởi động.
- Gateway health trả studio/cuda:0/FP16/ready; smoke qua HTTP chạy analyze/score/suggest.
- Integration fixture pass upload/idempotency, chặn đọc chéo phiên, thumbnail job, QR response và thu hồi token.
- 5 notebooks đã execute guarded: inference fixture + dataset fixture thực thi; baseline/train/promotion chưa chạy do chưa có dữ liệu.

Các phép kiểm trên không tương đương mobile capture end-to-end, đánh giá model trên người thật, hoặc soak test.

## Đợt nâng cấp frontend đang tiếp tục

### Yêu cầu mới: white strawberry studio

- Người dùng chốt light-only, thay cho Prismo system/light/dark. Layout không còn đọc preference cũ; shadcn/Base UI được restyle trắng/hồng dâu, không thêm UI framework hoặc Three.js.
- Trang chủ bỏ import scrollytelling 320vh có setProgress theo scroll; frames/about bỏ GSAP reveal và backdrop blur, sửa nội dung sai chức năng. Chưa đo Chrome Performance trace trước/sau, không tuyên bố FPS hoặc hết mọi nguyên nhân lag.
- Booth có 20 color presets + original, cùng công thức CSS preview/Canvas export. Frame artwork không bị lọc màu. Browser thiếu Canvas filter được báo lỗi thay vì xuất sai âm thầm.
- Nhập 1-4 JPEG/PNG/WebP local, tối đa 12 MiB/24MP mỗi ảnh, chuẩn hóa tối đa 1600px. Ảnh gốc trong phiên giữ nguyên khi đổi preset. Chụp/đổi cấu hình bị khóa khi đang import.
- Browser đã nhập một PNG asset của repo không bật camera, tạo composite và đổi grayscale đúng; chưa dùng ảnh khách. Download-event của browser tool timeout, chưa xác nhận file tải xuống. Chưa kiểm Safari/điện thoại/20 preset trên ảnh người thật.
- Bản Docker mới nhất build/typecheck pass; 14 frontend tests, 9 API tests và 7 research tests pass. Đã kiểm trang chủ desktop, lọc Red ở frames 390px và about 390px (document width 384 <= viewport 390, nền trắng light). Chưa chạy Lighthouse/trace hay full mobile booth capture.
- Công việc còn lại gồm xóa module legacy không còn caller sau review, audit backend theo execution path, chuẩn hóa toàn bộ docs và benchmark cuộn thực tế. Không coi vài trang mới là hoàn thành cleanup cả codebase.

- Photobooth đổi sang semantic Prismo, bỏ glow/gradient trong vùng tác nghiệp; camera chỉ mở khi người dùng bấm.
- Countdown có hủy, dọn timers/unmount, không đặt side-effect trong setState updater.
- Preview/capture dùng cùng crop/mirror; ảnh ghép giữ toàn khung đã chụp, không crop lần hai.
- Frame catalog nối query chọn frame; frame họa tiết hiện dùng layout strip 4 ảnh của asset đã có.
- Preview ảnh ghép là cùng dữ liệu dùng download và gallery. Lưu gallery là opt-in, không tự upload.
- Hook camera mới xử lý timeout quyền, camera disconnect, stream late arrival và danh sách thiết bị. Hook JS cũ không có caller khác đã thay bằng TypeScript; có thể phục hồi bản cũ từ Git.
- Pose Studio đã hợp nhất camera lifecycle và semantic layout mới; thêm tìm/lọc dáng, mang lựa chọn sang booth, bỏ độ lệch khớp hard-code. Landing/frames/about và editor vẫn cần audit giao diện/luồng đầy đủ.
- Đã xem booth ở desktop và 390px, light/dark, kiểm camera timeout có nút thử lại. Camera thật chưa cấp stream trong môi trường kiểm thử; không nhận đã nghiệm thu capture qua browser.
- Đã kiểm tìm kiếm `Khoanh` ở Pose Studio, chọn `Khoanh Tay`, chuyển sang `/booth?pose=crossed_arms` và xác minh nhãn đang chọn trên bản Docker sau reload; theme sáng được giữ qua chuyển trang/reload.
- Smoke test đã chạy lại sau triển khai API/worker/web: GPU readiness, inference fixture, isolation/idempotency, thumbnail, QR và revoke đều pass. Không thay thế test ảnh người thật hoặc expiry đủ 24 giờ.

## Chưa đạt — tiếp tục triển khai / nghiệm thu

| Hạng mục | Cần bằng chứng hoặc phần việc |
|---|---|
| Silhouette từ ảnh | Pose + segmentation thật, editor vị trí/tỉ lệ/opacity/mask; template persistence/QA |
| MediaPipe worker | Hiện inference browser còn chạy main thread; chuyển worker và kiểm backpressure/disposal |
| Camera | Kiểm camera thật, permission deny/revoke, mất thiết bị, xoay màn hình, đổi front/rear |
| Mobile LAN | TLS trusted trên 2 điện thoại, PUBLIC_ORIGIN đúng LAN, firewall phạm vi hẹp |
| Ba session | Soak 3 camera, p50/p95/VRAM, job restart + duplicate delivery fault injection |
| Gallery | Test expiry bằng clock/DB controlled, QR đọc được trên điện thoại, token read-only âm tính, orphan recovery |
| Admin | Operator UI, quản lý catalog/template/job, session không xem ngoài quyền |
| Contract | Sinh FE types từ OpenAPI, contract tests, snapshot versioned mới |
| Research | COCO converter coverage, near-duplicate review gate, Colab sạch, smoke training/resume thực |
| Model release | Load approved release metadata/checksum, promotion/rollback test và model license review |
| Supply chain | Audit dependency/security, lock transitive môi trường, asset/license provenance |
| Skills | Audit toàn bundle + commit; không cài hàng nghìn skills theo regex SKILL.md |
| Visual QA | Light/dark/system, mobile/desktop tất cả routes, keyboard/focus/reduced-motion, notebook rendered preview |

## Không tự thực hiện

Không upload khách/dataset/secrets; không mở public endpoint; không tạo tài nguyên trả phí; không train dài; không promote candidate thiếu report; không đổi trạng thái audit lỗi thành an toàn. Không dùng các số FPS hoặc nhãn "production-ready" cũ làm bằng chứng.

## Mục tiêu tiếp tục

Giữ đầy đủ plan pilot + nền research và mục tiêu nâng cấp toàn bộ sản phẩm. Một đợt build/tests xanh chỉ chứng minh các đường đã kiểm, không thu hẹp định nghĩa hoàn thành.
