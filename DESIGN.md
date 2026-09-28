# Pose-Booth: quy chuẩn giao diện và media

## Quyết định hiện hành
- Nền trắng duy nhất, không đổi theo hệ điều hành hoặc lựa chọn theme cũ.
- Một UI kit: c-comic-ui 1.2.0 đã cài trong worktree theo yêu cầu Comic UI mới. Giữ nền trang trắng, viền ink và bóng lệch ngắn; màu khối chỉ dùng cho thành phần nhấn. Không thêm thư viện component song song.
- Nunito cho nội dung; Geist Mono cho số liệu. Chữ charcoal, primary #b42355, secondary #fff1f5, muted foreground #62565c.
- App Flutter (`apps/mobile`) dùng cùng token light-only: nền `#FFFFFF`, ink `#171717`, primary `#B42355`, secondary `#FFF1F5`, accent `#FFE4EC`, muted `#62565C`, bóng lệch 3px. `ThemeMode.light` cố định; không `Brightness.dark`.
- Dùng semantic token background/foreground, card/card-foreground, primary/primary-foreground. Không dùng chữ sáng trên nền trắng hoặc gradient xám.
- Comic tokens: border 2px, radius 8px, shadow lệch 3px. Nút có vùng chạm tối thiểu 44px. Panel tác nghiệp không cần viền 8px hoặc chữ uppercase cho mọi đoạn mô tả.
- Giữ route, API contract và workflow. Không sửa frontend Vite legacy.

## Chuyển động
- Cuộn native; không scroll-driven React state, pin/scrub marketing, blur toàn màn hình hay renderer 3D trang trí.
- Feedback ngắn, chỉ transform/opacity khi có lý do. Countdown GSAP có scope, cleanup khi cập nhật và giảm chuyển động theo system preference.
- Không tuyên bố FPS hoặc mức giảm lag nếu chưa có trace đo thực tế.

## Camera, filter và ảnh tải lên
- 20 preset màu cộng Original; không thay hình học khuôn mặt/cơ thể.
- Preview và export dùng chung định nghĩa filter. Filter áp vào ảnh, không áp vào frame hoặc caption.
- Bản gốc giữ nguyên trong browser memory để đổi filter không làm mất dữ liệu.
- Chỉnh tay từng ảnh: cắt theo tỉ lệ, xoay, lật, zoom/pan và màu; canvas preview là nguồn ảnh được áp dụng. Mỗi lần mở chỉnh bắt đầu từ bản gốc, không chồng các lần nén. Có nút trở về ảnh gốc.
- Ảnh xuất không tự thêm watermark. Không xóa license/attribution bắt buộc của code hoặc asset bên thứ ba.
- Import JPEG/PNG/WebP: 1-4 ảnh, tối đa 12 MiB/ảnh, 24 megapixel, chuẩn hóa cạnh dài tối đa 1600px.
- Import không yêu cầu camera và không tự upload; gallery chỉ lưu khi người dùng đồng ý.
- Lỗi decode/filter/export phải hiện rõ; không thay bằng ảnh/điểm giả.

## Kiểm tra trước bàn giao
- Kiểm desktop/mobile mọi route: không tràn ngang, focus nhìn thấy, text và nút dễ đọc.
- Kiểm camera loading/denied/disconnected, hủy countdown, import sai định dạng, đổi filter và frame.
- Unit tests geometry/camera lifecycle/filter, TypeScript, production build và review diff.
- Browser test không thay thế kiểm camera vật lý, ba thiết bị hoặc soak test.

## Nguồn gốc
Typography và nền semantic tokens trước đây được tham khảo Prismo (MIT), giữ attribution tương ứng. Quyết định trắng-only hiện tại thay thế hoàn toàn quy chuẩn system/light/dark cũ. Asset frame có màu riêng, không phải theme giao diện.
