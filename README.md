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

Mỗi phòng có cửa quay lại hành lang. Không thể đi ngang xuyên ranh giới ảnh để sang phòng bên cạnh. Từ bếp ra sân sau, từ sân ra vườn, từ vườn vào nhà kính bằng cửa/cổng tương ứng. Tất cả vẫn thuộc chương 2, không tăng số chương khi đổi phòng. Phòng Linh và khu vườn không nối thẳng với nhau qua mép ảnh.

`currentStage` là chỉ số cấu hình khu vực nội bộ; `storyChapter` là một trong bốn chương đang diễn ra; `campaign.ts` ánh xạ các khu vực vật lý vào chương. Đi trở về hành lang hoặc bếp không làm lùi chương, không tự hoàn thành câu đố và không làm mất đồng hồ. `houseLayoutVersion` chuyển vị trí bản lưu từ bố cục cũ sang đúng phòng mới.

| Chương cốt truyện | Độ khó và nội dung |
|---|---|
| 1 — Khởi đầu | Làm quen đi/nhảy/kiểm tra; đọc mẩu giấy và tự xoay hai vòng hình của chốt cửa |
| 2 — Sự thật trong căn nhà | Hành lang và các phòng; đồng hồ, giếng, hộp nhạc và mạch ánh sáng đều cần quan sát hai thời điểm; đọc bản vẽ của Mẹ trước khi ra rừng |
| 3 — Cuộc chạy trốn | Ba chướng ngại đòi đổi thời gian luân phiên; giữ đủ ba ấn trong lúc bị đuổi; không dùng bảng câu đố tạm dừng |
| 4 — Tiếng chuông cuối | Nạp bẫy ở quá khứ, dụ quái vào hiện tại và xả khi điểm yếu mở; sau ba bẫy mới đồng bộ lõi và chọn kết thúc |

13 map xuất hiện đúng một lần trong cấu hình khu vực: map 1 là bên ngoài; map 3 là hành lang; map 2/5/6 là các phòng mở từ hành lang; map 7 là sân sau; map 4 là phòng Linh; map 8/9 là vườn và nhà kính; map 10–13 là tuyến kết thúc. Tên file ảnh không quyết định trình tự đi qua các cửa.

## Giải đố và cốt truyện

An trở về sau mười năm, mang chiếc kim gãy Mẹ để luật sư giữ hộ. Đồng hồ bỏ túi kết hợp với chiếc kim để đi vào các mốc ký ức. Những vật cộng hưởng giữ được thay đổi giữa hai thời điểm; cỗ máy không thể hồi sinh người đã mất.

- Đồng hồ lớn: tìm bánh răng, quan sát giờ dừng ở hiện tại, tự chỉnh kim và lên dây cót ở quá khứ.
- Giếng: đọc hai dấu còn sót trên tay quay hiện tại, chỉnh bộ truyền động trong quá khứ rồi kéo gàu để tìm hộp sắt.
- Hộp nhạc: quá khứ cho thứ tự hình vẽ, hiện tại cho liên hệ giữa hình và nốt. Người chơi tự gảy ba nốt trên sáu phím; sai không mở chốt.
- Nhà kính: ba cần điều khiển các dải sáng chồng lẫn; tìm mẫu đích ở hiện tại rồi sửa mạch ở quá khứ. Cổng rừng còn đòi chốt nhạc và bản vẽ của Mẹ.
- Trụ cộng hưởng: đọc nhật ký và suy ra ba vòng số từ giờ tai nạn. Lõi vẫn khóa khi các vòng chưa khớp.
- Sổ tay chỉ lưu những manh mối đã kiểm tra; có thể xem từ HUD hoặc bảng cơ cấu.

Kẻ Lạc Giờ là nỗi sợ của Linh bị cỗ máy biến dạng. Kết thúc cho phép giải phóng ký ức để bước tiếp hoặc ở lại trong bản sao ngày cũ.

## Hình ảnh và menu

Asset nằm trong `public/assets/pixel` và `public/assets/menu`; game không phụ thuộc đường dẫn ổ D. Importer canvas cắt bỏ chữ chú thích, lọc nền trắng/nhiễu JPG và giữ màu bên trong nhân vật. Nội thất rộng 800 đơn vị, cảnh ngoài rộng 1200; An cao 56 đơn vị với chung tỷ lệ và đường chân giữa các động tác. Nhịp chân đi theo quãng đường thực tế.

Menu dùng tranh chia đôi quá khứ/hiện tại. Sheet `menu-actors.png` có 24 khung riêng: Linh vẫy tay/chào vui vẻ, An nhìn quanh/chỉnh túi. Hover hoặc chạm nhân vật kích hoạt phản ứng. Giảm chuyển động giữ hình tĩnh.

Bắt đầu → loading xưởng đồng hồ với An sửa máy, con lắc, bánh răng và thanh tải theo tiến độ tài nguyên thực → câu chuyện mở đầu → chương 1. Tiếp tục tải bản lưu. Chọn chương dùng ảnh xem trước hai thời điểm và khóa theo tiến độ; cùng một bảng được dùng ở menu và trong game. Âm lượng được lưu riêng. Bảng chọn chương và các cơ cấu tạm dừng gameplay, hỗ trợ Esc và giữ focus bàn phím.

## Xác minh và triển khai

36 kiểm thử gồm vật lý, câu đố, đầy đủ 13 map, cửa hai chiều, ranh giới phòng, di chuyển camera và chuyển vị trí bản lưu cũ. Edge headless đã kiểm tra luồng cổng → hành lang → các phòng → sân sau → phòng Linh → vườn/nhà kính, giữ chương khi quay về, và 24 khung menu. Lượt kiểm tra cơ chế cuối đã đi qua ba bẫy trực tiếp, đồng bộ lõi và chọn kết thúc giải thoát; chưa chơi thủ công trọn cả hai kết thúc bằng điều khiển liên tục.

Ứng dụng Vite tĩnh, Node.js 24, deploy bằng `vercel.json`. Không cần API key để chơi. Nguồn hình: bộ người dùng cung cấp và nền menu sạch được dựng từ tranh tham khảo. Các prompt cũ nằm trong `ASSET-PROMPTS.md`.


## Truy đuổi và đối đầu theo thời gian

Chương 3 có ba ấn, theo thứ tự quá khứ → hiện tại → quá khứ. Tốc độ quái tăng theo khu rừng, hang, vùng đứt gãy. Sau mỗi lần đổi thời gian, hình bóng quái chậm hòa vào thời điểm mới 1,25 giây; đây là khoảng trống để vượt chướng ngại. Cổng cuối chỉ mở khi đủ ba ấn.

Ở trận cuối, mỗi bẫy chỉ dùng được một lần. Nạp ở quá khứ, đổi sang hiện tại để dụ quái vào vùng bẫy, rồi xả cộng hưởng trong cửa sổ điểm yếu. Ba pha tăng tốc độ quái từ 140 lên 158 và 176; nhịp nạp giảm 12/10/8 giây, cửa sổ xả giảm 3/2,4/1,8 giây. HUD hiển thị nhịp còn lại, ba lớp vỏ và liên kết của An. Quá khứ chỉ ổn định sáu giây; đứng lâu hơn quái vẫn có thể chạm vào An. Mất ba nhịp liên kết sẽ quay lại điểm đầu trận với các bẫy được đặt lại. Lõi không cho chọn kết thúc trước khi phá đủ ba lớp vỏ.

`campaignVersion: 2` chuyển bản lưu sáu chương cũ sang bốn chương mới. Bản lưu đang ở tuyến truy đuổi cũ được đưa về đầu tuyến để không bỏ lỡ các ấn vừa thêm. Menu chọn chương cũng ánh xạ đúng chương 3 tới rừng và chương 4 tới tâm điểm.


An dùng atlas thống nhất `public/assets/pixel/an-unified.png` (8 cột × 6 hàng: đứng, đi, chạy, nhảy, tương tác, menu) và atlas cùng mẫu `an-seated.png` (8 cột × 2 hàng cho sửa đồng hồ, ngủ và đọc thư). Mọi trạng thái gameplay dùng chung tỷ lệ nguồn theo dáng đứng, không kéo giãn từng khung. Menu, chân dung và loading cũng dùng các atlas này; ba cảnh mở đầu dùng tranh hoàn chỉnh: giấc mơ, nhận thư và chuyến xe buýt; căn nhà xuất hiện khi An xuống xe vào chương 1; các sheet An trước đây chỉ còn lưu làm nguồn tham khảo, không được nạp khi chơi.


Hành lang: cửa phòng khách ở vị trí đầu (228), phòng Linh ở cửa bị đóng ván (427). Cửa phòng Linh và xưởng bị sập ở hiện tại, chỉ đi qua được trong quá khứ, cả chiều vào lẫn chiều ra. Phòng Linh vẫn cần chìa khóa từ hộp sắt trong giếng. Người chơi lấy đồng hồ trong phòng khách trước nên không bị khóa tiến trình bởi điều kiện Q.


Sơ đồ cửa phòng khách/xưởng: Hành lang ↔ cửa trái Phòng khách; cửa phải Phòng khách ↔ cửa trái Xưởng; cửa phải Xưởng ↔ Hành lang. Mỗi lối quay về đúng cửa đối diện. Cả hai lối vào xưởng đều bị sập ở hiện tại và cần trở về quá khứ.
