import type { PuzzleState } from '../types/game';
import { bossDefeated } from './encounters';

export interface HintSet {
  /** Identifies the current objective step; the tier resets when it changes. */
  key: string;
  /** Hints from gentle to explicit. */
  tiers: string[];
}

/** Progressive hints (gentle → explicit) for the player's current objective. */
export function getHintSet(p: PuzzleState, chapter: number, roomName: string): HintSet {
  const set = (key: string, ...tiers: string[]): HintSet => ({ key, tiers });
  switch (chapter) {
    case 1:
      if (!p.tutorialMoved) return set('c1-move', 'Hãy đi sang phải, về phía hiên nhà.', 'Giữ phím D hoặc mũi tên phải.', 'Trên điện thoại, dùng nút → ở góc màn hình.');
      if (!p.motherNoteCh1Read) return set('c1-note', 'Có một vật nhỏ nằm gần chiếc ghế.', 'Đi tới gần ghế, nút E sẽ hiện tên vật có thể kiểm tra.', 'Đứng cạnh ghế dưới hiên và nhấn E để đọc mẩu giấy.');
      return set('c1-door', 'Lời nhắn của Mẹ nói về cách mở chốt cửa.', 'Tới cửa chính và nhấn E để xem chốt.', 'Xoay hai vòng hình của chốt cửa theo gợi ý trong mẩu giấy.');
    case 2:
      if (p.currentStage === 3) {
        if (!p.hallwayPassageCleared) return set('c2-well', 'Tay quay giếng khác nhau giữa hai thời điểm.', 'Đọc hai dấu còn sót trên tay quay ở Hiện tại, rồi dùng Q sang Quá khứ.', 'Ở Quá khứ chỉnh bộ truyền động của giếng theo hai dấu đã đọc, rồi kéo gàu.');
        if (!p.motherDiaryCh3Read) return set('c2-box', 'Chiếc gàu đã mang lên một thứ.', 'Kiểm tra hộp sắt ở giếng.', 'Nhấn E ở hộp sắt để lấy chìa và đọc nhật ký của Mẹ.');
        return set('c2-linh', 'Chìa khóa mang tên Linh.', 'Quay lại hành lang.', 'Cửa phòng Linh ở hành lang, nay đã mở được bằng chìa.');
      }
      if (p.currentStage === 4) {
        if (!p.musicBoxPlayed) return set('c2-music', 'Các hình vẽ trong phòng Linh đổi khác giữa hai thời điểm.', 'Quá khứ cho thứ tự hình vẽ, Hiện tại cho liên hệ giữa hình và nốt nhạc.', 'Ghi lại cả hai vào sổ tay, rồi gảy đúng ba nốt trên sáu phím. Gảy sai thì chốt không mở.');
        if (!p.greenhouseAligned) return set('c2-green', 'Nhà kính có một mạch sáng và tấm đồng bị che khuất.', 'Tìm mẫu đích ở Hiện tại, rồi sửa mạch ở Quá khứ.', 'Ba cần điều khiển làm các dải sáng chồng lên nhau. Chỉnh từng cần cho tới khi các dải khớp mẫu đích.');
        if (!p.motherNoteCh4Read) return set('c2-plan', 'Còn một bản vẽ của Mẹ chưa đọc.', 'Tìm bản vẽ trong nhà kính.', 'Kiểm tra bản vẽ bằng E. Cổng rừng đòi cả chốt nhạc và bản vẽ này.');
        return set('c2-forest', 'Mạch sáng đã nối tới cổng rừng.', 'Đi tiếp về phía cổng rừng.', 'Cổng rừng đã mở, đi theo mạch sáng.');
      }
      if (!p.hasWatch) return set(roomName.includes('Hành lang') ? 'c2-hall' : 'c2-watch', 'Chiếc đồng hồ bỏ túi ở phòng khách.', 'Từ hành lang, đi tới cửa phòng khách và nhấn E.', 'Vào phòng khách, kiểm tra đồng hồ bỏ túi để nhặt.');
      if (!p.testedTimelineSwitch) return set('c2-q', 'Chiếc đồng hồ cho phép đổi thời điểm.', 'Nhấn Q.', 'Nhấn Q để sang Quá khứ. Sau mỗi lần đổi phải chờ 3 giây.');
      if (!p.clockRepaired) return p.clockGearFound
        ? set('c2-fix', 'Bánh răng đã có, giờ cần đồng hồ lớn.', 'Đồng hồ lớn ở phòng khách, phải ở Quá khứ.', 'Ở Quá khứ, kiểm tra đồng hồ lớn để lắp bánh răng, chỉnh kim và lên dây cót.')
        : set('c2-gear', 'Đồng hồ lớn thiếu một bánh răng.', 'Bánh răng nằm ở xưởng đồng hồ, trong Quá khứ.', 'Sang Quá khứ, vào xưởng đồng hồ và kiểm tra bàn để nhặt bánh răng.');
      if (!p.clockInspectedPresent) return set('c2-check', 'Giờ đồng hồ đã chạy ở Quá khứ.', 'Hãy nhìn nó ở Hiện tại.', 'Nhấn Q về Hiện tại, kiểm tra đồng hồ lớn ở phòng khách.');
      return set('c2-back', 'Cửa sau đã mở.', 'Quay ra hành lang rồi vào nhà bếp.', 'Từ nhà bếp, đi qua cửa ra sân sau.');
    case 3:
      return p.chaseSealsComplete
        ? set('c3-gate', 'Cả ba ấn đã đủ.', 'Cổng cộng hưởng ở đảo cuối.', 'Chạy tới đảo cuối và nhấn E ở cổng.')
        : set('c3-seals', 'Có ba ấn, mỗi ấn chỉ lấy được ở một thời điểm.', 'Thứ tự là Quá khứ, Hiện tại, rồi Quá khứ. Cổng báo ấn còn thiếu.', 'Dùng Q để đổi thời điểm qua vật cản, nhảy qua bệ đá, và nhấn R để làm chậm cái bóng khi nó tới gần.');
    case 4:
      if (!bossDefeated(p)) return set('c4-boss', 'Kẻ Lạc Giờ chỉ yếu khi cơ cấu mở ra.', 'Mỗi bẫy dùng một lần: nạp ở Quá khứ, dụ nó vào Hiện tại, rồi xả khi điểm yếu mở.', 'Cần trúng ba bẫy. Cuốn nhật ký ở bệ đá thấp bên trái cũng có manh mối.');
      if (!p.finalDiaryCh6Read) return set('c4-diary', 'Còn một cuốn nhật ký.', 'Nó ở bệ đá thấp bên trái.', 'Tới bệ đá thấp bên trái và nhấn E.');
      if (!p.finalCoreAligned) return set('c4-core', 'Trụ cạnh lõi cần được chỉnh.', 'Làm ở Quá khứ, dựa vào ghi chép của Mẹ.', 'Suy ra ba vòng số từ giờ tai nạn trong nhật ký. Lõi vẫn khóa khi các vòng chưa khớp.');
      return set('c4-end', 'Lõi thời gian đang chờ.', 'Tới lõi và nhấn E.', 'Nhấn E ở lõi để đưa ra lựa chọn kết thúc.');
    default:
      return set('none');
  }
}
