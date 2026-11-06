import { DialogueLine, PuzzleState, Timeline } from '../types/game';

export const INITIAL_PUZZLE_STATE: PuzzleState = {
  currentStage: 1,
  motherNoteCh1Read: false,
  tutorialMoved: false,
  tutorialJumped: false,
  watchCollected: false,
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

  const sideMemories:Record<string,{title:string;text:string}>={
    memory_kitchen:{title:'Bữa cơm còn dang dở',text:'Trên bàn vẫn có ba chiếc cốc. Mẹ luôn để đèn bếp sáng khi An và Linh chưa về. Những điều nhỏ bé ấy mới là thứ cỗ máy giữ được lâu nhất.'},
    memory_workshop:{title:'Ghi chép về chiếc kim',text:'Chỉ những vật cộng hưởng mới truyền được thay đổi giữa hai mốc ký ức: bánh răng, ròng rọc, ánh sáng và khúc nhạc. Chiếc kim không thể hồi sinh người đã mất.'},
    memory_well:{title:'Sợi dây bên giếng',text:'Linh buộc một sợi chỉ đỏ lên thành giếng để đánh dấu đường về. Dấu nơ ấy còn lặp lại trong rừng ký ức, dẫn tới nơi em đang mắc kẹt.'},
    memory_garden:{title:'Chiếc nơ trong vườn',text:'Chiếc nơ đỏ của Linh mắc trên cành cây. Cái bóng trong hành lang cũng mang một vệt đỏ trước ngực. Vì sao một quái vật lại giữ kỷ vật của em?'},
    memory_greenhouse:{title:'Bản đồ rừng ký ức',text:'Sau nhà kính, không gian bị xé thành những mảnh vườn và hang động. Hãy theo dấu nơ đỏ, nhảy qua các bệ còn nguyên và tìm trụ cộng hưởng ở tâm điểm.'}
  };
  if(sideMemories[objectId]){
    const memory=sideMemories[objectId];
    return {success:true,messageVi:memory.title,updatedPuzzles:nextPuzzles,soundEvent:'paper_rustle',dialogue:[{speaker:'AN',speakerName:'An',emotion:'normal',text:memory.text}],showNote:{title:memory.title,content:memory.text,author:'Dấu vết gia đình'}};
  }
  if(objectId==='npc_grandfather')return {success:true,messageVi:'Ký ức xưởng đồng hồ của Ông Ngoại',updatedPuzzles:nextPuzzles,dialogue:[{speaker:'ONG',speakerName:'Ký ức Ông Ngoại',emotion:'normal',text:'Cỗ máy ghi lại những điều ta từng yêu thương. Nhưng ký ức là một nơi để trở về thăm, không phải nơi để sống thay phần đời còn lại.'}]};
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
            text: 'Trong phong thư nặc danh gửi đến ba ngày trước chỉ có chiếc KIM ĐỒNG HỒ GÃY này cùng lời nhắn: “Đừng để nó điểm giờ lần nữa.” Luật sư của Mẹ nói đây là phong thư được dặn giao khi ngôi nhà bắt đầu ngân chuông trở lại.'
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
      nextPuzzles.motherNoteCh1Read=true;
      return {success:true,messageVi:'Đã đọc lời nhắn trên ghế. Đi tới cửa chính và nhấn E để vào nhà.',soundEvent:'paper_rustle',updatedPuzzles:nextPuzzles,dialogue:[
        {speaker:'AN',speakerName:'An',emotion:'normal',text:'Lời nhắn của Mẹ còn kẹp trên ghế: “Đồng hồ của Ông Ngoại mẹ để trên bàn cạnh đèn trong phòng khách.”'},
        {speaker:'AN',speakerName:'An',emotion:'determined',text:'Mình có thể dùng A/D hoặc mũi tên để đi, Space để nhảy và E để tương tác. Đến cửa chính, nhấn E để vào nhà trước đã.'}
      ]};
    }

    case 'pocket_watch_box': {
      if(nextPuzzles.currentStage!==2)return {success:false,messageVi:'Đồng hồ nằm trong phòng khách. Hãy vào nhà trước.',updatedPuzzles:nextPuzzles};
      if(nextPuzzles.hasWatch)return {success:false,messageVi:'An đã giữ chiếc đồng hồ.',updatedPuzzles:nextPuzzles};
      nextPuzzles.hasWatch=true;nextPuzzles.watchCollected=true;
      return {success:true,messageVi:'Đã nhặt đồng hồ bỏ túi. Nhấn Q để chuyển thời gian.',soundEvent:'chime_success',updatedPuzzles:nextPuzzles,dialogue:[
        {speaker:'AN',speakerName:'An',emotion:'surprised',text:'Chiếc đồng hồ bỏ túi của Ông Ngoại vẫn ở trên bàn cạnh đèn. Chiếc kim gãy trong thư vừa khớp vào rãnh trên nắp...'},
        {speaker:'ME',speakerName:'Lời nhắn của Mẹ',emotion:'whisper',text:'Đồng hồ là vật dẫn. Nhấn Q để đi giữa ngôi nhà hiện tại và ký ức quá khứ. Sau mỗi lần chuyển, hãy chờ ba giây để chiếc kim hồi năng lượng.'},
        {speaker:'AN',speakerName:'An',emotion:'determined',text:'Mình sẽ thử Q ngay trong phòng khách. Chỉ những vật cộng hưởng mới giữ được thay đổi giữa hai thời điểm. Sau đó tìm bánh răng ở xưởng để sửa đồng hồ lớn.'}
      ]};
    }
    case 'clock': {
      if(nextPuzzles.currentStage<2||!nextPuzzles.hasWatch)return {success:false,messageVi:'Tìm và nhặt đồng hồ bỏ túi trên bàn cạnh đèn trong phòng khách trước.',updatedPuzzles:nextPuzzles};
      // Màn 2 (Chương 2): Sửa đồng hồ ở QUÁ KHỨ & kiểm tra ở HIỆN TẠI
      if (timeline === 'PAST') {
        nextPuzzles.hasWatch = true;
        nextPuzzles.testedTimelineSwitch = true;

        if (!nextPuzzles.clockGearFound)return {success:false,messageVi:'Cần lấy bánh răng dự phòng trong xưởng của Mẹ trước khi sửa.',updatedPuzzles:nextPuzzles};
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
                text: 'Ở Hiện Tại bánh răng đã mục nát hết rồi. Mình phải nhấn [Q] trở về QUÁ KHỨ, tìm bộ bánh răng dự phòng trên bàn sửa đồng hồ trong xưởng và sửa chiếc đồng hồ lúc nó còn nguyên vẹn!'
              }
            ]
          };
        }
      }
    }

    case 'stage_exit_1': {
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
            text: '“Bộ bánh răng hồi bằng đồng thau mình cất tạm trên BÀN SỬA ĐỒNG HỒ trong xưởng... Phải lắp nó vào đồng hồ trước khi con lắc lệch nhịp hoàn toàn.”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'determined',
            text: 'Đi qua phòng ăn là tới xưởng! Mình cần tìm Bộ Bánh Răng trên bàn và lắp vào chiếc đồng hồ giúp Mẹ!'
          }
        ]
      };
    }

    case 'clock_gear': {
      if (timeline === 'PAST') {
        nextPuzzles.clockGearFound = true;
        return {
          success: true,
          messageVi: 'Đã nhặt Bộ Bánh Răng Hồi Cơ Khí trên bàn sửa đồng hồ trong xưởng! Hãy đem lại sửa Đồng Hồ Cổ.',
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
            text: '“Ngày 14 tháng 10 — Chiếc đồng hồ của Ông Ngoại đang rò rỉ những mảnh ký ức bị mắc kẹt. Mấy đêm nay bé Linh cứ đứng trước mặt gương đồng hồ và bảo rằng có một bóng người đang khóc và gọi tên anh An...”'
          },
          {
            speaker: 'LINH',
            speakerName: 'Tiếng Vọng Từ Trong Gương',
            emotion: 'sad',
            text: '“Anh An ơi... Ở trong bóng tối lạnh lắm... Đừng bỏ em lại một mình...”'
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
              text: '“Mi... Sol... Đô cao... Khúc hát ru mỗi tối Mẹ vẫn gảy trên chiếc Hộp Nhạc đồng cho hai anh em nghe!”'
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
          content: 'Mẹ tháo chiếc kim đồng hồ ra chính là để ngăn nó điểm 3 giờ 15 phút và bảo vệ hai anh em.',
          author: 'Bản vẽ phong ấn của Mẹ'
        }
      };
    }

    case 'npc_linh_ch4': {
      return {
        success: true,
        messageVi: 'An trò chuyện cùng ký ức của bé Linh bên chiếc giường nhỏ.',
        speechBubbleVi: 'Linh ơi... Anh An nhất định sẽ đưa em về!',
        soundEvent: 'chime_success',
        updatedPuzzles: nextPuzzles,
        dialogue: [
          {
            speaker: 'LINH',
            speakerName: 'Ký Ức Bé Linh',
            emotion: 'normal',
            text: '“Anh An! Anh còn nhớ chiếc Hộp Nhạc bằng đồng trên kệ cạnh giường em không? Mỗi lần gảy ba nốt Mi - Sol - Đô cao, ổ khóa cửa bí mật của Mẹ sẽ tự động mở ra đó!”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'sad',
            text: 'Anh nhớ chứ, Linh của anh... Chờ anh thêm một chút nữa thôi, anh sẽ mở cánh cửa cuối cùng và tìm ra em!'
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
                text: '“Bài hát đó... Anh An... Đừng bỏ em lại...”'
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
            text: '“Anh An ơi... Em sợ anh lại bỏ em... Nỗi sợ ấy thành cái bóng mà em không điều khiển được. Đừng chạm vào nó khi lõi còn chạy, anh sẽ bị giữ lại như em...”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'determined',
            text: 'Linh ơi... Anh hiểu rồi. Anh phải ngắt cỗ máy, không thể cứu em bằng cách lặp lại tai nạn. Hãy chuyển sang QUÁ KHỨ [Q] đồng bộ Trụ Cộng Hưởng ở giữa phòng, rồi bước tới Lõi Đồng Hồ để giải cứu Linh!'
          }
        ],
        showNote: {
          title: 'Danh Tính Thật Của Kẻ Lạc Giờ',
          content: 'Mẹ gửi chiếc kim cho luật sư và dặn giao lại khi chuông ngân trở lại. Lõi máy chỉ lưu được ký ức, không hồi sinh người đã mất. Linh bị giữ trong đó suốt mười năm. Nỗi sợ bị bỏ lại đã hóa thành Kẻ Lạc Giờ; chạm vào lớp vỏ ấy sẽ kéo An vào vòng lặp. Đồng bộ trụ trước khi tháo kim để ký ức được tan đi an toàn. Rêu ngoài vườn đã phủ kín căn nhà thật; quá khứ chỉ là phần ký ức cỗ máy còn giữ được.',
          author: 'Trang nhật ký cuối cùng của Mẹ'
        }
      };
    }

    case 'npc_linh_ch6': {
      return {
        success: true,
        messageVi: 'An nắm lấy bàn tay ánh sáng của bé Linh trước Lõi Đồng Hồ Giao Thời.',
        speechBubbleVi: 'Linh ơi, anh ở ngay đây với em rồi!',
        soundEvent: 'chime_success',
        updatedPuzzles: nextPuzzles,
        dialogue: [
          {
            speaker: 'LINH',
            speakerName: 'Linh Hồn Bé Linh',
            emotion: 'sad',
            text: '“Anh An... Nếu anh rút chiếc kim đồng hồ gãy khỏi Lõi Thời Gian, vòng lặp sẽ tan biến và em cùng Mẹ sẽ được siêu thoát về nơi bình yên.”'
          },
          {
            speaker: 'LINH',
            speakerName: 'Linh Hồn Bé Linh',
            emotion: 'whisper',
            text: '“Còn nếu anh khóa chặt chiếc kim vào Lõi, căn nhà sẽ dừng lại mãi mãi ở buổi chiều hoàng hôn trước đêm tai nạn... Dù anh chọn con đường nào, em vẫn yêu anh nhiều lắm.”'
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
          messageVi: 'Lò sưởi đang cháy ấm áp. Trên bàn sửa đồng hồ trong xưởng phía trên có Bộ Bánh Răng bằng đồng Mẹ để lại.',
          speechBubbleVi: 'Lửa ấm quá... Trên bàn sửa đồng hồ trong xưởng có Bộ Bánh Răng kìa!',
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
          messageVi: 'Bức ảnh gia đình chụp Mẹ cùng hai anh em An và Linh cười rạng rỡ.',
          speechBubbleVi: 'Nụ cười của Mẹ và bé Linh ngày ấy...',
          soundEvent: 'paper_rustle',
          updatedPuzzles: nextPuzzles,
          dialogue: [
            {
              speaker: 'AN',
              speakerName: 'An',
              emotion: 'sad',
              text: 'Trong bức ảnh này, Mẹ đang ôm hai anh em mình bên chiếc đồng hồ cổ. Phía sau khung ảnh Mẹ từng viết: “Dù thời gian có chia cắt chúng ta ở đâu, tình thương của mẹ dành cho An và Linh vẫn mãi vẹn nguyên.”'
            }
          ],
          showNote: {
            title: 'Bức Ảnh Gia Đình (Quá Khứ)',
            content: 'Mẹ đang ôm hai anh em An và bé Linh bên chiếc đồng hồ cổ.',
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
