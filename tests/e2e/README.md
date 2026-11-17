# Kiểm tra phím, hội thoại, gợi ý và độ khó

Node 24, không cần API key. Các ca kiểm tra chạy trên desktop 1280×720 và điện thoại 667×375, 375×667 (hasTouch). Mỗi ca có localStorage riêng; không thay đổi bản lưu ở trình duyệt của người chơi.

```sh
npm install
npx playwright install chromium
npm run test:e2e
```

Nếu máy Windows đã có Microsoft Edge, có thể dùng trình duyệt đó thay cho tải Chromium. PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL='msedge'
npm run test:e2e
```

Playwright tự chạy Vite ở cổng 3000 nếu chưa có server. Nếu có server local thì dùng lại. Kiểm thử có 10 nhóm, mỗi nhóm chạy trên 3 kích thước màn hình:

- Đổi đủ 7 phím bằng giao diện Cài đặt, tải lại để kiểm tra lưu, xác nhận nhãn và mục tiêu trên HUD.
- Hội thoại dùng phím tương tác/nhảy đã đổi; phím cũ và sự kiện giữ phím không qua câu, sự kiện không lọt vào engine sau khi đóng.
- Đo chuyển động cái bóng, hồi đổi thời gian và cả 3 cửa sổ boss trực tiếp trong engine cho Dễ/Thường/Khó. Thường phải đúng giá trị gốc.
- Mở đủ 3 mức gợi ý, kiểm tra đáp án trụ cộng hưởng và nhãn phím đã đổi.
- So sánh getBoundingClientRect của các khối HUD, kiểm tra điểm bấm không bị nút cảm ứng che, mở đủ ba mức ở chương 3–4 và ẩn HUD khi có hội thoại.
- Camera dọc thấy ít nhất 520 đơn vị ngang; xoay màn hình không đổi vị trí nhân vật, bóng hoặc cooldown.
- Hạt bụi còn sống sau 400ms; prefers-reduced-motion không tạo burst hoặc shake.
- Đọc cả ba trang truyện, hai kết thúc và màn lựa chọn: nội dung cuộn được, nút điều hướng/xác nhận nằm trong viewport hoặc cuộn tới được và không bị che.
- Giải thực tế cơ cấu giếng, hộp nhạc và nhà kính qua nút trên giao diện; xác nhận được ghim riêng khỏi vùng cuộn.
- Nạp, làm lộ và xả bẫy boss bằng engine; kiểm tra phản hồi trúng bẫy và độ ổn định chiều cao hộp thoại trong lúc gõ chữ.

Chụp bộ ảnh đối chiếu (server đã chạy):

```powershell
$env:CAPTURE_PHASE='after'
node tests/e2e/capture-responsive.mjs
```

Ảnh và measurements.json lưu dưới outputs/responsive/after cạnh thư mục work của chat này. Có thể đặt CAPTURE_BASE_URL để chụp bản trước sửa ở server độc lập, không cần đổi checkout hiện tại.

Ảnh ở test-results được tạo để kiểm tra trực quan. Trace chỉ giữ khi thất bại. Chạy `npm run lint`, `npm test`, `npm run build` riêng để kiểm tra TypeScript, unit test và bản build.
