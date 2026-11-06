import React from 'react';
import { EndingType, GameStats } from '../types/game';
import { Sparkles, Clock, Compass, BookOpen, RotateCcw, ShieldAlert, HeartHandshake, Flame } from 'lucide-react';

interface FinalChoiceModalProps {
  onSelectEnding: (ending: EndingType) => void;
}

export const FinalChoiceModal: React.FC<FinalChoiceModalProps> = ({ onSelectEnding }) => {
  return (
    <div
      data-testid="final-choice-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 backdrop-blur-md p-4 select-none"
    >
      <div className="max-w-3xl w-full bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-7 shadow-2xl text-amber-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chương 6 — Thời Khắc Quyết Định</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-black tracking-wide text-amber-100">
            HAI PHÍA CỦA THỜI GIAN
          </h2>
          <p className="text-xs md:text-sm text-amber-200/80 font-serif italic mt-2 max-w-xl mx-auto">
            Trước Lõi Đồng Hồ Khổng Lồ, bóng hình của Kẻ Lạc Giờ khẽ run rẩy — bên trong lớp vỏ bóng tối ấy chính là ký ức và linh hồn bị mắc kẹt của bé Linh suốt mười năm qua. Chiếc kim đồng hồ gãy trong tay An đang nóng rực...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Choice 1: Accept Truth & Free Linh */}
          <div className="flex flex-col justify-between bg-slate-950/85 border-2 border-cyan-500/50 hover:border-cyan-400 rounded-2xl p-5 transition shadow-lg">
            <div>
              <div className="flex items-center gap-2.5 text-cyan-300 font-mono text-xs uppercase tracking-wider mb-2">
                <Flame className="w-4 h-4 text-cyan-400" />
                <span>Lựa Chọn I — Hiện Tại & Sự Giải Thoát</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-cyan-100 mb-2">
                Phá Hủy Liên Kết & Giải Thoát Linh
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-serif">
                Rút chiếc kim đồng hồ gãy khỏi lõi cơ khí để chấm dứt vòng lặp thời gian mãi mãi. Kẻ Lạc Giờ sẽ tan biến, linh hồn của bé Linh và tâm nguyện của Mẹ được siêu thoát, còn An chấp nhận sự thật để bước tiếp về phía tương lai.
              </p>
            </div>

            <button
              data-testid="choose-ending-accept"
              onClick={() => onSelectEnding('ACCEPT_TRUTH')}
              className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              Chấp Nhận Sự Thật & Giải Thoát Linh
            </button>
          </div>

          {/* Choice 2: Eternal Memory */}
          <div className="flex flex-col justify-between bg-slate-950/85 border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl p-5 transition shadow-lg">
            <div>
              <div className="flex items-center gap-2.5 text-amber-300 font-mono text-xs uppercase tracking-wider mb-2">
                <HeartHandshake className="w-4 h-4 text-amber-400" />
                <span>Lựa Chọn II — Quá Khứ Vĩnh Cửu</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-amber-100 mb-2">
                Khóa Chặt Kim Đồng Hồ & Ở Lại Quá Khứ
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-serif">
                Cố định chiếc kim đồng hồ gãy vào bánh răng trung tâm để đóng băng ngôi nhà trong buổi chiều ấm áp trước đêm tai nạn. An sẽ mãi mãi ở lại cùng Mẹ và bé Linh trong vòng lặp ký ức êm đềm, đánh đổi việc không bao giờ trở về Hiện Tại.
              </p>
            </div>

            <button
              data-testid="choose-ending-eternal"
              onClick={() => onSelectEnding('ETERNAL_MEMORY')}
              className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              Giữ Lại Ký Ức & Đoàn Tụ Ở Quá Khứ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EndingModalProps {
  stats: GameStats;
  ending: EndingType;
  onRestart: () => void;
  onSwitchEnding?: (ending: EndingType) => void;
}

export const EndingModal: React.FC<EndingModalProps> = ({
  stats,
  ending,
  onRestart,
  onSwitchEnding
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isAcceptTruth = ending === 'ACCEPT_TRUTH';

  return (
    <div
      data-testid="ending-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 select-none"
    >
      <div className="max-w-xl w-full bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-7 shadow-2xl text-amber-50 relative overflow-hidden">
        {/* Celestial Light Flare */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Emblem */}
        <div className="text-center mb-5">
          <div
            className={`inline-flex p-3 rounded-full mb-2 border ${
              isAcceptTruth
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}
          >
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div className="text-xs uppercase font-mono tracking-widest text-amber-400">
            {isAcceptTruth
              ? 'Kết Thúc I / II — Bình Minh Sau Cơn Mưa'
              : 'Kết Thúc II / II — Giấc Mơ Không Bao Giờ Tỉnh'}
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-black tracking-wider text-amber-200 mt-1">
            {isAcceptTruth ? 'PHÍA BÊN KIA CỦA SỰ THẬT' : 'MÃI MÃI TRONG QUÁ KHỨ'}
          </h2>
        </div>

        {/* Epilogue Narrative */}
        <div className="bg-[#f6eee3] text-[#2c1d11] p-5 rounded-2xl border-2 border-[#d7ccc8] mb-5 font-serif shadow-inner">
          <h3 className="text-sm font-bold text-[#5d4037] mb-2 uppercase tracking-wide">
            {isAcceptTruth
              ? 'Lời Từ Biệt Của Bé Linh & Người Mẹ'
              : 'Buổi Chiều Hoàng Hôn Bất Tận'}
          </h3>
          {isAcceptTruth ? (
            <p className="text-xs md:text-sm leading-relaxed text-[#3e2723] italic">
              Khi An rút chiếc kim đồng hồ gãy ra khỏi lõi cơ khí, tiếng chuông đồng hồ cuối cùng vang lên trong trẻo rồi lặng hẳn. Lớp sương mù đen tối của Kẻ Lạc Giờ tan biến thành muôn ngàn đom đóm sáng, để lộ hình bóng bé Linh mỉm cười nắm lấy bàn tay Mẹ.
              <br />
              <br />
              “Cảm ơn chị An... Đừng tự trách mình nữa nhé, chị đã cứu em khỏi bóng tối rồi.” Ánh bình minh rọi qua khung cửa sổ căn nhà cũ. Quá khứ đã khép lại bình yên, và An bước ra khỏi hiên nhà với trái tim được chữa lành.
            </p>
          ) : (
            <p className="text-xs md:text-sm leading-relaxed text-[#3e2723] italic">
              An ấn chặt chiếc kim đồng hồ gãy vào trục trung tâm, khóa vĩnh viễn bánh răng thời gian ở mốc hoàng hôn trước đêm tai nạn. Căn nhà đổ nát của Hiện Tại hoàn toàn biến mất, nhường chỗ cho ánh đèn vàng ấm áp và tiếng hộp nhạc du dương.
              <br />
              <br />
              Từ dưới cầu thang, tiếng Mẹ dịu dàng gọi hai chị em xuống ăn tối, còn bé Linh chạy ùa tới ôm chầm lấy An. Dù ngoài kia thời gian của thế giới thực đã dừng lại mãi mãi, An mỉm cười khép cánh cửa phòng — chọn ở lại trong ký ức trọn vẹn này.
            </p>
          )}
          <div className="mt-3 text-right text-xs font-bold text-[#8d6e63]">
            {isAcceptTruth ? '— Khép lại 10 năm ký ức' : '— Ký ức bất tận bên Mẹ và Linh'}
          </div>
        </div>

        {/* Run Mastery Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
            <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-[10px] text-slate-400 font-mono uppercase">Thời Gian</div>
            <div className="text-sm font-bold font-mono text-amber-200">
              {formatTime(stats.timeElapsed)}
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
            <Compass className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-[10px] text-slate-400 font-mono uppercase">Đổi Thời Gian</div>
            <div className="text-sm font-bold font-mono text-cyan-200">
              {stats.timelineSwitches} lần
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
            <Sparkles className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-[10px] text-slate-400 font-mono uppercase">Chương</div>
            <div className="text-sm font-bold font-mono text-emerald-200">
              6 / 6
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
            <BookOpen className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-[10px] text-slate-400 font-mono uppercase">Nhật Ký</div>
            <div className="text-sm font-bold font-mono text-purple-200">
              {stats.notesRead}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onSwitchEnding && (
            <button
              data-testid="switch-other-ending-btn"
              onClick={() =>
                onSwitchEnding(isAcceptTruth ? 'ETERNAL_MEMORY' : 'ACCEPT_TRUTH')
              }
              className="flex-1 py-3 px-4 rounded-2xl border border-amber-500/60 bg-slate-800/80 hover:bg-slate-800 text-amber-200 font-bold uppercase tracking-wider text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>
                {isAcceptTruth ? 'Xem Kết Thúc II (Ở Lại Quá Khứ)' : 'Xem Kết Thúc I (Giải Thoát Linh)'}
              </span>
            </button>
          )}

          <button
            data-start="true"
            onClick={onRestart}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold uppercase tracking-wider text-xs transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi Lại Từ Đầu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
