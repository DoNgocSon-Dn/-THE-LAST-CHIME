import { normalizeSceneScales } from './sceneScale';
import { configurePixelCampaign } from './pixelCampaign';
import { currentPixelRoom } from './pixelLayout';
import { Platform, InteractableObject, PuzzleState, MemoryNPC, Timeline } from '../types/game';

export const LEVEL_WIDTH = 1200; // Default stage width (each stage has its own width in StageConfig)
export const LEVEL_HEIGHT = 600;

export interface RoomZone {
  id: string;
  chapter: number;
  chapterTitleVi: string;
  nameVi: string;
  nameEn: string;
  minX: number;
  maxX: number;
}

export interface StageConfig {
  stage: number;
  id: string;
  chapterTitleVi: string;
  subtitleVi: string;
  roomNameVi: string;
  roomNameEn: string;
  width: number;
  spawnX: number;
  spawnY: number;
  defaultTimeline: Timeline;
  platforms: Platform[];
  interactables: InteractableObject[];
  memoryNPCs: MemoryNPC[];
}

export const ROOM_ZONES: RoomZone[] = [
  {
    id: 'stage_1',
    chapter: 1,
    chapterTitleVi: 'Màn 1 — Chương 1: Trở Về',
    nameVi: 'Hiên Nhà & Sảnh Đón',
    nameEn: 'Entrance Porch & Foyer',
    minX: 0,
    maxX: 1100
  },
  {
    id: 'stage_2',
    chapter: 2,
    chapterTitleVi: 'Màn 2 — Chương 2: Chiếc Đồng Hồ Ngừng Chạy',
    nameVi: 'Phòng Khách & Xưởng Đồng Hồ',
    nameEn: 'Family Living Room',
    minX: 0,
    maxX: 1150
  },
  {
    id: 'stage_3',
    chapter: 3,
    chapterTitleVi: 'Màn 3 — Chương 3: Hành Lang Ký Ức',
    nameVi: 'Hành Lang Gác Lửng',
    nameEn: 'Corridor of Memories',
    minX: 0,
    maxX: 1200
  },
  {
    id: 'stage_4',
    chapter: 4,
    chapterTitleVi: 'Màn 4 — Chương 4: Căn Phòng Bị Khóa',
    nameVi: 'Thư Phòng & Phòng Ngủ Của Linh',
    nameEn: 'Bedroom & Study',
    minX: 0,
    maxX: 1200
  },
  {
    id: 'stage_5',
    chapter: 5,
    chapterTitleVi: 'Màn 5 — Chương 5: Cuộc Truy Đuổi',
    nameVi: 'Hành Lang Sụp Đổ',
    nameEn: 'Shattered Gallery',
    minX: 0,
    maxX: 1500
  },
  {
    id: 'stage_6',
    chapter: 6,
    chapterTitleVi: 'Màn 6 — Chương 6: Hai Phía Của Thời Gian',
    nameVi: 'Tâm Điểm Thời Gian',
    nameEn: 'Clockwork Sanctuary',
    minX: 0,
    maxX: 1100
  }
];

function createStageBoundaryPlatforms(width: number): Platform[] {
  return [
    { id: 'ground_main', x: 0, y: 480, width, height: 120, type: 'solid', timeline: 'both' },
    { id: 'wall_left', x: -30, y: 0, width: 30, height: 600, type: 'solid', timeline: 'both' },
    { id: 'wall_right', x: width, y: 0, width: 30, height: 600, type: 'solid', timeline: 'both' },
    { id: 'ceiling', x: 0, y: -20, width, height: 40, type: 'solid', timeline: 'both' }
  ];
}

export const STAGE_CONFIGS: Record<number, StageConfig> = {
  // =========================================================================
  // MÀN 1 (CHƯƠNG 1 — TRỞ VỀ)
  // =========================================================================
  1: {
    stage: 1,
    id: 'stage_1',
    chapterTitleVi: 'Màn 1 — Chương 1: Trở Về',
    subtitleVi: 'Đêm mưa trở lại căn nhà cũ & chiếc kim đồng hồ gãy',
    roomNameVi: 'Hiên Nhà & Sảnh Đón',
    roomNameEn: 'Entrance Porch & Foyer',
    width: 1100,
    spawnX: 80,
    spawnY: 436,
    defaultTimeline: 'PRESENT',
    platforms: [
      ...createStageBoundaryPlatforms(1100),
      { id: 'porch_bench', x: 210, y: 446, width: 65, height: 34, type: 'one-way', timeline: 'both' },
      { id: 'foyer_table', x: 445, y: 442, width: 70, height: 38, type: 'one-way', timeline: 'both' }
    ],
    interactables: [
      {
        id: 'entrance_journal',
        name: 'Anonymous Letter & Broken Clock Hand',
        nameVi: 'Bức Thư Vô Danh & Chiếc Kim Gãy',
        descriptionVi: 'Bức thư không đề tên kèm chiếc kim đồng hồ gãy.',
        timeline: 'both',
        promptVi: 'Xem lại bức thư & chiếc kim gãy',
        room: 'stage_1',
        chapter: 1,
        type: 'journal_entry',
        x: 175,
        y: 425,
        width: 32,
        height: 48
      },
      {
        id: 'mother_note_ch1',
        name: "Mother's Faded Note",
        nameVi: 'Mẩu giấy cũ',
        descriptionVi: 'Một góc giấy mắc dưới thanh ghế.',
        timeline: 'both',
        promptVi: 'Nhặt mẩu giấy',
        room: 'stage_1',
        chapter: 1,
        type: 'journal_entry',
        x: 465,
        y: 416,
        width: 32,
        height: 45
      },
      {
        id: 'clock',
        name: 'Grandfather Antique Clock (Awakening)',
        nameVi: 'Đồng Hồ Quả Lắc Cổ',
        descriptionVi: 'Đưa chiếc kim đồng hồ gãy lại gần để đánh thức liên kết thời gian.',
        timeline: 'both',
        promptVi: 'Đưa chiếc kim gãy chạm vào Đồng Hồ Cổ',
        room: 'stage_1',
        chapter: 1,
        type: 'clock',
        x: 680,
        y: 380,
        width: 46,
        height: 100
      },
      {
        id: 'stage_exit_1',
        name: 'Door to Living Room (Stage 2)',
        nameVi: 'Cửa Vào Phòng Khách (Qua Màn 2)',
        descriptionVi: 'Cánh cửa dẫn sâu vào Phòng Khách & Xưởng Đồng Hồ.',
        timeline: 'both',
        promptVi: 'Bước qua Màn 2: Phòng Khách',
        room: 'stage_1',
        chapter: 1,
        type: 'stage_door',
        x: 960,
        y: 375,
        width: 44,
        height: 105
      }
    ],
    memoryNPCs: []
  },

  // =========================================================================
  // MÀN 2 (CHƯƠNG 2 — CHIẾC ĐỒNG HỒ NGỪNG CHẠY)
  // =========================================================================
  2: {
    stage: 2,
    id: 'stage_2',
    chapterTitleVi: 'Màn 2 — Chương 2: Chiếc Đồng Hồ Ngừng Chạy',
    subtitleVi: 'Sửa chữa cỗ máy ở Quá Khứ để mở lối đi ở Hiện Tại',
    roomNameVi: 'Phòng Khách & Xưởng Đồng Hồ',
    roomNameEn: 'Family Living Room',
    width: 1150,
    spawnX: 85,
    spawnY: 436,
    defaultTimeline: 'PRESENT',
    platforms: [
      ...createStageBoundaryPlatforms(1150),
      { id: 'living_shelf_past', x: 340, y: 390, width: 85, height: 14, type: 'one-way', timeline: 'PAST' },
      { id: 'crate_present', x: 350, y: 432, width: 48, height: 48, type: 'solid', timeline: 'PRESENT' },
      { id: 'step_stool_both', x: 675, y: 432, width: 55, height: 48, type: 'one-way', timeline: 'both' },
      { id: 'fireplace_mantel', x: 750, y: 382, width: 115, height: 14, type: 'one-way', timeline: 'both' },
      {
        id: 'living_hallway_door',
        x: 960,
        y: 220,
        width: 24,
        height: 260,
        type: 'solid',
        timeline: 'both',
        requiresPuzzleNotSolved: 'clockInspectedPresent',
        label: 'Cửa Cơ Khí (Sửa đồng hồ ở Quá Khứ & kiểm tra ở Hiện Tại)'
      }
    ],
    interactables: [
      {
        id: 'family_portrait',
        name: 'Family Portrait',
        nameVi: 'Bức Ảnh Gia Đình (Mẹ, An & Bé Linh)',
        descriptionVi: 'Bức ảnh chụp Mẹ cùng hai anh em An và Linh trước đêm tai nạn.',
        timeline: 'both',
        promptVi: 'Ngắm bức ảnh gia đình',
        room: 'stage_2',
        chapter: 2,
        type: 'portrait',
        x: 240,
        y: 380,
        width: 38,
        height: 54
      },
      {
        id: 'npc_mother_ch2',
        name: 'Memory of Mother',
        nameVi: 'Bóng Hình Ký Ức Của Mẹ',
        descriptionVi: 'Hình bóng Mẹ đang cặm cụi bên bàn đồng hồ trong Quá Khứ.',
        timeline: 'PAST',
        promptVi: 'Lắng nghe Ký Ức Của Mẹ',
        room: 'stage_2',
        chapter: 2,
        type: 'npc_memory',
        x: 455,
        y: 416,
        width: 34,
        height: 64
      },
      {
        id: 'clock',
        name: 'Grandfather Antique Clock',
        nameVi: 'Đồng Hồ Cổ Trung Tâm',
        descriptionVi: 'Sửa đồng hồ ở Quá Khứ rồi kiểm tra ở Hiện Tại để mở khóa cửa cơ khí.',
        timeline: 'both',
        promptVi: 'Tương tác với Đồng Hồ Cổ',
        room: 'stage_2',
        chapter: 2,
        type: 'clock',
        x: 575,
        y: 380,
        width: 46,
        height: 100
      },
      {
        id: 'clock_gear',
        name: 'Brass Escapement Gear',
        nameVi: 'Bộ Bánh Răng Hồi Cơ Khí',
        descriptionVi: 'Bộ bánh răng đồng thau Mẹ đặt trên bàn sửa đồng hồ trong xưởng trong Quá Khứ.',
        timeline: 'PAST',
        promptVi: 'Nhặt Bộ Bánh Răng Đồng Hồ',
        room: 'stage_2',
        chapter: 2,
        type: 'clock_gear',
        x: 790,
        y: 344,
        width: 34,
        height: 36
      },
      {
        id: 'fireplace',
        name: 'Hearth Fireplace',
        nameVi: 'Lò Sưởi Đá Cổ',
        descriptionVi: 'Lò sưởi ấm áp trong Quá Khứ nhưng lạnh lẽo ở Hiện Tại.',
        timeline: 'both',
        promptVi: 'Quan sát lò sưởi',
        room: 'stage_2',
        chapter: 2,
        type: 'fireplace',
        x: 785,
        y: 410,
        width: 50,
        height: 70
      },
      {
        id: 'stage_exit_2',
        name: 'Door to Corridor of Memories (Stage 3)',
        nameVi: 'Cửa Sang Hành Lang Ký Ức (Qua Màn 3)',
        descriptionVi: 'Dẫn sang Màn 3: Hành Lang Ký Ức.',
        timeline: 'both',
        promptVi: 'Bước qua Màn 3: Hành Lang Ký Ức',
        room: 'stage_2',
        chapter: 2,
        type: 'stage_door',
        x: 1025,
        y: 375,
        width: 44,
        height: 105
      }
    ],
    memoryNPCs: [
      {
        id: 'npc_mother_ch2',
        character: 'ME',
        nameVi: 'Ký Ức Của Mẹ',
        x: 455,
        y: 422,
        width: 26,
        height: 58,
        timeline: 'PAST',
        stage: 2,
        ambientQuoteVi: '“Bánh răng dự phòng mẹ để trên bàn sửa đồng hồ trong xưởng...”'
      }
    ]
  },

  // =========================================================================
  // MÀN 3 (CHƯƠNG 3 — HÀNH LANG KÝ ỨC)
  // =========================================================================
  3: {
    stage: 3,
    id: 'stage_3',
    chapterTitleVi: 'Màn 3 — Chương 3: Hành Lang Ký Ức',
    subtitleVi: 'Lối đi sụp đổ & dấu hiệu đầu tiên của Kẻ Lạc Giờ',
    roomNameVi: 'Hành Lang Gác Lửng',
    roomNameEn: 'Corridor of Memories',
    width: 1200,
    spawnX: 85,
    spawnY: 436,
    defaultTimeline: 'PRESENT',
    platforms: [
      ...createStageBoundaryPlatforms(1200),
      // Past intact stairs to upper mezzanine
      { id: 'stairs_step1_past', x: 260, y: 440, width: 52, height: 40, type: 'solid', timeline: 'PAST' },
      { id: 'stairs_step2_past', x: 312, y: 400, width: 52, height: 80, type: 'solid', timeline: 'PAST' },
      { id: 'stairs_step3_past', x: 364, y: 360, width: 56, height: 120, type: 'solid', timeline: 'PAST' },
      { id: 'hallway_mezzanine_past', x: 420, y: 330, width: 250, height: 16, type: 'one-way', timeline: 'PAST' },

      // Present broken stairs
      { id: 'stairs_step1_pres', x: 260, y: 446, width: 52, height: 34, type: 'solid', timeline: 'PRESENT' },
      { id: 'fallen_beam_pres', x: 340, y: 385, width: 70, height: 16, type: 'one-way', timeline: 'PRESENT' },
      { id: 'hallway_mezzanine_pres', x: 420, y: 330, width: 180, height: 16, type: 'one-way', timeline: 'PRESENT' },

      // Debris blocking Present lower corridor until pulley is activated in Past
      {
        id: 'hallway_debris_pres',
        x: 615,
        y: 346,
        width: 36,
        height: 134,
        type: 'solid',
        timeline: 'PRESENT',
        requiresPuzzleNotSolved: 'hallwayPassageCleared',
        label: 'Đống Đổ Nát Chắn Ngang'
      },
      {
        id: 'hallway_grate_past',
        x: 615,
        y: 346,
        width: 26,
        height: 134,
        type: 'solid',
        timeline: 'PAST',
        requiresPuzzleNotSolved: 'hallwayPassageCleared',
        label: 'Lưới Chắn Bảo Trì'
      }
    ],
    interactables: [
      {
        id: 'hallway_pulley',
        name: 'Corridor Support Pulley',
        nameVi: 'Trục Ròng Rọc Gia Cố Trần Nhà',
        descriptionVi: 'Kéo trục ròng rọc ở Quá Khứ để ngăn trần hành lang bị sập ở Hiện Tại.',
        timeline: 'PAST',
        promptVi: 'Kéo cần trục gia cố dầm trần nhà',
        room: 'stage_3',
        chapter: 3,
        type: 'hallway_pulley',
        x: 550,
        y: 280,
        width: 34,
        height: 46
      },
      {
        id: 'mother_diary_ch3',
        name: "Mother's Research Diary & Linh's Echo",
        nameVi: 'Nhật Ký Của Mẹ & Tiếng Vọng Trong Gương',
        descriptionVi: 'Ghi chép về tiếng gọi từ mặt kính đồng hồ và bóng hình của Linh.',
        timeline: 'both',
        promptVi: 'Đọc Nhật Ký & Lắng Nghe Tiếng Vọng',
        room: 'stage_3',
        chapter: 3,
        type: 'journal_entry',
        x: 830,
        y: 415,
        width: 36,
        height: 55
      },
      {
        id: 'stage_exit_3',
        name: 'Door to Locked Room (Stage 4)',
        nameVi: 'Cửa Vào Thư Phòng & Phòng Ngủ (Qua Màn 4)',
        descriptionVi: 'Cánh cửa dẫn sang Màn 4: Căn Phòng Bị Khóa.',
        timeline: 'both',
        promptVi: 'Bước qua Màn 4: Căn Phòng Bị Khóa',
        room: 'stage_3',
        chapter: 3,
        type: 'stage_door',
        x: 1060,
        y: 375,
        width: 44,
        height: 105
      }
    ],
    memoryNPCs: [
      {
        id: 'npc_linh_ch3',
        character: 'LINH',
        nameVi: 'Tiếng Vọng Bé Linh',
        x: 790,
        y: 432,
        width: 22,
        height: 48,
        timeline: 'PAST',
        stage: 3,
        ambientQuoteVi: '“Anh An ơi... trong mặt kính có ai giống hệt em...”'
      }
    ]
  },

  // =========================================================================
  // MÀN 4 (CHƯƠNG 4 — CĂN PHÒNG BỊ KHÓA)
  // =========================================================================
  4: {
    stage: 4,
    id: 'stage_4',
    chapterTitleVi: 'Màn 4 — Chương 4: Căn Phòng Bị Khóa',
    subtitleVi: 'Mật mã ánh sáng, khúc nhạc ru của Linh và nỗi lòng của Mẹ',
    roomNameVi: 'Thư Phòng & Phòng Ngủ Của Linh',
    roomNameEn: 'Bedroom & Study',
    width: 1200,
    spawnX: 85,
    spawnY: 436,
    defaultTimeline: 'PRESENT',
    platforms: [
      ...createStageBoundaryPlatforms(1200),
      { id: 'study_desk', x: 540, y: 428, width: 80, height: 52, type: 'one-way', timeline: 'both' },
      { id: 'study_bed_platform', x: 740, y: 438, width: 95, height: 42, type: 'one-way', timeline: 'both' },
      { id: 'study_bookshelf_high', x: 860, y: 345, width: 100, height: 14, type: 'one-way', timeline: 'both' },
      {
        id: 'final_door_barrier',
        x: 1020,
        y: 220,
        width: 24,
        height: 260,
        type: 'solid',
        timeline: 'both',
        requiresPuzzleNotSolved: 'finalDoorUnlocked',
        label: 'Cánh Cửa Khóa Ba Tầng'
      }
    ],
    interactables: [
      {
        id: 'light_switch',
        name: 'Chandelier Switch',
        nameVi: 'Công Tắc Đèn Chùm Pha Lê',
        descriptionVi: 'Công tắc bật đèn chùm chiếu sáng lăng kính.',
        timeline: 'both',
        promptVi: 'Bật / Kiểm tra công tắc đèn chùm',
        room: 'stage_4',
        chapter: 4,
        type: 'light_switch',
        x: 220,
        y: 400,
        width: 28,
        height: 38
      },
      {
        id: 'light_target',
        name: 'Prism Wall Projection',
        nameVi: 'Vệt Sáng Lăng Kính Trên Tường',
        descriptionVi: 'Nơi ánh sáng đèn chùm hiện lên 3 nốt nhạc ru của Mẹ.',
        timeline: 'both',
        promptVi: 'Quan sát mật mã ánh sáng',
        room: 'stage_4',
        chapter: 4,
        type: 'light_target',
        x: 410,
        y: 400,
        width: 36,
        height: 48
      },
      {
        id: 'mother_note_ch4',
        name: "Mother's Warning Blueprint",
        nameVi: 'Bản Thiết Kế Phong Ấn Của Mẹ',
        descriptionVi: 'Tài liệu tiết lộ Mẹ tháo kim đồng hồ để cứu An và Linh.',
        timeline: 'both',
        promptVi: 'Đọc Bản Thiết Kế Của Mẹ',
        room: 'stage_4',
        chapter: 4,
        type: 'bookshelf',
        x: 565,
        y: 380,
        width: 40,
        height: 75
      },
      {
        id: 'npc_linh_ch4',
        name: 'Memory of Little Linh',
        nameVi: 'Ký Ức Bé Linh Bên Giường Ngủ',
        descriptionVi: 'Hình bóng bé Linh đang ngân nga khúc hát ru.',
        timeline: 'PAST',
        promptVi: 'Trò chuyện với Ký Ức Bé Linh',
        room: 'stage_4',
        chapter: 4,
        type: 'npc_memory',
        x: 730,
        y: 422,
        width: 30,
        height: 55
      },
      {
        id: 'music_box',
        name: "Linh's Music Box",
        nameVi: 'Hộp Nhạc Của Em Gái Linh',
        descriptionVi: 'Gảy 3 nốt nhạc ru ở Quá Khứ để mở khóa Cánh Cửa Bị Khóa.',
        timeline: 'both',
        promptVi: 'Gảy Hộp Nhạc Của Linh',
        room: 'stage_4',
        chapter: 4,
        type: 'music_box',
        x: 845,
        y: 405,
        width: 34,
        height: 32
      },
      {
        id: 'final_door',
        name: 'Locked Door to Stage 5',
        nameVi: 'Cánh Cửa Bị Khóa (Qua Màn 5)',
        descriptionVi: 'Mở cánh cửa ở Hiện Tại để bước sang Màn 5: Cuộc Truy Đuổi.',
        timeline: 'both',
        promptVi: 'Mở Cánh Cửa & Bước Vào Màn 5',
        room: 'stage_4',
        chapter: 4,
        type: 'final_door',
        x: 1050,
        y: 375,
        width: 44,
        height: 105
      }
    ],
    memoryNPCs: [
      {
        id: 'npc_linh_ch4',
        character: 'LINH',
        nameVi: 'Ký Ức Bé Linh',
        x: 730,
        y: 432,
        width: 22,
        height: 48,
        timeline: 'PAST',
        stage: 4,
        ambientQuoteVi: '“Mi - Sol - Đô cao... bài hát mẹ ru tụi mình...”'
      }
    ]
  },

  // =========================================================================
  // MÀN 5 (CHƯƠNG 5 — CUỘC TRUY ĐUỔI)
  // =========================================================================
  5: {
    stage: 5,
    id: 'stage_5',
    chapterTitleVi: 'Màn 5 — Chương 5: Cuộc Truy Đuổi',
    subtitleVi: 'Chạy thoát khỏi Kẻ Lạc Giờ xuyên qua hai dòng thời gian',
    roomNameVi: 'Hành Lang Sụp Đổ',
    roomNameEn: 'Shattered Gallery',
    width: 1500,
    spawnX: 170,
    spawnY: 436,
    defaultTimeline: 'PRESENT',
    platforms: [
      ...createStageBoundaryPlatforms(1500),
      // 1. Low obstacle crate
      { id: 'chase_crate_1', x: 420, y: 440, width: 36, height: 40, type: 'solid', timeline: 'both' },
      // 2. Collapsed wall in PRESENT -> switch to PAST [Q]
      {
        id: 'chase_wall_present',
        x: 680,
        y: 260,
        width: 28,
        height: 220,
        type: 'solid',
        timeline: 'PRESENT',
        label: 'Tường Sập (Nhấn [Q] sang Quá Khứ!)'
      },
      // 3. Stepping stone platform (works in both timelines so player is never trapped by cooldown)
      { id: 'chase_step_both', x: 930, y: 415, width: 70, height: 14, type: 'one-way', timeline: 'both' },
      // 4. Past barricade -> jump over via step OR switch back to PRESENT [Q]
      {
        id: 'chase_barricade_past',
        x: 1060,
        y: 422,
        width: 30,
        height: 58,
        type: 'solid',
        timeline: 'PAST',
        label: 'Rào Chắn Gỗ'
      }
    ],
    interactables: [
      {
        id: 'stage_exit_5',
        name: 'Sanctuary Portal (To Stage 6)',
        nameVi: 'Cổng Vào Tâm Điểm Thời Gian (Qua Màn 6)',
        descriptionVi: 'Chạy tới cổng ánh sáng để thoát khỏi Kẻ Lạc Giờ và vào Màn 6.',
        timeline: 'both',
        promptVi: 'Bước vào Màn 6: Tâm Điểm Thời Gian',
        room: 'stage_5',
        chapter: 5,
        type: 'stage_door',
        x: 1360,
        y: 375,
        width: 48,
        height: 105
      }
    ],
    memoryNPCs: []
  },

  // =========================================================================
  // MÀN 6 (CHƯƠNG 6 — HAI PHÍA CỦA THỜI GIAN)
  // =========================================================================
  6: {
    stage: 6,
    id: 'stage_6',
    chapterTitleVi: 'Màn 6 — Chương 6: Hai Phía Của Thời Gian',
    subtitleVi: 'Sự thật về em gái Linh và lựa chọn cuối cùng trước Lõi Đồng Hồ',
    roomNameVi: 'Tâm Điểm Thời Gian',
    roomNameEn: 'Clockwork Sanctuary',
    width: 1100,
    spawnX: 90,
    spawnY: 436,
    defaultTimeline: 'PRESENT',
    platforms: [
      ...createStageBoundaryPlatforms(1100),
      { id: 'sanctuary_step_1', x: 500, y: 435, width: 100, height: 45, type: 'one-way', timeline: 'both' },
      { id: 'final_pedestal', x: 820, y: 425, width: 110, height: 55, type: 'one-way', timeline: 'both' }
    ],
    interactables: [
      {
        id: 'final_diary_ch6',
        name: 'The Night of the Accident',
        nameVi: 'Nhật Ký Đêm Tai Nạn & Sự Thật Về Linh',
        descriptionVi: 'Ghi chép cuối cùng tiết lộ danh tính thật của Kẻ Lạc Giờ.',
        timeline: 'both',
        promptVi: 'Đọc sự thật đêm tai nạn',
        room: 'stage_6',
        chapter: 6,
        type: 'journal_entry',
        x: 290,
        y: 420,
        width: 36,
        height: 52
      },
      {
        id: 'temporal_anchor',
        name: 'Temporal Resonance Pillar',
        nameVi: 'Trụ Cộng Hưởng Thời Gian',
        descriptionVi: 'Đồng bộ Trụ Cộng Hưởng ở Quá Khứ để mở khóa Lõi Đồng Hồ.',
        timeline: 'both',
        promptVi: 'Đồng bộ Trụ Cộng Hưởng',
        room: 'stage_6',
        chapter: 6,
        type: 'temporal_anchor',
        x: 530,
        y: 375,
        width: 40,
        height: 60
      },
      {
        id: 'npc_linh_ch6',
        name: 'Spirit of Sister Linh',
        nameVi: 'Linh Hồn Của Em Gái Linh',
        descriptionVi: 'Hình bóng thật sự của bé Linh ẩn sau lớp sương Kẻ Lạc Giờ.',
        timeline: 'both',
        promptVi: 'Trò chuyện với Bé Linh',
        room: 'stage_6',
        chapter: 6,
        type: 'npc_memory',
        x: 700,
        y: 422,
        width: 30,
        height: 55
      },
      {
        id: 'final_core',
        name: 'The Heart of Time',
        nameVi: 'Lõi Đồng Hồ Giao Thời',
        descriptionVi: 'Đặt chiếc kim đồng hồ gãy và quyết định số phận của hai dòng thời gian.',
        timeline: 'both',
        promptVi: 'Đặt Chiếc Kim Gãy & Quyết Định Kết Thúc',
        room: 'stage_6',
        chapter: 6,
        type: 'final_core',
        x: 850,
        y: 360,
        width: 48,
        height: 65
      }
    ],
    memoryNPCs: [
      {
        id: 'npc_linh_ch6',
        character: 'LINH',
        nameVi: 'Linh Hồn Bé Linh',
        x: 700,
        y: 432,
        width: 22,
        height: 48,
        timeline: 'both',
        stage: 6,
        ambientQuoteVi: '“Anh An... cuối cùng anh cũng tìm thấy em rồi...”'
      }
    ]
  }
};

configurePixelCampaign(STAGE_CONFIGS);
normalizeSceneScales(STAGE_CONFIGS);

export function getStageConfig(stage: number): StageConfig {
  const clamped = Math.max(1, Math.min(6, Math.round(stage || 1)));
  return STAGE_CONFIGS[clamped];
}

export function getCurrentRoom(playerX:number,stage:number=1):RoomZone {
  const base=ROOM_ZONES[Math.max(0,Math.min(5,stage-1))];
  const room=currentPixelRoom(stage,playerX);
  return {...base,id:`stage_${stage}_room_${room.index}`,nameVi:room.name,minX:room.start,maxX:room.start+room.width};
}

export function getActiveChapter(puzzles: PuzzleState, _playerX: number = 0): { num: number; titleVi: string } {
  const stageCfg = getStageConfig(puzzles.currentStage || 1);
  return {
    num: stageCfg.stage,
    titleVi: stageCfg.chapterTitleVi
  };
}

// Combined exports for unit tests
export const LEVEL_PLATFORMS: Platform[] = [
  ...STAGE_CONFIGS[1].platforms,
  ...STAGE_CONFIGS[2].platforms,
  ...STAGE_CONFIGS[3].platforms,
  ...STAGE_CONFIGS[4].platforms,
  ...STAGE_CONFIGS[5].platforms,
  ...STAGE_CONFIGS[6].platforms
];

export const LEVEL_INTERACTABLES: InteractableObject[] = [
  ...STAGE_CONFIGS[1].interactables,
  ...STAGE_CONFIGS[2].interactables,
  ...STAGE_CONFIGS[3].interactables,
  ...STAGE_CONFIGS[4].interactables,
  ...STAGE_CONFIGS[5].interactables,
  ...STAGE_CONFIGS[6].interactables
];
