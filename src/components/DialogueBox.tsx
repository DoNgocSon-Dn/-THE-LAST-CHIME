import { PixelPortrait } from './PixelPortrait';
import React, { useState, useEffect } from 'react';
import { DialogueLine, SpeakerId, DialogueEmotion } from '../types/game';
import { StageConfig } from '../game/levelData';
import { ChevronRight, Sparkles } from 'lucide-react';
import { soundManager } from '../game/audio';

interface CharacterPortraitProps {
  speaker: SpeakerId;
  emotion: DialogueEmotion;
}

const CharacterPortrait:React.FC<CharacterPortraitProps>=({speaker})=><PixelPortrait speaker={speaker}/>;

interface DialogueBoxProps {
  lines: DialogueLine[];
  onClose: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ lines, onClose }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const currentLine = lines[lineIndex] || lines[0];
  const fullText = currentLine?.text || '';
  const isTyping = charIndex < fullText.length;

  useEffect(() => {
    setCharIndex(0);
  }, [lineIndex, lines]);

  useEffect(() => {
    if (!currentLine) return;
    if (charIndex < fullText.length) {
      const timer = window.setTimeout(() => {
        setCharIndex((prev) => Math.min(fullText.length, prev + 2));
      }, 18);
      return () => clearTimeout(timer);
    }
  }, [charIndex, fullText, currentLine]);

  const handleAdvance = () => {
    soundManager.playFootstep();
    if (isTyping) {
      setCharIndex(fullText.length);
      return;
    }
    if (lineIndex < lines.length - 1) {
      setLineIndex(lineIndex + 1);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'e' || key === ' ' || key === 'enter') {
        e.preventDefault();
        e.stopPropagation();
        handleAdvance();
      } else if (key === 'escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  });

  if (!currentLine) return null;

  const badgeColors: Record<SpeakerId, string> = {
    ONG: 'bg-amber-500/20 border-amber-400/60 text-amber-200',
    AN: 'bg-amber-500/20 border-amber-400/60 text-amber-200',
    ME: 'bg-orange-500/20 border-orange-400/60 text-orange-200',
    LINH: 'bg-amber-600/20 border-amber-400/60 text-amber-100',
    KE_LAC_GIO: 'bg-purple-500/25 border-purple-400/60 text-purple-200',
    HE_THONG: 'bg-[#6b6039]/60 border-[#a19872] text-[#e1d4ac]'
  };

  return (
    <div
      data-testid="dialogue-box"
      onClick={handleAdvance}
      className="antique-menu fixed inset-x-0 bottom-0 z-50 p-4 md:p-6 flex justify-center items-end bg-gradient-to-t from-[#11150d]/95 via-[#11150d]/50 to-transparent select-none cursor-pointer"
    >
      <div className="max-w-4xl w-full bg-[#11150d]/95 border-2 border-amber-500/60 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-md flex items-center gap-4 md:gap-5 relative">
        {/* Expressive Character Portrait */}
        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl border-2 border-amber-500/50 overflow-hidden shadow-lg bg-[#232217]">
          <CharacterPortrait speaker={currentLine.speaker} emotion={currentLine.emotion} />
        </div>

        {/* Dialogue Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-0.5 rounded-full border text-xs font-bold tracking-wide ${
                  badgeColors[currentLine.speaker]
                }`}
              >
                {currentLine.speakerName}
              </span>
              <span className="text-[11px] font-sans text-[#b8b28d]">
                ({lineIndex + 1}/{lines.length})
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-[11px] font-sans text-[#b8b28d] hover:text-amber-300 px-2 py-0.5 rounded bg-[#232217]/80 border border-[#41412a]"
            >
              Đóng nhanh [Esc]
            </button>
          </div>

          <p className="text-sm md:text-base text-amber-50 font-sans leading-relaxed min-h-[3.2rem]">
            {fullText.slice(0, charIndex)}
            {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-amber-400 animate-pulse" />}
          </p>

          <div className="mt-2 flex items-center justify-end gap-1.5 text-xs font-sans text-amber-300/90">
            <span>
              {isTyping
                ? 'Nhấn [E] / [Space] để hiện hết câu'
                : lineIndex < lines.length - 1
                  ? 'Nhấn [E] / [Space] để nghe tiếp'
                  : 'Nhấn [E] / [Space] để tiếp tục hành trình'}
            </span>
            <ChevronRight className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface StageTransitionBannerProps {
  stageConfig: StageConfig | null;
}

export const StageTransitionBanner: React.FC<StageTransitionBannerProps> = ({ stageConfig }) => {
  if (!stageConfig) return null;

  return (
    <div
      data-testid="stage-transition-banner"
      className="antique-menu fixed inset-0 z-40 pointer-events-none flex items-center justify-center bg-[#11150d]/75 backdrop-blur-xs animate-fade-in"
    >
      <div className="text-center px-8 py-6 rounded-3xl bg-[#11150d]/90 border-2 border-amber-500/60 shadow-2xl max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-sans uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chương mới — {stageConfig.roomNameVi}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-amber-100 tracking-wide">
          {stageConfig.chapterTitleVi}
        </h2>
        <p className="text-xs md:text-sm font-sans italic text-amber-200/80 mt-2">
          {stageConfig.subtitleVi}
        </p>
      </div>
    </div>
  );
};
