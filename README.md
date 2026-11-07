# THE LAST CHIME — Tiếng chuông dưới tán rêu

Bản làm lại từ repo DoNgocSon-Dn/-THE-LAST-CHIME, tích hợp bộ pixel THE LAST CHIME người dùng cung cấp: 13 map và các sheet nhân vật, nội thất, đồ vật, ký ức.

## Chạy game

Cần Node.js 22.12+ hoặc 24.

```sh
npm ci
npm run dev
```

Mở http://localhost:3000. A/D hoặc mũi tên để đi, Space để nhảy, E tương tác, màn 1 học đi/nhảy/E; màn 2 nhặt đồng hồ bỏ túi để mở Q, Esc tạm dừng.

```sh
npm run lint
npm test
npm run build
```

## Cốt truyện

Mười năm sau tai nạn, An nhận di vật Mẹ gửi luật sư giữ hộ. Điều kiện trao lại là tiếng chuông vang lên từ căn nhà bỏ hoang. Trong hiện tại, rêu đã nuốt chửng căn nhà; trong quá khứ, cỗ máy tái hiện buổi chiều cuối cùng của gia đình.

Đồng hồ bỏ túi nhận được trong phòng khách là vật dẫn, kết hợp với chiếc kim gãy trong thư. Chỉ các vật cộng hưởng giữ được thay đổi giữa hai thời điểm: bánh răng, ròng rọc, ánh sáng và hộp nhạc. Đây là lý do hành động trong quá khứ mở đường ở hiện tại; người chơi không thể viết lại toàn bộ lịch sử hay hồi sinh người đã mất.

Sáu chương: trở về và đánh thức kim; sửa bộ máy; gia cố hành lang và đọc nhật ký; tìm khúc ru Mi–Sol–Đô; chạy khỏi Kẻ Lạc Giờ; đồng bộ lõi và lựa chọn.

Kẻ Lạc Giờ là nỗi sợ bị bỏ lại của Linh bị lõi máy biến dạng. Linh không điều khiển được lớp vỏ ấy, nên An vẫn phải tránh nó. Đồng bộ trụ giúp tháo kim an toàn: giải phóng ký ức và bước tiếp, hoặc tự nguyện ở lại bản sao buổi chiều cũ. Kết thúc thứ hai là sự đánh đổi, không phải hồi sinh gia đình.

## Bộ pixel người dùng cung cấp

Bản hiện tại dùng 13 map và các sheet JPG trong bộ `thelasrchime`: An, hoạt ảnh An/Linh, NPC Mẹ/Linh/Ông Ngoại, Kẻ Lạc Giờ, đồ vật, nội thất và ký ức.

| Chương | Các map và khu vực |
|---|---|
| 1 | Map 1 — Cổng nhà và hiên trước |
| 2 | Map 2 → 6 → 5 — Phòng khách, phòng ăn, xưởng đồng hồ |
| 3 | Map 3 → 7 — Hành lang và sân sau |
| 4 | Map 4 → 8 → 9 — Phòng Linh, vườn, nhà kính |
| 5 | Map 10 → 11 → 12 — Rừng ký ức, hang và không gian đứt gãy |
| 6 | Map 13 — Tâm điểm thời gian |

Đi sang phải để chuyển khu trong cùng chương. Nút la bàn ở góc trên mở danh sách 6 chương. Các map 1–9 đổi giữa hai phần quá khứ/hiện tại thật của ảnh khi nhấn Q; map 10–13 là không gian ký ức chỉ có một bản vẽ nền, vẫn cho phép đổi trạng thái câu đố.

Importer canvas tách từng ô sprite và xóa vùng trắng thông với biên, giữ màu bên trong nhân vật. Riêng map ngoại cảnh, cả các mảng trắng khép kín bên trong vòm cây/hàng rào được bỏ. Các tiêu đề/chú thích được loại bằng vùng cắt. Dùng nearest-neighbor để giữ nét pixel. Sheet gốc giữ nguyên trong `public/assets/pixel`; không phụ thuộc ổ D khi chạy game.

Các nền dài nối thành nhiều khu trong chương; tên khu, camera và dấu hồi sinh cập nhật khi đi qua ranh giới. Các bệ ở hang và tâm điểm có va chạm theo hình; ván bổ sung hiện rõ ở chỗ cần bắc cầu. Rơi khỏi bệ sẽ trở về dấu mốc gần nhất.

Bản cốt truyện vẫn có 6 chương và 2 kết thúc. Các ghi chép phụ ở nhà bếp, giếng, vườn và nhà kính bổ sung dấu vết về Linh. Xưởng có NPC ký ức Ông Ngoại. Hình An mới dùng cách xưng hô anh/em với Linh.

Ảnh tham khảo phân cảnh và nội thất được dùng để đối chiếu bố trí, không biến chữ chú thích thành giao diện trò chơi. Các asset tự tạo của bản trước được giữ trong `public/assets/art` nhưng bộ pixel là hình ảnh đang được sử dụng.

## Luồng hướng dẫn và ghép cảnh

Menu chính dùng cảnh sân và đồng hồ pixel từ bộ asset, chữ và nút phẳng gọn. Bấm **Chơi** → màn tải đồng hồ xoay/vỡ/ghép lại → truyện mở đầu → màn 1. Bấm **Tiếp tục** sẽ tải bản lưu mà không kể lại truyện. Tiến độ tải dựa trên 21 ảnh thật, không dùng số phần trăm giả.

Menu tạm dừng, âm lượng, hội thoại, chọn kết thúc và màn kết thúc dùng cùng bảng màu vàng cổ, nâu rỉ và rêu; nút tối thiểu 42–48 px, chữ chức năng 14–18 px. Âm lượng, tắt tiếng, tiếp tục, chơi lại, lưu khi về menu và hai nút kết thúc đã được kiểm tra trên trình duyệt.

Màn 1 chỉ giới thiệu A/D, Space và E: đọc lời nhắn trên ghế, tới cửa chính có sẵn trong map để vào nhà. Ngoài sân không có đồng hồ cổ hoặc cửa gỗ rời. Màn 2 mới nhặt đồng hồ bỏ túi trên bàn cạnh đèn, nhận hướng dẫn Q và thời gian hồi ba giây. Từ màn 3 không hiện bảng hướng dẫn điều khiển/mục tiêu chi tiết.

Các cửa và đồng hồ đã vẽ trong map chỉ có vùng tương tác, không bị vẽ thêm bản sao. Ảnh gia đình ở quá khứ dùng khung trên tường; ở hiện tại là khung hỏng nhỏ trên bàn. Gợi ý E đặt trên An, tên hành động hiển thị phía dưới. Màn 1 bắt đầu phía ngoài cổng sân ở x=220, camera đặt theo điểm bắt đầu. An dùng một sheet thống nhất và cùng tỉ lệ pixel ở các tư thế, không chuyển sang ảnh cầm đồng hồ khi đọc giấy. Thân An cao 84 đơn vị trong cả hình vẽ và va chạm; người lớn cùng tỉ lệ, Linh cao 60. Điểm xuất phát và bản lưu cũ được chỉnh theo cùng vị trí bàn chân.

## Xác minh

- TypeScript và production build đạt.
- 20 bài kiểm tra đạt: vật lý, chuỗi câu đố, đủ 13 map, vị trí tương tác/spawn và giới hạn nhảy của tuyến hang/tâm điểm.
- Edge headless: đi, nhảy, màn 1 vào nhà không cần Q; màn 2 nhặt đồng hồ bỏ túi rồi mới dùng Q, chuyển thời gian, tên khu và checkpoint, rơi/hồi sinh, cuộc truy đuổi không kết thúc sớm tại mốc cũ, bắt đầu lại về chương 1.
- Đã xem ảnh chụp menu, hiên nhà, phòng khách ở hai thời điểm, xưởng, phòng Linh, hang và tâm điểm. Không có page error hoặc ảnh 404 trong lượt kiểm tra.
- Chưa chơi thủ công trọn cả hai kết thúc trong bản đồ mới. Một số chuỗi dùng ít khung vì sheet nguồn là ảnh tổng hợp JPG; ảnh nền đã chứa sẵn nhiều đồ nội thất nên không phải đồ vật nào trong nền cũng tương tác được.

Nguồn: bộ ảnh người dùng cung cấp. Thông tin giấy phép/tác giả gốc chưa được đính kèm. Prompt tạo ảnh của phiên bản trước ở [ASSET-PROMPTS.md](ASSET-PROMPTS.md).

## Triển khai

Ứng dụng Vite tĩnh, build bằng `npm run build`, thư mục đầu ra `dist`, dùng Node.js 24. Vercel đọc cấu hình trong `vercel.json`. Không cần API key hoặc biến môi trường để chơi.

### Tỉ lệ và viền sprite

Các map nội thất (2–6 và 9) dùng chiều rộng phòng 800 đơn vị; cảnh ngoài trời dùng 1200. Map, bệ, cửa và điểm tương tác được chuyển cùng một phép biến đổi theo đường chân sàn. Thân An vẫn cao 84 ở mọi cảnh; camera chuyển độ phóng mượt khi qua cửa. Bản lưu cũ được chuyển tọa độ sang phòng tương ứng, không mất tiến độ.

Importer nhân vật lọc cả nền xám sáng do nén JPG, nối vùng nền theo tám hướng và loại các mảnh nhiễu rời. Màu áo, da và điểm sáng bên trong thân được giữ. Đã kiểm tra sprite phóng lớn và đếm pixel viền trung tính sáng còn thừa: 0 ở khung An được kiểm tra.

### Điện thoại

Canvas tự điều chỉnh tỉ lệ theo màn hình, không còn khung 16:9 nằm giữa các khoảng đen lớn khi chơi dọc. Nút cảm ứng trái/phải và nhảy dùng cùng đầu vào với bàn phím; E và Q dùng các nút tương tác trên HUD. Đã kiểm tra khung 390×844 và thao tác giữ nút di chuyển.


### Interactive puzzle update

- Chapter 2: obtain the replacement gear, inspect the stopped clock, then manually set its hands and wind it in the past. Inspect the result in the present to release the hallway latch.
- Chapter 4: inspect the lit wall in both timelines. One reveals the symbol order; the other reveals symbol-to-note associations. Enter a three-note melody with the six playable keys; incorrect entries leave the door locked.
- Chapter 6: read the final diary and derive the three ring settings from the accident time. The core stays locked until the rings are aligned.
- An's notebook records inspected clues, persists in saves, and can be reopened from the HUD or a mechanism. Future chapters stay locked in the chapter picker.
- Revised user-supplied `an-v2.jpg`: 23 cropped poses for walking, crouching, idle, thinking and escape running. Every pose uses the same source-pixel scale and foot baseline; sheet headings are excluded.


### Illustrated main menu

The user-provided split-time title illustration is the visual reference. `public/assets/menu/title-plate.png` is its clean background plate; `title-reference.png` preserves the supplied art for Linh's clipped animation. The canvas animates Linh's breathing and wave, An's revised idle/thinking poses, pocket-watch hands, pollen and rain. Hovering or tapping either character triggers a reaction. Reduced-motion preferences keep the scene still.

All four menu items are real controls. Continue requires a save, chapter selection respects saved progress, and audio preferences persist separately from the game save. New Game retains the loading → opening story → Chapter 1 flow. Portrait screens use larger controls below the illustration; short landscape screens use a four-button toolbar.
