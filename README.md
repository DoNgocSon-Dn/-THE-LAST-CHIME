# THE LAST CHIME — Tiếng chuông dưới tán rêu

Game phiêu lưu giải đố, dùng 13 map và các sheet nhân vật/đồ vật người dùng cung cấp.

## Chạy và kiểm tra

Cần Node.js 24. Chạy `npm ci`, sau đó `npm run dev` và mở http://localhost:3000.

- A/D hoặc ←/→: di chuyển; Space: nhảy.
- E: kiểm tra đồ vật hoặc đi qua cửa. Nút E hiện tên điểm tương tác gần nhất.
- Nhặt đồng hồ trong phòng khách để dùng Q chuyển quá khứ/hiện tại; hồi 3 giây.
- Esc: tạm dừng. Điện thoại có nút di chuyển, nhảy, E và Q.
- `npm run lint`, `npm test`, `npm run build` kiểm tra mã và tạo bản production trong `dist`.

## Chương là cốt truyện, phòng là địa điểm

Luồng vào nhà: **cổng ngoài → cửa chính → hành lang**. Hành lang có bốn cửa tương tác:

- Phòng khách: đồng hồ bỏ túi và đồng hồ lớn.
- Xưởng đồng hồ: bánh răng thay thế và ký ức của Mẹ, Ông Ngoại.
- Nhà bếp: ghi chép gia đình và cửa ra sân sau.
- Phòng Linh: khóa cho tới khi tìm được chìa trong hộp sắt ở giếng.

Mỗi phòng có cửa quay lại hành lang. Không thể đi ngang xuyên ranh giới ảnh để sang phòng bên cạnh. Từ bếp ra sân sau, từ sân ra vườn, từ vườn vào nhà kính bằng cửa/cổng tương ứng. Phòng Linh và khu vườn không nối thẳng với nhau qua mép ảnh.

`currentStage` là chỉ số cấu hình khu vực nội bộ; `storyChapter` là chương đang diễn ra. Đi trở về hành lang hoặc bếp không làm lùi chương, không tự hoàn thành câu đố và không làm mất đồng hồ. `houseLayoutVersion` chuyển vị trí bản lưu từ bố cục cũ sang đúng phòng mới.

| Chương cốt truyện | Nội dung |
|---|---|
| 1 — Trở về | Cổng và hiên nhà; di chuyển, nhặt mẩu giấy, vào hành lang |
| 2 — Chiếc đồng hồ ngừng chạy | Khám phá các cửa phòng khách, xưởng và bếp; sửa đồng hồ để mở chốt cửa sau |
| 3 — Dấu vết bên giếng | Kéo gàu trong quá khứ; mở hộp sắt lấy nhật ký và chìa khóa |
| 4 — Căn phòng bị khóa | Quay lại hành lang vào phòng Linh; giải hộp nhạc; khám phá vườn và nhà kính |
| 5 — Cuộc truy đuổi | Rừng ký ức, hang đồng hồ và không gian đứt gãy |
| 6 — Hai phía của thời gian | Đồng bộ lõi và chọn kết thúc |

13 map xuất hiện đúng một lần trong cấu hình khu vực: map 1 là bên ngoài; map 3 là hành lang; map 2/5/6 là các phòng mở từ hành lang; map 7 là sân sau; map 4 là phòng Linh; map 8/9 là vườn và nhà kính; map 10–13 là tuyến kết thúc. Tên file ảnh không quyết định trình tự đi qua các cửa.

## Giải đố và cốt truyện

An trở về sau mười năm, mang chiếc kim gãy Mẹ để luật sư giữ hộ. Đồng hồ bỏ túi kết hợp với chiếc kim để đi vào các mốc ký ức. Những vật cộng hưởng giữ được thay đổi giữa hai thời điểm; cỗ máy không thể hồi sinh người đã mất.

- Đồng hồ lớn: tìm bánh răng, quan sát giờ dừng ở hiện tại, tự chỉnh kim và lên dây cót ở quá khứ.
- Giếng: tay quay ở hiện tại đã gãy; dùng bản còn nguyên trong quá khứ để kéo gàu và tìm hộp sắt.
- Hộp nhạc: quá khứ cho thứ tự hình vẽ, hiện tại cho liên hệ giữa hình và nốt. Người chơi tự gảy ba nốt trên sáu phím; sai không mở chốt.
- Trụ cộng hưởng: đọc nhật ký và suy ra ba vòng số từ giờ tai nạn. Lõi vẫn khóa khi các vòng chưa khớp.
- Sổ tay chỉ lưu những manh mối đã kiểm tra; có thể xem từ HUD hoặc bảng cơ cấu.

Kẻ Lạc Giờ là nỗi sợ của Linh bị cỗ máy biến dạng. Kết thúc cho phép giải phóng ký ức để bước tiếp hoặc ở lại trong bản sao ngày cũ.

## Hình ảnh và menu

Asset nằm trong `public/assets/pixel` và `public/assets/menu`; game không phụ thuộc đường dẫn ổ D. Importer canvas cắt bỏ chữ chú thích, lọc nền trắng/nhiễu JPG và giữ màu bên trong nhân vật. Nội thất rộng 800 đơn vị, cảnh ngoài rộng 1200; An cao 84 đơn vị với chung tỷ lệ và đường chân giữa các động tác. Nhịp chân đi theo quãng đường thực tế.

Menu dùng tranh chia đôi quá khứ/hiện tại. Sheet `menu-actors.png` có 24 khung riêng: Linh vẫy tay/chào vui vẻ, An nhìn quanh/chỉnh túi. Hover hoặc chạm nhân vật kích hoạt phản ứng. Giảm chuyển động giữ hình tĩnh.

Bắt đầu → loading đồng hồ pixel quay/vỡ/ghép lại → câu chuyện mở đầu → chương 1. Tiếp tục tải bản lưu. Chọn chương dùng ảnh xem trước hai thời điểm và khóa theo tiến độ; cùng một bảng được dùng ở menu và trong game. Âm lượng được lưu riêng. Bảng chọn chương và các cơ cấu tạm dừng gameplay, hỗ trợ Esc và giữ focus bàn phím.

## Xác minh và triển khai

31 kiểm thử gồm vật lý, câu đố, đầy đủ 13 map, cửa hai chiều, ranh giới phòng, di chuyển camera và chuyển vị trí bản lưu cũ. Edge headless đã kiểm tra luồng cổng → hành lang → các phòng → sân sau → phòng Linh → vườn/nhà kính, giữ chương khi quay về, và 24 khung menu. Chưa chơi thủ công trọn cả hai kết thúc trong bố cục mới.

Ứng dụng Vite tĩnh, Node.js 24, deploy bằng `vercel.json`. Không cần API key để chơi. Nguồn hình: bộ người dùng cung cấp và nền menu sạch được dựng từ tranh tham khảo. Các prompt cũ nằm trong `ASSET-PROMPTS.md`.
