import React, { useState } from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../game/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onMainMenu }) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [musicVol, setMusicVol] = useState(soundManager.getMusicVolume());
  const [sfxVol, setSfxVol] = useState(soundManager.getSfxVolume());

  const handleToggleMute = () => {
    const next = !isMuted;
    soundManager.setMuted(next);
    setIsMuted(next);
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    soundManager.setMusicVolume(val);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundManager.setSfxVolume(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4 select-none">
      <div className="max-w-sm w-full bg-slate-900 border border-amber-800/60 rounded-2xl p-6 shadow-2xl text-amber-50">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-500">Tạm Dừng — THE LAST CHIME</div>
          <h2 className="text-2xl font-serif font-black tracking-wider text-amber-200 mt-1">
            KHI ĐỒNG HỒ ĐIỂM
          </h2>
        </div>

        {/* Audio Volume Controls */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 mb-6 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Âm thanh</span>
            <button
              onClick={handleToggleMute}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 hover:text-amber-300 text-slate-300 text-xs"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isMuted ? 'Đã tắt' : 'Bật'}</span>
            </button>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Nhạc nền (BGM)</span>
              <span>{Math.round(musicVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVol}
              onChange={handleMusicChange}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Hiệu ứng (SFX)</span>
              <span>{Math.round(sfxVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={handleSfxChange}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold uppercase tracking-wider text-xs transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Tiếp Tục Chơi [Esc]</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-700 hover:border-amber-600/50 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Chơi Lại Từ Đầu</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-400 hover:text-slate-200 text-xs transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Về Màn Hình Chính</span>
          </button>
        </div>
      </div>
    </div>
  );
};
