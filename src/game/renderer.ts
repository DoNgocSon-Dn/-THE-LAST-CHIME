import {
  Player,
  Timeline,
  Platform,
  InteractableObject,
  PuzzleState,
  PursuerEntity,
  MemoryNPC
} from '../types/game';
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
  private particles: Particle[] = [];
  private rainDrops: { x: number; y: number; speed: number; len: number }[] = [];
  private warpAnimProgress: number = 0; // 0 to 1 during transition
  private warpActive: boolean = false;
  private animTick: number = 0;

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

  public triggerWarp() {
    this.warpActive = true;
    this.warpAnimProgress = 1.0;
  }

  public update(dt: number, timeline: Timeline) {
    this.animTick += dt;

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
    ctx.imageSmoothingEnabled = true;

    ctx.translate(-Math.floor(cameraX), 0);

    const isPast = timeline === 'PAST';
    const stageCfg = getStageConfig(puzzles.currentStage || 1);

    // 1. Draw stage-specific atmospheric background & windows
    this.drawBackground(ctx, cameraX, viewportWidth, stageCfg.width, stageCfg.stage, isPast);

    // 2. Draw stage architecture & light puzzle projections
    this.drawArchitecture(ctx, stageCfg.width, stageCfg.stage, isPast, puzzles);

    // 3. Draw platforms, doors & timeline barriers
    this.drawPlatforms(ctx, platforms, isPast);

    // 4. Draw interactive furniture, stage exit doors & puzzle objects
    this.drawInteractables(ctx, interactables, isPast, puzzles, nearbyInteractableId);

    // 5. Draw In-World Memory Echo NPCs (Mẹ & Bé Linh)
    const activeNPCs = stageCfg.memoryNPCs.filter(
      npc => npc.timeline === 'both' || npc.timeline === timeline
    );
    this.drawMemoryNPCs(ctx, activeNPCs, nearbyInteractableId);

    // 6. Draw Pursuer (Kẻ Lạc Giờ) if active or during Chapter 3 omen
    if (pursuer && (pursuer.active || pursuer.omenActive)) {
      this.drawPursuer(ctx, pursuer);
    }

    // 7. Draw player character (An) with expressive character design & overhead speech bubble
    this.drawPlayer(ctx, player, puzzles.hasWatch);

    // 8. Draw foreground atmosphere, dust particles & rain
    this.drawAtmosphere(ctx, stageCfg.stage, isPast);

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

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    viewportWidth: number,
    stageWidth: number,
    stageNum: number,
    isPast: boolean
  ) {
    const startX = Math.max(0, cameraX - 50);
    const endX = Math.min(stageWidth, cameraX + viewportWidth + 50);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, 500);
    if (isPast) {
      bgGrad.addColorStop(0, '#2d1810');
      bgGrad.addColorStop(0.5, '#4a2818');
      bgGrad.addColorStop(1, '#3b1d12');
    } else {
      bgGrad.addColorStop(0, '#0f171e');
      bgGrad.addColorStop(0.5, '#16222f');
      bgGrad.addColorStop(1, '#111a24');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(startX, 0, endX - startX, 480);

    // Wallpaper damask vertical stripes
    ctx.fillStyle = isPast ? 'rgba(92, 45, 26, 0.25)' : 'rgba(30, 48, 64, 0.25)';
    for (let x = Math.floor(startX / 36) * 36; x < endX; x += 36) {
      ctx.fillRect(x, 40, 18, 440);
    }

    // Stage-specific windows
    if (stageNum === 1) {
      this.drawWindow(ctx, 110, 80, 80, 140, isPast);
      this.drawWindow(ctx, 560, 75, 85, 145, isPast);
      this.drawWindow(ctx, 840, 75, 85, 145, isPast);
    } else if (stageNum === 2) {
      this.drawWindow(ctx, 150, 70, 90, 150, isPast);
      this.drawWindow(ctx, 490, 70, 90, 150, isPast);
    } else if (stageNum === 3) {
      this.drawWindow(ctx, 160, 65, 80, 155, isPast);
      this.drawWindow(ctx, 520, 65, 80, 155, isPast);
      this.drawWindow(ctx, 900, 65, 80, 155, isPast);
    } else if (stageNum === 4) {
      this.drawWindow(ctx, 300, 70, 90, 150, isPast);
      this.drawWindow(ctx, 680, 70, 90, 150, isPast);
    } else if (stageNum === 5) {
      this.drawWindow(ctx, 250, 70, 85, 145, isPast);
      this.drawWindow(ctx, 560, 70, 85, 145, isPast);
      this.drawWindow(ctx, 860, 70, 85, 145, isPast);
      this.drawWindow(ctx, 1180, 70, 85, 145, isPast);
    } else if (stageNum === 6) {
      this.drawRoseWindow(ctx, 420, 145, 68, isPast);
      this.drawRoseWindow(ctx, 860, 145, 78, isPast);
    }
  }

  private drawWindow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean
  ) {
    ctx.save();
    const skyGrad = ctx.createLinearGradient(x, y, x, y + h);
    if (isPast) {
      skyGrad.addColorStop(0, '#ff7675');
      skyGrad.addColorStop(0.5, '#fdcb6e');
      skyGrad.addColorStop(1, '#ffeaa7');
    } else {
      skyGrad.addColorStop(0, '#090a0f');
      skyGrad.addColorStop(0.5, '#1e272e');
      skyGrad.addColorStop(1, '#2f3542');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = isPast ? '#5c3d2e' : '#222f3e';
    ctx.lineWidth = 5;
    ctx.strokeRect(x, y, w, h);

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.stroke();

    if (isPast) {
      ctx.fillStyle = '#8e2727';
      ctx.fillRect(x - 8, y, 12, h + 10);
      ctx.fillRect(x + w - 4, y, 12, h + 10);
    } else {
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(x - 6, y, 10, h * 0.7);
    }
    ctx.restore();
  }

  private drawRoseWindow(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    isPast: boolean
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = isPast ? '#e17055' : '#192a56';
    ctx.fill();
    ctx.strokeStyle = isPast ? '#d63031' : '#273c75';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = isPast ? '#fdcb6e' : '#40739e';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawArchitecture(
    ctx: CanvasRenderingContext2D,
    stageWidth: number,
    stageNum: number,
    isPast: boolean,
    puzzles: PuzzleState
  ) {
    // Crown molding & wainscoting across current stage
    ctx.fillStyle = isPast ? '#523424' : '#1c2833';
    ctx.fillRect(0, 30, stageWidth, 10);
    ctx.fillRect(0, 460, stageWidth, 20);

    // Stage 1 porch pillar at x = 380
    if (stageNum === 1) {
      this.drawDoorwayArch(ctx, 370, 200, 36, 280, isPast);
    }

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
      ctx.fillText('♪ Mi - Sol - Đô ♪', targetX, targetY - 12);
      ctx.restore();
    }
  }

  private drawDoorwayArch(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isPast: boolean
  ) {
    ctx.save();
    ctx.fillStyle = isPast ? '#633d26' : '#273444';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = isPast ? '#835334' : '#34495e';
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    ctx.restore();
  }

  // =========================================================================
  // PLATFORMS, DOORS & TIMELINE BARRIERS
  // =========================================================================

  private drawPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[], isPast: boolean) {
    for (const plat of platforms) {
      ctx.save();
      if (plat.id.startsWith('ground')) {
        const floorGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        if (isPast) {
          floorGrad.addColorStop(0, '#59341f');
          floorGrad.addColorStop(0.15, '#75472b');
          floorGrad.addColorStop(1, '#3b2112');
        } else {
          floorGrad.addColorStop(0, '#242b35');
          floorGrad.addColorStop(0.15, '#353e4b');
          floorGrad.addColorStop(1, '#181e26');
        }
        ctx.fillStyle = floorGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        ctx.strokeStyle = isPast ? '#452614' : '#14181f';
        ctx.lineWidth = 1;
        for (let bx = plat.x; bx < plat.x + plat.width; bx += 40) {
          ctx.beginPath();
          ctx.moveTo(bx, plat.y);
          ctx.lineTo(bx, plat.y + 16);
          ctx.stroke();
        }
        ctx.fillStyle = isPast ? '#945c38' : '#495666';
        ctx.fillRect(plat.x, plat.y, plat.width, 2);
      } else if (plat.id === 'living_hallway_door' || plat.id === 'final_door_barrier') {
        ctx.fillStyle = isPast ? '#4a2511' : '#1e272e';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#d63031';
        ctx.fillRect(plat.x + 4, plat.y + plat.height / 2 - 12, plat.width - 8, 24);
      } else if (plat.id === 'hallway_debris_pres' || plat.id === 'chase_wall_present') {
        ctx.fillStyle = '#2f3640';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#00cec9';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x + 2, plat.y + 2, plat.width - 4, plat.height - 4);
        ctx.fillStyle = '#81ecec';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText('Q', plat.x + 9, plat.y + plat.height / 2);
      } else if (plat.id === 'hallway_grate_past' || plat.id === 'chase_barricade_past') {
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#fdcb6e';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x + 2, plat.y + 2, plat.width - 4, plat.height - 4);
      } else if (plat.type === 'one-way') {
        ctx.fillStyle = isPast ? '#835334' : '#3d4b5c';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = isPast ? '#a56c44' : '#55667d';
        ctx.fillRect(plat.x, plat.y, plat.width, 3);
      } else if (plat.id.includes('stairs')) {
        ctx.fillStyle = isPast ? '#75472b' : '#333f4d';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = isPast ? '#945c38' : '#4b596b';
        ctx.fillRect(plat.x, plat.y, plat.width, 3);
      } else if (plat.id.includes('crate')) {
        ctx.fillStyle = '#4b382a';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#271d15';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      } else {
        ctx.fillStyle = isPast ? '#633d26' : '#273444';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      }
      ctx.restore();
    }
  }

  // =========================================================================
  // INTERACTABLE FURNITURE, STAGE DOORS & PUZZLE ASSETS
  // =========================================================================

  private drawInteractables(
    ctx: CanvasRenderingContext2D,
    interactables: InteractableObject[],
    isPast: boolean,
    puzzles: PuzzleState,
    nearbyId: string | null
  ) {
    for (const obj of interactables) {
      ctx.save();
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

      if (obj.id === nearbyId) {
        this.drawInteractPromptBadge(ctx, obj.x + obj.width / 2, obj.y - 16, isPast);
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
    // Outer frame
    ctx.fillStyle = isPast ? '#452614' : '#1e272e';
    ctx.fillRect(x - 4, y - 4, w + 8, h + 4);

    // Inner portal / door panel
    if (isUnlocked) {
      const portalGrad = ctx.createLinearGradient(x, y, x, y + h);
      portalGrad.addColorStop(0, isPast ? '#fdcb6e' : '#00cec9');
      portalGrad.addColorStop(1, isPast ? '#d35400' : '#0984e3');
      ctx.fillStyle = portalGrad;
      ctx.fillRect(x + 2, y + 2, w - 4, h - 2);

      // Overhead stage badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(x - 8, y - 24, w + 16, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`➔ ${targetLabel}`, x + w / 2, y - 13);
    } else {
      ctx.fillStyle = isPast ? '#5c3d2e' : '#2f3542';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 2);
      // Lock emblem
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // =========================================================================
  // IN-WORLD MEMORY ECHO NPCs (KÝ ỨC CỦA MẸ & BÉ LINH)
  // =========================================================================

  private drawMemoryNPCs(
    ctx: CanvasRenderingContext2D,
    npcs: MemoryNPC[],
    nearbyId: string | null
  ) {
    for (const npc of npcs) {
      ctx.save();
      const floatY = Math.sin(this.animTick * 3.2) * 3;
      const nx = Math.floor(npc.x);
      const ny = Math.floor(npc.y + floatY);
      const isMother = npc.character === 'ME';

      // Soft memory aura
      const auraGrad = ctx.createRadialGradient(
        nx + npc.width / 2,
        ny + npc.height / 2,
        4,
        nx + npc.width / 2,
        ny + npc.height / 2,
        42
      );
      if (isMother) {
        auraGrad.addColorStop(0, 'rgba(253, 203, 110, 0.55)');
        auraGrad.addColorStop(1, 'rgba(253, 203, 110, 0)');
      } else {
        auraGrad.addColorStop(0, 'rgba(129, 236, 236, 0.55)');
        auraGrad.addColorStop(1, 'rgba(129, 236, 236, 0)');
      }
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(nx + npc.width / 2, ny + npc.height / 2, 42, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.85 + Math.sin(this.animTick * 4) * 0.1;

      if (isMother) {
        // Mother's dress & clockmaker apron
        ctx.fillStyle = '#8d4925';
        ctx.beginPath();
        ctx.roundRect(nx + 3, ny + 18, 20, 36, 4);
        ctx.fill();
        ctx.fillStyle = '#f5eedb';
        ctx.fillRect(nx + 6, ny + 22, 14, 24);

        // Head & gentle bun hair
        ctx.fillStyle = '#f7d794';
        ctx.beginPath();
        ctx.arc(nx + 13, ny + 11, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3d2518';
        ctx.beginPath();
        ctx.arc(nx + 13, ny + 8, 7.5, Math.PI, Math.PI * 2);
        ctx.arc(nx + 7, ny + 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Spectacles
        ctx.strokeStyle = '#fdcb6e';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(nx + 11, ny + 9, 4, 3);
        ctx.strokeRect(nx + 16, ny + 9, 4, 3);
      } else {
        // Little Sister Linh: sky-blue dress & cyan ribbon
        ctx.fillStyle = '#0984e3';
        ctx.beginPath();
        ctx.roundRect(nx + 3, ny + 16, 16, 28, 4);
        ctx.fill();
        ctx.fillStyle = '#dff9fb';
        ctx.fillRect(nx + 5, ny + 18, 12, 8);

        // Head & twin tails
        ctx.fillStyle = '#f7d794';
        ctx.beginPath();
        ctx.arc(nx + 11, ny + 10, 6.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2d1e18';
        ctx.beginPath();
        ctx.arc(nx + 11, ny + 8, 7, Math.PI, Math.PI * 2);
        ctx.fill();
        // Cyan hair ribbon
        ctx.fillStyle = '#00cec9';
        ctx.fillRect(nx + 4, ny + 4, 5, 3);
      }

      ctx.globalAlpha = 1.0;

      // Ambient whisper bubble above NPC when player isn't right on top
      if (nearbyId !== npc.id) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.strokeStyle = isMother ? 'rgba(251, 191, 36, 0.6)' : 'rgba(34, 211, 238, 0.6)';
        ctx.lineWidth = 1;
        ctx.font = 'italic 10px "Be Vietnam Pro", sans-serif';
        const textWidth = Math.min(200, ctx.measureText(npc.ambientQuoteVi).width + 14);
        ctx.beginPath();
        ctx.roundRect(nx + npc.width / 2 - textWidth / 2, ny - 26, textWidth, 18, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isMother ? '#fde68a' : '#a5f3fc';
        ctx.textAlign = 'center';
        ctx.fillText(npc.ambientQuoteVi, nx + npc.width / 2, ny - 14);
      }

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

    if (!puzzles.hasWatch) {
      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
    }
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
    ctx.fillStyle = isPast ? '#f5eedb' : '#a4b0be';
    ctx.fillRect(x, y, 14, 18);
    ctx.fillStyle = isPast ? '#d4af37' : '#747d8c';
    ctx.fillRect(x + 2, y + 3, 10, 2);
    ctx.fillRect(x + 2, y + 7, 10, 2);
    ctx.fillRect(x + 2, y + 11, 7, 2);
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
    ctx.fillStyle = isPast ? '#f39c12' : '#0984e3';
    ctx.beginPath();
    ctx.roundRect(x - 14, py - 12, 28, 20, 5);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', x, py - 2);
    ctx.restore();
  }

  // =========================================================================
  // KẺ LẠC GIỜ (THE TIME-LOST ENTITY)
  // =========================================================================

  private drawPursuer(ctx: CanvasRenderingContext2D, pursuer: PursuerEntity) {
    ctx.save();
    const hover = Math.sin(this.animTick * 7) * 5;
    const gx = Math.floor(pursuer.x);
    const gy = Math.floor(pursuer.y + hover);

    const aura = ctx.createRadialGradient(
      gx + pursuer.width / 2,
      gy + pursuer.height / 2,
      4,
      gx + pursuer.width / 2,
      gy + pursuer.height / 2,
      54
    );
    aura.addColorStop(0, 'rgba(108, 92, 231, 0.8)');
    aura.addColorStop(0.5, 'rgba(0, 206, 201, 0.4)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(gx + pursuer.width / 2, gy + pursuer.height / 2, 54, 0, Math.PI * 2);
    ctx.fill();

    // Tattered cloak silhouette
    ctx.fillStyle = '#0b0c10';
    ctx.beginPath();
    ctx.roundRect(gx + 3, gy + 12, 24, 35, 6);
    ctx.fill();

    // Head silhouette
    ctx.beginPath();
    ctx.arc(gx + 15, gy + 7, 8, 0, Math.PI * 2);
    ctx.fill();

    // Glowing cyan eyes
    ctx.fillStyle = '#81ecec';
    ctx.fillRect(gx + 12, gy + 5, 3, 3);
    ctx.fillRect(gx + 18, gy + 5, 3, 3);

    // Floating broken clock hands orbiting the entity
    ctx.strokeStyle = '#fdcb6e';
    ctx.lineWidth = 2;
    const handAngle = this.animTick * 6;
    ctx.beginPath();
    ctx.moveTo(gx + 15, gy + 24);
    ctx.lineTo(gx + 15 + Math.cos(handAngle) * 18, gy + 24 + Math.sin(handAngle) * 18);
    ctx.moveTo(gx + 15, gy + 24);
    ctx.lineTo(gx + 15 + Math.cos(-handAngle * 0.7) * 14, gy + 24 + Math.sin(-handAngle * 0.7) * 14);
    ctx.stroke();

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

  private drawPlayer(ctx: CanvasRenderingContext2D, player: Player, hasWatch: boolean) {
    ctx.save();
    const px = Math.floor(player.x);
    const py = Math.floor(player.y);
    const facingRight = player.facing === 'right';

    // Subtle ground shadow beneath An
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(px + player.width / 2, py + player.height + 1, 11, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    let scaleX = 1;
    let scaleY = 1;
    if (player.state === 'jump') {
      scaleX = 0.92;
      scaleY = 1.08;
    } else if (player.state === 'fall') {
      scaleX = 0.96;
      scaleY = 1.04;
    }

    ctx.save();
    ctx.translate(px + player.width / 2, py + player.height);
    ctx.scale(facingRight ? scaleX : -scaleX, scaleY);
    ctx.translate(-player.width / 2, -player.height);

    const idleBreath = player.state === 'idle' ? Math.sin(this.animTick * 3.5) * 1.2 : 0;
    const walkBob = player.state === 'walk' ? Math.abs(Math.sin(this.animTick * 12)) * -2.2 : idleBreath;
    const legSwing = player.state === 'walk' ? Math.sin(this.animTick * 12) * 6 : 0;
    const cx = player.width / 2;

    // 1. Trailing Amber Scarf Tail (flutters behind An)
    const scarfWave = Math.sin(this.animTick * 9) * 2.5 + (player.state === 'walk' ? 4 : 1);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(cx - 4, player.height - 28 + walkBob);
    ctx.quadraticCurveTo(
      cx - 13 - scarfWave * 0.6,
      player.height - 26 + walkBob,
      cx - 15 - scarfWave,
      player.height - 19 + walkBob + Math.cos(this.animTick * 8) * 2
    );
    ctx.lineTo(cx - 11 - scarfWave * 0.8, player.height - 16 + walkBob);
    ctx.quadraticCurveTo(cx - 8, player.height - 23 + walkBob, cx - 3, player.height - 24 + walkBob);
    ctx.fill();

    // 2. Legs & Boots
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 5 + legSwing * 0.35, player.height - 14 + walkBob, 4, 10);
    ctx.fillRect(cx + 1 - legSwing * 0.35, player.height - 14 + walkBob, 4, 10);

    // Leather boots
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.roundRect(cx - 6 + legSwing * 0.45, player.height - 5 + walkBob, 6.5, 5, 2);
    ctx.roundRect(cx + 0.5 - legSwing * 0.45, player.height - 5 + walkBob, 6.5, 5, 2);
    ctx.fill();

    // 3. Trench Coat / Autumn Jacket & Skirt Hem
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(cx - 8, player.height - 29 + walkBob, 16, 16, 4);
    ctx.fill();

    // Coat inner lapel & belt
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(cx - 2, player.height - 28 + walkBob, 5, 7);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(cx - 8, player.height - 19 + walkBob, 16, 2.5);

    // Crossbody satchel bag
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(cx - 9, player.height - 22 + walkBob, 6, 8, 2);
    ctx.fill();

    // 4. Warm Amber Scarf Wrap around neck
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.roundRect(cx - 7, player.height - 31 + walkBob, 14, 4.5, 2);
    ctx.fill();

    // 5. Head, Expressive Face & Flowing Chestnut Bob Hair
    // Back hair layer
    ctx.fillStyle = '#2c1810';
    ctx.beginPath();
    ctx.arc(cx, player.height - 38 + walkBob, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = '#fde4cf';
    ctx.beginPath();
    ctx.roundRect(cx - 6, player.height - 43 + walkBob, 12.5, 11.5, 5);
    ctx.fill();

    // Subtle rosy cheek
    ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath();
    ctx.arc(cx + 3.5, player.height - 35 + walkBob, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Expressive Eye (blinks periodically)
    const isBlinking = Math.sin(this.animTick * 2.7) > 0.96;
    ctx.fillStyle = '#1e1b4b';
    if (isBlinking) {
      ctx.fillRect(cx + 2, player.height - 37.5 + walkBob, 3, 1);
    } else {
      ctx.beginPath();
      ctx.arc(cx + 3.2, player.height - 37.5 + walkBob, 1.6, 0, Math.PI * 2);
      ctx.fill();
      // Eye catchlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 3.5, player.height - 38.5 + walkBob, 1, 1);
    }

    // Front bangs & side hairlocks
    ctx.fillStyle = '#3b2316';
    ctx.beginPath();
    ctx.arc(cx - 0.5, player.height - 40.5 + walkBob, 7.8, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
    // Side hair lock framing face
    ctx.beginPath();
    ctx.roundRect(cx - 7.5, player.height - 41 + walkBob, 3.8, 9.5, 2);
    ctx.fill();

    // Hair clip (matching her sister Linh's keepsake)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx - 3, player.height - 42 + walkBob, 3.5, 1.8);

    // 6. Arm & Glowing Broken Clock Hand
    ctx.fillStyle = '#d97706';
    if (player.state === 'interact') {
      ctx.beginPath();
      ctx.roundRect(cx + 3, player.height - 26 + walkBob, 10, 4, 2);
      ctx.fill();
      // Glowing Broken Clock Hand held forward
      ctx.strokeStyle = hasWatch ? '#22d3ee' : '#facc15';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx + 13, player.height - 24 + walkBob);
      ctx.lineTo(cx + 20, player.height - 29 + walkBob);
      ctx.stroke();
    } else {
      const armSwing = player.state === 'walk' ? -legSwing * 0.45 : 0;
      ctx.beginPath();
      ctx.roundRect(cx + 2 + armSwing * 0.3, player.height - 26 + walkBob, 4, 9, 2);
      ctx.fill();
    }

    ctx.restore();

    // 7. In-World Speech / Thought Bubble above An's head
    if (player.speechBubbleText && (player.speechBubbleTimer ?? 0) > 0) {
      ctx.save();
      ctx.font = '600 11px "Be Vietnam Pro", sans-serif';
      const text = player.speechBubbleText;
      const bubbleW = Math.min(280, Math.max(90, ctx.measureText(text).width + 20));
      const bx = Math.max(12, Math.min(1400, px + player.width / 2 - bubbleW / 2));
      const by = py - 34;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, bubbleW, 24, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef3c7';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, bx + bubbleW / 2, by + 12, bubbleW - 14);
      ctx.restore();
    }

    ctx.restore();
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
      ctx.strokeStyle = 'rgba(164, 176, 190, 0.42)';
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
