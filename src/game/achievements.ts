import type { EndingType, GameStats, PuzzleState } from '../types/game';
import { bossDefeated } from './encounters';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** Evaluated on puzzle updates (stats/ending are only provided at the ending). */
  test: (p: PuzzleState, stats?: GameStats, ending?: EndingType) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_shift', title: 'Hai mốc thời gian', description: 'Đổi sang Quá khứ lần đầu tiên.', test: p => !!p.testedTimelineSwitch },
  { id: 'clock_repaired', title: 'Tiếng tích tắc trở lại', description: 'Sửa chiếc đồng hồ lớn ở phòng khách.', test: p => !!p.clockRepaired },
  { id: 'well', title: 'Chiếc gàu lên từ giếng', description: 'Kéo gàu lên khỏi giếng sau nhà.', test: p => !!p.hallwayPassageCleared },
  { id: 'music_box', title: 'Giai điệu của Linh', description: 'Gảy đúng ba nốt của hộp nhạc.', test: p => !!p.musicBoxPlayed },
  { id: 'greenhouse', title: 'Mạch sáng', description: 'Chỉnh mạch ánh sáng trong nhà kính.', test: p => !!p.greenhouseAligned },
  { id: 'diaries', title: 'Người giữ ký ức', description: 'Đọc cả bốn lời nhắn và nhật ký của Mẹ.', test: p => !!(p.motherNoteCh1Read && p.motherDiaryCh3Read && p.motherNoteCh4Read && p.finalDiaryCh6Read) },
  { id: 'seals', title: 'Ba ấn thời gian', description: 'Giữ đủ ba ấn trong cuộc chạy trốn.', test: p => !!p.chaseSealsComplete },
  { id: 'boss', title: 'Nỗi sợ được gọi tên', description: 'Khiến Kẻ Lạc Giờ lộ lõi.', test: p => bossDefeated(p) },
  { id: 'core', title: 'Đồng bộ', description: 'Chỉnh lõi thời gian cho khớp.', test: p => !!p.finalCoreAligned },
  { id: 'ending_accept', title: 'Bước tiếp', description: 'Chấp nhận sự thật và giải phóng ký ức.', test: (_p, _s, e) => e === 'ACCEPT_TRUTH' },
  { id: 'ending_eternal', title: 'Ngày cũ vẹn nguyên', description: 'Ở lại trong bản sao ngày cũ.', test: (_p, _s, e) => e === 'ETERNAL_MEMORY' },
  { id: 'no_retry', title: 'Không lùi bước', description: 'Hoàn thành cuộc chạy trốn mà không phải thử lại.', test: (_p, s) => !!s && s.chaseRetries === 0 },
  { id: 'swift', title: 'Kịp trước giờ chuông', description: 'Kết thúc hành trình trong vòng một giờ.', test: (_p, s) => !!s && s.timeElapsed <= 3600 },
];

const KEY = 'THE_LAST_CHIME_ACHIEVEMENTS';

export function getUnlocked(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
  } catch { return []; }
}

/** Unlocks any newly satisfied achievements, persists them, and returns the new ones. */
export function evaluateAchievements(p: PuzzleState, stats?: GameStats, ending?: EndingType): Achievement[] {
  const have = new Set(getUnlocked());
  const fresh = ACHIEVEMENTS.filter(a => !have.has(a.id) && a.test(p, stats, ending));
  if (fresh.length) {
    fresh.forEach(a => have.add(a.id));
    try { localStorage.setItem(KEY, JSON.stringify([...have])); } catch { /* ignore */ }
  }
  return fresh;
}
