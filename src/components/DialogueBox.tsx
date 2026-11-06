import React, { useState, useEffect } from 'react';
import { DialogueLine, SpeakerId, DialogueEmotion } from '../types/game';
import { StageConfig } from '../game/levelData';
import { ChevronRight, Sparkles } from 'lucide-react';
import { soundManager } from '../game/audio';

interface CharacterPortraitProps {
  speaker: SpeakerId;
  emotion: DialogueEmotion;
}

const CharacterPortrait: React.FC<CharacterPortraitProps> = ({ speaker, emotion }) => {
  if (speaker === 'ME') {
    return (
      <svg viewBox="0 0 96 96" className="w-full h-full">
        <defs>
          <radialGradient id="meBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#1c1917" />
          </radialGradient>
        </defs>
        <rect width="96" height="96" rx="16" fill="url(#meBg)" />
        {/* Warm memory halo */}
        <circle cx="48" cy="46" r="34" fill="#f59e0b" fillOpacity="0.18" />
        {/* Hair bun & back hair */}
        <circle cx="48" cy="20" r="11" fill="#2c1810" />
        <circle cx="48" cy="44" r="22" fill="#3b2316" />
        {/* Shoulders & Clockmaker Shawl */}
        <path d="M20 92 C22 68, 74 68, 76 92 Z" fill="#92400e" />
        <path d="M34 72 L48 88 L62 72 Z" fill="#fef3c7" />
        {/* Face */}
        <rect x="33" y="30" width="30" height="33" rx="14" fill="#fde4cf" />
        {/* Front bangs */}
        <path d="M31 40 Q48 24 65 40 Q58 31 48 33 Q38 31 31 40 Z" fill="#2c1810" />
        {/* Round brass spectacles */}
        <circle cx="41" cy="46" r="5.5" stroke="#fbbf24" strokeWidth="2" fill="rgba(255,255,255,0.15)" />
        <circle cx="55" cy="46" r="5.5" stroke="#fbbf24" strokeWidth="2" fill="rgba(255,255,255,0.15)" />
        <line x1="46.5" y1="46" x2="49.5" y2="46" stroke="#fbbf24" strokeWidth="2" />
        {/* Gentle Eyes */}
        <circle cx="41" cy="46" r="1.8" fill="#292524" />
        <circle cx="55" cy="46" r="1.8" fill="#292524" />
        {/* Expression mouth */}
        {emotion === 'sad' ? (
          <path d="M44 56 Q48 53 52 56" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M43 55 Q48 58 53 55" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
      </svg>
    );
  }

  if (speaker === 'LINH') {
    return (
      <svg viewBox="0 0 96 96" className="w-full h-full">
        <defs>
          <radialGradient id="linhBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#164e63" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>
        <rect width="96" height="96" rx="16" fill="url(#linhBg)" />
        <circle cx="48" cy="48" r="34" fill="#22d3ee" fillOpacity="0.18" />
        {/* Twin tails & Cyan Ribbon */}
        <circle cx="27" cy="52" r="9" fill="#2c1810" />
        <circle cx="69" cy="52" r="9" fill="#2c1810" />
        <rect x="23" y="38" width="10" height="5" rx="2" fill="#22d3ee" />
        <rect x="63" y="38" width="10" height="5" rx="2" fill="#22d3ee" />
        {/* Dress */}
        <path d="M24 92 C26 70, 70 70, 72 92 Z" fill="#0284c7" />
        <path d="M36 73 L48 84 L60 73 Z" fill="#e0f2fe" />
        {/* Head */}
        <circle cx="48" cy="44" r="20" fill="#3b2316" />
        <rect x="34" y="33" width="28" height="29" rx="13" fill="#fde4cf" />
        {/* Bangs */}
        <path d="M32 42 Q48 28 64 42 L60 34 L48 37 L36 34 Z" fill="#2c1810" />
        {/* Big innocent eyes */}
        <circle cx="41" cy="48" r="2.8" fill="#0f172a" />
        <circle cx="55" cy="48" r="2.8" fill="#0f172a" />
        <circle cx="42" cy="47" r="1" fill="#ffffff" />
        <circle cx="56" cy="47" r="1" fill="#ffffff" />
        {/* Tear drop if sad */}
        {emotion === 'sad' && (
          <path d="M39 52 Q38 56 40 57 Q42 56 41 52 Z" fill="#38bdf8" />
        )}
        {/* Mouth */}
        {emotion === 'sad' ? (
          <path d="M44 56 Q48 53 52 56" stroke="#be123c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M44 55 Q48 58 52 55" stroke="#be123c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        )}
      </svg>
    );
  }

  if (speaker === 'KE_LAC_GIO') {
    return (
      <svg viewBox="0 0 96 96" className="w-full h-full">
        <rect width="96" height="96" rx="16" fill="#090d16" />
        <circle cx="48" cy="48" r="36" fill="#6d28d9" fillOpacity="0.25" />
        {/* Clock face silhouette */}
        <circle cx="48" cy="48" r="30" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
        {/* Shadowy hood */}
        <path d="M24 90 C24 52, 72 52, 72 90 Z" fill="#020617" />
        <circle cx="48" cy="44" r="17" fill="#020617" />
        {/* Glowing fractured eyes */}
        <rect x="38" y="42" width="6" height="4" rx="1" fill="#22d3ee" />
        <rect x="52" y="42" width="6" height="4" rx="1" fill="#22d3ee" />
        {/* Broken golden clock hands */}
        <line x1="48" y1="66" x2="62" y2="54" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="48" y1="66" x2="36" y2="74" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Default: AN (Protagonist) with expressive emotions
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <defs>
        <radialGradient id="anBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
      <rect width="96" height="96" rx="16" fill="url(#anBg)" />
      <circle cx="48" cy="48" r="36" fill="#f59e0b" fillOpacity="0.16" />

      {/* Back Chestnut Bob Hair */}
      <path d="M26 56 C24 26, 72 26, 70 56 L66 64 L30 64 Z" fill="#2c1810" />

      {/* Autumn Trench Coat & Warm Amber Scarf */}
      <path d="M20 92 C23 68, 73 68, 76 92 Z" fill="#b45309" />
      <rect x="30" y="62" width="36" height="11" rx="5" fill="#fbbf24" />
      <path d="M54 68 L64 88 L52 88 Z" fill="#f59e0b" />

      {/* Face */}
      <rect x="33" y="31" width="30" height="32" rx="14" fill="#fde4cf" />

      {/* Rosy cheeks */}
      <circle cx="38" cy="51" r="3" fill="#f472b6" fillOpacity="0.35" />
      <circle cx="58" cy="51" r="3" fill="#f472b6" fillOpacity="0.35" />

      {/* Front Bangs & Sister's Cyan Hairpin */}
      <path d="M30 43 C33 27, 63 27, 66 43 C60 35, 53 34, 48 37 C42 34, 36 35, 30 43 Z" fill="#3b2316" />
      <rect x="34" y="34" width="8" height="3" rx="1.5" transform="rotate(-15 34 34)" fill="#38bdf8" />

      {/* Eyebrows based on emotion */}
      {emotion === 'sad' && (
        <>
          <line x1="37" y1="42" x2="44" y2="44" stroke="#2c1810" strokeWidth="2" strokeLinecap="round" />
          <line x1="59" y1="42" x2="52" y2="44" stroke="#2c1810" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {emotion === 'determined' && (
        <>
          <line x1="37" y1="44" x2="44" y2="42" stroke="#2c1810" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="59" y1="44" x2="52" y2="42" stroke="#2c1810" strokeWidth="2.2" strokeLinecap="round" />
        </>
      )}
      {(emotion === 'normal' || emotion === 'surprised' || emotion === 'whisper') && (
        <>
          <line x1="37" y1="42" x2="44" y2="42" stroke="#2c1810" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="52" y1="42" x2="59" y2="42" stroke="#2c1810" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {/* Eyes */}
      <circle cx="41" cy="47" r={emotion === 'surprised' ? 3.2 : 2.6} fill="#1e1b4b" />
      <circle cx="55" cy="47" r={emotion === 'surprised' ? 3.2 : 2.6} fill="#1e1b4b" />
      <circle cx="42" cy="46" r="1" fill="#ffffff" />
      <circle cx="56" cy="46" r="1" fill="#ffffff" />

      {/* Mouth based on emotion */}
      {emotion === 'surprised' && <circle cx="48" cy="56" r="2.6" fill="#9a3412" />}
      {emotion === 'sad' && (
        <path d="M44 57 Q48 54 52 57" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {emotion === 'determined' && (
        <line x1="44" y1="56" x2="52" y2="55.5" stroke="#9a3412" strokeWidth="2.2" strokeLinecap="round" />
      )}
      {(emotion === 'normal' || emotion === 'whisper') && (
        <path d="M44 55.5 Q48 58 52 55.5" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
};

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
    AN: 'bg-amber-500/20 border-amber-400/60 text-amber-200',
    ME: 'bg-orange-500/20 border-orange-400/60 text-orange-200',
    LINH: 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200',
    KE_LAC_GIO: 'bg-purple-500/25 border-purple-400/60 text-purple-200',
    HE_THONG: 'bg-slate-700/60 border-slate-500 text-slate-200'
  };

  return (
    <div
      data-testid="dialogue-box"
      onClick={handleAdvance}
      className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6 flex justify-center items-end bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent select-none cursor-pointer"
    >
      <div className="max-w-4xl w-full bg-slate-950/95 border-2 border-amber-500/60 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-md flex items-center gap-4 md:gap-5 relative">
        {/* Expressive Character Portrait */}
        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl border-2 border-amber-500/50 overflow-hidden shadow-lg bg-slate-900">
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
              <span className="text-[11px] font-mono text-slate-400">
                ({lineIndex + 1}/{lines.length})
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-amber-300 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800"
            >
              Đóng nhanh [Esc]
            </button>
          </div>

          <p className="text-sm md:text-base text-amber-50 font-serif leading-relaxed min-h-[3.2rem]">
            {fullText.slice(0, charIndex)}
            {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-amber-400 animate-pulse" />}
          </p>

          <div className="mt-2 flex items-center justify-end gap-1.5 text-xs font-mono text-amber-300/90">
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
      className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center bg-slate-950/75 backdrop-blur-xs animate-fade-in"
    >
      <div className="text-center px-8 py-6 rounded-3xl bg-slate-950/90 border-2 border-amber-500/60 shadow-2xl max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chuyển Màn Chơi — {stageConfig.roomNameVi}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-black text-amber-100 tracking-wide">
          {stageConfig.chapterTitleVi}
        </h2>
        <p className="text-xs md:text-sm font-serif italic text-amber-200/80 mt-2">
          {stageConfig.subtitleVi}
        </p>
      </div>
    </div>
  );
};
