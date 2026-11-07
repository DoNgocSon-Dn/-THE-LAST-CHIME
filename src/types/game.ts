export type Timeline = 'PAST' | 'PRESENT';

export type GameState = 'title' | 'loading' | 'prologue' | 'playing' | 'paused' | 'choice' | 'ending';

export type EndingType = 'ACCEPT_TRUTH' | 'ETERNAL_MEMORY';

export type SpeakerId = 'AN' | 'ME' | 'LINH' | 'KE_LAC_GIO' | 'HE_THONG' | 'ONG';

export type DialogueEmotion = 'normal' | 'sad' | 'surprised' | 'determined' | 'whisper';

export interface DialogueLine {
  speaker: SpeakerId;
  speakerName: string;
  emotion: DialogueEmotion;
  text: string;
}

export interface MemoryNPC {
  id: string;
  character: 'ME' | 'LINH' | 'ONG';
  nameVi: string;
  x: number;
  y: number;
  width: number;
  height: number;
  timeline: 'PAST' | 'PRESENT' | 'both';
  stage: number;
  ambientQuoteVi: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Platform extends BoundingBox {
  id: string;
  type: 'solid' | 'one-way' | 'hazard';
  timeline: 'both' | 'PAST' | 'PRESENT';
  stage?: number; // If omitted, inferred or active in matching stage
  requiresPuzzleNotSolved?: keyof PuzzleState;
  requiresPuzzleSolved?: keyof PuzzleState;
  label?: string;
  color?: string;
  bakedIntoMap?: boolean;
}

export type PlayerAction = 'idle' | 'walk' | 'jump' | 'fall' | 'interact' | 'warp';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  state: PlayerAction;
  interactionPose?: 'crouch'|'think';
  animFrame: number;
  animTimer: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  interactCooldown: number;
  interactAnimTimer: number;
  speechBubbleText?: string;
  speechBubbleTimer?: number;
}

export interface PursuerEntity {
  phase?:Timeline;
  phaseDelay?:number;
  exposed?:boolean;
  stagger?:number;
  active: boolean;
  omenActive: boolean;
  omenTimer: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  animTimer: number;
}

export interface InteractableObject extends BoundingBox {
  id: string;
  name: string;
  nameVi: string;
  descriptionVi: string;
  timeline: 'both' | 'PAST' | 'PRESENT';
  requiresPuzzle?: string;
  promptVi: string;
  room: string;
  chapter: number; // Stage number (1..6)
  type:
    | 'room_door'
    | 'pocket_watch'
    | 'clock'
    | 'clock_gear'
    | 'hallway_pulley'
    | 'light_switch'
    | 'light_target'
    | 'music_box'
    | 'final_door'
    | 'stage_door'
    | 'npc_memory'
    | 'temporal_anchor'
    | 'final_core'
    | 'journal_entry'
    | 'fireplace'
    | 'portrait'
    | 'bookshelf';
  destination?: {stage:number;x:number;y?:number;requiresPuzzle?:keyof PuzzleState;lockedMessage?:string};
  bakedIntoMap?: boolean;
  isSolved?: boolean;
  isActive?: boolean;
}

export interface PuzzleState {
  // Current active stage (1 to 6)
  currentStage: number;
  storyChapter?: number;
  furthestChapter?: number;
  porchDoorUnlocked?: boolean;
  greenhouseAligned?: boolean;
  chaseSeals?: number[];
  chaseSealsComplete?: boolean;
  bossHits?: number[];
  bossArmedTrap?: number;
  bossExposedTrap?: number;
  bossWindowSeconds?: number;
  pastSafetySeconds?: number;
  playerResolve?: number;
  furthestStage?: number;

  // Chapter 1 — Trở về (Màn 1)
  motherNoteCh1Read: boolean;
  arrivalMonologueSeen?: boolean;
  tutorialMoved?: boolean;
  tutorialJumped?: boolean;
  watchCollected?: boolean;
  hasWatch: boolean;            // Collected in Chapter 2, inside the living room
  testedTimelineSwitch: boolean; // Player presses [Q] to test switching between Past & Present

  // Chapter 2 — Chiếc đồng hồ ngừng chạy (Màn 2)
  clockGearFound: boolean;      // Found brass gear in Past living room
  clockRepaired: boolean;       // Repaired antique clock in Past
  clockInspectedPresent: boolean; // Inspected repaired clock in Present -> unlocks exit to Stage 3

  // Chapter 3 — Hành lang ký ức (Màn 3)
  hallwayPassageCleared: boolean; // Activated pulley in Past -> clears debris in Present hallway
  motherDiaryCh3Read: boolean;    // Read Mother's diary & witnessed first omen of Kẻ Lạc Giờ

  collectedClues?: string[];
  lightOrderFound?: boolean;
  lightLegendFound?: boolean;

  // Chapter 4 — Căn phòng bị khóa (Màn 4)
  lightSwitchOn: boolean;       // Past chandelier light illuminates wall code
  lightRuneFound: boolean;      // Inspected code in Present
  motherNoteCh4Read: boolean;   // Read note revealing Mother tried to stop the accident
  musicBoxPlayed: boolean;      // Played melody in Past -> unlocks door to Chapter 5
  finalDoorUnlocked: boolean;   // Unlocked door leading to Stage 5

  // Chapter 5 — Cuộc truy đuổi (Màn 5)
  chaseStarted: boolean;
  chaseCompleted: boolean;      // Escaped Kẻ Lạc Giờ into Stage 6

  // Chapter 6 — Hai phía của thời gian (Màn 6)
  finalDiaryCh6Read: boolean;   // Discovered truth about Sister Linh & Kẻ Lạc Giờ
  finalCoreAligned: boolean;    // Aligned Past & Present temporal anchor
  chosenEnding?: EndingType;
}

export interface CheckpointData {
  x: number;
  y: number;
  timeline: Timeline;
  chapter: number;
  labelVi: string;
}

export interface GameStats {
  timeElapsed: number; // in seconds
  timelineSwitches: number;
  puzzlesSolvedCount: number;
  notesRead: number;
  chaseRetries: number;
}

export interface SaveData {
  version: number;
  player: {
    x: number;
    y: number;
  };
  timeline: Timeline;
  puzzles: PuzzleState;
  checkpoint: CheckpointData;
  stats: GameStats;
  volume: {
    sfx: number;
    music: number;
    muted: boolean;
  };
}
