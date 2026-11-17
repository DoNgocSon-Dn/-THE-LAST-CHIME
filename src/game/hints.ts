import type { PuzzleState } from '../types/game';
import { bossDefeated } from './encounters';
import {cooldownLabel} from './controls';

export interface HintSet {
  /** Identifies the current objective step; the tier resets when it changes. */
  key: string;
  /** Hints from gentle to explicit. */
  tiers: [string,string,string];
}

/** Progressive hints (gentle → explicit) for the player's current objective. */
export function getHintSet(p: PuzzleState, chapter: number, roomName: string): HintSet {
  const set = (key: string, ...tiers: [string,string,string]): HintSet => ({ key, tiers });
  switch (chapter) {
    case 1:
      if (!p.tutorialMoved) return set('c1-move', 'Hãy đi sang phải, về phía hiên nhà.', 'Giữ phím D hoặc mũi tên phải.', 'Trên điện thoại, dùng nút → ở góc màn hình.');
      if (!p.motherNoteCh1Read) return set('c1-note', 'Có một vật nhỏ nằm gần chiếc ghế.', 'Đi tới gần ghế, nút E sẽ hiện tên vật có thể kiểm tra.', 'Đứng cạnh ghế dưới hiên và nhấn E để đọc mẩu giấy.');
      return set('c1-door', 'Lời nhắn của Mẹ nói về cách mở chốt cửa.', 'Tới cửa chính và nhấn E để xem chốt.', 'Đặt vòng bên trái là Trăng, bên phải là Mặt trời, rồi kéo chốt cửa.');
    case 2:
      if (p.currentStage === 3) {
        if (!p.hallwayPassageCleared) return set('c2-well', 'Tay quay giếng khác nhau giữa hai thời điểm.', 'Đọc hai dấu còn sót trên tay quay ở Hiện tại, rồi dùng Q sang Quá khứ.', 'Ở Quá khứ, đặt bánh răng bên trái ở nấc 2, bên phải ở nấc 1, rồi chọn Quay tay giếng.');
        if (!p.motherDiaryCh3Read) return set('c2-box', 'Chiếc gàu đã mang lên một thứ.', 'Kiểm tra hộp sắt ở giếng.', 'Nhấn E ở hộp sắt để lấy chìa và đọc nhật ký của Mẹ.');
        return set('c2-linh', 'Chìa khóa mang tên Linh.', 'Quay lại hành lang.', 'Dùng Q về Quá khứ, tới cửa phòng Linh trong hành lang và nhấn E; chìa từ hộp sắt sẽ mở khóa.');
      }
      if (p.currentStage === 4) {
        if (!p.musicBoxPlayed) return set('c2-music', 'Các hình vẽ trong phòng Linh đổi khác giữa hai thời điểm.', 'Quá khứ cho thứ tự hình vẽ, Hiện tại cho liên hệ giữa hình và nốt nhạc.', 'Ở Quá khứ, xóa đoạn nhạc rồi gảy Mi → Sol → Đô cao, sau đó kéo cần phát nhạc.');
        if (!p.greenhouseAligned) return set('c2-green', 'Nhà kính có một mạch sáng và tấm đồng bị che khuất.', 'Tìm mẫu đích ở Hiện tại, rồi sửa mạch ở Quá khứ.', 'Ở Quá khứ, mẫu đích là I Sáng, II Tắt, III Tắt. Từ ba dải đều tắt, gạt cần A → B → C mỗi cần một lần, rồi kiểm tra dòng sáng.');
        if (!p.motherNoteCh4Read) return set('c2-plan', 'Còn một bản vẽ của Mẹ chưa đọc.', 'Tìm bản vẽ trong nhà kính.', 'Kiểm tra bản vẽ bằng E. Cổng rừng đòi cả chốt nhạc và bản vẽ này.');
        return set('c2-forest', 'Mạch sáng đã nối tới cổng rừng.', 'Đi tiếp về phía cổng rừng.', 'Dùng Q về Hiện tại, tới cổng rừng trong nhà kính và nhấn E để mở cổng.');
      }
      if (!p.hasWatch) return set(roomName.includes('Hành lang') ? 'c2-hall' : 'c2-watch', 'Chiếc đồng hồ bỏ túi ở phòng khách.', 'Từ hành lang, đi tới cửa phòng khách và nhấn E.', 'Vào phòng khách, kiểm tra đồng hồ bỏ túi để nhặt.');
      if (!p.testedTimelineSwitch) return set('c2-q', 'Chiếc đồng hồ cho phép đổi thời điểm.', 'Nhấn Q.', `Nhấn Q để sang Quá khứ. Sau mỗi lần đổi phải chờ ${cooldownLabel()} giây.`);
      if (!p.clockRepaired) return p.clockGearFound
        ? set('c2-fix', 'Bánh răng đã có, giờ cần đồng hồ lớn.', 'Đồng hồ lớn ở phòng khách, phải ở Quá khứ.', 'Ở Quá khứ, mở đồng hồ lớn, đặt giờ 3 và phút 15, rồi chọn Lên dây cót.')
        : set('c2-gear', 'Đồng hồ lớn thiếu một bánh răng.', 'Bánh răng nằm ở xưởng đồng hồ, trong Quá khứ.', 'Sang Quá khứ, vào xưởng đồng hồ và kiểm tra bàn để nhặt bánh răng.');
      if (!p.clockInspectedPresent) return set('c2-check', 'Giờ đồng hồ đã chạy ở Quá khứ.', 'Hãy nhìn nó ở Hiện tại.', 'Nhấn Q về Hiện tại, kiểm tra đồng hồ lớn ở phòng khách.');
      return set('c2-back', 'Cửa sau đã mở.', 'Quay ra hành lang rồi vào nhà bếp.', 'Từ nhà bếp, đi qua cửa ra sân sau.');
    case 3:
      return p.chaseSealsComplete
        ? set('c3-gate', 'Cả ba ấn đã đủ.', 'Cổng cộng hưởng ở đảo cuối.', 'Chạy tới đảo cuối và nhấn E ở cổng.')
        : set('c3-seals', 'Có ba ấn, mỗi ấn chỉ lấy được ở một thời điểm.', 'Thứ tự là Quá khứ, Hiện tại, rồi Quá khứ. Cổng báo ấn còn thiếu.', 'Ấn 1 ở cuối rừng trong Quá khứ; ấn 2 ở đoạn đầu hang trong Hiện tại; ấn 3 ở lối vào ký ức đứt gãy trong Quá khứ. Tới mỗi ấn và nhấn E; dùng R khi cái bóng tới gần.');
    case 4:
      if (!bossDefeated(p)) return set('c4-boss', 'Kẻ Lạc Giờ chỉ yếu khi cơ cấu mở ra.', 'Mỗi bẫy dùng một lần: nạp ở Quá khứ, dụ nó vào Hiện tại, rồi xả khi điểm yếu mở.', 'Với từng bẫy 1, 2 và 3: nhấn E ở Quá khứ để nạp, dùng Q về Hiện tại, dụ cái bóng tới gần bẫy ở cùng độ cao. Khi báo Lộ điểm yếu xuất hiện, nhấn E ngay tại bẫy để xả. Mỗi bẫy chỉ phá một lớp vỏ; cần đủ cả ba.');
      if (!p.finalDiaryCh6Read) return set('c4-diary', 'Còn một cuốn nhật ký.', 'Nó ở bệ đá thấp bên trái.', 'Tới bệ đá thấp bên trái và nhấn E.');
      if (!p.finalCoreAligned) return set('c4-core', 'Trụ cạnh lõi cần được chỉnh.', 'Làm ở Quá khứ, dựa vào ghi chép của Mẹ.', 'Đọc nhật ký rồi dùng Q về Quá khứ. Tại trụ cộng hưởng, đặt vòng ngoài 3, vòng giữa 1, vòng trong 5 (giờ tai nạn 3:15), rồi chọn Ghép nhịp.');
      return set('c4-end', 'Lõi thời gian đang chờ.', 'Tới lõi và nhấn E.', 'Nhấn E ở lõi để đưa ra lựa chọn kết thúc.');
    default:
      return set('none','Quan sát khu vực xung quanh.','Tới gần đồ vật để xem tên tương tác.','Nhấn E ở đồ vật có dấu tương tác, hoặc mở sổ tay để đọc lại manh mối.');
  }
}
