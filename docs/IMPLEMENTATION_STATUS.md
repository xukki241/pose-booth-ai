# Trạng thái triển khai và release gates

Ngày cập nhật: 2026-09-26. Đây là tracking kỹ thuật, không phải chứng nhận hoàn thành toàn plan. Working tree gồm thay đổi có từ trước và thay đổi mới; chưa commit/push.

## Có code và đã kiểm

- Next.js build/type check thành công sau gallery và sau đợt chỉnh photobooth.
- 9 unit tests API: environment, CUDA/dependency unavailable readiness, decode màu RGB, input lỗi, visibility/score.
- 7 data/research tests: quyền sử dụng, archive traversal, chia nhóm subject/session, release bất biến/tái lập, nhãn NaN, dry-run không load model, chặn YAML execution hooks và protocol không tương thích.
- 3 frontend geometry tests: centered cover, mirror đúng tọa độ, camera chưa ready không tạo landmarks.
- Docker images ai/api/worker/web build thành công; PostgreSQL/RabbitMQ/Redis/Nginx khởi động.
- Gateway health trả studio/cuda:0/FP16/ready; smoke qua HTTP chạy analyze/score/suggest.
- Integration fixture pass upload/idempotency, chặn đọc chéo phiên, thumbnail job, QR response và thu hồi token.
- 5 notebooks đã execute guarded: inference fixture + dataset fixture thực thi; baseline/train/promotion chưa chạy do chưa có dữ liệu.

Các phép kiểm trên không tương đương mobile capture end-to-end, đánh giá model trên người thật, hoặc soak test.

## Đợt nâng cấp frontend đang tiếp tục

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
