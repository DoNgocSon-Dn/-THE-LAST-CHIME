import { PLAYER_WIDTH, PLAYER_HEIGHT, PURSUER_BODY_HEIGHT } from './entityScale';
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
    labelVi: 'Màn 1 — Hiên Nhà (Chương 1)'
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

  // Input states
  private keysPressed = new Set<string>();
  private justPressed = new Set<string>();
  private footstepTimer: number = 0;

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
  public loadStage(stageNum: number, showBanner: boolean = true) {
    const cfg = getStageConfig(stageNum);
    this.puzzles.currentStage = cfg.stage;

    // Ensure prerequisite abilities are unlocked if jumping directly to later stages
    if(cfg.stage===1){this.puzzles.hasWatch=false;this.puzzles.watchCollected=false;this.puzzles.testedTimelineSwitch=false;}
    if (cfg.stage >= 3) {
      this.puzzles.hasWatch = true;
      this.puzzles.watchCollected = true;
      this.puzzles.testedTimelineSwitch = true;
    }
    if (cfg.stage >= 3) {
      this.puzzles.clockGearFound = true;
      this.puzzles.clockRepaired = true;
      this.puzzles.clockInspectedPresent = true;
    }
    if (cfg.stage >= 4) {
      this.puzzles.hallwayPassageCleared = true;
      this.puzzles.motherDiaryCh3Read = true;
    }
    if (cfg.stage >= 5) {
      this.puzzles.lightSwitchOn = true;
      this.puzzles.lightRuneFound = true;
      this.puzzles.musicBoxPlayed = true;
      this.puzzles.finalDoorUnlocked = true;
    }
    if (cfg.stage >= 6) {
      this.puzzles.chaseCompleted = true;
    }

    this.player.x = cfg.spawnX;
    this.player.y = cfg.spawnY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 'right';
    this.player.state = 'idle';
    this.player.isGrounded = true;
    this.player.speechBubbleText = '';
    this.player.speechBubbleTimer = 0;
    this.viewZoom=sceneZoom(cfg.stage,this.player.x);
    this.cameraX=Math.max(0,Math.min(cfg.width-this.canvas.width/this.viewZoom,this.player.x+this.player.width/2-this.canvas.width/this.viewZoom/2));
    this.timeline = cfg.defaultTimeline;
    this.switchCooldown = 0;
    this.nearbyInteractable = null;

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
      this.pursuer.active = false;
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
  }

  public switchTimeline() {
    if (!this.puzzles.hasWatch) {
      this.setPlayerSpeech('Đồng hồ bỏ túi ở trong phòng khách. Mình phải vào nhà trước.', 3.2);
      this.callbacks.onNotification(
        'Chưa có đồng hồ. Màn 1: học di chuyển và vào nhà bằng E. Màn 2: nhặt đồng hồ trên bàn cạnh đèn.'
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

    // Mark Chapter 1 tutorial switch complete
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
    this.timeline = nextTimeline;
    this.switchCooldown = SWITCH_COOLDOWN_TIME;
    this.stats.timelineSwitches++;

    soundManager.playTimelineWarp(nextTimeline);
    soundManager.setTimeline(nextTimeline);
    this.renderer.triggerWarp();

    this.callbacks.onTimelineChange(nextTimeline);
    this.callbacks.onCooldownChange(1.0, SWITCH_COOLDOWN_TIME);

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

  public triggerInteract() {
    if (!this.nearbyInteractable || this.player.interactCooldown > 0) return;

    this.player.interactCooldown = 0.25;
    this.player.interactAnimTimer = 0.45;
    this.player.state = 'interact';

    const result = processInteraction(this.nearbyInteractable.id, this.timeline, this.puzzles);
    this.puzzles = result.updatedPuzzles;
    this.callbacks.onPuzzleUpdate({ ...this.puzzles });

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
      this.loadStage(result.advanceToStage, true);
      return;
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

    if (this.gameState === 'playing') {
      this.update(dt);
    }

    this.render();
    this.justPressed.clear();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public update(dt: number) {
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
    }

    // 3. Movement input
    let inputX = 0;
    if (this.keysPressed.has('a') || this.keysPressed.has('arrowleft')) {
      inputX -= 1;
    }
    if (this.keysPressed.has('d') || this.keysPressed.has('arrowright')) {
      inputX += 1;
    }

    if (inputX > 0) this.player.facing = 'right';
    if (inputX < 0) this.player.facing = 'left';

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

    if (this.player.isGrounded && Math.abs(this.player.vx) > 30) {
      this.footstepTimer += dt;
      if (this.footstepTimer > 0.32) {
        soundManager.playFootstep();
        this.footstepTimer = 0;
      }
    } else {
      this.footstepTimer = 0.2;
    }

    // Animation state
    if (this.player.interactAnimTimer > 0) {
      this.player.interactAnimTimer = Math.max(0, this.player.interactAnimTimer - dt);
      this.player.state = 'interact';
    } else if (!this.player.isGrounded) {
      this.player.state = this.player.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(this.player.vx) > 15) {
      this.player.state = 'walk';
    } else {
      this.player.state = 'idle';
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
    }

    // 7. Stage 3 Omen & Stage 5 Chase Logic (Kẻ Lạc Giờ)
    this.updatePursuerAndStageProgress(dt, stageCfg);

    // 8. Camera follow within current stage bounds
    this.viewZoom+=(sceneZoom(stageCfg.stage,this.player.x)-this.viewZoom)*Math.min(dt*6,1);
    const targetCamX = this.player.x + this.player.width / 2 - this.canvas.width / this.viewZoom / 2;
    const maxCamX = Math.max(0, stageCfg.width - this.canvas.width / this.viewZoom);
    const clampedCamX = Math.max(0, Math.min(maxCamX, targetCamX));
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

    // Stage 5: Active pursuit by Kẻ Lạc Giờ
    if (stageCfg.stage === 5 && !this.puzzles.chaseCompleted) {
      if (!this.pursuer.active) {
        this.pursuer.active = true;
        this.pursuer.x = 25;
        this.pursuer.y = 480-PURSUER_BODY_HEIGHT;
      }

      const dir = this.player.x > this.pursuer.x ? 1 : -1;
      this.pursuer.x += dir * this.pursuer.speed * dt;

      this.pursuer.y += (this.player.y+3-this.pursuer.y)*Math.min(2*dt,1);
      // Check collision with An
      if (checkAABB(this.player,this.pursuer)) {
        this.respawnAtCheckpoint();
        return;
      }

      // The sanctuary is at the end of all three forest/cave rooms.
      if (this.player.x >= stageCfg.width - 100) {
        this.pursuer.active = false;
        this.puzzles.chaseCompleted = true;
        soundManager.playChimeSuccess();
        this.loadStage(6, true);
      }
    }
  }

  private checkNearbyInteractables(stageCfg: StageConfig) {
    const pCenter = this.player.x + this.player.width / 2;
    let closestObj: InteractableObject | null = null;
    let closestDist = 68;

    for (const obj of stageCfg.interactables) {
      if (obj.timeline !== 'both' && obj.timeline !== this.timeline) {
        continue;
      }
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
      this.pursuer
    );
    this.ctx.restore();
  }

  // --- SAVE / LOAD SYSTEM ---

  public saveGame() {
    try {
      const data = {
        characterScaleVersion:2,
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
      if (data.puzzles) {
        this.puzzles = { ...this.puzzles, ...data.puzzles };
      }
      const stageCfg = getStageConfig(this.puzzles.currentStage || 1);
      if(stageCfg.stage===1||(stageCfg.stage===2&&!this.puzzles.watchCollected)){this.puzzles.hasWatch=false;this.puzzles.testedTimelineSwitch=false;this.timeline='PRESENT';}
      if (data.player && typeof data.player.x === 'number') {
        const savedY=data.player.y+(data.characterScaleVersion===2?0:44-PLAYER_HEIGHT);
        const point=data.sceneScaleVersion===2?{x:data.player.x,y:savedY+PLAYER_HEIGHT}:legacyScenePoint(stageCfg.stage,data.player.x,savedY+PLAYER_HEIGHT);
        this.player.x=Math.max(10,Math.min(stageCfg.width-40,point.x));
        this.player.y=point.y-PLAYER_HEIGHT>=50&&point.y<=480?point.y-PLAYER_HEIGHT:stageCfg.spawnY;
      }
      if(stageCfg.stage===1&&data.spawnVersion!==3){this.player.x=stageCfg.spawnX;this.player.y=stageCfg.spawnY;}
      this.viewZoom=sceneZoom(stageCfg.stage,this.player.x);
      this.cameraX=Math.max(0,Math.min(stageCfg.width-this.canvas.width/this.viewZoom,this.player.x+this.player.width/2-this.canvas.width/this.viewZoom/2));
      if (data.timeline) {
        this.timeline = data.timeline;
      }
      if(!this.puzzles.hasWatch)this.timeline='PRESENT';
      if (data.checkpoint) {
        const oldY=data.checkpoint.y+(data.characterScaleVersion===2?0:44-PLAYER_HEIGHT);
        const point=data.sceneScaleVersion===2?{x:data.checkpoint.x,y:oldY+PLAYER_HEIGHT}:legacyScenePoint(data.checkpoint.chapter,data.checkpoint.x,oldY+PLAYER_HEIGHT);
        this.checkpoint={...data.checkpoint,x:point.x,y:point.y-PLAYER_HEIGHT};
      }
      if(stageCfg.stage===1&&data.spawnVersion!==3)this.checkpoint={x:stageCfg.spawnX,y:stageCfg.spawnY,timeline:'PRESENT',chapter:1,labelVi:stageCfg.roomNameVi};
      if (data.stats) {
        this.stats = { ...this.stats, ...data.stats };
      }
      if (stageCfg.stage === 5 && !this.puzzles.chaseCompleted) {
        this.pursuer.active = true;
        this.pursuer.x = Math.max(10, this.player.x - 140);
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
