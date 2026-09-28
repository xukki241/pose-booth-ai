# Pose-Booth: quy chuẩn giao diện và media

## Quyết định hiện hành
- Nền C-Comic theo hệ điều hành (`prefers-color-scheme` / `ThemeMode.system`), không light-only. Dark dùng cùng token comic (ink/primary lệch, không quay lại Prism).
- Một UI kit: c-comic-ui 1.2.0. Viền ink và bóng lệch ngắn; màu khối cho nhấn. Không thêm thư viện component song song.
- Nunito cho nội dung; Geist Mono cho số liệu. Light: nền trắng, ink charcoal, primary #b42355. Dark: nền #171717, primary #ff6b9d, paper ink #f5f0eb.
- App Flutter (`apps/mobile`) `ThemeMode.system` với cùng token light/dark; không khóa `ThemeMode.light`.
- Dùng semantic token background/foreground, card/card-foreground, primary/primary-foreground. Không dùng chữ sáng trên nền trắng hoặc gradient xám.
- Comic tokens: border 2px, radius 8px, shadow lệch 3px. Nút có vùng chạm tối thiểu 44px. Panel tác nghiệp không cần viền 8px hoặc chữ uppercase cho mọi đoạn mô tả.
- Giữ route, API contract và workflow. Không sửa frontend Vite legacy.

## Chuyển động
- Cuộn native; không scroll-driven React state, pin/scrub marketing, blur toàn màn hình hay renderer 3D trang trí.
- Feedback ngắn: hover-press CSS, View Transition stamp + morph `booth-nav`/`booth-cta`. Countdown GSAP có scope. Camera/video/skeleton không nằm trong transition.
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
Typography và nền semantic tokens trước đây được tham khảo Prismo (MIT), giữ attribution tương ứng. C-Comic light/dark theo hệ điều hành thay thế quy chuẩn Prism cũ. Asset frame/sticker có màu riêng, không phải theme giao diện.
