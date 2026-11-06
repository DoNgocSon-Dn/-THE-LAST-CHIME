import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Clock, Compass, BookOpen, Play } from 'lucide-react';
import { soundManager } from '../game/audio';

interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  hasSave: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onContinue, hasSave }) => {
  const [showStory, setShowStory] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const toggleSound = () => {
    soundManager.init();
    const nextMuted = !isMuted;
    soundManager.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 select-none overflow-hidden bg-slate-950 text-amber-50">
      {/* Cinematic Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-radial from-amber-950/40 via-slate-950/80 to-slate-950" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Top Header / Audio Toggle */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between border-b border-amber-900/30 pb-3">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-amber-400/80">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>2D Side-Scrolling Temporal Puzzle & Mystery</span>
        </div>
        <button
          onClick={toggleSound}
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-800/40 bg-amber-950/30 text-amber-200/90 hover:bg-amber-900/40 hover:text-amber-100 transition text-xs font-mono"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          <span>{isMuted ? 'Âm thanh: TẮT' : 'Âm thanh: BẬT'}</span>
        </button>
      </header>

      {/* Center Hero Title Lockup */}
      <main className="relative z-10 flex flex-col items-center text-center my-auto max-w-2xl">
        {/* Dual Crest Emblem */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-amber-500/40 flex items-center justify-center bg-radial from-amber-500/20 to-transparent shadow-lg shadow-amber-900/30">
            <svg viewBox="0 0 48 48" className="w-12 h-12">
              {/* Left half: Past Sun */}
              <path d="M24 6 A18 18 0 0 0 24 42 Z" fill="#f39c12" fillOpacity="0.85" />
              {/* Right half: Present Moon */}
              <path d="M24 6 A18 18 0 0 1 24 42 A14 14 0 0 0 24 6 Z" fill="#00cec9" fillOpacity="0.85" />
              {/* Clock hands */}
              <line x1="24" y1="24" x2="24" y2="12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="24" y1="24" x2="33" y2="24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="24" r="3" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-xs md:text-sm font-mono uppercase tracking-[0.35em] text-amber-400/90 mb-1.5">
          THE LAST CHIME
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 drop-shadow-md">
          KHI ĐỒNG HỒ ĐIỂM
        </h1>
        <p className="mt-2.5 text-sm md:text-base font-serif italic text-amber-200/80">
          “Đừng để nó điểm giờ lần nữa.” — Hành trình đi tìm sự thật giữa Quá Khứ & Hiện Tại
        </p>

        {/* Menu Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center">
          <button
            data-start="true"
            onClick={onStart}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold tracking-wider uppercase shadow-lg shadow-amber-600/25 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Bắt Đầu Hành Trình</span>
          </button>

          {hasSave && (
            <button
              onClick={onContinue}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-amber-700/60 bg-slate-900/80 hover:bg-amber-950/60 text-amber-200 font-semibold tracking-wide transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Tiếp Tục</span>
            </button>
          )}

          <button
            onClick={() => setShowStory(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 hover:border-amber-600/50 bg-slate-900/50 text-slate-300 hover:text-amber-200 transition flex items-center justify-center gap-2 text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Cốt Truyện</span>
          </button>
        </div>
      </main>

      {/* Footer Controls Hints */}
      <footer className="relative z-10 w-full max-w-4xl text-center border-t border-amber-900/20 pt-3">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-amber-200/60 font-mono">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">A</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">D</kbd>
            <span>/ Mũi tên: Di chuyển</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">Space</kbd>
            <span>: Nhảy</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-600 text-amber-200 font-bold">Q</kbd>
            <span>: Chuyển thời gian (Past ⇄ Present)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">E</kbd>
            <span>: Tương tác vật thể</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">Esc</kbd>
            <span>: Tạm dừng</span>
          </span>
        </div>
      </footer>

      {/* Story Lore Modal */}
      {showStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-amber-700/60 rounded-2xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-serif font-bold text-amber-300 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Khi Đồng Hồ Điểm — Cốt Truyện</span>
            </h2>
            <div className="space-y-3 text-sm text-amber-100/85 leading-relaxed font-serif">
              <p>
                <strong>An</strong> trở về căn nhà cũ của gia đình sau khi nhận được bức thư không đề tên kèm theo một <strong>chiếc kim đồng hồ gãy</strong> và lời nhắn: <em>“Đừng để nó điểm giờ lần nữa.”</em>
              </p>
              <p>
                Mười năm trước, một tai nạn xảy ra khi Mẹ thử sửa chiếc đồng hồ cổ do Ông Ngoại để lại. Đêm đó em gái <strong>Linh</strong> biến mất, Mẹ qua đời không lâu sau, còn An chỉ nhớ những mảnh ký ức rời rạc.
              </p>
              <p className="bg-amber-950/40 p-3 rounded-lg border border-amber-800/40 text-amber-200">
                ⚡ <strong>Liên kết thời gian:</strong> Khi kim đồng hồ gãy chạm vào đồng hồ cổ, nó mở ra liên kết giữa <strong className="text-amber-300">QUÁ KHỨ</strong> (trước đêm tai nạn) và <strong className="text-cyan-300">HIỆN TẠI</strong> (ngôi nhà hoang phế). Chỉ những vật thể cộng hưởng với chiếc kim mới giữ được trạng thái xuyên thời gian.
              </p>
              <p>
                Nhưng trong khe nứt thời gian ấy, thực thể mang tên <strong>Kẻ Lạc Giờ</strong> vẫn đang rình rập. Hãy vượt qua 6 chương truyện để khám phá sự thật và đưa ra lựa chọn cuối cùng.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStory(false)}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition text-sm"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
