import {chapterForArea,savedChapterProgress} from './campaign';
import {BOSS_TRAPS,bossDefeated,completeSeals} from './encounters';
import {houseDestination,houseCamera,migrateHouseLocation} from './houseLayout';
import { advanceGait } from './locomotion';
import type { MechanismId } from './mechanisms';
import { PLAYER_WIDTH, PLAYER_HEIGHT, PURSUER_BODY_HEIGHT, savedCharacterHeight, migrateCharacterY } from './entityScale';
import { GAME_ZOOM, currentPixelRoom, sceneZoom, legacyScenePoint } from './pixelLayout';
import {
  Player,
  Timeline,
  GameState,
  PuzzleState,
  GameStats,
  InteractableObject,
  PursuerEntity,
  CheckpointData,
  EndingType,
  DialogueLine
} from '../types/game';
import {
  checkAABB,
  updateAndResolvePhysics,
  getActivePlatforms,
  resolveSafeTimelinePosition
} from './physics';
import {
  getStageConfig,
  getCurrentRoom,
  RoomZone,
  StageConfig
} from './levelData';
import { processInteraction, INITIAL_PUZZLE_STATE } from './puzzles';
import { soundManager } from './audio';
import { GameRenderer } from './renderer';

export const SWITCH_COOLDOWN_TIME = 3.0; // 3 seconds cooldown as required

export interface EngineCallbacks {
  onOpenMechanism?: (id:MechanismId)=>void;
  onTimelineChange: (timeline: Timeline) => void;
  onCooldownChange: (cooldownRatio: number, secondsRemaining: number) => void;
  onNearbyPrompt: (object: InteractableObject | null) => void;
  onStartDialogue: (lines: DialogueLine[]) => void;
  onStageTransition: (stageConfig: StageConfig) => void;
  onTriggerFinalChoice: () => void;
  onTriggerEnding: (stats: GameStats, ending: EndingType) => void;
  onPuzzleUpdate: (puzzles: PuzzleState) => void;
  onRoomChange: (room: RoomZone) => void;
  onNotification: (msg: string) => void;
}

const STORAGE_KEY = 'THE_LAST_CHIME_PIXEL_SAVE_V1';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;
  private callbacks: EngineCallbacks;

  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Game state
  private roomFade=0;
  private bossArmSeconds=0;
  private bossExposedSeconds=0;
  private contactCooldown=0;
  private bossPastSeconds=0;
  public gameState: GameState = 'playing';
  public timeline: Timeline = 'PRESENT';
  public switchCooldown: number = 0; // in seconds

  public player: Player = {
    x: 80,
    y: 480-PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    facing: 'right',
    isGrounded: true,
    state: 'idle',
    animFrame: 0,
    animTimer: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    interactCooldown: 0,
    interactAnimTimer: 0,
    speechBubbleText: 'Ngôi nhà cũ đây rồi... Chiếc kim gãy đang rung nhẹ.',
    speechBubbleTimer: 4.0
  };

  public pursuer: PursuerEntity = {
    active: false,
    omenActive: false,
    omenTimer: 0,
    x: 20,
    y: 480-PURSUER_BODY_HEIGHT,
    width: 40,
    height: PURSUER_BODY_HEIGHT,
    speed: 132,
    animTimer: 0
  };

  public checkpoint: CheckpointData = {
    x: 80,
    y: 480-PLAYER_HEIGHT,
    timeline: 'PRESENT',
    chapter: 1,
    labelVi: 'Chương 1 — Khởi đầu'
  };

  public puzzles: PuzzleState = { ...INITIAL_PUZZLE_STATE };
  public stats: GameStats = {
    timeElapsed: 0,
    timelineSwitches: 0,
    puzzlesSolvedCount: 0,
    notesRead: 0,
    chaseRetries: 0
  };

  private currentPixelRoomId='';
  private viewZoom=GAME_ZOOM;
  public cameraX: number = 0;
  public nearbyInteractable: InteractableObject | null = null;
  private mechanismContext:{id:MechanismId;objectId:string;stage:number;timeline:Timeline}|null=null;
  public closeMechanism(){this.mechanismContext=null;}
  public submitMechanism(id:MechanismId,answer:readonly number[]){
    const context=this.mechanismContext;
    if(!context||context.id!==id||context.stage!==this.puzzles.currentStage||context.timeline!==this.timeline)return false;
    return this.triggerInteract(answer)===true;
  }

  // Input states
  private keysPressed = new Set<string>();
  private justPressed = new Set<string>();


  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;
    this.renderer = new GameRenderer();

    this.bindEvents();
    if(!this.loadSave())this.loadStage(1,false);
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  public unbindEvents() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if(this.gameState!=='playing')return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = e.key.toLowerCase();
    if (!this.keysPressed.has(key)) {
      this.justPressed.add(key);
    }
    this.keysPressed.add(key);

    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'space'].includes(key)) {
      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keysPressed.delete(key);
  };

  private handleBlur = () => {
    this.keysPressed.clear();
    this.justPressed.clear();
  };

  public setTouchControl(key:string,pressed:boolean){
    if(pressed){if(!this.keysPressed.has(key))this.justPressed.add(key);this.keysPressed.add(key);}
    else this.keysPressed.delete(key);
  }
  public isReady(){return this.renderer.isReady();}

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    soundManager.init();
    soundManager.setTimeline(this.timeline);
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resetGame() {
    this.firstWarpBeat=0;
    localStorage.removeItem(STORAGE_KEY);
    this.puzzles = { ...INITIAL_PUZZLE_STATE };
    this.timeline = 'PRESENT';
    this.switchCooldown = 0;
    this.pursuer.active = false;
    this.pursuer.omenActive = false;
    this.stats = {
      timeElapsed: 0,
      timelineSwitches: 0,
      puzzlesSolvedCount: 0,
      notesRead: 0,
      chaseRetries: 0
    };
    this.loadStage(1, false);
    this.setPlayerSpeech('Ngôi nhà cũ đây rồi... Chiếc kim gãy đang rung nhẹ.', 4.5);
  }

  public setPlayerSpeech(text: string, duration: number = 3.5) {
    this.player.speechBubbleText = text;
    this.player.speechBubbleTimer = duration;
  }

  /**
   * Transitions player to a specific Stage (Màn 1 -> Màn 6)
   */
  public loadStage(stageNum: number, showBanner: boolean = true,preserveProgress=false,arrivalTimeline?:Timeline) {
    this.firstWarpBeat=0;this.mechanismContext=null;
    const cfg = getStageConfig(stageNum);
    this.puzzles.storyChapter=preserveProgress?Math.max(this.puzzles.storyChapter??chapterForArea(this.puzzles.currentStage),chapterForArea(cfg.stage)):chapterForArea(cfg.stage);
    this.puzzles.furthestChapter=Math.max(this.puzzles.furthestChapter??1,this.puzzles.storyChapter);
    this.puzzles.furthestStage=Math.max(this.puzzles.furthestStage??this.puzzles.currentStage,cfg.stage);
    this.puzzles.currentStage = cfg.stage;

    // Ensure prerequisite abilities are unlocked if jumping directly to later stages
    if(!preserveProgress&&cfg.stage===1){this.puzzles.hasWatch=false;this.puzzles.watchCollected=false;this.puzzles.testedTimelineSwitch=false;}
    if (!preserveProgress && cfg.stage >= 3) {
      this.puzzles.hasWatch = true;
      this.puzzles.watchCollected = true;
      this.puzzles.testedTimelineSwitch = true;
    }
    if (!preserveProgress && cfg.stage >= 3) {
      this.puzzles.clockGearFound = true;
      this.puzzles.clockRepaired = true;
      this.puzzles.clockInspectedPresent = true;
    }
    if (!preserveProgress && cfg.stage >= 4) {
      this.puzzles.hallwayPassageCleared = true;
      this.puzzles.motherDiaryCh3Read = true;
    }
    if (!preserveProgress && cfg.stage >= 5) {
      this.puzzles.lightSwitchOn = true;
      this.puzzles.lightRuneFound = true;
      this.puzzles.musicBoxPlayed = true;
      this.puzzles.finalDoorUnlocked = true;
    }
    if (!preserveProgress && cfg.stage >= 6) {
      this.puzzles.chaseCompleted = true;
    }

    this.player.x = cfg.spawnX;
    this.player.y = cfg.spawnY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 'right';
    this.player.state = 'idle';
    this.player.animTimer=0;this.player.animFrame=0;
    this.player.isGrounded = true;
    this.player.speechBubbleText = '';
    this.player.speechBubbleTimer = 0;
    this.viewZoom=sceneZoom(cfg.stage,this.player.x);
    this.snapRoomCamera();
    this.timeline = this.puzzles.hasWatch?(arrivalTimeline??cfg.defaultTimeline):'PRESENT';
    this.switchCooldown = 0;
    this.nearbyInteractable = null;

    delete this.puzzles.bossArmedTrap;delete this.puzzles.bossExposedTrap;this.bossArmSeconds=0;this.bossExposedSeconds=0;this.contactCooldown=1.5;this.bossPastSeconds=0;
    if(cfg.stage===6){if(!preserveProgress){this.puzzles.bossHits=[];this.puzzles.playerResolve=3;this.puzzles.finalCoreAligned=false;this.puzzles.finalDiaryCh6Read=false;}else this.puzzles.playerResolve??=3;}
    if(cfg.stage===5&&!preserveProgress){this.puzzles.chaseSeals=[];this.puzzles.chaseSealsComplete=false;this.puzzles.bossHits=[];this.puzzles.playerResolve=3;this.puzzles.finalCoreAligned=false;this.puzzles.finalDiaryCh6Read=false;}
    // Configure Pursuer (Kẻ Lạc Giờ) for Stage 5 Chase
    this.pursuer.omenActive = false;
    if (cfg.stage === 5) {
      this.puzzles.chaseCompleted = false;
      this.puzzles.chaseStarted = true;
      this.pursuer.active = true;
      this.pursuer.x = 25;
      this.pursuer.y = 480-PURSUER_BODY_HEIGHT;
      this.setPlayerSpeech('Kẻ Lạc Giờ đang đuổi theo! Mau chạy về bên phải và dùng [Q] vượt tường chắn!', 4.5);
    } else {
      this.pursuer.active = cfg.stage===6&&!bossDefeated(this.puzzles);
      if(cfg.stage===6){this.pursuer.x=1050;this.pursuer.y=290;this.pursuer.phase='PRESENT';this.pursuer.stagger=0;}
    }

    this.checkpoint = {
      x: cfg.spawnX,
      y: cfg.spawnY,
      timeline: this.timeline,
      chapter: cfg.stage,
      labelVi: cfg.chapterTitleVi
    };

    soundManager.setTimeline(this.timeline);
    this.callbacks.onTimelineChange(this.timeline);
    this.callbacks.onCooldownChange(0, 0);
    this.callbacks.onPuzzleUpdate({ ...this.puzzles });
    this.callbacks.onRoomChange(getCurrentRoom(this.player.x, cfg.stage));
    this.callbacks.onNearbyPrompt(null);

    if (showBanner) {
      this.callbacks.onStageTransition(cfg);
    }

    this.saveGame();
  }

  public respawnAtCheckpoint() {
    const cfg = getStageConfig(this.puzzles.currentStage);
    if(cfg.stage===5)this.stats.chaseRetries++;
    const point=this.checkpoint.chapter===cfg.stage?this.checkpoint:{x:cfg.spawnX,y:cfg.spawnY,timeline:cfg.defaultTimeline};
    this.player.x=point.x;
    this.player.y=point.y;
    this.player.vx=0;
    this.player.vy=0;
    this.timeline=point.timeline;
    this.switchCooldown = 0;

    if (cfg.stage === 6) {this.puzzles.bossHits=[];this.puzzles.playerResolve=3;delete this.puzzles.bossArmedTrap;delete this.puzzles.bossExposedTrap;this.pursuer.active=true;this.pursuer.x=1050;this.pursuer.y=290;this.pursuer.stagger=1.5;this.bossExposedSeconds=0;this.bossArmSeconds=0;this.contactCooldown=2;this.callbacks.onPuzzleUpdate({...this.puzzles});}
    if (cfg.stage === 5) {
      this.pursuer.active = true;
      this.pursuer.x=Math.max(10,this.player.x-150);
      this.pursuer.y=this.player.y+2;
    }

    soundManager.playDoorUnlock();
    soundManager.setTimeline(this.timeline);
    this.callbacks.onTimelineChange(this.timeline);
    this.callbacks.onCooldownChange(0, 0);
    this.setPlayerSpeech('Thử lại từ dấu mốc gần nhất.',2);
    this.callbacks.onNotification('Đã trở lại dấu mốc: '+this.checkpoint.labelVi);
    this.callbacks.onRoomChange(getCurrentRoom(this.player.x,cfg.stage));
    this.saveGame();
  }

  private firstWarpBeat=0;

  public switchTimeline() {
    if(this.firstWarpBeat>0)return;
    if (!this.puzzles.hasWatch) {
      this.setPlayerSpeech('Đồng hồ bỏ túi ở trong phòng khách. Mình phải vào nhà trước.', 3.2);
      this.callbacks.onNotification(
        'Chưa có đồng hồ. Chưa có đồng hồ bỏ túi. Vào phòng khách từ hành lang để tìm vật dẫn thời gian.'
      );
      return;
    }
    if (this.switchCooldown > 0) {
      this.setPlayerSpeech(`Cần chờ ${Math.ceil(this.switchCooldown)} giây để chiếc kim hồi năng lượng!`, 2.0);
      this.callbacks.onNotification(
        `Liên kết thời gian đang hồi năng lượng (${Math.ceil(this.switchCooldown)}s)...`
      );
      return;
    }

    const nextTimeline: Timeline = this.timeline === 'PAST' ? 'PRESENT' : 'PAST';
    const stageCfg = getStageConfig(this.puzzles.currentStage);

    const firstShift=this.puzzles.currentStage===2&&(!this.puzzles.testedTimelineSwitch||this.puzzles.firstShiftReactionSeen===false);
    if(firstShift)this.puzzles.firstShiftReactionSeen=false;

    // Mark the first timeline switch complete
    if (!this.puzzles.testedTimelineSwitch) {
      this.puzzles.testedTimelineSwitch = true;
      this.callbacks.onPuzzleUpdate({ ...this.puzzles });
    }

    // Check collision in new timeline and safely resolve player coordinate if needed
    const nextPlatforms = getActivePlatforms(stageCfg.platforms, nextTimeline, this.puzzles);
    const safePos = resolveSafeTimelinePosition(
      {
        x: this.player.x,
        y: this.player.y,
        width: this.player.width,
        height: this.player.height
      },
      nextPlatforms
    );

    this.player.x = safePos.x;
    this.player.y = safePos.y;
    this.pursuer.phase=this.timeline;this.pursuer.phaseDelay=1.25;
    this.timeline = nextTimeline;
    this.nearbyInteractable=null;this.mechanismContext=null;this.callbacks.onNearbyPrompt(null);
    this.switchCooldown = SWITCH_COOLDOWN_TIME;
    this.stats.timelineSwitches++;

    soundManager.playTimelineWarp(nextTimeline);
    soundManager.setTimeline(nextTimeline);
    this.renderer.triggerWarp();

    this.callbacks.onTimelineChange(nextTimeline);
    this.callbacks.onCooldownChange(1.0, SWITCH_COOLDOWN_TIME);

    if(firstShift){
      this.callbacks.onNotification('');
      this.player.vx=0;this.player.state='interact';this.player.interactionPose='think';this.player.interactAnimTimer=.7;
      this.handleBlur();this.gameState='paused';this.firstWarpBeat=.95;
      this.saveGame();return;
    }

    if (safePos.shifted) {
      this.setPlayerSpeech('Có vật cản ở mốc thời gian này, mình vừa lách sang vị trí an toàn!', 3.0);
      this.callbacks.onNotification(
        nextTimeline === 'PAST'
          ? 'Đã chuyển sang QUÁ KHỨ (Vị trí có vật cản nên An đã được đẩy nhẹ tới điểm an toàn).'
          : 'Đã chuyển sang HIỆN TẠI (Vị trí có vật cản nên An đã được đẩy nhẹ tới điểm an toàn).'
      );
    } else {
      this.setPlayerSpeech(
        nextTimeline === 'PAST'
          ? 'Quá Khứ: Ngôi nhà trước đêm xảy ra tai nạn...'
          : 'Hiện Tại: Mười năm sau đêm bão...',
        2.5
      );
      this.callbacks.onNotification(
        nextTimeline === 'PAST'
          ? 'Dòng thời gian: QUÁ KHỨ (Trước đêm xảy ra tai nạn)'
          : 'Dòng thời gian: HIỆN TẠI (Ngôi nhà bỏ hoang)'
      );
    }

    this.saveGame();
  }

  private snapRoomCamera(){
    const cfg=getStageConfig(this.puzzles.currentStage),view=this.canvas.width/this.viewZoom;
    const bounds=houseCamera(cfg.stage,this.player.x,view,cfg.width);
    this.cameraX=Math.max(bounds.min,Math.min(bounds.max,this.player.x+this.player.width/2-view/2));
  }
  private enterRoomDoor(obj:InteractableObject){
    const route=houseDestination(obj,this.puzzles,this.timeline);if(!route)return false;
    if(route.locked){this.callbacks.onNotification(route.lockedMessage??'Cửa đang khóa.');this.player.interactCooldown=.3;return true;}
    const era=this.timeline,story=this.puzzles.storyChapter??this.puzzles.currentStage,d=route.destination;
    if(d.stage!==this.puzzles.currentStage)this.loadStage(d.stage,chapterForArea(d.stage)>story,true,era);
    this.timeline=this.puzzles.hasWatch?era:'PRESENT';
    Object.assign(this.player,{x:d.x,y:d.y??480-PLAYER_HEIGHT,vx:0,vy:0,state:'idle',animTimer:0,animFrame:0,interactCooldown:.5,isGrounded:true});
    this.handleBlur();this.viewZoom=sceneZoom(d.stage,d.x);this.snapRoomCamera();this.nearbyInteractable=null;this.mechanismContext=null;this.roomFade=.24;
    const room=getCurrentRoom(d.x,d.stage);this.checkpoint={x:d.x,y:this.player.y,timeline:this.timeline,chapter:d.stage,labelVi:room.nameVi};
    this.callbacks.onTimelineChange(this.timeline);soundManager.setTimeline(this.timeline);soundManager.playDoorUnlock();
    this.callbacks.onNearbyPrompt(null);this.callbacks.onRoomChange(room);this.callbacks.onPuzzleUpdate({...this.puzzles});this.callbacks.onNotification(room.nameVi);this.saveGame();return true;
  }

  public triggerInteract(answer?:readonly number[]) {
    if(!answer){
      if(this.gameState!=='playing')return;
      this.checkNearbyInteractables(getStageConfig(this.puzzles.currentStage));
    }
    if(!answer&&this.nearbyInteractable?.destination){if(this.player.interactCooldown<=0)this.enterRoomDoor(this.nearbyInteractable);return;}
    const objectId=answer?this.mechanismContext?.objectId:this.nearbyInteractable?.id;
    if (!objectId || (!answer && this.player.interactCooldown > 0)) return;

    this.player.interactCooldown = 0.25;
    this.player.interactAnimTimer = 0.45;
    this.player.state = 'interact';
    this.player.interactionPose=['mother_note_ch1','clock_gear'].includes(objectId)?'crouch':'think';

    const currentBossHits=this.puzzles.bossHits?.length??0;
    const result = processInteraction(objectId, this.timeline, this.puzzles, answer);
    this.puzzles = result.updatedPuzzles;
    this.callbacks.onPuzzleUpdate({ ...this.puzzles });
    if(result.challenge){
      if(!answer){
        this.mechanismContext={id:result.challenge,objectId,stage:this.puzzles.currentStage,timeline:this.timeline};
        this.gameState='paused';this.handleBlur();this.player.vx=0;
        this.callbacks.onOpenMechanism?.(result.challenge);
      }
      else this.callbacks.onNotification(result.messageVi);
      this.saveGame();return false;
    }


    if(answer)this.mechanismContext=null;
    if(objectId.startsWith('boss_trap_')&&result.success){
      if(this.puzzles.bossArmedTrap!==undefined&&this.timeline==='PAST'){this.bossArmSeconds=12-(this.puzzles.bossHits?.length??0)*2;this.bossExposedSeconds=0;}
      if((this.puzzles.bossHits?.length??0)!==currentBossHits){this.pursuer.stagger=4;this.pursuer.x=Math.max(35,this.player.x-180);this.bossArmSeconds=0;this.bossExposedSeconds=0;this.pursuer.exposed=false;}
    }
    if (result.speechBubbleVi) {
      this.setPlayerSpeech(result.speechBubbleVi, 3.5);
    }

    if (result.soundEvent) {
      switch (result.soundEvent) {
        case 'clock_wind':
          soundManager.playClockWind();
          break;
        case 'clock_tick':
          soundManager.playClockTick();
          break;
        case 'switch_flip':
          soundManager.playSwitchFlip();
          break;
        case 'chime_success':
          soundManager.playChimeSuccess();
          this.stats.puzzlesSolvedCount++;
          break;
        case 'door_unlock':
          soundManager.playDoorUnlock();
          this.stats.puzzlesSolvedCount++;
          break;
        case 'paper_rustle':
          soundManager.playFootstep();
          break;
      }
    }

    this.callbacks.onNotification(result.messageVi);

    // Chapter 3 Omen of Kẻ Lạc Giờ
    if (result.triggerOmen) {
      const stageCfg = getStageConfig(this.puzzles.currentStage);
      this.pursuer.omenActive = true;
      this.pursuer.omenTimer = 3.5;
      this.pursuer.x = Math.min(stageCfg.width - 90, this.player.x + 130);
      this.pursuer.y = 480-PURSUER_BODY_HEIGHT;
      soundManager.playTimelineWarp('PRESENT');
    }

    // Handle stage transition if player interacted with an unlocked stage exit door
    if (result.advanceToStage) {
      this.loadStage(result.advanceToStage,chapterForArea(result.advanceToStage)>(this.puzzles.storyChapter??1),true,this.timeline);
      return true;
    }

    // Trigger expressive character dialogue box if dialogue lines are returned
    if (result.dialogue && result.dialogue.length > 0) {
      this.stats.notesRead++;
      this.callbacks.onStartDialogue(result.dialogue);
    }

    if (result.triggerFinalChoice) {
      this.gameState = 'choice';
      this.callbacks.onTriggerFinalChoice();
    }

    this.saveGame();
    return result.success;
  }

  public completeWithEnding(ending: EndingType) {
    this.puzzles.chosenEnding = ending;
    this.callbacks.onPuzzleUpdate({ ...this.puzzles });
    soundManager.playChimeSuccess();
    this.gameState = 'ending';
    this.callbacks.onTriggerEnding(this.stats, ending);
    this.saveGame();
  }

  // --- CORE GAME LOOP ---

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = Math.min(rawDt, 0.05);

    if(this.firstWarpBeat>0){
      this.firstWarpBeat=Math.max(0,this.firstWarpBeat-dt);
      this.renderer.update(dt,this.timeline);
      if(this.firstWarpBeat===0){
        this.puzzles.firstShiftReactionSeen=true;
        this.callbacks.onPuzzleUpdate({...this.puzzles});
        this.callbacks.onStartDialogue([
          {speaker:'AN',speakerName:'An',emotion:'surprised',text:'Khoan… Chuyện gì vừa xảy ra vậy?'},
          {speaker:'AN',speakerName:'An · nghĩ thầm',emotion:'surprised',text:this.timeline==='PAST'?'Mùi trà… Ghế sofa còn nguyên. Cả ánh đèn này nữa… Rõ ràng ban nãy mọi thứ đã mục hết rồi mà.':'Căn phòng lại tối rồi… Vết nứt trên tường cũng trở lại. Mình vẫn đứng đúng chỗ này.'},
          {speaker:'AN',speakerName:'An · nghĩ thầm',emotion:'whisper',text:'Chiếc kim… Mình chỉ vừa chạm vào nó. Không lẽ những gì mình đang thấy là thật?'},
          {speaker:'AN',speakerName:'An',emotion:'determined',text:'Bình tĩnh đã. Nhìn kỹ xung quanh xem… Có lẽ ở đây vẫn còn điều gì đó về Linh.'}
        ]);
        this.saveGame();
      }
    }else if(this.gameState==='playing'){
      this.update(dt);
    }

    this.render();
    this.justPressed.clear();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public update(dt: number) {
    this.roomFade=Math.max(0,this.roomFade-dt);
    this.contactCooldown=Math.max(0,this.contactCooldown-dt);
    this.stats.timeElapsed += dt;
    const stageCfg = getStageConfig(this.puzzles.currentStage);

    // 1. Cooldowns & timers
    if (this.switchCooldown > 0) {
      this.switchCooldown = Math.max(0, this.switchCooldown - dt);
      const ratio = this.switchCooldown / SWITCH_COOLDOWN_TIME;
      this.callbacks.onCooldownChange(ratio, Math.ceil(this.switchCooldown));
    }
    if (this.player.interactCooldown > 0) {
      this.player.interactCooldown = Math.max(0, this.player.interactCooldown - dt);
    }
    if (this.player.speechBubbleTimer && this.player.speechBubbleTimer > 0) {
      this.player.speechBubbleTimer = Math.max(0, this.player.speechBubbleTimer - dt);
    }

    // 2. Timeline switch key: Q
    if (this.justPressed.has('q')) {
      this.switchTimeline();
      if(this.gameState!=='playing')return;
    }

    // 3. Movement input
    let inputX = 0;
    if (this.keysPressed.has('a') || this.keysPressed.has('arrowleft')) {
      inputX -= 1;
    }
    if (this.keysPressed.has('d') || this.keysPressed.has('arrowright')) {
      inputX += 1;
    }


    const jumpRequested =
      this.justPressed.has(' ') ||
      this.justPressed.has('space') ||
      this.justPressed.has('w') ||
      this.justPressed.has('arrowup');
    const jumpHeld =
      this.keysPressed.has(' ') ||
      this.keysPressed.has('space') ||
      this.keysPressed.has('w') ||
      this.keysPressed.has('arrowup');

    // 4. Update physics against current stage's platforms
    const activePlatforms = getActivePlatforms(stageCfg.platforms, this.timeline, this.puzzles);

    const previousX=this.player.x;
    const previousState=this.player.state;
    const prevGrounded = this.player.isGrounded;
    const prevVy = this.player.vy;

    const physResult = updateAndResolvePhysics(
      this.player,
      activePlatforms,
      inputX,
      jumpRequested,
      jumpHeld,
      dt
    );

    this.player.x = physResult.x;
    this.player.y = physResult.y;
    this.player.vx = physResult.vx;
    this.player.vy = physResult.vy;
    this.player.isGrounded = physResult.isGrounded;
    this.player.coyoteTimer = physResult.coyoteTimer;
    this.player.jumpBufferTimer = physResult.jumpBufferTimer;

    if (this.player.x < 10) this.player.x = 10;
    if (this.player.x > stageCfg.width - this.player.width - 10) {
      this.player.x = stageCfg.width - this.player.width - 10;
    }

    if(stageCfg.stage===1){
      let changed=false;
      if(!this.puzzles.tutorialMoved&&Math.abs(this.player.x-stageCfg.spawnX)>40){this.puzzles.tutorialMoved=true;changed=true;}
      if(!this.puzzles.tutorialJumped&&prevGrounded&&!this.player.isGrounded&&this.player.vy<0){this.puzzles.tutorialJumped=true;changed=true;}
      if(changed)this.callbacks.onPuzzleUpdate({...this.puzzles});
    }
    if (!prevGrounded && this.player.isGrounded && prevVy > 100) {
      soundManager.playLand();
    }
    if (prevGrounded && !this.player.isGrounded && this.player.vy < -200) {
      soundManager.playJump();
    }

    const distanceMoved=this.player.x-previousX;
    // Face the actual movement while decelerating through a direction change.
    if(this.player.vx>5)this.player.facing='right';
    else if(this.player.vx < -5)this.player.facing='left';
    else if(inputX)this.player.facing=inputX>0?'right':'left';

    // Animation state
    if (this.player.interactAnimTimer > 0) {
      this.player.interactAnimTimer = Math.max(0, this.player.interactAnimTimer - dt);
      this.player.state = 'interact';
    } else if (!this.player.isGrounded) {
      this.player.state = this.player.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(this.player.vx) > 5 && Math.abs(distanceMoved)>.001) {
      this.player.state = 'walk';
    } else {
      this.player.state = 'idle';
    }

    if(this.player.state==='walk'){
      if(previousState==='idle')this.player.animTimer=0;
      const gait=advanceGait(this.player.animTimer,distanceMoved,this.player.isGrounded,stageCfg.stage===5);
      this.player.animTimer=gait.phase;
      this.player.animFrame=Math.floor(gait.phase*8);
      if(gait.step)soundManager.playFootstep();
    }else if(this.player.state==='idle'){
      this.player.animTimer=0;this.player.animFrame=0;
    }

    if(this.player.y>640){this.respawnAtCheckpoint();return;}
    const room=getCurrentRoom(this.player.x,stageCfg.stage);
    const previousRoom=currentPixelRoom(stageCfg.stage,this.checkpoint.x);
    const nextRoom=currentPixelRoom(stageCfg.stage,this.player.x);
    if(this.player.isGrounded&&nextRoom.index>previousRoom.index){
      this.checkpoint={x:this.player.x,y:this.player.y,timeline:this.timeline,chapter:stageCfg.stage,labelVi:room.nameVi};
      this.callbacks.onNotification('Dấu mốc mới: '+room.nameVi);this.saveGame();
    }
    if(this.currentPixelRoomId!==room.id){this.currentPixelRoomId=room.id;this.callbacks.onRoomChange(room);}
    // 5. Check nearby interactables in current stage
    this.checkNearbyInteractables(stageCfg);

    // 6. Interact key: E
    if (this.justPressed.has('e')) {
      this.triggerInteract();
      if(stageCfg.stage!==this.puzzles.currentStage)return;
    }

    // 7. Stage 3 Omen & Stage 5 Chase Logic (Kẻ Lạc Giờ)
    this.updatePursuerAndStageProgress(dt, stageCfg);

    // 8. Camera follow within current stage bounds
    this.viewZoom+=(sceneZoom(stageCfg.stage,this.player.x)-this.viewZoom)*Math.min(dt*6,1);
    const targetCamX = this.player.x + this.player.width / 2 - this.canvas.width / this.viewZoom / 2;
    const cameraBounds=houseCamera(stageCfg.stage,this.player.x,this.canvas.width/this.viewZoom,stageCfg.width);
    const clampedCamX = Math.max(cameraBounds.min,Math.min(cameraBounds.max,targetCamX));
    this.cameraX += (clampedCamX - this.cameraX) * Math.min(dt * 8, 1);

    // 9. Update renderer animations & particles
    this.renderer.update(dt, this.timeline);
  }

  private updatePursuerAndStageProgress(dt: number, stageCfg: StageConfig) {
    if (this.pursuer.omenActive) {
      this.pursuer.omenTimer -= dt;
      if (this.pursuer.omenTimer <= 0) {
        this.pursuer.omenActive = false;
      }
    }

    this.pursuer.phaseDelay=Math.max(0,(this.pursuer.phaseDelay??0)-dt);
    if(!this.pursuer.phaseDelay)this.pursuer.phase=this.timeline;
    if(stageCfg.stage===5&&!this.puzzles.chaseCompleted){
      this.pursuer.active=true;
      const speed=this.player.x<1200?145:this.player.x<2400?158:170;
      const factor=this.pursuer.phase===this.timeline?1:.5;
      this.pursuer.x+=Math.sign(this.player.x-this.pursuer.x)*speed*factor*dt;
      this.pursuer.y+=(this.player.y+3-this.pursuer.y)*Math.min(2*dt,1);
      if(this.pursuer.phase===this.timeline&&checkAABB(this.player,this.pursuer)){this.respawnAtCheckpoint();return;}
      if(this.player.x>=stageCfg.width-100&&completeSeals(this.puzzles)){
        this.pursuer.active=false;this.puzzles.chaseCompleted=true;this.loadStage(6,true,true);return;
      }
    }
    if(stageCfg.stage===6){
      if(bossDefeated(this.puzzles)){this.pursuer.active=false;return;}
      this.bossPastSeconds=this.timeline==='PAST'?this.bossPastSeconds+dt:0;
      this.pursuer.active=true;if(this.timeline==='PAST')this.pursuer.phase=this.bossPastSeconds<6?'PRESENT':'PAST';this.pursuer.stagger=Math.max(0,(this.pursuer.stagger??0)-dt);
      let changed=false;
      if(this.bossArmSeconds>0&&this.puzzles.bossExposedTrap===undefined){this.bossArmSeconds=Math.max(0,this.bossArmSeconds-dt);if(!this.bossArmSeconds){delete this.puzzles.bossArmedTrap;changed=true;this.callbacks.onNotification('Bẫy đã hết nhịp. Cần nạp lại ở quá khứ.');}}
      if(this.bossExposedSeconds>0){this.bossExposedSeconds=Math.max(0,this.bossExposedSeconds-dt);if(!this.bossExposedSeconds){delete this.puzzles.bossExposedTrap;delete this.puzzles.bossArmedTrap;this.pursuer.exposed=false;changed=true;}}
      const armed=this.puzzles.bossArmedTrap,trap=armed===undefined?undefined:BOSS_TRAPS[armed];
      if(trap&&this.bossArmSeconds>0&&this.puzzles.bossExposedTrap===undefined&&this.timeline==='PRESENT'&&this.pursuer.phase==='PRESENT'&&Math.abs(this.pursuer.x-trap.x)<85){
        this.puzzles.bossExposedTrap=armed;this.bossExposedSeconds=3-(this.puzzles.bossHits?.length??0)*.6;this.pursuer.exposed=true;changed=true;soundManager.playChimeSuccess();this.callbacks.onNotification('Vỏ quái đã sáng lên — xả bẫy ngay!');
      }
      if(!this.pursuer.stagger&&!this.bossExposedSeconds){
        this.pursuer.x+=Math.sign(this.player.x-this.pursuer.x)*(this.timeline==='PAST'&&this.bossPastSeconds<6?70:140+(this.puzzles.bossHits?.length??0)*18)*dt;
        this.pursuer.y+=(this.player.y+3-this.pursuer.y)*Math.min(3*dt,1);
      }
      if((this.timeline==='PRESENT'||this.bossPastSeconds>=6)&&this.pursuer.phase===this.timeline&&!this.pursuer.stagger&&!this.bossExposedSeconds&&this.contactCooldown<=0&&checkAABB(this.player,this.pursuer)){
        this.puzzles.playerResolve=(this.puzzles.playerResolve??3)-1;changed=true;this.contactCooldown=1.8;
        if(this.puzzles.playerResolve<=0){this.respawnAtCheckpoint();return;}
        const away=this.player.x<this.pursuer.x?-1:1;this.player.x=Math.max(15,Math.min(stageCfg.width-45,this.player.x+away*65));this.player.vy=-170;this.player.isGrounded=false;this.pursuer.x-=away*45;
        this.callbacks.onNotification(`Liên kết rạn nứt: còn ${this.puzzles.playerResolve}/3 nhịp.`);soundManager.playLand();
      }
      const safety=this.timeline==='PAST'?Math.max(0,Math.ceil(6-this.bossPastSeconds)):undefined;
      if(this.puzzles.pastSafetySeconds!==safety){this.puzzles.pastSafetySeconds=safety;changed=true;}
      const windowSeconds=Math.ceil(this.bossExposedSeconds||this.bossArmSeconds);
      if((this.puzzles.bossWindowSeconds??0)!==windowSeconds){this.puzzles.bossWindowSeconds=windowSeconds;changed=true;}
      if(changed){this.callbacks.onPuzzleUpdate({...this.puzzles});this.saveGame();}
    }
  }

  private checkNearbyInteractables(stageCfg: StageConfig) {
    const pCenter = this.player.x + this.player.width / 2;
    let closestObj: InteractableObject | null = null;
    let closestDist = 68;

    for (const obj of stageCfg.interactables) {
      if((stageCfg.stage===2||stageCfg.stage===4)&&currentPixelRoom(stageCfg.stage,obj.x+obj.width/2).index!==currentPixelRoom(stageCfg.stage,this.player.x).index)continue;
      if (obj.timeline !== 'both' && obj.timeline !== this.timeline) {
        continue;
      }
      if(obj.id.startsWith('boss_trap_')&&this.puzzles.bossHits?.includes(Number(obj.id.slice(-1))))continue;
      if(obj.id==='npc_linh_ch6'&&!bossDefeated(this.puzzles))continue;
      if(obj.id==='temporal_anchor'&&this.puzzles.finalCoreAligned)continue;
      if(obj.id.startsWith('chase_seal_')&&this.puzzles.chaseSeals?.includes(Number(obj.id.slice(-1))))continue;
      if(obj.id==='pocket_watch_box'&&this.puzzles.hasWatch)continue;
      if (obj.id === 'clock_gear' && this.puzzles.clockGearFound) {
        continue;
      }
      const objCenter = obj.x + obj.width / 2;
      const dist = Math.abs(pCenter - objCenter);
      const verticalDist = Math.abs((this.player.y + this.player.height / 2) - (obj.y + obj.height / 2));

      if (dist < closestDist && verticalDist < (obj.type==='portrait'?170:85)) {
        closestDist = dist;
        closestObj = obj;
      }
    }

    if (closestObj !== this.nearbyInteractable) {
      this.nearbyInteractable = closestObj;
      this.callbacks.onNearbyPrompt(closestObj);
    }
  }

  public render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const stageCfg = getStageConfig(this.puzzles.currentStage);
    const activePlatforms = getActivePlatforms(stageCfg.platforms, this.timeline, this.puzzles);
    const activeInteractables = stageCfg.interactables.filter(
      obj => obj.timeline === 'both' || obj.timeline === this.timeline
    );

    this.ctx.save();
    this.ctx.scale(this.viewZoom, this.viewZoom);
    this.ctx.translate(0,-Math.min(480-470.25/this.viewZoom,this.player.y-45));
    this.renderer.render(
      this.ctx,
      this.cameraX,
      this.canvas.width / this.viewZoom,
      this.canvas.height / this.viewZoom,
      this.timeline,
      this.player,
      activePlatforms,
      activeInteractables,
      this.puzzles,
      this.nearbyInteractable?.id || null,
      this.pursuer,
      this.gameState==='playing'
    );
    this.ctx.restore();
    if(this.roomFade>0){this.ctx.fillStyle=`rgba(4,12,8,${this.roomFade/.24})`;this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);}
  }

  // --- SAVE / LOAD SYSTEM ---

  public saveGame() {
    try {
      const data = {
        campaignVersion:2,
        houseLayoutVersion:1,
        characterScaleVersion:3,
        spawnVersion:3,
        sceneScaleVersion:2,
        player: { x: this.player.x, y: this.player.y },
        timeline: this.timeline,
        puzzles: this.puzzles,
        checkpoint: this.checkpoint,
        stats: this.stats
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  public loadSave(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if(!data.houseLayoutVersion&&data.sceneScaleVersion===2&&data.puzzles){
        const oldStage=data.puzzles.currentStage??1;data.puzzles.storyChapter=oldStage;
        const moved=migrateHouseLocation(oldStage,data.player?.x??80);data.puzzles.currentStage=moved.stage;if(data.player)data.player.x=moved.x;
        if(data.checkpoint){const cp=migrateHouseLocation(data.checkpoint.chapter,data.checkpoint.x);data.checkpoint.chapter=cp.stage;data.checkpoint.x=cp.x;}
      }
      if(data.puzzles&&data.campaignVersion!==2){const progress=savedChapterProgress(data.puzzles,data.campaignVersion);data.puzzles.storyChapter=progress.current;data.puzzles.furthestChapter=progress.unlocked;if(data.puzzles.currentStage===5){data.player={x:170,y:480-savedCharacterHeight(data.characterScaleVersion)};data.checkpoint={chapter:5,x:170,y:480-savedCharacterHeight(data.characterScaleVersion),timeline:'PRESENT'};data.puzzles.chaseSeals=[];data.puzzles.chaseSealsComplete=false;data.puzzles.chaseCompleted=false;}}
      if (data.puzzles) {
        this.puzzles = { ...this.puzzles, ...data.puzzles };
        this.puzzles.storyChapter??=chapterForArea(this.puzzles.currentStage);
      }
      const stageCfg = getStageConfig(this.puzzles.currentStage || 1);
      if((stageCfg.stage===1&&(this.puzzles.storyChapter??1)<=1)||(stageCfg.stage===2&&!this.puzzles.watchCollected)){this.puzzles.hasWatch=false;this.puzzles.testedTimelineSwitch=false;this.timeline='PRESENT';}
      if (data.player && typeof data.player.x === 'number') {
        const savedY=migrateCharacterY(data.player.y,data.characterScaleVersion);
        const point=data.sceneScaleVersion===2?{x:data.player.x,y:savedY+PLAYER_HEIGHT}:legacyScenePoint(stageCfg.stage,data.player.x,savedY+PLAYER_HEIGHT);
        this.player.x=Math.max(10,Math.min(stageCfg.width-40,point.x));
        this.player.y=point.y-PLAYER_HEIGHT>=50&&point.y<=480?point.y-PLAYER_HEIGHT:stageCfg.spawnY;
      }
      if(stageCfg.stage===1&&data.spawnVersion!==3){this.player.x=stageCfg.spawnX;this.player.y=stageCfg.spawnY;}
      this.viewZoom=sceneZoom(stageCfg.stage,this.player.x);
      this.snapRoomCamera();
      if (data.timeline) {
        this.timeline = data.timeline;
      }
      if(!this.puzzles.hasWatch)this.timeline='PRESENT';
      if (data.checkpoint) {
        const oldY=migrateCharacterY(data.checkpoint.y,data.characterScaleVersion);
        const point=data.sceneScaleVersion===2?{x:data.checkpoint.x,y:oldY+PLAYER_HEIGHT}:legacyScenePoint(data.checkpoint.chapter,data.checkpoint.x,oldY+PLAYER_HEIGHT);
        this.checkpoint={...data.checkpoint,x:point.x,y:point.y-PLAYER_HEIGHT};
      }
      if(stageCfg.stage===1&&data.spawnVersion!==3)this.checkpoint={x:stageCfg.spawnX,y:stageCfg.spawnY,timeline:'PRESENT',chapter:1,labelVi:stageCfg.roomNameVi};
      if (data.stats) {
        this.stats = { ...this.stats, ...data.stats };
      }
      if(stageCfg.stage===6&&!bossDefeated(this.puzzles)){this.pursuer.active=true;this.pursuer.x=1050;this.pursuer.y=290;this.pursuer.phase='PRESENT';this.puzzles.playerResolve??=3;delete this.puzzles.bossArmedTrap;delete this.puzzles.bossExposedTrap;this.contactCooldown=2;}
      if (stageCfg.stage === 5 && !this.puzzles.chaseCompleted) {
        this.pursuer.active = true;
        this.pursuer.x = Math.max(10, this.player.x - 140);
      }
      // Older saves could enter the now-collapsed workshop before collecting the watch.
      if(stageCfg.stage===2&&!this.puzzles.hasWatch&&currentPixelRoom(2,this.player.x).map===5){
        this.player.x=250;this.player.y=480-PLAYER_HEIGHT;this.timeline='PRESENT';
        this.checkpoint={x:250,y:this.player.y,timeline:'PRESENT',chapter:2,labelVi:'Hành lang trong nhà'};
        this.viewZoom=sceneZoom(2,250);this.snapRoomCamera();
      }
      this.callbacks.onTimelineChange(this.timeline);
      this.callbacks.onPuzzleUpdate({ ...this.puzzles });
      this.callbacks.onRoomChange(getCurrentRoom(this.player.x, stageCfg.stage));
      return true;
    } catch {
      return false;
    }
  }

  public hasSaveData(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
}
