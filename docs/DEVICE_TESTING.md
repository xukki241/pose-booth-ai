# Chuẩn bị test camera và điện thoại

## Máy tính + webcam/USB capture

1. Mở gateway local theo QUICKSTART: http://localhost:8080/booth.
2. Cắm webcam USB hoặc capture card được Windows nhận như video input. Camera DSLR/mirrorless cần chế độ webcam hoặc capture card phù hợp; cắm dây USB đơn thuần không đảm bảo có video.
3. Đóng phần mềm đang giữ độc quyền thiết bị, bấm Mở camera, cấp quyền tại browser.
4. Khi có nhiều video input, chọn đúng thiết bị trong mục Thiết bị. Không truy cập camera trực tiếp từ container GPU.
5. Chụp thử 1 và 4 ảnh, kiểm mirror/crop, filter, frame, bản gốc và ảnh ghép tải xuống.
6. Rút camera giữa lượt chụp: UI phải báo mất kết nối, không trả ảnh hoặc điểm giả. Cắm lại rồi mở camera lại.

Điện thoại nối USB chỉ xuất hiện như webcam khi có tính năng/driver webcam tương thích hệ điều hành. Dự án chưa có giao thức riêng để nhận video điện thoại qua USB.

## Điện thoại dùng camera của chính nó

- Cần mạng LAN cùng máy chủ và HTTPS có certificate đúng hostname được điện thoại tin cậy.
- Gateway hiện chỉ bind 127.0.0.1:8080. Localhost trên điện thoại là điện thoại, không phải máy tính.
- Không mở firewall rộng, tắt secure-context hoặc tạo public tunnel để né TLS.
- Trước khi cấu hình deployment LAN cần chốt hostname/interface, certificate và phạm vi thiết bị. Chưa có bằng chứng test hai điện thoại thật.
- PUBLIC_ORIGIN phải là HTTPS origin điện thoại truy cập để QR không trỏ sai về localhost.

## Test không cần camera

Mở Dùng ảnh có sẵn, chọn tối đa 4 JPEG/PNG/WebP. Trong phần Xem lại chọn Chỉnh ảnh:
cắt/zoom/dịch/xoay/lật, chỉnh màu, Áp dụng, đổi một trong 20 filter, tải ảnh có khung.
Hủy chỉnh không thay ảnh đã áp dụng. Về ảnh gốc hủy chỉnh sửa của riêng ảnh đó.
Ảnh không tự gửi tới server. Chỉ thử gallery bằng ảnh fixture không nhạy cảm hoặc ảnh có consent.

## Phiếu nghiệm thu

Ghi model thiết bị, OS/browser, loại kết nối, kích thước stream, thời gian khởi tạo model,
lỗi permission/disconnect, latency thực và trạng thái health. Chạy ba phiên độc lập trước khi tuyên bố hỗ trợ ba camera.
Test unit và fixture không thay thế test camera vật lý, quyền truy cập trên điện thoại hoặc soak test.
