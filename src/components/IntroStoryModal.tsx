import React, { useState } from 'react';
import { Sparkles, ArrowRight, Compass, Clock, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../game/audio';

interface IntroStoryModalProps {
  onComplete: () => void;
}

export const IntroStoryModal: React.FC<IntroStoryModalProps> = ({ onComplete }) => {
  const [slide, setSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const toggleSound = () => {
    soundManager.init();
    const next = !isMuted;
    soundManager.setMuted(next);
    setIsMuted(next);
  };

  const slides = [
    {
      chapter: 'Hồi Ức I',
      title: 'Bức Thư Không Đề Tên & Kim Đồng Hồ Gãy',
      icon: Compass,
      subtitle: 'Hành trình trở về căn nhà cũ của An sau mười năm',
      content:
        'Cơn mưa đêm phủ mờ con đường dẫn về ngôi nhà cũ của gia đình.\n\nBa ngày trước, An nhận được một phong thư không đề tên người gửi. Bên trong chỉ có một chiếc KIM ĐỒNG HỒ GÃY bằng đồng thau lạnh buốt và mảnh giấy viết vội:\n\n“Đừng để nó điểm giờ lần nữa.”'
    },
    {
      chapter: 'Hồi Ức II',
      title: 'Đêm Tai Nạn & Những Mảnh Ký Ức Rời Rạc',
      icon: Clock,
      subtitle: 'Người Mẹ, em gái Linh và chiếc đồng hồ cổ của Ông Ngoại',
      content:
        'Khi còn nhỏ, An từng sống hạnh phúc tại ngôi nhà này cùng Mẹ và em gái út tên Linh.\n\nNhưng vào một đêm mưa bão mười năm trước, một tai nạn kỳ lạ đã xảy ra khi Mẹ cố sửa chiếc đồng hồ quả lắc cổ do Ông Ngoại để lại. Sau đêm đó, bé Linh biến mất không dấu vết, Mẹ qua đời không lâu sau vì kiệt sức và đau buồn, còn ký ức của An về đêm ấy chỉ là những mảnh vỡ đứt đoạn.'
    },
    {
      chapter: 'Hồi Ức III',
      title: 'Chương 1 — Trở Về',
      icon: Sparkles,
      subtitle: 'Vật dẫn thời gian vẫn đang chờ nguồn cộng hưởng',
      content:
        'An bước qua cổng hiên căn nhà bỏ hoang, tay nắm chặt chiếc kim đồng hồ gãy. Lúc này chiếc kim vẫn hoàn toàn im lìm — bạn chưa thể chuyển đổi thời gian.\n\nNhiệm vụ mở đầu của bạn:\n• Tiến vào Phòng Khách và đọc Mảnh Giấy Của Mẹ trên bàn.\n• Đưa chiếc kim đồng hồ gãy chạm vào Đồng Hồ Quả Lắc Cổ [E] để đánh thức liên kết giữa Quá Khứ và Hiện Tại!'
    }
  ];

  const current = slides[slide];
  const IconComponent = current.icon;

  const handleNext = () => {
    soundManager.playFootstep();
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-xl w-full bg-slate-900/90 border border-amber-600/50 rounded-3xl p-7 shadow-2xl text-amber-50">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-5">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-amber-400 uppercase">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Mở Đầu Câu Chuyện — {current.chapter}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-300 transition text-xs"
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            </button>
            <button
              onClick={onComplete}
              className="text-xs font-mono text-slate-400 hover:text-amber-300 px-2 py-1 rounded hover:bg-slate-800 transition"
            >
              Bỏ qua [Skip]
            </button>
          </div>
        </div>

        {/* Icon Emblem */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-inner">
            <IconComponent className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-black tracking-wide text-amber-200">
              {current.title}
            </h3>
            <p className="text-xs font-serif italic text-amber-200/60 mt-0.5">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Narrative Prose Box */}
        <div className="bg-slate-950/70 border border-amber-900/40 rounded-2xl p-5 mb-6 text-sm text-amber-100/90 leading-relaxed font-serif whitespace-pre-line shadow-inner min-h-[150px]">
          {current.content}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-2">
          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === slide ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-900/40 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <span>{slide < slides.length - 1 ? 'Tiếp Theo' : 'Bước Vào Ngôi Nhà'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
