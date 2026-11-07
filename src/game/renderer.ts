import {bossDefeated} from './encounters';
import { PURSUER_ART_HEIGHT } from './entityScale';
import { pixelAssets } from './pixelAssets';
import { CharacterAtlas } from './characterAtlas';
import {
  Player,
  Timeline,
  Platform,
  InteractableObject,
  PuzzleState,
  PursuerEntity,
  MemoryNPC
} from '../types/game';
import { PixelWorld } from './pixelWorld';
import { getStageConfig } from './levelData';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export class GameRenderer {
  private world = new PixelWorld();
  private pixel = pixelAssets();
  private character = new CharacterAtlas();
  private particles: Particle[] = [];
  private rainDrops: { x: number; y: number; speed: number; len: number }[] = [];
  private warpAnimProgress: number = 0; // 0 to 1 during transition
  private warpActive: boolean = false;
  private animTick: number = 0;
  private lastBossHits=0;
  private trapPulse=0;
  private trapPulseX=0;
  private trapPulseY=0;

  constructor() {
    for (let i = 0; i < 55; i++) {
      this.particles.push({
        x: Math.random() * 1500,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 8,
        vy: -4 - Math.random() * 10,
        life: Math.random() * 5,
        maxLife: 4 + Math.random() * 3,
        size: 1.5 + Math.random() * 2,
        color: '#f6d365'
      });
    }

    for (let i = 0; i < 65; i++) {
      this.rainDrops.push({
        x: Math.random() * 420,
        y: Math.random() * 600,
        speed: 380 + Math.random() * 180,
        len: 8 + Math.random() * 6
      });
    }
  }

  public isReady(){return this.pixel.isReady()&&this.world.isReady();}

  public triggerWarp() {
    this.warpActive = true;
    this.warpAnimProgress = 1.0;
  }

  public update(dt: number, timeline: Timeline) {
    this.animTick += dt;
    this.trapPulse=Math.max(0,this.trapPulse-dt);

    if (this.warpActive) {
      this.warpAnimProgress -= dt * 1.8;
      if (this.warpAnimProgress <= 0) {
        this.warpAnimProgress = 0;
        this.warpActive = false;
      }
    }

    const isPast = timeline === 'PAST';
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      if (p.life >= p.maxLife || p.y < 50 || p.x < 0 || p.x > 1500) {
        p.life = 0;
        p.x = Math.random() * 1500;
        p.y = 200 + Math.random() * 350;
        p.color = isPast ? (Math.random() > 0.4 ? '#ffdd88' : '#ffeaa7') : '#81ecec';
      }
    }

    if (!isPast) {
      for (const r of this.rainDrops) {
        r.y += r.speed * dt;
        r.x -= r.speed * 0.15 * dt;
        if (r.y > 550) {
          r.y = 0;
          r.x = Math.random() * 420;
        }
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    viewportWidth: number,
    viewportHeight: number,
    timeline: Timeline,
    player: Player,
    platforms: Platform[],
    interactables: InteractableObject[],
    puzzles: PuzzleState,
    nearbyInteractableId: string | null,
    pursuer?: PursuerEntity
  ) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    ctx.translate(-cameraX, 0);

    const isPast = timeline === 'PAST';
    const stageCfg = getStageConfig(puzzles.currentStage || 1);

    this.world.background(ctx, cameraX, viewportWidth, stageCfg.width, isPast, stageCfg.stage);
    this.drawArchitecture(ctx, stageCfg.width, stageCfg.stage, isPast, puzzles);
    this.world.platforms(ctx, platforms, isPast);

    // 4. Draw interactive furniture, stage exit doors & puzzle objects
    this.drawInteractables(ctx, interactables, isPast, puzzles, nearbyInteractableId);

    // 5. Draw In-World Memory Echo NPCs (Mẹ & Bé Linh)
    const activeNPCs = stageCfg.memoryNPCs.filter(
      npc => (npc.timeline === 'both' || npc.timeline === timeline) && (stageCfg.stage!==6||bossDefeated(puzzles))
    );
    this.drawMemoryNPCs(ctx, activeNPCs, nearbyInteractableId);

    // 6. Draw Pursuer (Kẻ Lạc Giờ) if active or during Chapter 3 omen
    if (pursuer && (pursuer.active || pursuer.omenActive)) {
      this.drawPursuer(ctx, pursuer,timeline);
    }

    // 7. Draw player character (An) with expressive character design & overhead speech bubble
    this.character.draw(ctx,player,this.animTick,stageCfg.stage===5);
    if(nearbyInteractableId)this.drawInteractPromptBadge(ctx,player.x+player.width/2,player.y-16,isPast);

    const hits=puzzles.bossHits?.length??0;
    if(hits>this.lastBossHits&&puzzles.currentStage===6){this.trapPulse=.6;const traps=[[417,398],[667,372],[967,375]];const pos=traps[puzzles.bossHits![hits-1]];this.trapPulseX=pos[0];this.trapPulseY=pos[1];}
    this.lastBossHits=hits;
    if(this.trapPulse>0){ctx.save();ctx.globalAlpha=this.trapPulse/.6;ctx.strokeStyle='#ffe4a1';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.trapPulseX,this.trapPulseY,15+(1-this.trapPulse/.6)*110,0,Math.PI*2);ctx.stroke();ctx.restore();}

    // 8. Draw foreground atmosphere, dust particles & rain
    this.drawAtmosphere(ctx, stageCfg.stage, isPast);
    this.world.foreground(ctx, cameraX, viewportWidth, stageCfg.width, this.animTick);

    ctx.restore();

    // 9. Chase vignette warning if Kẻ Lạc Giờ is actively hunting
    if (pursuer && pursuer.active) {
      this.drawChaseDangerVignette(ctx, viewportWidth, viewportHeight);
    }

    // 10. Post-processing warp & chromatic aberration effect on screen
    if (this.warpActive && this.warpAnimProgress > 0) {
      this.drawWarpOverlay(ctx, viewportWidth, viewportHeight, this.warpAnimProgress, isPast);
    }
  }

  // =========================================================================
  // STAGE BACKGROUND & ARCHITECTURE
  // =========================================================================

  private drawArchitecture(
    ctx: CanvasRenderingContext2D,
    stageWidth: number,
    stageNum: number,
    isPast: boolean,
    puzzles: PuzzleState
  ) {
    // Stage 4: Memory of Light projection onto wall at x = 428
    if (stageNum === 4 && puzzles.lightSwitchOn) {
      ctx.save();
      const targetX = 428;
      const targetY = 395;
      if (isPast) {
        const lightGrad = ctx.createRadialGradient(targetX, targetY, 5, targetX, targetY, 68);
        lightGrad.addColorStop(0, 'rgba(255, 234, 167, 0.9)');
        lightGrad.addColorStop(0.5, 'rgba(253, 203, 110, 0.45)');
        lightGrad.addColorStop(1, 'rgba(253, 203, 110, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 68, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const runeGrad = ctx.createRadialGradient(targetX, targetY, 5, targetX, targetY, 52);
        runeGrad.addColorStop(0, 'rgba(0, 206, 201, 0.78)');
        runeGrad.addColorStop(0.6, 'rgba(129, 236, 236, 0.3)');
        runeGrad.addColorStop(1, 'rgba(129, 236, 236, 0)');
        ctx.fillStyle = runeGrad;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 52, 0, Math.PI * 2);
        ctx.fill();
      }

      // Musical notes E - G - C etched in light
      ctx.fillStyle = isPast ? '#fff3bf' : '#81ecec';
      ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isPast ? '☾  ★  ☀' : '☾ Mi · ☀ Đô · ★ Sol', targetX, targetY - 12);
      ctx.restore();
    }
  }

  private drawInteractables(
    ctx: CanvasRenderingContext2D,
    interactables: InteractableObject[],
    isPast: boolean,
    puzzles: PuzzleState,
    nearbyId: string | null
  ) {
    for (const obj of interactables) {
      ctx.save();
      const glow = ctx.createRadialGradient(obj.x + obj.width / 2, obj.y + obj.height / 2, 2, obj.x + obj.width / 2, obj.y + obj.height / 2, obj.id === 'clock' ? 115 : 40);
      glow.addColorStop(0, obj.bakedIntoMap||obj.id!==nearbyId ? '#00000000' : isPast ? '#f3ca6b26' : '#a8d8b922');
      glow.addColorStop(1, '#a8d8b900');
      ctx.fillStyle = glow; ctx.fillRect(obj.x - 115, obj.y - 115, obj.width + 230, obj.height + 230);
      if(obj.type==='room_door'&&puzzles.currentStage===2&&obj.x<800){
        ctx.font='bold 7px "Be Vietnam Pro", sans-serif';ctx.textAlign='center';
        const width=ctx.measureText(obj.nameVi).width+10,cx=obj.x+obj.width/2;
        ctx.fillStyle=isPast?'#513a22':'#243528';ctx.fillRect(cx-width/2,obj.y-20,width,12);
        ctx.strokeStyle='#a5894c';ctx.lineWidth=.5;ctx.strokeRect(cx-width/2,obj.y-20,width,12);
        ctx.fillStyle='#e3cd96';ctx.fillText(obj.nameVi,cx,obj.y-12);
      }
      if(this.pixel.object(ctx,obj,isPast,puzzles,this.animTick)) {

        ctx.restore();continue;
      }
      switch (obj.id) {
        case 'clock':
          this.drawGrandfatherClock(ctx, obj.x, obj.y, obj.width, obj.height, isPast, puzzles);
          break;
        case 'clock_gear':
          if (!puzzles.clockGearFound) {
            this.drawClockGear(ctx, obj.x, obj.y, obj.width, obj.height);
          }
          break;
        case 'fireplace':
          this.drawFireplace(ctx, obj.x, obj.y, obj.width, obj.height, isPast);
          break;
        case 'family_portrait':
          this.drawFamilyPortrait(ctx, obj.x, obj.y, obj.width, obj.height, isPast);
          break;
        case 'hallway_pulley':
          this.drawHallwayPulley(ctx, obj.x, obj.y, obj.width, obj.height, puzzles.hallwayPassageCleared);
          break;
        case 'light_switch':
          this.drawLightSwitch(ctx, obj.x, obj.y, obj.width, obj.height, isPast, puzzles);
          break;
        case 'light_target':
          break;
        case 'mother_note_ch4':
          this.drawBookshelf(ctx, obj.x, obj.y, obj.width, obj.height, isPast);
          break;
        case 'music_box':
          this.drawMusicBox(ctx, obj.x, obj.y, obj.width, obj.height, isPast, puzzles);
          break;
        case 'stage_exit_1':
          this.drawStageExitDoor(
            ctx,
            obj.x,
            obj.y,
            obj.width,
            obj.height,
            isPast,
            puzzles.hasWatch && puzzles.testedTimelineSwitch,
            'MÀN 2'
          );
          break;
        case 'stage_exit_2':
          this.drawStageExitDoor(
            ctx,
            obj.x,
            obj.y,
            obj.width,
            obj.height,
            isPast,
            puzzles.clockInspectedPresent,
            'MÀN 3'
          );
          break;
        case 'stage_exit_3':
          this.drawStageExitDoor(
            ctx,
            obj.x,
            obj.y,
            obj.width,
            obj.height,
            isPast,
            puzzles.hallwayPassageCleared && puzzles.motherDiaryCh3Read,
            'MÀN 4'
          );
          break;
        case 'final_door':
          this.drawStageExitDoor(
            ctx,
            obj.x,
            obj.y,
            obj.width,
            obj.height,
            isPast,
            puzzles.musicBoxPlayed && !isPast,
            'MÀN 5'
          );
          break;
        case 'stage_exit_5':
          this.drawStageExitDoor(ctx, obj.x, obj.y, obj.width, obj.height, isPast, true, 'MÀN 6');
          break;
        case 'temporal_anchor':
          this.drawTemporalAnchor(ctx, obj.x, obj.y, obj.width, obj.height, isPast, puzzles.finalCoreAligned);
          break;
        case 'final_core':
          this.drawSanctuaryAltar(ctx, obj.x, obj.y, obj.width, obj.height, isPast);
          break;
        case 'entrance_journal':
        case 'mother_note_ch1':
        case 'mother_diary_ch3':
        case 'final_diary_ch6':
          this.drawNoteObject(ctx, obj.x, obj.y, isPast);
          break;
      }


      ctx.restore();
    }
  }

  private drawStageExitDoor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean,
    isUnlocked: boolean,
    targetLabel: string
  ) {
    ctx.save();
    const cx=x+w/2;
    // Stone arch surrounding a timber door; its frame sits outside the collision box.
    ctx.fillStyle='#16271f';ctx.strokeStyle='#6c7960';ctx.lineWidth=7;
    ctx.beginPath();ctx.moveTo(x-5,y+h);ctx.lineTo(x-5,y+22);
    ctx.quadraticCurveTo(cx,y-20,x+w+5,y+22);ctx.lineTo(x+w+5,y+h);ctx.closePath();
    ctx.fill();ctx.stroke();
    ctx.save();ctx.beginPath();ctx.moveTo(x+2,y+h);ctx.lineTo(x+2,y+23);
    ctx.quadraticCurveTo(cx,y-8,x+w-2,y+23);ctx.lineTo(x+w-2,y+h);ctx.closePath();ctx.clip();
    const wood=ctx.createLinearGradient(x,y,x+w,y);
    wood.addColorStop(0,'#263727');wood.addColorStop(.5,isPast?'#695634':'#40533b');wood.addColorStop(1,'#15291f');
    ctx.fillStyle=wood;ctx.fillRect(x,y,w,h);
    ctx.strokeStyle='#0e211c';ctx.lineWidth=1;
    for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(x+i*w/5,y);ctx.lineTo(x+i*w/5,y+h);ctx.stroke();}
    ctx.fillStyle='#a99d69';ctx.fillRect(x,y+38,w,3);ctx.fillRect(x,y+h-16,w,3);
    if(isUnlocked){
      ctx.shadowColor='#f2d899';ctx.shadowBlur=16;ctx.fillStyle='#f2d899';ctx.fillRect(cx-1,y+12,2,h-12);
    }
    ctx.restore();
    ctx.fillStyle=isUnlocked?'#ffe3a4':'#b3a575';ctx.beginPath();ctx.arc(x+w-10,y+h*.62,2.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#a0b184';
    for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(x-4+i*3,y+15-i*2,4,2,-.6,0,Math.PI*2);ctx.fill();}
    if(isUnlocked){ctx.font='9px Georgia,serif';ctx.textAlign='center';ctx.fillStyle='#e9dcc0';ctx.fillText(targetLabel.replace('MÀN','CHƯƠNG'),cx,y-20);}
    ctx.restore();
  }

  // =========================================================================
  // IN-WORLD MEMORY ECHO NPCs (KÝ ỨC CỦA MẸ & BÉ LINH)
  // =========================================================================

  private drawMemoryNPCs(ctx:CanvasRenderingContext2D,npcs:MemoryNPC[],nearbyId:string|null){
    for(const npc of npcs){
      ctx.save();ctx.globalAlpha=.8+Math.sin(this.animTick*2)*.08;
      const key=npc.character==='LINH'?`linhIdle${Math.floor(this.animTick*3)%4}`:npc.character==='ONG'?'npc6':'npc3';
      const h=npc.height;
      ctx.shadowBlur=10;ctx.shadowColor=npc.character==='LINH'?'#72d6cf':'#dab56c';
      this.pixel.feet(ctx,key,npc.x+npc.width/2,npc.y+npc.height,h);
      ctx.shadowBlur=0;
      ctx.restore();
    }
  }

  private drawClockGear(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    const cx = x + w / 2;
    const cy = y + h / 2 + Math.sin(this.animTick * 4) * 2;
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + this.animTick;
      ctx.fillRect(cx + Math.cos(a) * 10 - 2, cy + Math.sin(a) * 10 - 2, 4, 4);
    }
  }

  private drawHallwayPulley(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isActivated: boolean
  ) {
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(x + 4, y, w - 8, h);
    ctx.strokeStyle = isActivated ? '#00b894' : '#f39c12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 14, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 28);
    ctx.lineTo(isActivated ? x + w + 6 : x - 6, isActivated ? y + 18 : y + 38);
    ctx.stroke();
  }

  private drawTemporalAnchor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean,
    isAligned: boolean
  ) {
    ctx.fillStyle = isPast ? '#5c3d2e' : '#2c3e50';
    ctx.fillRect(x + 6, y, w - 12, h);
    ctx.fillStyle = isAligned ? '#00cec9' : (isPast ? '#f1c40f' : '#636e72');
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 18, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawGrandfatherClock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean,
    puzzles: PuzzleState
  ) {
    ctx.save();
    ctx.translate(x+w/2,y+h);ctx.scale(1.12,1.12);ctx.translate(-x-w/2,-y-h);
    const aura=ctx.createRadialGradient(x+w/2,y+25,5,x+w/2,y+25,90);
    aura.addColorStop(0,'#f6cb7655');aura.addColorStop(1,'#f6cb7600');ctx.fillStyle=aura;ctx.fillRect(x-80,y-70,w+160,h+140);
    ctx.fillStyle='#776347';ctx.strokeStyle='#c9b180';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x-5,y+10);ctx.quadraticCurveTo(x+w/2,y-24,x+w+5,y+10);ctx.lineTo(x+w+5,y+17);ctx.lineTo(x-5,y+17);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle = isPast ? '#452614' : '#221915';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = isPast ? '#633d26' : '#2d221c';
    ctx.fillRect(x - 3, y, w + 6, 8);
    ctx.fillRect(x - 1, y - 4, w + 2, 4);

    // Clock Face
    ctx.fillStyle = isPast ? '#f5eedb' : '#a89f91';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 24, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isPast ? '#d4af37' : '#574d42';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Clock hands
    ctx.strokeStyle = '#1e272e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 24);
    if (puzzles.clockRepaired) {
      const angle = this.animTick * 2.5;
      ctx.lineTo(x + w / 2 + Math.cos(angle) * 10, y + 24 + Math.sin(angle) * 10);
    } else {
      ctx.lineTo(x + w / 2 + 9, y + 24);
      ctx.moveTo(x + w / 2, y + 24);
      ctx.lineTo(x + w / 2 + 5, y + 24 + 6);
    }
    ctx.stroke();

    // Pendulum chamber
    ctx.fillStyle = isPast ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.6)';
    ctx.fillRect(x + 8, y + 46, w - 16, 42);

    const isTicking = puzzles.clockRepaired;
    const swingAngle = isTicking ? Math.sin(this.animTick * 4) * 0.28 : 0.2;
    const pendLen = 30;
    const bobX = x + w / 2 + Math.sin(swingAngle) * pendLen;
    const bobY = y + 48 + Math.cos(swingAngle) * pendLen;

    ctx.strokeStyle = isPast ? '#d4af37' : '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 48);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    ctx.fillStyle = isPast ? '#f1c40f' : '#95a5a6';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle='#a88e5b';ctx.lineWidth=1;
    ctx.strokeRect(x+3,y+3,w-6,h-6);
    ctx.fillStyle='#a88e5b';ctx.fillRect(x-4,y+h-4,w+8,5);
    ctx.restore();
  }

  private drawFireplace(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean
  ) {
    ctx.fillStyle = isPast ? '#633d26' : '#2d3436';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#111111';
    ctx.fillRect(x + 8, y + 16, w - 16, h - 16);

    if (isPast) {
      const flicker = Math.sin(this.animTick * 12) * 3;
      ctx.fillStyle = '#e17055';
      ctx.beginPath();
      ctx.moveTo(x + 12, y + h);
      ctx.lineTo(x + w / 2, y + 24 + flicker);
      ctx.lineTo(x + w - 12, y + h);
      ctx.fill();

      ctx.fillStyle = '#fdcb6e';
      ctx.beginPath();
      ctx.moveTo(x + 16, y + h);
      ctx.lineTo(x + w / 2, y + 32 + flicker * 0.8);
      ctx.lineTo(x + w - 16, y + h);
      ctx.fill();
    } else {
      ctx.fillStyle = '#636e72';
      ctx.fillRect(x + 14, y + h - 6, w - 28, 4);
    }
  }

  private drawFamilyPortrait(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean
  ) {
    ctx.fillStyle = isPast ? '#d4af37' : '#4b4b4b';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = isPast ? '#ffeaa7' : '#636e72';
    ctx.fillRect(x + 3, y + 3, w - 6, h - 6);

    if (isPast) {
      ctx.fillStyle = '#8e2727';
      ctx.fillRect(x + 6, y + 14, 8, 16);
      ctx.fillStyle = '#d35400';
      ctx.fillRect(x + 16, y + 17, 7, 13);
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(x + 25, y + 20, 6, 10);
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 5);
      ctx.lineTo(x + w - 8, y + h - 10);
      ctx.stroke();
    }
  }

  private drawLightSwitch(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean,
    puzzles: PuzzleState
  ) {
    ctx.fillStyle = isPast ? '#b7791f' : '#2d3748';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = isPast && puzzles.lightSwitchOn ? '#fdcb6e' : '#1a202c';
    const leverY = isPast && puzzles.lightSwitchOn ? y + 8 : y + h - 16;
    ctx.fillRect(x + 8, leverY, w - 16, 8);
  }

  private drawBookshelf(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean
  ) {
    ctx.fillStyle = isPast ? '#5c3d2e' : '#222f3e';
    ctx.fillRect(x, y, w, h);
    const bookColors = isPast
      ? ['#d63031', '#0984e3', '#00b894', '#fdcb6e']
      : ['#353b48', '#2f3542', '#1e272e', '#2c3e50'];

    for (let shelf = 0; shelf < 3; shelf++) {
      const sy = y + 12 + shelf * 22;
      ctx.fillStyle = isPast ? '#3d2518' : '#14181f';
      ctx.fillRect(x + 3, sy + 18, w - 6, 3);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = bookColors[i % bookColors.length];
        ctx.fillRect(x + 6 + i * 7, sy + 4, 5, 14);
      }
    }
  }

  private drawMusicBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean,
    puzzles: PuzzleState
  ) {
    ctx.fillStyle = isPast ? '#835334' : '#2f3542';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = isPast ? '#f1c40f' : '#57606f';
    ctx.fillRect(x, y, 4, 4);
    ctx.fillRect(x + w - 4, y, 4, 4);

    if (puzzles.musicBoxPlayed && isPast) {
      const noteY = y - 10 - Math.sin(this.animTick * 4) * 8;
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(x + 12, noteY, 4, 4);
    }
  }

  private drawSanctuaryAltar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean
  ) {
    ctx.fillStyle = isPast ? '#633d26' : '#2d3436';
    ctx.fillRect(x, y, w, h);

    const sphereY = y - 18;
    const sphereGrad = ctx.createRadialGradient(x + w / 2, sphereY, 2, x + w / 2, sphereY, 24);
    sphereGrad.addColorStop(0, '#ffffff');
    sphereGrad.addColorStop(0.4, isPast ? '#fdcb6e' : '#00cec9');
    sphereGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(x + w / 2, sphereY, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isPast ? '#f1c40f' : '#81ecec';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, sphereY, 16, 6, this.animTick * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawNoteObject(ctx: CanvasRenderingContext2D, x: number, y: number, isPast: boolean) {
    ctx.save();ctx.translate(x+9,y+10);ctx.rotate(-.12);
    ctx.shadowColor='#efd49c';ctx.shadowBlur=8+Math.sin(this.animTick*2)*3;
    ctx.fillStyle=isPast?'#eadab2':'#c3c5a0';ctx.strokeStyle='#635f40';ctx.lineWidth=.8;
    ctx.beginPath();ctx.moveTo(-9,-12);ctx.lineTo(6,-12);ctx.lineTo(10,-7);ctx.lineTo(10,13);ctx.lineTo(-9,13);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#898a63';ctx.beginPath();ctx.moveTo(6,-12);ctx.lineTo(6,-7);ctx.lineTo(10,-7);ctx.fill();
    ctx.strokeStyle='#77785b';ctx.lineWidth=.7;
    for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-5,-5+i*4);ctx.lineTo(5-(i%2)*3,-5+i*4);ctx.stroke();}
    ctx.restore();
  }

  private drawInteractPromptBadge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isPast: boolean
  ) {
    const bob = Math.sin(this.animTick * 6) * 3;
    const py = y + bob;

    ctx.save();
    ctx.fillStyle = '#d5c18b';
    ctx.beginPath();
    ctx.roundRect(x - 14, py - 12, 28, 20, 5);
    ctx.fill();
    ctx.strokeStyle = '#f0e1b2';
    ctx.lineWidth = .8;
    ctx.stroke();

    ctx.fillStyle = '#193225';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', x, py - 2);
    ctx.restore();
  }

  // =========================================================================
  // KẺ LẠC GIỜ (THE TIME-LOST ENTITY)
  // =========================================================================

  private drawPursuer(ctx:CanvasRenderingContext2D,pursuer:PursuerEntity,timeline:Timeline){
    ctx.save();ctx.globalAlpha=pursuer.phase&&pursuer.phase!==timeline?.28:pursuer.omenActive?.6:.95;ctx.shadowColor=pursuer.exposed?'#ffe2a0':'#65bea0';ctx.shadowBlur=pursuer.exposed?28:14;
    const key=pursuer.stagger?`lostAction${3+Math.floor(this.animTick*5)%3}`:pursuer.omenActive?`lostAction${Math.floor(this.animTick*5)%6}`:`lost${Math.floor(this.animTick*8)%9}`;
    this.pixel.feet(ctx,key,pursuer.x+pursuer.width/2,pursuer.y+pursuer.height+Math.sin(this.animTick*4)*3,PURSUER_ART_HEIGHT);
    ctx.restore();
  }

  private drawChaseDangerVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    const pulse = 0.22 + Math.sin(this.animTick * 8) * 0.08;
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.25,
      width / 2,
      height / 2,
      width * 0.65
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(180, 20, 40, ${pulse})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // =========================================================================
  // EXPRESSIVE 2D CHARACTER DESIGN FOR AN & FLOATING SPEECH BUBBLE
  // =========================================================================

  private drawPlayer(ctx:CanvasRenderingContext2D,player:Player,_hasWatch:boolean){
    this.character.draw(ctx,player,this.animTick);
  }

  private drawAtmosphere(ctx: CanvasRenderingContext2D, stageNum: number, isPast: boolean) {
    ctx.save();
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.sin((p.life / p.maxLife) * Math.PI) * (isPast ? 0.7 : 0.45);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    if (!isPast && stageNum === 1) {
      ctx.strokeStyle = 'rgba(164, 190, 176, 0.17)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const r of this.rainDrops) {
        if (r.x < 380) {
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - 2, r.y + r.len);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawWarpOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number,
    isPast: boolean
  ) {
    ctx.save();
    const alpha = Math.sin(progress * Math.PI) * 0.85;
    const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.7);
    if (isPast) {
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.4, `rgba(253, 203, 110, ${alpha * 0.7})`);
      grad.addColorStop(1, `rgba(225, 112, 85, 0)`);
    } else {
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.4, `rgba(129, 236, 236, ${alpha * 0.7})`);
      grad.addColorStop(1, `rgba(9, 132, 227, 0)`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = isPast ? 'rgba(255, 234, 167, 0.15)' : 'rgba(0, 206, 201, 0.15)';
    for (let y = 0; y < height; y += 8) {
      ctx.fillRect(0, y, width, 3);
    }
    ctx.restore();
  }
}
