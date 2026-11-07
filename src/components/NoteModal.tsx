import React from 'react';
import { X, BookOpen, Feather } from 'lucide-react';

interface NoteModalProps {
  note: {
    title: string;
    content: string;
    author?: string;
  };
  onClose: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({ note, onClose }) => {
  return (
    <div className="antique-menu fixed inset-0 z-50 flex items-center justify-center bg-[#11150d]/80 backdrop-blur-xs p-4 select-none">
      <div className="relative max-w-lg w-full bg-[#f6eee3] text-[#2c1d11] rounded-2xl p-7 shadow-2xl border-4 border-[#bcaaa4] font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Đóng tài liệu"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#e0d6c8] text-[#5d4037] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Vintage Header */}
        <div className="flex items-center gap-2 border-b-2 border-[#d7ccc8] pb-3 mb-4 text-[#8d6e63]">
          <BookOpen className="w-5 h-5 text-[#6d4c41]" />
          <span className="text-xs tracking-widest uppercase font-sans font-bold">Kỷ Vật Thời Gian</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#4e342e] mb-3">{note.title}</h3>

        {/* Note Content */}
        <div className="text-sm leading-relaxed text-[#3e2723] whitespace-pre-line bg-[#efebe9]/50 p-4 rounded-xl border border-[#d7ccc8]/80 font-sans">
          {note.content}
        </div>

        {/* Author / Origin */}
        {note.author && (
          <div className="mt-4 flex items-center justify-end gap-1.5 text-xs italic text-[#795548]">
            <Feather className="w-3.5 h-3.5" />
            <span>— {note.author}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#5d4037] hover:bg-[#4e342e] text-[#fbe9e7] font-semibold text-xs tracking-wider uppercase transition shadow-md"
          >
            Gấp Lại [Esc / E]
          </button>
        </div>
      </div>
    </div>
  );
};
