import React, { useState } from 'react';
import { Timeline, InteractableObject, PuzzleState } from '../types/game';
import { RoomZone } from '../game/levelData';
import { Sun, Moon, Volume2, VolumeX, Pause, Sparkles, Compass, Lock, BookOpen } from 'lucide-react';
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
  onOpenChapters:()=>void;
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
  onOpenChapters
}) => {
  const isPast = timeline === 'PAST';
  const isReady = cooldownRatio <= 0;
  const [isMuted, setMuted] = useState(soundManager.getMuted());
  const [journalOpen,setJournalOpen]=useState(false);
  const activeStage = puzzles.storyChapter ?? puzzles.currentStage ?? 1;

  const getObjectiveHint = (): { chapterLabel: string; hint: string } => {
    switch (activeStage) {
      case 1:
        return {chapterLabel:'Chương 1 / 6 — Trở về',hint:!puzzles.tutorialMoved?'Bắt đầu từ cổng. Dùng A/D hoặc các nút ← → để đi sang phải.':!puzzles.tutorialJumped?'Thử nhảy bằng Space hoặc nút ↑, rồi đi tới ghế và cửa chính.':!puzzles.motherNoteCh1Read?'Đến gần đồ vật, nhấn E khi biểu tượng tương tác xuất hiện.':'Đến cửa chính, nhấn E để vào hành lang.'};

      case 2:
        if(!puzzles.hasWatch)return {chapterLabel:'Chương 2 — Đồng hồ của Ông Ngoại',hint:currentRoom.nameVi.includes('Hành lang')?'Bạn đang ở hành lang. Tới cửa Phòng khách và nhấn E để vào.':'Tìm chiếc đồng hồ bỏ túi trong phòng khách. Dùng cửa để quay lại hành lang.'};
        if(!puzzles.testedTimelineSwitch)return {chapterLabel:'Chương 2 — Hai mốc thời gian',hint:'Nhấn Q để thử chuyển sang Quá Khứ. Chờ 3 giây sau mỗi lần chuyển.'};
        if (!puzzles.clockRepaired) {
          return {
            chapterLabel: 'Chương 2 / 6 — Chiếc Đồng Hồ Ngừng Chạy',
            hint: 'Khám phá căn nhà trong Quá Khứ. Đến gần đồ vật và nhấn E để kiểm tra.'
          };
        }
        if (!puzzles.clockInspectedPresent) {
          return {
            chapterLabel: 'Chương 2 / 6 — Chiếc Đồng Hồ Ngừng Chạy',
            hint: 'Nhấn Q về Hiện Tại và kiểm tra đồng hồ ở phòng khách.'
          };
        }
        return {
          chapterLabel: 'Chương 2 / 6 — Chiếc Đồng Hồ Ngừng Chạy',
          hint: 'Cửa sau đã mở. Quay ra hành lang, vào nhà bếp để tới sân sau.'
        };

      default:
        return {chapterLabel:`Chương ${activeStage} / 6`,hint:''};
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
          <button aria-label="Mở sổ tay" aria-expanded={journalOpen} onClick={()=>setJournalOpen(!journalOpen)}><BookOpen size={18}/></button>
          <button aria-label="Chọn chương" onClick={onOpenChapters}><Compass size={18}/></button>
          <button onClick={toggleSound} aria-label={isMuted?'Bật âm thanh':'Tắt âm thanh'}>{isMuted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button>
          <button onClick={onPause} aria-label="Tạm dừng game"><Pause size={18}/><kbd>Esc</kbd></button>
        </div>
      </header>
      {journalOpen&&!isDialogueActive&&<aside className="hud-journal mechanism-journal"><header><h3>Sổ tay của An</h3><button onClick={()=>setJournalOpen(false)} aria-label="Đóng sổ tay">×</button></header>{puzzles.collectedClues?.length?puzzles.collectedClues.map(c=><p key={c}>{c}</p>):<p>Chưa ghi lại dấu vết nào. Kiểm tra đồ vật trong căn nhà để tìm hiểu thêm.</p>}</aside>}
      {!isDialogueActive&&!journalOpen&&activeStage<=2&&<div className="hud-objective"><span>DẤU VẾT TIẾP THEO</span><p>{objective.hint}</p></div>}
      {notification&&!isDialogueActive&&!journalOpen&&<div className="hud-toast" role="status">{notification}</div>}
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
