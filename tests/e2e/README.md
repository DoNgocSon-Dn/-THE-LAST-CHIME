# Kiểm tra phím, hội thoại, gợi ý và độ khó

Node 24, không cần API key. Các ca kiểm tra chạy trên desktop 1280×800 và điện thoại 360×800, 390×844. Mỗi ca có localStorage riêng; không thay đổi bản lưu ở trình duyệt của người chơi.

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

Playwright tự chạy Vite ở cổng 3000 nếu chưa có server. Nếu có server local thì dùng lại. Kiểm thử có 4 nhóm, mỗi nhóm chạy trên 3 kích thước màn hình:

- Đổi đủ 7 phím bằng giao diện Cài đặt, tải lại để kiểm tra lưu, xác nhận nhãn và mục tiêu trên HUD.
- Hội thoại dùng phím tương tác/nhảy đã đổi; phím cũ và sự kiện giữ phím không qua câu, sự kiện không lọt vào engine sau khi đóng.
- Đo chuyển động cái bóng, hồi đổi thời gian và cả 3 cửa sổ boss trực tiếp trong engine cho Dễ/Thường/Khó. Thường phải đúng giá trị gốc.
- Mở đủ 3 mức gợi ý, kiểm tra đáp án trụ cộng hưởng và nhãn phím đã đổi.

Ảnh ở test-results được tạo để kiểm tra trực quan. Trace chỉ giữ khi thất bại. Chạy `npm run lint`, `npm test`, `npm run build` riêng để kiểm tra TypeScript, unit test và bản build.
