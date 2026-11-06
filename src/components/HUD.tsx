import React, { useState } from 'react';
import { Timeline, InteractableObject, PuzzleState } from '../types/game';
import { RoomZone } from '../game/levelData';
import { Sun, Moon, Volume2, VolumeX, Pause, Sparkles, Compass, Lock } from 'lucide-react';
import { soundManager } from '../game/audio';

interface HUDProps {
  timeline: Timeline;
  cooldownRatio: number;
  cooldownSeconds: number;
  nearbyObject: InteractableObject | null;
  puzzles: PuzzleState;
  currentRoom: RoomZone;
  notification: string | null;
  isDialogueActive?: boolean;
  onPause: () => void;
  onTimelineSwitch: () => void;
  onInteract: () => void;
  onSelectStage: (stageNum: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  timeline,
  cooldownRatio,
  cooldownSeconds,
  nearbyObject,
  puzzles,
  currentRoom,
  notification,
  isDialogueActive = false,
  onPause,
  onTimelineSwitch,
  onInteract,
  onSelectStage
}) => {
  const isPast = timeline === 'PAST';
  const isReady = cooldownRatio <= 0;
  const [isMuted, setMuted] = useState(soundManager.getMuted());
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const activeStage = puzzles.currentStage || 1;

  const getObjectiveHint = (): { chapterLabel: string; hint: string } => {
    switch (activeStage) {
      case 1:
        return {chapterLabel:'Màn 1 / 6 — Trở về',hint:!puzzles.tutorialMoved?'Bắt đầu từ cổng. Dùng A/D hoặc các nút ← → để đi sang phải.':!puzzles.tutorialJumped?'Thử nhảy bằng Space hoặc nút ↑, rồi đi tới ghế và cửa chính.':!puzzles.motherNoteCh1Read?'Đến gần lời nhắn trên ghế, nhấn E để đọc.':'Đến cửa chính của ngôi nhà, nhấn E để vào màn 2.'};

      case 2:
        if(!puzzles.hasWatch)return {chapterLabel:'Màn 2 — Đồng hồ của Ông Ngoại',hint:'Nhặt đồng hồ bỏ túi trên bàn cạnh đèn trong phòng khách [E].'};
        if(!puzzles.testedTimelineSwitch)return {chapterLabel:'Màn 2 — Hai mốc thời gian',hint:'Nhấn Q để thử chuyển sang Quá Khứ. Chờ 3 giây sau mỗi lần chuyển.'};
        if (!puzzles.clockRepaired) {
          return {
            chapterLabel: 'Màn 2 / 6 — Chương 2: Chiếc Đồng Hồ Ngừng Chạy',
            hint: 'Chuyển sang Quá Khứ [Q], trò chuyện với Ký Ức Của Mẹ, đi qua phòng ăn tới xưởng lấy bánh răng, rồi quay lại sửa Đồng Hồ Cổ ở phòng khách.'
          };
        }
        if (!puzzles.clockInspectedPresent) {
          return {
            chapterLabel: 'Màn 2 / 6 — Chương 2: Chiếc Đồng Hồ Ngừng Chạy',
            hint: 'Nhấn [Q] về Hiện Tại và kiểm tra Đồng Hồ Cổ [E] để mở chốt cửa cơ khí sang Màn 3.'
          };
        }
        return {
          chapterLabel: 'Màn 2 / 6 — Chương 2: Chiếc Đồng Hồ Ngừng Chạy',
          hint: 'Cửa cơ khí đã mở! Hãy tiến tới cánh cửa bên phải [E] để bước sang Màn 3!'
        };

      case 3:
        if (!puzzles.hallwayPassageCleared) {
          return {
            chapterLabel: 'Màn 3 / 6 — Chương 3: Hành Lang Ký Ức',
            hint: 'Hành lang Hiện Tại bị sập. Chuyển sang Quá Khứ [Q], leo cầu thang lên gác lửng và kéo Trục Ròng Rọc [E].'
          };
        }
        if (!puzzles.motherDiaryCh3Read) {
          return {
            chapterLabel: 'Màn 3 / 6 — Chương 3: Hành Lang Ký Ức',
            hint: 'Đi qua chỗ vừa thông đường, đọc Nhật Ký Của Mẹ [E] ở cuối hành lang trước khi qua Màn 4.'
          };
        }
        return {
          chapterLabel: 'Màn 3 / 6 — Chương 3: Hành Lang Ký Ức',
          hint: 'Tiến tới Cửa Vào Thư Phòng ở cuối hành lang bên phải [E] để sang Màn 4!'
        };

      case 4:
        if (!puzzles.lightSwitchOn) {
          return {
            chapterLabel: 'Màn 4 / 6 — Chương 4: Căn Phòng Bị Khóa',
            hint: 'Trong Quá Khứ [Q], bật Công Tắc Đèn Chùm ở đầu phòng để chiếu sáng mật mã trên tường.'
          };
        }
        if (!puzzles.lightRuneFound) {
          return {
            chapterLabel: 'Màn 4 / 6 — Chương 4: Căn Phòng Bị Khóa',
            hint: 'Quan sát Vệt Sáng Lăng Kính trên tường [E] để biết 3 nốt nhạc ru của Mẹ.'
          };
        }
        if (!puzzles.musicBoxPlayed) {
          return {
            chapterLabel: 'Màn 4 / 6 — Chương 4: Căn Phòng Bị Khóa',
            hint: 'Đọc bản vẽ của Mẹ và gảy Hộp Nhạc Của Linh trong Quá Khứ [E] để mở khóa cửa.'
          };
        }
        return {
          chapterLabel: 'Màn 4 / 6 — Chương 4: Căn Phòng Bị Khóa',
          hint: 'Chuyển về Hiện Tại [Q] và mở Cánh Cửa Bị Khóa bên phải [E] để bước vào Màn 5!'
        };

      case 5:
        return {
          chapterLabel: 'Màn 5 / 6 — Chương 5: Cuộc Truy Đuổi',
          hint: 'CHẠY VỀ BÊN PHẢI! Nhảy [Space] qua thùng gỗ và nhấn [Q] đổi thời gian khi gặp tường sập để tới Cổng Màn 6!'
        };

      case 6:
      default:
        if (!puzzles.finalCoreAligned) {
          return {
            chapterLabel: 'Màn 6 / 6 — Chương 6: Hai Phía Của Thời Gian',
            hint: 'Đọc Nhật Ký Đêm Tai Nạn và đồng bộ Trụ Cộng Hưởng Thời Gian trong Quá Khứ [E].'
          };
        }
        return {
          chapterLabel: 'Màn 6 / 6 — Chương 6: Hai Phía Của Thời Gian',
          hint: 'Tương tác với Lõi Đồng Hồ Giao Thời ở cuối phòng [E] để đưa ra Lựa Chọn Cuối Cùng!'
        };
    }
  };

  const objective = getObjectiveHint();

  const toggleSound = () => {
    soundManager.setMuted(!isMuted); setMuted(!isMuted);
  };
  return (
    <div className="game-hud">
      <header className="hud-header">
        <div className="hud-location"><span>CHƯƠNG {activeStage} <i>/ 06</i></span><h2>{currentRoom.nameVi}</h2></div>
        <div className="hud-tools">
          <button aria-label="Chọn chương" onClick={()=>setChaptersOpen(!chaptersOpen)}><Compass size={18}/></button>
          <button onClick={toggleSound} aria-label={isMuted?'Bật âm thanh':'Tắt âm thanh'}>{isMuted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button>
          <button onClick={onPause} aria-label="Tạm dừng game"><Pause size={18}/><kbd>Esc</kbd></button>
        </div>
      </header>
      {chaptersOpen&&<nav className="chapter-menu" aria-label="Chọn chương">{[1,2,3,4,5,6].map(st=><button key={st} data-testid={`stage-select-${st}`} onClick={()=>{onSelectStage(st);setChaptersOpen(false);}} aria-current={st===activeStage?'step':undefined}>Chương {st}</button>)}</nav>}
      {!isDialogueActive&&activeStage<=2&&<div className="hud-objective"><span>DẤU VẾT TIẾP THEO</span><p>{objective.hint}</p></div>}
      {notification&&!isDialogueActive&&<div className="hud-toast" role="status">{notification}</div>}
      {!isDialogueActive&&<footer className="hud-bottom">
        {activeStage>=2&&<button className={`time-control ${isPast?'is-past':''}`} disabled={!puzzles.hasWatch||!isReady} onClick={onTimelineSwitch} aria-label="Chuyển thời gian">
          <span className="time-dial">{puzzles.hasWatch?<kbd>Q</kbd>:<Lock size={16}/>}</span>
          <span><small>{isPast?'KÝ ỨC ẤM ÁP':'NGÔI NHÀ BỎ QUÊN'}</small><strong>{isPast?'Quá khứ':'Hiện tại'}</strong><em>{!puzzles.hasWatch?'Tìm đồng hồ trong phòng khách':isReady?'Chuyển thời gian':`${cooldownSeconds}s · Đang hồi phục`}</em></span>
        </button>}
        {nearbyObject&&<button className="interaction-control" onClick={onInteract}><kbd>E</kbd><span>{nearbyObject.promptVi}</span></button>}
        {activeStage<=2&&<div className="hud-controls"><span><kbd>A</kbd><kbd>D</kbd> Di chuyển</span><span><kbd>Space</kbd> Nhảy</span></div>}
      </footer>}
    </div>
  );
};
