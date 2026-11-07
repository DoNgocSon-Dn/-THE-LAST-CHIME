import {bossDefeated,canReleaseTrap,CHASE_SEALS} from './encounters';
import { mechanismMatches, type MechanismId } from './mechanisms';
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
  challenge?: MechanismId;
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
  currentPuzzles: PuzzleState,
  answer?: readonly number[]
): InteractionResult {
  const nextPuzzles = { ...currentPuzzles };
  const remember=(clue:string)=>{nextPuzzles.collectedClues=[...new Set([...(nextPuzzles.collectedClues??[]),clue])];};
  if(objectId==='stage_exit_1'&&!nextPuzzles.porchDoorUnlocked){
    if(!mechanismMatches('porch_lock',answer??[]))return {success:false,challenge:'porch_lock',messageVi:'Hai vòng khắc hình đang giữ chốt cửa.',updatedPuzzles:nextPuzzles};
    nextPuzzles.porchDoorUnlocked=true;
  }
  if(objectId==='hallway_pulley'&&timeline==='PRESENT')remember('Tay quay giếng ở hiện tại: nấc bên trái còn dấu II, bên phải còn dấu I.');
  if(objectId==='hallway_pulley'&&timeline==='PAST'&&!nextPuzzles.hallwayPassageCleared&&!mechanismMatches('well_winch',answer??[]))return {success:false,challenge:'well_winch',messageVi:'Hai bánh răng chưa khớp dấu.',updatedPuzzles:nextPuzzles};
  if(objectId==='greenhouse_console'){
    if(timeline==='PRESENT'){remember('Tấm đồng nhà kính: chỉ dải I thông sáng; II và III bị bịt kín.');return {success:true,messageVi:'Đã ghi vị trí ba dải sáng vào sổ.',updatedPuzzles:nextPuzzles};}
    if(nextPuzzles.greenhouseAligned)return {success:true,messageVi:'Mạch ánh sáng đã ổn định.',updatedPuzzles:nextPuzzles};
    if(!mechanismMatches('greenhouse_console',answer??[]))return {success:false,challenge:'greenhouse_console',messageVi:'Các dải sáng chưa khớp.',updatedPuzzles:nextPuzzles};
    nextPuzzles.greenhouseAligned=true;return {success:true,messageVi:'Ba cần đã đưa dòng sáng về đúng đường.',soundEvent:'chime_success',updatedPuzzles:nextPuzzles};
  }
  if(objectId.startsWith('chase_seal_')){
    const index=Number(objectId.slice(-1)),seal=CHASE_SEALS[index];
    if(!seal||timeline!==seal.era)return {success:false,messageVi:'Ấn không hiện rõ ở thời điểm này.',updatedPuzzles:nextPuzzles};
    nextPuzzles.chaseSeals=[...new Set([...(nextPuzzles.chaseSeals??[]),index])];nextPuzzles.chaseSealsComplete=nextPuzzles.chaseSeals.length===3;
    return {success:true,messageVi:`Đã giữ nhịp ấn ${nextPuzzles.chaseSeals.length}/3.`,soundEvent:'switch_flip',updatedPuzzles:nextPuzzles};
  }
  if(objectId.startsWith('boss_trap_')){
    const index=Number(objectId.slice(-1));
    if(index<0||index>2||!Number.isInteger(index))return {success:false,messageVi:'Bẫy không còn nguyên.',updatedPuzzles:nextPuzzles};
    if(nextPuzzles.bossHits?.includes(index))return {success:false,messageVi:'Bẫy này đã cháy hết lõi cộng hưởng.',updatedPuzzles:nextPuzzles};
    if(canReleaseTrap(nextPuzzles,index,timeline)){
      nextPuzzles.bossHits=[...new Set([...(nextPuzzles.bossHits??[]),index])];delete nextPuzzles.bossArmedTrap;delete nextPuzzles.bossExposedTrap;
      return {success:true,messageVi:bossDefeated(nextPuzzles)?'Lớp vỏ cuối đã tan. Tiếng gọi của Linh rõ trở lại.':`Đã phá ${nextPuzzles.bossHits.length}/3 lớp vỏ.`,soundEvent:'chime_success',updatedPuzzles:nextPuzzles};
    }
    if(timeline==='PAST'){nextPuzzles.bossArmedTrap=index;delete nextPuzzles.bossExposedTrap;return {success:true,messageVi:`Bẫy ${index+1} đã nạp. Dụ cái bóng vào bẫy ở hiện tại.`,soundEvent:'clock_wind',updatedPuzzles:nextPuzzles};}
    return {success:false,messageVi:'Bẫy chưa giữ được cái bóng. Bản cơ cấu ở quá khứ còn nguyên.',updatedPuzzles:nextPuzzles};
  }
  if(['temporal_anchor','final_core','npc_linh_ch6'].includes(objectId)&&!bossDefeated(nextPuzzles))return {success:false,messageVi:'Lớp vỏ của Kẻ Lạc Giờ đang giữ lõi. Ba bẫy cộng hưởng quanh đây còn có thể dùng được.',updatedPuzzles:nextPuzzles};
  const needsMechanism = timeline==='PAST' && (
    (objectId==='clock' && nextPuzzles.currentStage===2 && nextPuzzles.hasWatch && nextPuzzles.clockGearFound && !nextPuzzles.clockRepaired) ||
    (objectId==='music_box' && !nextPuzzles.musicBoxPlayed) ||
    (objectId==='temporal_anchor' && !nextPuzzles.finalCoreAligned && nextPuzzles.finalDiaryCh6Read)
  );
  if(needsMechanism && !mechanismMatches(objectId as MechanismId,answer??[]))return {
    success:false,challenge:objectId as MechanismId,updatedPuzzles:nextPuzzles,
    messageVi:answer?'Cơ cấu rung lên rồi dừng. Chưa khớp nhịp.':'An cúi xuống kiểm tra cơ cấu.'
  };
  if(objectId==='temporal_anchor' && timeline==='PAST' && !nextPuzzles.finalDiaryCh6Read)return {
    success:false,messageVi:'Các vòng số đã mờ. Bên bệ đá còn một cuốn sổ.',updatedPuzzles:nextPuzzles
  };
  if(objectId==='clock' && timeline==='PRESENT')remember('Mặt đồng hồ vỡ: cả hai kim dừng ở 3 giờ 15.');
  if(objectId==='final_diary_ch6')remember('Ghi cuối nhật ký: lấy giờ tai nạn. Vòng ngoài là giờ; hai vòng trong lần lượt là hàng chục và hàng đơn vị của phút.');


  const sideMemories:Record<string,{title:string;text:string}>={
    memory_kitchen:{title:'Bữa cơm còn dang dở',text:'Ba chiếc cốc vẫn ở đây. Cái sứt quai là của mình... Mẹ cứ bảo đổi mà mình không chịu.'},
    memory_workshop:{title:'Ghi chép về chiếc kim',text:'Bản vẽ có một đường cáp nối đồng hồ phòng khách với chốt cửa sau. Mẹ còn khoanh tròn trục bánh răng bị thiếu.'},
    memory_well:{title:'Sợi dây bên giếng',text:'Một nút chỉ đỏ trên thành giếng... Linh từng buộc thế này mỗi khi chơi tìm đường. Không biết trong vườn còn dấu nào không.'},
    memory_garden:{title:'Chiếc nơ trong vườn',text:'Chiếc nơ đỏ của Linh mắc trên cành cây. Cái bóng bên giếng cũng mang một vệt đỏ trước ngực. Vì sao một quái vật lại giữ kỷ vật của em?'},
    memory_greenhouse:{title:'Bản đồ rừng ký ức',text:'Linh vẽ một đường đỏ xuyên qua mấy hình cây và tảng đá. Trông giống lối đi phía sau nhà kính.'}
  };
  if(sideMemories[objectId]){
    const original=sideMemories[objectId];
    const eraText:Record<string,[string,string]>={
      memory_kitchen:['Ba chiếc cốc còn sạch trên bàn. Cái sứt quai là của mình… Mẹ cứ bảo đổi mà mình không chịu.','Bụi bám kín ba chiếc cốc. Cái sứt quai của mình vẫn còn, ngay chỗ cũ.'],
      memory_workshop:['Bản vẽ còn mới. Mẹ đánh dấu đường cáp nối đồng hồ với chốt cửa sau và khoanh tròn trục bánh răng.','Mép bản vẽ đã mủn. Vẫn đọc được đường cáp nối đồng hồ với chốt cửa sau và dấu khoanh ở trục bánh răng.'],
      memory_well:['Sợi chỉ đỏ còn tươi màu trên thành giếng. Linh thường buộc những nút thế này khi chơi tìm đường.','Sợi chỉ trên thành giếng đã bạc màu. Cách thắt nút này… là trò tìm đường của Linh ngày trước.'],
      memory_garden:['Chiếc nơ của Linh mắc trên cành cây. Chắc em vừa chạy qua đây.','Chiếc nơ đã sờn, nhưng vẫn còn mắc trên cành. Mình nhớ Linh quý nó lắm.'],
      memory_greenhouse:['Nét vẽ đỏ còn rõ: một đường đi xuyên qua cây và những tảng đá phía sau nhà kính.','Tờ giấy đã ố, còn sót một đường đỏ qua mấy hình cây và tảng đá. Có lẽ vẫn lần theo được.']
    };
    const memory={...original,text:eraText[objectId]?.[timeline==='PAST'?0:1]??original.text};
    return {success:true,messageVi:memory.title,updatedPuzzles:nextPuzzles,soundEvent:'paper_rustle',dialogue:[{speaker:'AN',speakerName:'An',emotion:'normal',text:memory.text}],showNote:{title:memory.title,content:memory.text,author:'Dấu vết gia đình'}};
  }
  if(objectId==='npc_grandfather')return {success:true,messageVi:'Ký ức xưởng đồng hồ của Ông Ngoại',updatedPuzzles:nextPuzzles,dialogue:[{speaker:'ONG',speakerName:'Ký ức Ông Ngoại',emotion:'normal',text:'An, xong rồi thì cất giúp ông cái kính nhé. Ông cứ để đâu là quên đấy.'}]};
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
      if(nextPuzzles.motherNoteCh1Read)return {success:false,messageVi:'An đã cất mẩu giấy vào túi.',updatedPuzzles:nextPuzzles};
      nextPuzzles.motherNoteCh1Read=true;
      return {success:true,messageVi:'Đã nhặt mẩu giấy cũ.',soundEvent:'paper_rustle',updatedPuzzles:nextPuzzles,dialogue:[
        {speaker:'AN',speakerName:'An',emotion:'surprised',text:'Có gì kẹt dưới thanh ghế này... Một mẩu giấy?'},
        {speaker:'AN',speakerName:'An',emotion:'sad',text:'“An, vào nhà thì cất đồng hồ của ông giúp mẹ nhé. Mẹ để cạnh đèn phòng khách.” ...Chữ của mẹ.'},
        {speaker:'AN',speakerName:'An',emotion:'normal',text:'Dưới dòng chữ còn có một câu: “Mặt trời theo sau trăng.” Chắc mẹ nhắc chốt cửa.'}
      ]};
    }

    case 'pocket_watch_box': {
      if(nextPuzzles.currentStage!==2)return {success:false,messageVi:'An chưa vào phòng khách.',updatedPuzzles:nextPuzzles};
      if(nextPuzzles.hasWatch)return {success:false,messageVi:'An đã giữ chiếc đồng hồ.',updatedPuzzles:nextPuzzles};
      nextPuzzles.hasWatch=true;nextPuzzles.watchCollected=true;
      return {success:true,messageVi:'Đồng hồ bỏ túi bắt đầu chạy.',soundEvent:'chime_success',updatedPuzzles:nextPuzzles,dialogue:[
        {speaker:'AN',speakerName:'An',emotion:'normal',text:'Đồng hồ của ông... Vẫn còn ở đây.'},
        {speaker:'AN',speakerName:'An',emotion:'surprised',text:'Rãnh này vừa với chiếc kim trong phong thư. Thử đặt vào xem...'},
        {speaker:'AN',speakerName:'An',emotion:'surprised',text:'Nó chạy rồi? Khoan... tiếng ai trong nhà vậy?'}
      ]};
    }
    case 'clock': {
      if(nextPuzzles.currentStage<2||!nextPuzzles.hasWatch)return {success:false,messageVi:'Tìm và nhặt đồng hồ bỏ túi trên bàn cạnh đèn trong phòng khách trước.',updatedPuzzles:nextPuzzles};
      // Chương 2 (Chương 2): Sửa đồng hồ ở QUÁ KHỨ & kiểm tra ở HIỆN TẠI
      if (timeline === 'PAST') {
        nextPuzzles.hasWatch = true;
        nextPuzzles.testedTimelineSwitch = true;

        if (!nextPuzzles.clockGearFound)return {success:false,messageVi:'Trong bộ máy có một chỗ trống. Hình như thiếu một bánh răng.',updatedPuzzles:nextPuzzles};
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
                text: 'Vừa rồi... Con lắc chạy lại rồi.'
              },
              {
                speaker: 'ME',
                speakerName: 'Ký Ức Của Mẹ',
                emotion: 'normal',
                text: '“Nghe tiếng máy là biết ngay con ạ. Đều thế này mới đúng.”'
              }
            ],
            showNote: {
              title: 'Đồng Hồ Đã Hoạt Động Trở Lại',
              content: 'Quay về hiện tại và kiểm tra dây cáp nối đồng hồ với cửa sau.',
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
        // PRESENT (Chương 2)
        if (nextPuzzles.clockRepaired) {
          if (!nextPuzzles.clockInspectedPresent) {
            nextPuzzles.clockInspectedPresent = true;
            return {
              success: true,
              messageVi: 'Đồng hồ đã kéo sợi cáp và nhả chốt cửa sau trong bếp.',
              speechBubbleVi: 'Chốt cửa sau đã nhả.',
              soundEvent: 'door_unlock',
              updatedPuzzles: nextPuzzles,
              dialogue: [
                {
                  speaker: 'AN',
                  speakerName: 'An',
                  emotion: 'surprised',
                  text: 'Nó vẫn chạy... Nhưng vừa nãy ở đây còn hỏng mà.'
                },
                {
                  speaker: 'AN',
                  speakerName: 'An',
                  emotion: 'determined',
                  text: 'Có tiếng chốt bật ra ở phía bếp. Sợi cáp này nối tới cửa sau.'
                }
              ],
              showNote: {
                title: 'Cơ Chế Mở Cửa Hành Lang',
                content: 'Cửa sau trong bếp đã mở.',
                author: 'Đồng Hồ Cổ'
              }
            };
          }
          return {
            success: true,
            messageVi: 'Dây cáp đã nhả chốt. Cửa sau trong bếp có thể mở được rồi.',
            speechBubbleVi: 'Mình có thể ra sân sau từ bếp.',
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
                text: 'Ba giờ mười lăm... Nó vẫn dừng đúng lúc ấy.'
              },
              {
                speaker: 'AN',
                speakerName: 'An',
                emotion: 'determined',
                text: 'Bên trong rỉ hết rồi. Không biết trước kia bộ máy trông thế nào...'
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
        messageVi: 'Chuyển sang Chương 2 — Chiếc Đồng Hồ Ngừng Chạy!',
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
            text: 'Mẹ...? Mẹ có nghe con không?'
          },
          {
            speaker: 'ME',
            speakerName: 'Ký Ức Của Mẹ',
            emotion: 'normal',
            text: '“Lại thiếu mất một bánh răng... Mình còn để cái dự phòng trên bàn trong xưởng.”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'determined',
            text: 'Mẹ không nghe thấy mình... Cứ như chuyện này đang diễn ra lại vậy.'
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
              text: 'Cái này cùng cỡ với chỗ trống trong đồng hồ. May mà vẫn còn.'
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

    case 'hallway_pulley': {
      if(nextPuzzles.hallwayPassageCleared)return {success:true,messageVi:timeline==='PAST'?'Dây đã cuốn hết vào trục. Chiếc gàu đang nằm ở miệng giếng.':'Tay quay đã mục, nhưng chiếc gàu vẫn nằm ở miệng giếng.',updatedPuzzles:nextPuzzles};
      if(timeline!=='PAST')return {success:false,messageVi:'Tay quay giếng đã gãy. Chiếc gàu vẫn kẹt dưới đáy.',updatedPuzzles:nextPuzzles};
      nextPuzzles.hallwayPassageCleared=true;
      return {success:true,messageVi:'Đã kéo chiếc gàu lên. Có một hộp sắt bên trong.',soundEvent:'door_unlock',updatedPuzzles:nextPuzzles,dialogue:[
        {speaker:'AN',speakerName:'An',emotion:'normal',text:'Nặng quá... Có cái gì mắc trong cuộn dây.'},
        {speaker:'AN',speakerName:'An',emotion:'surprised',text:'Một cái hộp. Trên nắp có buộc chỉ đỏ, giống sợi chỉ ở cửa phòng Linh.'}
      ]};
    }

    case 'mother_diary_ch3': {
      if(!nextPuzzles.hallwayPassageCleared)return {success:false,messageVi:timeline==='PAST'?'Chiếc gàu còn nằm dưới đáy giếng. Có thể dùng tay quay bên cạnh để kéo lên.':'Chiếc gàu còn mắc dưới giếng. Tay quay ở hiện tại đã gãy.',updatedPuzzles:nextPuzzles};
      const firstTime = !nextPuzzles.motherDiaryCh3Read;
      nextPuzzles.motherDiaryCh3Read = true;
      return {
        success: true,
        messageVi: 'Trong hộp sắt có nhật ký và hai chìa khóa: phòng Linh và cổng vườn.',
        speechBubbleVi: 'Ai đó vừa xuất hiện trong bóng tối bên giếng cũ...!',
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
            text: 'Hai chiếc chìa khóa buộc chỉ đỏ... Một chiếc có khắc tên Linh. Nhưng giọng vừa rồi là ai?'
          }
        ],
        showNote: {
          title: 'Nhật Ký Của Mẹ & Dấu Hiệu Kẻ Lạc Giờ',
          content: 'Một bóng hình méo mó — Kẻ Lạc Giờ — vừa lướt qua bên giếng cũ!',
          author: 'Nhật ký của Mẹ'
        }
      };
    }

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
                text: 'Dưới ánh đèn mới thấy... Trên tường có nét vẽ.'
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
      if(!nextPuzzles.lightSwitchOn)return {success:false,messageVi:'Những nét vẽ chìm trong bóng tối.',updatedPuzzles:nextPuzzles};
      const past=timeline==='PAST';
      if(past){nextPuzzles.lightOrderFound=true;remember('Nét vẽ lúc còn mới, từ trái sang phải: trăng — sao — mặt trời.');}
      else {nextPuzzles.lightLegendFound=true;remember('Dưới lớp giấy bong: trăng = Mi; mặt trời = Đô cao; sao = Sol.');}
      nextPuzzles.lightRuneFound=!!(nextPuzzles.lightOrderFound&&nextPuzzles.lightLegendFound);
      return {success:true,messageVi:'Đã ghi lại nét vẽ vào sổ.',soundEvent:'paper_rustle',updatedPuzzles:nextPuzzles,dialogue:[
        {speaker:'AN',speakerName:'An',emotion:'normal',text:past?'Ba hình vẽ: trăng, sao, rồi mặt trời. Linh còn tô cả viền cho chúng.':'Lớp giấy đã bong ra... Bên dưới có tên nốt nhạc cạnh mỗi hình. Mình ghi lại đã.'}
      ]};
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
            text: 'Có chữ ở lề bản vẽ... Mẹ viết cho mình?'
          },
          {
            speaker: 'ME',
            speakerName: 'Lời Nhắn Của Mẹ Trong Bản Vẽ',
            emotion: 'sad',
            text: '“An, mẹ đã khóa căn phòng cuối lại. Đêm ấy mặt kính nứt trước khi mẹ kịp chạm vào máy. Mẹ bẻ chiếc kim để ngăn tiếng chuông. Mẹ chỉ kịp kéo con ra...”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'sad',
            text: 'Con cứ nghĩ chính mẹ đã làm nó hỏng... Mẹ ơi, con xin lỗi.'
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
            text: '“Anh An, đừng xóa mấy hình em vẽ nhé! Không có chúng là anh quên bài hát ngay.”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'sad',
            text: 'Anh có xóa đâu... Vẫn còn đây này.'
          }
        ]
      };
    }

    case 'music_box': {
      if(nextPuzzles.musicBoxPlayed)return {success:true,messageVi:timeline==='PAST'?'Ba chốt đã rút vào. Hộp nhạc vẫn ngân khẽ.':'Dây cót đã rỉ, hộp nhạc im tiếng. Nhưng chốt nhạc ở cổng đã rút.',updatedPuzzles:nextPuzzles};
      if (timeline === 'PAST') {
        if (mechanismMatches('music_box',answer??[])) {
          nextPuzzles.musicBoxPlayed = true;
          return {
            success: true,
            messageVi: 'Khúc nhạc đã rút chốt nhạc ở cổng nhà kính.',
            speechBubbleVi: 'Khúc nhạc ngân vang rồi! Giờ chuyển về Hiện Tại [Q] mở cửa thôi!',
            soundEvent: 'chime_success',
            updatedPuzzles: nextPuzzles,
            dialogue: [
              {
                speaker: 'AN',
                speakerName: 'An',
                emotion: 'determined',
                text: 'Đúng bài này rồi. Có tiếng gì vừa bật trong tường.'
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
                text: 'Tiếng bước chân ấy lại tới rồi. Mình phải đi thôi.'
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
      if(!nextPuzzles.motherNoteCh4Read||!nextPuzzles.greenhouseAligned)return {success:false,messageVi:'Cổng chưa nhận đủ dòng sáng. Bản vẽ của Mẹ và mạch trong nhà kính vẫn còn dấu vết.',updatedPuzzles:nextPuzzles};
      if (timeline === 'PRESENT') {
        if (nextPuzzles.musicBoxPlayed) {
          nextPuzzles.finalDoorUnlocked = true;
          nextPuzzles.currentStage = 5;
          return {
            success: true,
            messageVi: 'Cổng rừng mở ra. Tiếng bước chân dồn dập phía sau — chạy thôi!',
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
      if(!nextPuzzles.chaseSealsComplete)return {success:false,messageVi:'Cổng cần đủ ba ấn cộng hưởng.',updatedPuzzles:nextPuzzles};
      nextPuzzles.chaseCompleted = true;
      nextPuzzles.currentStage = 6;
      return {
        success: true,
        messageVi: 'Ba ấn mở đường vào tâm điểm. Cái bóng vẫn còn theo tới đây.',
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
            text: '“Ba bẫy cộng hưởng vẫn còn ở thời điểm cũ. Lên dây ở quá khứ, dụ cái bóng vào vùng bẫy trong hiện tại rồi xả xung khi vỏ nó sáng lên. Mỗi lõi chỉ chịu được một lần.”'
          },
          {
            speaker: 'AN',
            speakerName: 'An',
            emotion: 'surprised',
            text: 'Cái bóng ấy... Là em sao, Linh?'
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
            text: 'Linh... Anh nghe thấy rồi. Anh sẽ dừng cỗ máy. Em không phải chờ ở đây nữa.'
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
            text: '“Rút chiếc kim ra thì căn nhà này sẽ không còn nữa. Em cũng không ở lại được đâu, anh.”'
          },
          {
            speaker: 'LINH',
            speakerName: 'Linh Hồn Bé Linh',
            emotion: 'whisper',
            text: '“Anh có thể giữ nó chạy... Nhưng mình sẽ cứ ở trong ngày hôm ấy. Anh sẽ không về được nữa.”'
          }
        ]
      };
    }

    case 'temporal_anchor': {
      if(nextPuzzles.finalCoreAligned)return {success:true,messageVi:'Các vòng đang quay cùng nhịp.',updatedPuzzles:nextPuzzles};
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
              text: 'Tiếng ù ngừng rồi. Ánh sáng từ trụ đang dẫn về phía lõi.'
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
              text: 'Kính vỡ hết rồi... Chỉ còn nhìn rõ mặt mình.'
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
