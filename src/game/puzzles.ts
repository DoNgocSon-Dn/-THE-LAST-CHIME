import { DialogueLine, PuzzleState, Timeline } from '../types/game';

export const INITIAL_PUZZLE_STATE: PuzzleState = {
  currentStage: 1,
  motherNoteCh1Read: false,
  hasWatch: false,
  testedTimelineSwitch: false,
  clockGearFound: false,
  clockRepaired: false,
  clockInspectedPresent: false,
  hallwayPassageCleared: false,
  motherDiaryCh3Read: false,
  lightSwitchOn: false,
  lightRuneFound: false,
  motherNoteCh4Read: false,
  musicBoxPlayed: false,
  finalDoorUnlocked: false,
  chaseStarted: false,
  chaseCompleted: false,
  finalDiaryCh6Read: false,
  finalCoreAligned: false
};

export interface InteractionResult {
  success: boolean;
  messageVi: string;
  speechBubbleVi?: string;
  soundEvent?: 'clock_wind' | 'clock_tick' | 'switch_flip' | 'chime_success' | 'door_unlock' | 'paper_rustle';
  updatedPuzzles: PuzzleState;
  dialogue?: DialogueLine[];
  showNote?: {
    title: string;
    content: string;
    author?: string;
  };
  advanceToStage?: number;
  triggerOmen?: boolean;
  triggerFinalChoice?: boolean;
  triggerEnding?: boolean;
}

/**
 * Handle interaction with game objects depending on current timeline, stage, and puzzle progression
 */
export function processInteraction(
  objectId: string,
  timeline: Timeline,
  currentPuzzles: PuzzleState
): InteractionResult {
  const nextPuzzles = { ...currentPuzzles };

  switch (objectId) {
    // =========================================================================
    // MÀN 1 (CHƯƠNG 1 — TRỞ VỀ)
    // =========================================================================
    case 'entrance_journal': {
      return {
        success: true,
        messageVi: 'An nhìn lại bức thư nặc danh và chiếc kim đồng hồ gãy.',
        speechBubbleVi: '“Đừng để nó điểm giờ lần nữa...”',
        soundEvent: 'paper_rustle',
        updatedPuzzles: nextPuzzles,
        dialogue: [
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'sad',
            text: 'Mười năm rồi mình mới dám bước chân về lại hiên nhà này... Mùi gỗ ẩm và tiếng mưa đêm vẫn chẳng khác gì đêm hôm ấy.'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'determined',
            text: 'Trong phong thư nặc danh gửi đến tuần trước chỉ có chiếc KIM ĐỒNG HỒ GÃY này cùng lời nhắn: “Đừng để nó điểm giờ lần nữa.” Ai là người đã gửi nó cho mình?'
          }
        ],
        showNote: {
          title: 'Bức Thư Không Đề Tên & Chiếc Kim Gãy',
          content: '“Đừng để nó điểm giờ lần nữa.”',
          author: 'Kỷ vật của An'
        }
      };
    }

    case 'mother_note_ch1': {
      nextPuzzles.motherNoteCh1Read = true;
      return {
        success: true,
        messageVi: 'An đọc mảnh ghi chú của Mẹ để lại trên bàn sảnh.',
        speechBubbleVi: 'Nét chữ của Mẹ vẫn còn đây...',
        soundEvent: 'paper_rustle',
        updatedPuzzles: nextPuzzles,
        dialogue: [
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'surprised',
            text: 'Trên bàn vẫn còn mảnh giấy viết tay của Mẹ! Để xem Mẹ đã ghi lại điều gì trước đêm xảy ra tai nạn...'
          },
          {
            speaker: 'ME',
            speakerName: 'Ký Ức Của Mẹ (Qua Trang Giấy)',
            emotion: 'whisper',
            text: '“An và Linh của mẹ... Nếu có chuyện bất trắc xảy ra, hãy nhớ: Chiếc kim đồng hồ là VẬT DẪN duy nhất, còn đồng hồ quả lắc cổ là NGUỒN DUY TRÌ liên kết giữa hai bờ thời gian.”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'determined',
            text: 'Vậy ra chiếc kim gãy trong tay mình cần được chạm vào chiếc Đồng Hồ Quả Lắc Cổ ngay phía trước!'
          }
        ],
        showNote: {
          title: 'Mảnh Ghi Chú Của Mẹ',
          content: 'Chiếc kim đồng hồ là vật dẫn duy nhất, còn cỗ máy đồng hồ cổ là nguồn duy trì liên kết.',
          author: 'Nét chữ của Mẹ'
        }
      };
    }

    // Legacy alias support for unit tests
    case 'pocket_watch_box': {
      nextPuzzles.hasWatch = true;
      return {
        success: true,
        messageVi: 'Chiếc kim đồng hồ gãy cộng hưởng với cơ chế cổ! Khả năng Chuyển Đổi Thời Gian [Q] đã mở khóa!',
        soundEvent: 'chime_success',
        updatedPuzzles: nextPuzzles,
        showNote: {
          title: 'Sự Cộng Hưởng Thời Gian',
          content: 'Hãy nhấn phím [Q] để chuyển đổi giữa Quá Khứ và Hiện Tại!',
          author: 'Liên kết Thời Gian'
        }
      };
    }

    case 'clock': {
      // Màn 1: Chạm kim đồng hồ gãy vào đồng hồ cổ lần đầu tiên để mở khóa [Q]
      if (!nextPuzzles.hasWatch && timeline === 'PRESENT') {
        nextPuzzles.hasWatch = true;
        return {
          success: true,
          messageVi: 'Chiếc kim gãy phát sáng cộng hưởng với đồng hồ cổ! Đã mở khóa chuyển đổi thời gian [Q]!',
          speechBubbleVi: 'Chiếc kim đang phát sáng... Không gian rung chuyển rồi!',
          soundEvent: 'chime_success',
          updatedPuzzles: nextPuzzles,
          dialogue: [
            {
              speaker: 'AN',
              speakerName: 'An',
              emotion: 'surprised',
              text: 'Á—! Ngay khi mình đưa mũi kim đồng hồ gãy chạm vào mặt kính nứt, một luồng ánh sáng ấm áp tỏa ra từ sâu trong lồng máy!'
            },
            {
              speaker: 'ME',
              speakerName: 'Tiếng Vọng Của Mẹ',
              emotion: 'whisper',
              text: '“Khi kim đồng hồ chạm vào cỗ máy gốc, hai thời điểm của ngôi nhà — Quá Khứ trước đêm tai nạn và Hiện Tại hoang tàn — sẽ kết nối làm một...”'
            },
            {
              speaker: 'AN',
              speakerName: 'An',
              emotion: 'determined',
              text: 'Mình cảm nhận được nhịp đập của ngôi nhà ở phía bên kia thời gian! Hãy nhấn phím [Q] để thử chuyển đổi sang QUÁ KHỨ rồi mở cánh cửa bên phải qua Màn 2!'
            }
          ],
          showNote: {
            title: 'Liên Kết Hai Dòng Thời Gian',
            content: 'Đã mở khóa khả năng chuyển đổi thời gian [Q]!',
            author: 'Cơ chế Đồng Hồ Cổ'
          }
        };
      }

      // Nếu đang ở Màn 1 tại HIỆN TẠI và đã mở khóa [Q] (nhưng chưa sửa đồng hồ ở Màn 2)
      if (nextPuzzles.currentStage === 1 && timeline === 'PRESENT' && !nextPuzzles.clockRepaired) {
        nextPuzzles.testedTimelineSwitch = true;
        return {
          success: false,
          messageVi: 'Đồng hồ ở Hiện Tại đã ngừng chạy. Hãy nhấn [Q] thử chuyển thời gian rồi qua Cửa Màn 2 bên phải!',
          speechBubbleVi: 'Thử nhấn [Q] rồi qua cánh cửa bên phải sang Màn 2 nhé!',
          soundEvent: 'clock_tick',
          updatedPuzzles: nextPuzzles,
          dialogue: [
            {
              speaker: 'AN',
              speakerName: 'An',
              emotion: 'normal',
              text: 'Chiếc đồng hồ đã truyền năng lượng vào kim đồng hồ trong tay mình. Hãy nhấn [Q] để cảm nhận dòng thời gian Quá Khứ, sau đó tiến tới cánh cửa cuối sảnh để bước sang Màn 2!'
            }
          ]
        };
      }

      // Màn 2 (Chương 2): Sửa đồng hồ ở QUÁ KHỨ & kiểm tra ở HIỆN TẠI
      if (timeline === 'PAST') {
        nextPuzzles.hasWatch = true;
        nextPuzzles.testedTimelineSwitch = true;

        if (!nextPuzzles.clockRepaired) {
          nextPuzzles.clockRepaired = true;
          nextPuzzles.clockGearFound = true;
          return {
            success: true,
            messageVi: 'An đã lắp bộ bánh răng đồng vào đồng hồ trong Quá Khứ! Tiếng tích tắc vang vọng xuyên thời gian!',
            speechBubbleVi: 'Đồng hồ chạy lại rồi! Giờ quay về Hiện Tại [Q] kiểm tra thôi!',
            soundEvent: 'clock_wind',
            updatedPuzzles: nextPuzzles,
            dialogue: [
              {
                speaker: 'AN',
                speakerName: 'An',
                emotion: 'determined',
                text: 'Khớp vừa khít! Mình đã lắp bộ bánh răng đồng thau vào trục chính và lên dây cót cho con lắc trong Quá Khứ.'
              },
              {
                speaker: 'ME',
                speakerName: 'Ký Ức Của Mẹ',
                emotion: 'normal',
                text: '“Những gì được sửa chữa ở Quá Khứ sẽ lưu giữ động năng sang tận Hiện Tại. Con hãy quay về Hiện Tại [Q] và kiểm tra đồng hồ để mở chốt cửa hành lang nhé.”'
              }
            ],
            showNote: {
              title: 'Đồng Hồ Đã Hoạt Động Trở Lại',
              content: 'Hãy nhấn [Q] quay về HIỆN TẠI và kiểm tra đồng hồ để mở cửa sang Màn 3!',
              author: 'Quan hệ Nhân - Quả Thời Gian'
            }
          };
        }

        return {
          success: true,
          messageVi: 'Đồng hồ cổ trong Quá Khứ đang chạy đều đặn. Hãy nhấn [Q] sang Hiện Tại để kiểm tra kết quả!',
          speechBubbleVi: 'Nhấn [Q] về Hiện Tại để mở chốt cửa thôi!',
          soundEvent: 'clock_tick',
          updatedPuzzles: nextPuzzles
        };
      } else {
        // PRESENT (Màn 2)
        if (nextPuzzles.clockRepaired) {
          if (!nextPuzzles.clockInspectedPresent) {
            nextPuzzles.clockInspectedPresent = true;
            return {
              success: true,
              messageVi: 'Nhờ được sửa ở Quá Khứ, đồng hồ Hiện Tại đã kéo dây cáp mở khóa Cửa Sang Màn 3!',
              speechBubbleVi: 'Cửa sang Màn 3 mở rồi!',
              soundEvent: 'door_unlock',
              updatedPuzzles: nextPuzzles,
              dialogue: [
                {
                  speaker: 'AN',
                  speakerName: 'An',
                  emotion: 'surprised',
                  text: 'Kỳ diệu thật... Dù đã trôi qua mười năm, con lắc ở Hiện Tại vẫn đang nhịp nhàng đung đưa nhờ lần sửa chữa trong Quá Khứ!'
                },
                {
                  speaker: 'AN',
                  speakerName: 'An',
                  emotion: 'determined',
                  text: 'Dây cáp cơ khí nối từ chân đồng hồ đã rút chốt sắt bên phải. Mình có thể bước qua cánh cửa để sang Màn 3: Hành Lang Ký Ức rồi!'
                }
              ],
              showNote: {
                title: 'Cơ Chế Mở Cửa Hành Lang',
                content: 'Lối đi sang Chương 3 đã mở!',
                author: 'Đồng Hồ Cổ'
              }
            };
          }
          return {
            success: true,
            messageVi: 'Cửa cơ khí đã mở! Hãy đi tới cánh cửa bên phải để qua Màn 3.',
            speechBubbleVi: 'Tiến tới cửa bên phải để sang Màn 3!',
            soundEvent: 'clock_tick',
            updatedPuzzles: nextPuzzles
          };
        } else {
          return {
            success: false,
            messageVi: 'Đồng hồ ở Hiện Tại bị gãy trục bánh răng và dừng ở 3:15. Hãy chuyển sang QUÁ KHỨ [Q] để sửa nó!',
            speechBubbleVi: 'Kim đồng hồ kẹt cứng ở 3:15... Phải sang Quá Khứ [Q] sửa nó!',
            updatedPuzzles: nextPuzzles,
            dialogue: [
              {
                speaker: 'AN',
                speakerName: 'An',
                emotion: 'sad',
                text: 'Mặt kính đồng hồ ở Hiện Tại vỡ nát, hai chiếc kim kẹt cứng ở đúng 3 giờ 15 phút — thời khắc bé Linh biến mất.'
              },
              {
                speaker: 'AN',
                speakerName: 'An',
                emotion: 'determined',
                text: 'Ở Hiện Tại bánh răng đã mục nát hết rồi. Mình phải nhấn [Q] trở về QUÁ KHỨ, tìm bộ bánh răng dự phòng trên lò sưởi và sửa chiếc đồng hồ lúc nó còn nguyên vẹn!'
              }
            ]
          };
        }
      }
    }

    case 'stage_exit_1': {
      if (!nextPuzzles.hasWatch) {
        return {
          success: false,
          messageVi: 'Cánh cửa dẫn vào phòng trong đang khóa. Hãy đọc ghi chú của Mẹ và chạm vào Đồng Hồ Cổ trước!',
          speechBubbleVi: 'Mình cần kiểm tra chiếc Đồng Hồ Cổ ở giữa sảnh trước đã!',
          updatedPuzzles: nextPuzzles
        };
      }
      if (!nextPuzzles.testedTimelineSwitch) {
        return {
          success: false,
          messageVi: 'Hãy nhấn phím [Q] ít nhất 1 lần để thử nghiệm chuyển đổi thời gian trước khi qua Màn 2!',
          speechBubbleVi: 'Thử nhấn phím [Q] chuyển thời gian trước khi vào trong nhé!',
          updatedPuzzles: nextPuzzles
        };
      }
      nextPuzzles.currentStage = 2;
      return {
        success: true,
        messageVi: 'Chuyển sang Màn 2 — Chương 2: Chiếc Đồng Hồ Ngừng Chạy!',
        soundEvent: 'door_unlock',
        updatedPuzzles: nextPuzzles,
        advanceToStage: 2
      };
    }

    // =========================================================================
    // MÀN 2 (CHƯƠNG 2 — CHIẾC ĐỒNG HỒ NGỪNG CHẠY)
    // =========================================================================
    case 'npc_mother_ch2': {
      return {
        success: true,
        messageVi: 'An lắng nghe bóng hình ký ức của Mẹ bên bàn sửa đồng hồ.',
        speechBubbleVi: 'Mẹ ơi... là bóng hình của Mẹ trong quá khứ!',
        soundEvent: 'chime_success',
        updatedPuzzles: nextPuzzles,
        dialogue: [
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'sad',
            text: 'Mẹ...! Hình bóng của Mẹ đang cặm cụi ghi chép bên chiếc đồng hồ... Dù chỉ là dư ảnh của Quá Khứ, tim mình vẫn nhói lên khi nhìn thấy Mẹ.'
          },
          {
            speaker: 'ME',
            speakerName: 'Ký Ức Của Mẹ',
            emotion: 'normal',
            text: '“Bộ bánh răng hồi bằng đồng thau mình cất tạm trên BỆ LÒ SƯỞI ĐÁ bên phải... Phải lắp nó vào đồng hồ trước khi con lắc lệch nhịp hoàn toàn.”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'determined',
            text: 'Bệ lò sưởi ở phía bên phải! Mình có thể nhảy qua chiếc ghế đẩu để lấy Bộ Bánh Răng và lắp vào chiếc đồng hồ giúp Mẹ!'
          }
        ]
      };
    }

    case 'clock_gear': {
      if (timeline === 'PAST') {
        nextPuzzles.clockGearFound = true;
        return {
          success: true,
          messageVi: 'Đã nhặt Bộ Bánh Răng Hồi Cơ Khí trên bệ lò sưởi! Hãy đem lại sửa Đồng Hồ Cổ.',
          speechBubbleVi: 'Đã lấy được Bộ Bánh Răng đồng thau!',
          soundEvent: 'chime_success',
          updatedPuzzles: nextPuzzles,
          dialogue: [
            {
              speaker: 'AN',
              speakerName: 'An',
              emotion: 'determined',
              text: 'Tìm thấy rồi! Bộ bánh răng đồng thau của Ông Ngoại vẫn còn sáng bóng. Giờ hãy quay lại chiếc Đồng Hồ Cổ ở giữa phòng để lắp nó vào!'
            }
          ]
        };
      }
      return {
        success: false,
        messageVi: 'Bộ bánh răng chỉ còn nguyên vẹn ở Quá Khứ.',
        updatedPuzzles: nextPuzzles
      };
    }

    case 'stage_exit_2': {
      if (!nextPuzzles.clockInspectedPresent) {
        return {
          success: false,
          messageVi: 'Cánh cửa cơ khí chưa mở hoàn toàn! Hãy sửa đồng hồ ở Quá Khứ rồi kiểm tra nó ở Hiện Tại [E].',
          speechBubbleVi: 'Phải sửa đồng hồ ở Quá Khứ rồi kiểm tra lại ở Hiện Tại trước!',
          updatedPuzzles: nextPuzzles
        };
      }
      nextPuzzles.currentStage = 3;
      return {
        success: true,
        messageVi: 'Chuyển sang Màn 3 — Chương 3: Hành Lang Ký Ức!',
        soundEvent: 'door_unlock',
        updatedPuzzles: nextPuzzles,
        advanceToStage: 3
      };
    }

    // =========================================================================
    // MÀN 3 (CHƯƠNG 3 — HÀNH LANG KÝ ỨC)
    // =========================================================================
    case 'hallway_pulley': {
      if (timeline === 'PAST') {
        if (!nextPuzzles.hallwayPassageCleared) {
          nextPuzzles.hallwayPassageCleared = true;
          return {
            success: true,
            messageVi: 'Kẽo kẹt! Bạn kéo cần trục ròng rọc trong Quá Khứ, gia cố dầm trần nhà! Đống đổ nát ở Hiện Tại đã biến mất!',
            speechBubbleVi: 'Đã khóa cáp gia cố trần nhà! Lối đi Hiện Tại thông thoáng rồi!',
            soundEvent: 'door_unlock',
            updatedPuzzles: nextPuzzles,
            dialogue: [
              {
                speaker: 'AN',
                speakerName: 'An',
                emotion: 'determined',
                text: 'Kẽo kẹt...! Mình đã kéo căng dây cáp thép trên gác lửng, cố định chắc chắn thanh dầm gỗ trần nhà trong Quá Khứ!'
              },
              {
                speaker: 'AN',
                speakerName: 'An',
                emotion: 'normal',
                text: 'Khi trần nhà được gia cố từ mười năm trước, nó sẽ không còn bị sập ở Hiện Tại nữa. Đống đổ nát chắn ngang bên dưới đã biến mất rồi!'
              }
            ],
            showNote: {
              title: 'Thay Đổi Quá Khứ — Mở Đường Hiện Tại',
              content: 'Đống đổ nát ở Hiện Tại đã biến mất!',
              author: 'Cơ chế Ròng Rọc'
            }
          };
        }
        return {
          success: true,
          messageVi: 'Trục ròng rọc đã được khóa chặt, hành lang ở cả hai thời điểm đều đã thông suốt.',
          speechBubbleVi: 'Dầm trần nhà đã được gia cố chắc chắn.',
          soundEvent: 'switch_flip',
          updatedPuzzles: nextPuzzles
        };
      }
      return {
        success: false,
        messageVi: 'Trục ròng rọc ở Hiện Tại đã gãy rời. Hãy kích hoạt nó trong Quá Khứ!',
        updatedPuzzles: nextPuzzles
      };
    }

    case 'mother_diary_ch3': {
      const firstTime = !nextPuzzles.motherDiaryCh3Read;
      nextPuzzles.motherDiaryCh3Read = true;
      return {
        success: true,
        messageVi: 'Khi An đọc nhật ký của Mẹ, bóng hình Kẻ Lạc Giờ thoáng hiện ra cuối hành lang!',
        speechBubbleVi: 'Ai đó vừa xuất hiện trong bóng tối cuối hành lang...!',
        soundEvent: 'paper_rustle',
        updatedPuzzles: nextPuzzles,
        triggerOmen: firstTime,
        dialogue: [
          {
            speaker: 'ME',
            speakerName: 'Nhật Ký Của Mẹ',
            emotion: 'whisper',
            text: '“Ngày 14 tháng 10 — Chiếc đồng hồ của Ông Ngoại đang rò rỉ những mảnh ký ức bị mắc kẹt. Mấy đêm nay bé Linh cứ đứng trước mặt gương đồng hồ và bảo rằng có một bóng người đang khóc và gọi tên chị An...”'
          },
          {
            speaker: 'LINH',
            speakerName: 'Tiếng Vọng Từ Trong Gương',
            emotion: 'sad',
            text: '“Chị An ơi... Ở trong bóng tối lạnh lắm... Đừng bỏ em lại một mình...”'
          },
          {
            speaker: 'KE_LAC_GIO',
            speakerName: 'Kẻ Lạc Giờ (Bóng Đen Bí Ẩn)',
            emotion: 'whisper',
            text: '“Tích... tắc... 3 giờ 15 phút... Đừng đi...”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'surprised',
            text: 'Cái bóng đen có những chiếc kim đồng hồ xoay quanh vừa thoáng hiện ra ở cuối hành lang là gì vậy?! Mình phải mau chóng qua cánh cửa bên phải để sang Màn 4!'
          }
        ],
        showNote: {
          title: 'Nhật Ký Của Mẹ & Dấu Hiệu Kẻ Lạc Giờ',
          content: 'Một bóng hình méo mó — Kẻ Lạc Giờ — vừa lướt qua cuối hành lang!',
          author: 'Nhật ký của Mẹ'
        }
      };
    }

    case 'stage_exit_3': {
      if (!nextPuzzles.hallwayPassageCleared) {
        return {
          success: false,
          messageVi: 'Hành lang phía trước còn bị chặn. Hãy kéo Trục Ròng Rọc trên gác lửng ở Quá Khứ trước!',
          speechBubbleVi: 'Mình cần kéo Trục Ròng Rọc trên gác lửng ở Quá Khứ trước!',
          updatedPuzzles: nextPuzzles
        };
      }
      if (!nextPuzzles.motherDiaryCh3Read) {
        return {
          success: false,
          messageVi: 'Có cuốn Nhật Ký Của Mẹ đang phát sáng trên bục ngay bên trái cửa. Hãy đọc nó trước khi vào phòng!',
          speechBubbleVi: 'Đọc cuốn Nhật Ký Của Mẹ ngay bên trái cửa trước đã!',
          updatedPuzzles: nextPuzzles
        };
      }
      nextPuzzles.currentStage = 4;
      return {
        success: true,
        messageVi: 'Chuyển sang Màn 4 — Chương 4: Căn Phòng Bị Khóa!',
        soundEvent: 'door_unlock',
        updatedPuzzles: nextPuzzles,
        advanceToStage: 4
      };
    }

    // =========================================================================
    // MÀN 4 (CHƯƠNG 4 — CĂN PHÒNG BỊ KHÓA)
    // =========================================================================
    case 'light_switch': {
      if (timeline === 'PAST') {
        nextPuzzles.lightSwitchOn = !nextPuzzles.lightSwitchOn;
        if (nextPuzzles.lightSwitchOn) {
          return {
            success: true,
            messageVi: 'Tách! Đèn chùm pha lê trong Quá Khứ bừng sáng, chiếu luồng sáng qua lăng kính lên bức tường!',
            speechBubbleVi: 'Đèn chùm sáng rồi! Có vệt sáng hiện lên trên tường kìa!',
            soundEvent: 'switch_flip',
            updatedPuzzles: nextPuzzles,
            dialogue: [
              {
                speaker: 'AN',
                speakerName: 'An',
                emotion: 'normal',
                text: 'Đèn chùm pha lê đã bật sáng! Luồng ánh sáng chiếu xuyên qua lăng kính đang rọi thẳng vào mảng tường giữa phòng.'
              }
            ]
          };
        } else {
          return {
            success: true,
            messageVi: 'Bạn đã tắt đèn chùm.',
            speechBubbleVi: 'Đèn chùm đã tắt.',
            soundEvent: 'switch_flip',
            updatedPuzzles: nextPuzzles
          };
        }
      } else {
        return {
          success: false,
          messageVi: 'Công tắc ở Hiện Tại đã đứt dây điện. Hãy chuyển sang Quá Khứ [Q] để bật đèn chùm!',
          speechBubbleVi: 'Dây điện ở Hiện Tại đứt rồi, phải bật đèn ở Quá Khứ [Q]!',
          updatedPuzzles: nextPuzzles
        };
      }
    }

    case 'light_target': {
      if (nextPuzzles.lightSwitchOn) {
        nextPuzzles.lightRuneFound = true;
        return {
          success: true,
          messageVi: 'Ánh sáng làm hiện rõ mật mã 3 nốt nhạc ru trên tường: Mi (E) - Sol (G) - Đô cao (C)!',
          speechBubbleVi: 'Mật mã Hộp Nhạc: Mi - Sol - Đô cao!',
          soundEvent: 'chime_success',
          updatedPuzzles: nextPuzzles,
          dialogue: [
            {
              speaker: 'AN',
              speakerName: 'An',
              emotion: 'surprised',
              text: 'Nhìn kìa! Ánh sáng từ đèn chùm làm hiện lên những dòng chữ dạ quang mà Mẹ và bé Linh từng vẽ trên tường!'
            },
            {
              speaker: 'LINH',
              speakerName: 'Tiếng Ngân Nga Của Bé Linh',
              emotion: 'normal',
              text: '“Mi... Sol... Đô cao... Khúc hát ru mỗi tối Mẹ vẫn gảy trên chiếc Hộp Nhạc đồng cho hai chị em nghe!”'
            },
            {
              speaker: 'AN',
              speakerName: 'An',
              emotion: 'determined',
              text: 'Ba nốt nhạc mật mã là: Mi (E) — Sol (G) — Đô cao (C)! Mình có thể dùng nó để mở khóa chiếc Hộp Nhạc của Linh ở phía bên phải!'
            }
          ],
          showNote: {
            title: 'Bản Nhạc Ru Trên Tường',
            content: 'Thứ tự phím Hộp Nhạc: Mi (E) — Sol (G) — Đô cao (C).',
            author: 'Mật mã Ánh Sáng'
          }
        };
      } else {
        return {
          success: false,
          messageVi: 'Mảng tường này tối om. Hãy bật Công Tắc Đèn Chùm ở bên trái trong Quá Khứ [Q] trước!',
          speechBubbleVi: 'Tối quá, phải bật Công Tắc Đèn Chùm ở Quá Khứ trước!',
          updatedPuzzles: nextPuzzles
        };
      }
    }

    case 'mother_note_ch4': {
      nextPuzzles.motherNoteCh4Read = true;
      return {
        success: true,
        messageVi: 'Bản vẽ kỹ thuật của Mẹ tiết lộ: Mẹ tháo kim đồng hồ chính là để cứu An và Linh!',
        speechBubbleVi: 'Thì ra đêm ấy Mẹ đã cố phá hủy vòng lặp để cứu tụi mình...',
        soundEvent: 'paper_rustle',
        updatedPuzzles: nextPuzzles,
        dialogue: [
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'surprised',
            text: 'Đây là bản vẽ kỹ thuật trên bàn làm việc của Mẹ... Bấy lâu nay mình cứ ngỡ Mẹ vô tình gây ra tai nạn khi sửa đồng hồ, nhưng không phải!'
          },
          {
            speaker: 'ME',
            speakerName: 'Lời Nhắn Của Mẹ Trong Bản Vẽ',
            emotion: 'sad',
            text: '“Gửi An — Đừng trách mẹ vì đã khóa chặt căn phòng cuối. Chiếc đồng hồ của Ông Ngoại đã tự rạn nứt từ trước. Đêm ấy, mẹ liều mình bẻ gãy chiếc kim đồng hồ chính là để NGĂN nó điểm 3 giờ 15 phút và đẩy hai con ra khỏi khe nứt...”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'sad',
            text: 'Mẹ ơi... Vậy mà suốt mười năm qua con đã hiểu lầm Mẹ. Chính Mẹ là người đã gửi chiếc kim gãy và giấu nó lại để hôm nay con có thể chấm dứt chuyện này!'
          }
        ],
        showNote: {
          title: 'Sự Thật Về Đêm Tai Nạn Của Mẹ',
          content: 'Mẹ tháo chiếc kim đồng hồ ra chính là để ngăn nó điểm 3 giờ 15 phút và bảo vệ hai chị em.',
          author: 'Bản vẽ phong ấn của Mẹ'
        }
      };
    }

    case 'npc_linh_ch4': {
      return {
        success: true,
        messageVi: 'An trò chuyện cùng ký ức của bé Linh bên chiếc giường nhỏ.',
        speechBubbleVi: 'Linh ơi... Chị An nhất định sẽ đưa em về!',
        soundEvent: 'chime_success',
        updatedPuzzles: nextPuzzles,
        dialogue: [
          {
            speaker: 'LINH',
            speakerName: 'Ký Ức Bé Linh',
            emotion: 'normal',
            text: '“Chị An! Chị còn nhớ chiếc Hộp Nhạc bằng đồng trên kệ cạnh giường em không? Mỗi lần gảy ba nốt Mi - Sol - Đô cao, ổ khóa cửa bí mật của Mẹ sẽ tự động mở ra đó!”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'sad',
            text: 'Chị nhớ chứ, Linh của chị... Chờ chị thêm một chút nữa thôi, chị sẽ mở cánh cửa cuối cùng và tìm ra em!'
          }
        ]
      };
    }

    case 'music_box': {
      if (timeline === 'PAST') {
        if (nextPuzzles.lightRuneFound || nextPuzzles.lightSwitchOn) {
          nextPuzzles.musicBoxPlayed = true;
          return {
            success: true,
            messageVi: 'An gảy ba nốt Mi - Sol - Đô cao trên Hộp Nhạc của Linh! Cánh cửa khóa sang Màn 5 đã mở chốt!',
            speechBubbleVi: 'Khúc nhạc ngân vang rồi! Giờ chuyển về Hiện Tại [Q] mở cửa thôi!',
            soundEvent: 'chime_success',
            updatedPuzzles: nextPuzzles,
            dialogue: [
              {
                speaker: 'AN',
                speakerName: 'An',
                emotion: 'determined',
                text: 'Mi... Sol... Đô cao... Tiếng chuông hộp nhạc vừa ngân vang, cả ba chốt sắt của Cánh Cửa Bị Khóa bên phải đã đồng loạt xoay mở!'
              },
              {
                speaker: 'KE_LAC_GIO',
                speakerName: 'Tiếng Thì Thầm Ngoài Hành Lang',
                emotion: 'whisper',
                text: '“Bài hát đó... Chị An... Đừng bỏ em lại...”'
              },
              {
                speaker: 'AN',
                speakerName: 'An',
                emotion: 'surprised',
                text: 'Không khí ở Hiện Tại chợt lạnh buốt — Kẻ Lạc Giờ đã nghe thấy tiếng hộp nhạc! Hãy nhấn [Q] chuyển sang HIỆN TẠI và mở Cánh Cửa Bị Khóa để tiến vào Màn 5!'
              }
            ],
            showNote: {
              title: 'Hộp Nhạc Của Linh',
              content: 'Hãy chuyển sang HIỆN TẠI [Q] và mở Cánh Cửa Bị Khóa!',
              author: 'Cơ chế Hộp Nhạc'
            }
          };
        } else {
          return {
            success: false,
            messageVi: 'Hộp nhạc bị khóa bởi 3 phím mật mã. Hãy bật đèn chùm và tìm mật mã ánh sáng trên tường trước!',
            speechBubbleVi: 'Mình cần bật đèn chùm tìm 3 nốt nhạc mật mã trên tường trước!',
            updatedPuzzles: nextPuzzles
          };
        }
      } else {
        return {
          success: false,
          messageVi: 'Hộp nhạc ở Hiện Tại đã đứt dây cót. Hãy chuyển sang QUÁ KHỨ [Q] để gảy bản nhạc!',
          speechBubbleVi: 'Dây cót rỉ sét rồi, phải gảy Hộp Nhạc ở Quá Khứ [Q]!',
          updatedPuzzles: nextPuzzles
        };
      }
    }

    case 'final_door': {
      if (timeline === 'PRESENT') {
        if (nextPuzzles.musicBoxPlayed) {
          nextPuzzles.finalDoorUnlocked = true;
          nextPuzzles.currentStage = 5;
          return {
            success: true,
            messageVi: 'Cánh cửa mở toang! Bước vào Màn 5 — Chương 5: Cuộc Truy Đuổi!',
            speechBubbleVi: 'Cửa mở rồi! Chạy thôi!',
            soundEvent: 'door_unlock',
            updatedPuzzles: nextPuzzles,
            advanceToStage: 5,
            triggerEnding: true
          };
        } else {
          return {
            success: false,
            messageVi: 'Cánh cửa bị khóa bởi 3 chốt cơ khí. Hãy giải mã Ánh Sáng và gảy Hộp Nhạc ở Quá Khứ trước!',
            speechBubbleVi: 'Cửa còn khóa! Phải gảy Hộp Nhạc ở Quá Khứ trước!',
            updatedPuzzles: nextPuzzles
          };
        }
      } else {
        return {
          success: false,
          messageVi: 'Ở Quá Khứ, Mẹ đã chốt cánh cửa này từ bên trong. Hãy gảy Hộp Nhạc rồi mở cửa ở HIỆN TẠI [Q]!',
          speechBubbleVi: 'Cửa này chỉ mở được ở Hiện Tại [Q] sau khi gảy Hộp Nhạc!',
          updatedPuzzles: nextPuzzles
        };
      }
    }

    // =========================================================================
    // MÀN 5 (CHƯƠNG 5 — CUỘC TRUY ĐUỔI)
    // =========================================================================
    case 'stage_exit_5': {
      nextPuzzles.chaseCompleted = true;
      nextPuzzles.currentStage = 6;
      return {
        success: true,
        messageVi: 'Bạn đã thoát khỏi Kẻ Lạc Giờ và tiến vào Màn 6 — Tâm Điểm Thời Gian!',
        soundEvent: 'chime_success',
        updatedPuzzles: nextPuzzles,
        advanceToStage: 6
      };
    }

    // =========================================================================
    // MÀN 6 (CHƯƠNG 6 — HAI PHÍA CỦA THỜI GIAN)
    // =========================================================================
    case 'final_diary_ch6': {
      nextPuzzles.finalDiaryCh6Read = true;
      return {
        success: true,
        messageVi: 'An khám phá sự thật: Kẻ Lạc Giờ chính là mảnh ký ức và linh hồn bị mắc kẹt của bé Linh!',
        speechBubbleVi: 'Kẻ Lạc Giờ... chính là em gái Linh của mình sao?!',
        soundEvent: 'paper_rustle',
        updatedPuzzles: nextPuzzles,
        dialogue: [
          {
            speaker: 'ME',
            speakerName: 'Trang Nhật Ký Cuối Cùng Của Mẹ',
            emotion: 'sad',
            text: '“Đêm tai nạn 3 giờ 15 phút — Khi lồng kính đồng hồ vỡ tung, khe nứt thời gian đã kéo bé Linh vào khoảng không giữa Quá Khứ và Hiện Tại...”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'surprised',
            text: 'Không thể nào... Vậy thực thể mang tên KẺ LẠC GIỜ đuổi theo mình suốt dọc hành lang... không phải là quái vật muốn hại mình!'
          },
          {
            speaker: 'LINH',
            speakerName: 'Tiếng Khóc Của Bé Linh (Từ Kẻ Lạc Giờ)',
            emotion: 'sad',
            text: '“Chị An ơi... Em chạy theo chị chỉ vì sợ chị lại biến mất thêm mười năm nữa... Em chỉ muốn nắm lấy tay chị thôi...”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'determined',
            text: 'Linh ơi...! Chị xin lỗi vì đã chạy trốn em! Hãy chuyển sang QUÁ KHỨ [Q] đồng bộ Trụ Cộng Hưởng ở giữa phòng, rồi bước tới Lõi Đồng Hồ để giải cứu Linh!'
          }
        ],
        showNote: {
          title: 'Danh Tính Thật Của Kẻ Lạc Giờ',
          content: 'Kẻ Lạc Giờ chính là hình bóng và nỗi cô đơn của bé Linh bị mắc kẹt suốt 10 năm qua.',
          author: 'Trang nhật ký cuối cùng của Mẹ'
        }
      };
    }

    case 'npc_linh_ch6': {
      return {
        success: true,
        messageVi: 'An nắm lấy bàn tay ánh sáng của bé Linh trước Lõi Đồng Hồ Giao Thời.',
        speechBubbleVi: 'Linh ơi, chị ở ngay đây với em rồi!',
        soundEvent: 'chime_success',
        updatedPuzzles: nextPuzzles,
        dialogue: [
          {
            speaker: 'LINH',
            speakerName: 'Linh Hồn Bé Linh',
            emotion: 'sad',
            text: '“Chị An... Nếu chị rút chiếc kim đồng hồ gãy khỏi Lõi Thời Gian, vòng lặp sẽ tan biến và em cùng Mẹ sẽ được siêu thoát về nơi bình yên.”'
          },
          {
            speaker: 'LINH',
            speakerName: 'Linh Hồn Bé Linh',
            emotion: 'whisper',
            text: '“Còn nếu chị khóa chặt chiếc kim vào Lõi, căn nhà sẽ dừng lại mãi mãi ở buổi chiều hoàng hôn trước đêm tai nạn... Dù chị chọn con đường nào, em vẫn yêu chị nhiều lắm.”'
          }
        ]
      };
    }

    case 'temporal_anchor': {
      if (timeline === 'PAST') {
        nextPuzzles.finalCoreAligned = true;
        return {
          success: true,
          messageVi: 'Đã đồng bộ Trụ Cộng Hưởng Thời Gian trong Quá Khứ! Lõi Đồng Hồ Giao Thời đã mở khóa!',
          speechBubbleVi: 'Trụ Cộng Hưởng đã đồng bộ! Tới Lõi Đồng Hồ thôi!',
          soundEvent: 'chime_success',
          updatedPuzzles: nextPuzzles,
          dialogue: [
            {
              speaker: 'AN',
              speakerName: 'An',
              emotion: 'determined',
              text: 'Trụ Cộng Hưởng đã kết nối hoàn toàn tần số giữa Quá Khứ và Hiện Tại! Lõi Đồng Hồ Giao Thời ở bục cao bên phải đã sẵn sàng!'
            }
          ],
          showNote: {
            title: 'Trụ Cộng Hưởng Đã Đồng Bộ',
            content: 'Hãy tiến tới Lõi Đồng Hồ Giao Thời để đưa ra lựa chọn cuối cùng!',
            author: 'Hệ thống Lõi Thời Gian'
          }
        };
      } else {
        if (nextPuzzles.finalCoreAligned) {
          return {
            success: true,
            messageVi: 'Trụ Cộng Hưởng đang phát sáng ổn định ở cả hai dòng thời gian.',
            speechBubbleVi: 'Trụ Cộng Hưởng đã đồng bộ hoàn tất.',
            soundEvent: 'clock_tick',
            updatedPuzzles: nextPuzzles
          };
        }
        return {
          success: false,
          messageVi: 'Trụ Cộng Hưởng ở Hiện Tại đã tắt năng lượng. Hãy nhấn [Q] chuyển sang QUÁ KHỨ để kích hoạt nó!',
          speechBubbleVi: 'Phải chuyển sang Quá Khứ [Q] để kích hoạt Trụ Cộng Hưởng!',
          updatedPuzzles: nextPuzzles
        };
      }
    }

    case 'final_core': {
      if (!nextPuzzles.finalCoreAligned) {
        return {
          success: false,
          messageVi: 'Lõi Đồng Hồ Giao Thời đang bị lệch pha! Hãy đồng bộ Trụ Cộng Hưởng ở bên trái trong QUÁ KHỨ [Q] trước!',
          speechBubbleVi: 'Phải đồng bộ Trụ Cộng Hưởng ở Quá Khứ [Q] trước!',
          updatedPuzzles: nextPuzzles
        };
      }
      return {
        success: true,
        messageVi: 'An nâng chiếc kim đồng hồ gãy lên trước Lõi Đồng Hồ Giao Thời... Đã đến lúc lựa chọn số phận của hai dòng thời gian.',
        speechBubbleVi: 'Đã đến lúc đưa ra quyết định cuối cùng...',
        soundEvent: 'chime_success',
        updatedPuzzles: nextPuzzles,
        triggerFinalChoice: true
      };
    }

    // =========================================================================
    // VẬT THỂ BỐI CẢNH (LORE & FLAVOR)
    // =========================================================================
    case 'fireplace': {
      if (timeline === 'PAST') {
        return {
          success: true,
          messageVi: 'Lò sưởi đang cháy ấm áp. Trên bệ lò sưởi phía trên có Bộ Bánh Răng bằng đồng Mẹ để lại.',
          speechBubbleVi: 'Lửa ấm quá... Trên bệ lò sưởi có Bộ Bánh Răng kìa!',
          soundEvent: 'paper_rustle',
          updatedPuzzles: nextPuzzles
        };
      } else {
        return {
          success: true,
          messageVi: 'Lò sưởi chỉ còn lại tro tàn lạnh lẽo phủ đầy bụi.',
          speechBubbleVi: 'Chỉ còn đống tro lạnh lẽo của mười năm trước...',
          soundEvent: 'paper_rustle',
          updatedPuzzles: nextPuzzles
        };
      }
    }

    case 'family_portrait': {
      if (timeline === 'PAST') {
        return {
          success: true,
          messageVi: 'Bức ảnh gia đình chụp Mẹ cùng hai chị em An và Linh cười rạng rỡ.',
          speechBubbleVi: 'Nụ cười của Mẹ và bé Linh ngày ấy...',
          soundEvent: 'paper_rustle',
          updatedPuzzles: nextPuzzles,
          dialogue: [
            {
              speaker: 'AN',
              speakerName: 'An',
              emotion: 'sad',
              text: 'Trong bức ảnh này, Mẹ đang ôm hai chị em mình bên chiếc đồng hồ cổ. Phía sau khung ảnh Mẹ từng viết: “Dù thời gian có chia cắt chúng ta ở đâu, tình thương của mẹ dành cho An và Linh vẫn mãi vẹn nguyên.”'
            }
          ],
          showNote: {
            title: 'Bức Ảnh Gia Đình (Quá Khứ)',
            content: 'Mẹ đang ôm hai chị em An và bé Linh bên chiếc đồng hồ cổ.',
            author: 'Kỷ niệm Gia Đình'
          }
        };
      } else {
        return {
          success: true,
          messageVi: 'Mặt kính bức ảnh đã nứt một vệt dài ngay giữa vị trí của bé Linh và Mẹ.',
          speechBubbleVi: 'Vết nứt chia đôi bức ảnh gia đình mình...',
          soundEvent: 'paper_rustle',
          updatedPuzzles: nextPuzzles,
          dialogue: [
            {
              speaker: 'AN',
              speakerName: 'An',
              emotion: 'sad',
              text: 'Mặt kính khung ảnh ở Hiện Tại đã nứt toác đúng vị trí của Mẹ và bé Linh... Hãy chuyển sang Quá Khứ [Q] nếu muốn ngắm lại bức ảnh lúc còn nguyên vẹn.'
            }
          ]
        };
      }
    }

    default:
      return {
        success: false,
        messageVi: 'Không thể tương tác với vật thể này lúc này.',
        updatedPuzzles: nextPuzzles
      };
  }
}
