# Asset tự tạo — THE LAST CHIME

Công cụ: built-in `imagegen`, không dùng CLI/API fallback. Các ảnh đã được chép vào repo và được game tải trực tiếp. Bộ Mossy người dùng cung cấp tiếp tục dùng cho bệ, mặt đất, dây leo, đá và cây cỏ.

## File

- `public/assets/art/forest-house.png`: ngoại cảnh và nền menu.
- `public/assets/art/clockmaker-interior.png`: nội thất dùng cho chương 2, 3, 4 và 6.
- `public/assets/art/an-sprites.png`: atlas nền trong suốt gồm đứng, hai bước đi và nhảy. Bộ dựng hình dò alpha trong từng ô, giữ cùng tỉ lệ và chân để tránh rung hình vì khoảng trống khác nhau.

Đây là hoạt ảnh ít khung phục vụ bản chơi hiện tại; chưa phải bộ animation đầy đủ cho mọi hành động. NPC ký ức và một số đồ vật vẫn dùng hình vẽ canvas.

## Prompt ngoại cảnh

Use case: stylized-concept. Asset type: wide landscape background painting for a playable 2D side scrolling game, THE LAST CHIME. Create an exquisitely illustrated abandoned family clockmaker's house swallowed by an ancient moss forest, with strong clear composition and atmospheric depth. Hand painted storybook game art, organic rounded moss leaves with fine ink contour lines, dark olive and forest green foliage matching hand drawn Mossy platform tiles. A ruined conservatory with tall arched windows and a sloped broken glass roof occupies the right half, an old wooden clockmaker workshop behind the arches, small warm amber lamplight deep inside. Massive ancient trees frame the left and right edges, arching branches overhead, sparse hanging ferns, pale teal moonlight shafts through the broken roof, a distant misty woodland and tiny fireflies. Left half has open atmospheric dark forest negative space. Side-on orthographic camera, clear flat playable floor line at 83 percent image height, no large foreground objects below it; ground dark with moss but no platforms or interactable props. Strong painterly shapes, restrained detail, cinematic warm gold versus cool teal lighting, enchanting melancholic mystery. Wide 16:9 landscape. NO characters, no UI, no text, no logos, no giant repeated leaf columns, no repeated stamped patterns. This must look like a cohesive professional indie adventure game background, not a mockup.

## Prompt nhân vật

Use case: stylized-concept. Asset type: production 2D game character sprite atlas, transparent background. A SINGLE HORIZONTAL ROW of EXACTLY FOUR separate full-body sprites of the SAME young adult Vietnamese female explorer named An, all in strict side profile facing RIGHT. Each sprite centered in its own equal-width quarter of the image, ample transparent padding between characters. All four are the exact same scale and design, their feet on the same horizontal baseline. From left to right: 1 neutral standing idle with arms relaxed; 2 walking stride left foot forward right foot back; 3 walking stride right foot forward left foot back; 4 midair jumping with knees bent and scarf trailing. Design: short chestnut bob hair, small muted teal hair clip, warm ochre/amber short hooded traveling cape and scarf over an olive dress, brown leather crossbody satchel, dark leggings and sturdy brown boots. Young adult proportions about 4 heads tall, not baby chibi. Distinct readable silhouette with expressive but tiny face, hand painted storybook adventure game art, fine dark contour outlines, softly shaded matte colors matching a dark mossy forest game. Mild warm rim lighting. Clean edges. No weapons, no ground, no background, no shadows outside character, no labels, no captions, no text, no effects, no UI. True transparent background. Wide landscape composition with four distinct unconnected sprites in ONE row.

## Prompt nội thất

Use case: stylized-concept. Asset type: wide 2D side scrolling adventure game interior background painting for THE LAST CHIME, paired with an exterior mossy forest clockmaker house. Paint the INSIDE of a long abandoned family clockmaker's conservatory and library, swallowed by woodland moss after ten years. Side-on orthographic cutaway view at ground level, not perspective looking into a corridor. A continuous panoramic room with readable atmospheric depth. On the left a clockmaker workbench with shelves of brass gears and antique clocks; center a high vaulted gallery with a broken mezzanine, tall arched windows looking onto misty blue green moonlit woods; on the right an intimate library and music room with faded family portraits, bookshelves and a small piano, a great circular astronomical clock set into the far wall. Climbing vines through broken roof glass, fern clusters on old stone, scattered paper. Flat uninterrupted walking floor at exactly 83 percent image height, dark soil and stone below it. All furniture small and pushed to back wall, NO large foreground props blocking the playable area. Fine ink outlines, richly hand painted storybook game art, warm amber lamps against cool teal moonlight, dark olive moss, melancholic enchanting mystery. Strong coherent architectural composition, never a repeated pattern. Wide landscape 16:9. No people, no creatures, no text, no UI, no floating platforms, no labels.

## Kiểm tra bản sửa giao diện

- TypeScript và production build đạt.
- 9 kiểm tra vật lý / giải đố đạt.
- Edge headless: đi, nhảy, tương tác đồng hồ, mở khóa và chuyển Q, chọn cả sáu chương đạt; không có page error hoặc HTTP 404.
- Đã xem ảnh chụp menu 1440×900, menu 900×600, ngoại cảnh và nội thất trong game.
- Font Noto Serif và Be Vietnam Pro được đóng gói cùng ứng dụng, không cần gọi Google Fonts khi chạy.
