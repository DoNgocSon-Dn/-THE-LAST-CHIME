import React from 'react';
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
  const isMuted = soundManager.getMuted();
  const activeStage = puzzles.currentStage || 1;

  const getObjectiveHint = (): { chapterLabel: string; hint: string } => {
    switch (activeStage) {
      case 1:
        if (!puzzles.hasWatch) {
          return {
            chapterLabel: 'Màn 1 / 6 — Chương 1: Trở Về',
            hint: 'Đọc mảnh ghi chú của Mẹ trên bàn và đưa chiếc kim gãy chạm vào Đồng Hồ Cổ [E].'
          };
        }
        if (!puzzles.testedTimelineSwitch) {
          return {
            chapterLabel: 'Màn 1 / 6 — Chương 1: Trở Về',
            hint: 'Nhấn phím [Q] để thử chuyển đổi thời gian, sau đó tới cánh cửa bên phải qua Màn 2!'
          };
        }
        return {
          chapterLabel: 'Màn 1 / 6 — Chương 1: Trở Về',
          hint: 'Tiến tới Cửa Vào Phòng Khách ở cuối sảnh bên phải [E] để bước sang Màn 2!'
        };

      case 2:
        if (!puzzles.clockRepaired) {
          return {
            chapterLabel: 'Màn 2 / 6 — Chương 2: Chiếc Đồng Hồ Ngừng Chạy',
            hint: 'Chuyển sang Quá Khứ [Q], trò chuyện với Ký Ức Của Mẹ, lấy Bộ Bánh Răng trên lò sưởi và sửa Đồng Hồ Cổ.'
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
    soundManager.setMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 select-none">
      {/* TOP BAR: Stage Switcher, Room/Objective & Utilities */}
      <div className="flex items-start justify-between w-full gap-3">
        {/* Left: Stage Progress Pills & Objective */}
        <div className="flex flex-col gap-1.5 max-w-xl pointer-events-auto">
          <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-700/70 text-xs font-mono backdrop-blur-xs">
            <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-amber-300 font-bold">{objective.chapterLabel}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{currentRoom.nameVi}</span>
          </div>

          {/* 6-Stage Selector Bar so player clearly sees all 6 distinct stages */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/85 border border-slate-800/80 text-[11px] font-mono">
            <span className="text-slate-400 mr-1">Chọn Màn:</span>
            {[1, 2, 3, 4, 5, 6].map((st) => {
              const isCurrent = activeStage === st;
              return (
                <button
                  key={st}
                  type="button"
                  data-testid={`stage-select-${st}`}
                  onClick={() => onSelectStage(st)}
                  className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-amber-500/60 hover:text-amber-200'
                  }`}
                >
                  Màn {st}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-amber-800/40 text-xs text-amber-100 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="leading-tight">{objective.hint}</span>
          </div>
        </div>

        {/* Right: Audio & Pause Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            tabIndex={-1}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
          <button
            onClick={onPause}
            aria-label="Tạm dừng game"
            tabIndex={-1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 transition text-xs font-mono"
          >
            <Pause className="w-4 h-4" />
            <span>Esc</span>
          </button>
        </div>
      </div>

      {/* CENTER TOAST NOTIFICATION */}
      {notification && !isDialogueActive && (
        <div className="self-center mb-auto mt-3 px-4 py-2 rounded-xl bg-slate-950/90 border border-amber-600/70 text-amber-200 text-xs md:text-sm shadow-xl animate-fade-in text-center max-w-lg pointer-events-auto">
          {notification}
        </div>
      )}

      {/* BOTTOM CLUSTER: Timeline Switcher & Nearby Interaction Prompt */}
      {!isDialogueActive && (
        <div className="flex flex-col items-center gap-3 w-full">
          {nearbyObject && (
            <button
              onClick={onInteract}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-950/90 border-2 border-amber-500 text-amber-100 shadow-xl shadow-amber-950/50 hover:bg-amber-950/40 hover:scale-102 transition cursor-pointer"
            >
              <kbd className="px-2 py-0.5 rounded bg-amber-600 text-slate-950 font-black text-xs font-mono shadow-inner">
                E
              </kbd>
              <span className="text-xs md:text-sm font-semibold tracking-wide">
                {nearbyObject.promptVi} : <strong className="text-amber-300">{nearbyObject.nameVi}</strong>
              </span>
            </button>
          )}

          {/* Timeline Indicator & Switch Cooldown [Q] */}
          <div className="pointer-events-auto flex items-center gap-4 px-4 py-2 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-xs">
            <div className="flex items-center gap-2">
              {isPast ? (
                <div className="flex items-center gap-2 text-amber-400">
                  <div className="p-1.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                    <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-amber-500">Dòng Thời Gian</div>
                    <div className="text-xs font-bold text-amber-200 tracking-wider">QUÁ KHỨ (PAST)</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-cyan-400">
                  <div className="p-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40">
                    <Moon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-500">Dòng Thời Gian</div>
                    <div className="text-xs font-bold text-cyan-200 tracking-wider">HIỆN TẠI (PRESENT)</div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-7 w-px bg-slate-800" />

            {!puzzles.hasWatch ? (
              <button
                onClick={onTimelineSwitch}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-500 cursor-not-allowed text-xs font-mono"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                <span>Chưa Mở Khóa [Q]</span>
              </button>
            ) : (
              <button
                onClick={onTimelineSwitch}
                disabled={!isReady}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition ${
                  isReady
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300 hover:bg-amber-500/30 cursor-pointer shadow-lg shadow-amber-900/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">
                  Q
                </kbd>
                <span>
                  {isReady ? (
                    <span className="text-emerald-400">Sẵn Sàng Chuyển [Q]</span>
                  ) : (
                    <span>Hồi Chiêu: {cooldownSeconds}s</span>
                  )}
                </span>
                {!isReady && (
                  <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-100"
                      style={{ width: `${(1 - cooldownRatio) * 100}%` }}
                    />
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
