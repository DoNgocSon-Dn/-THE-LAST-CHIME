import { BoundingBox, Platform, Player, PuzzleState, Timeline } from '../types/game';

export const GRAVITY = 880; // pixels per sec^2
export const MOVE_SPEED = 180; // max speed
export const ACCELERATION = 900;
export const DECELERATION = 1100;
export const JUMP_VELOCITY = -390;
export const JUMP_CUT_MULTIPLIER = 0.45;
export const COYOTE_TIME = 0.12; // 120ms
export const JUMP_BUFFER_TIME = 0.14; // 140ms

export function checkAABB(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Filter platforms active in the given timeline and puzzle state
 */
export function getActivePlatforms(
  platforms: Platform[],
  timeline: Timeline,
  puzzles?: PuzzleState
): Platform[] {
  return platforms.filter(p => {
    if (p.timeline !== 'both' && p.timeline !== timeline) return false;
    if (puzzles) {
      if (p.requiresPuzzleNotSolved && puzzles[p.requiresPuzzleNotSolved]) {
        return false;
      }
      if (p.requiresPuzzleSolved && !puzzles[p.requiresPuzzleSolved]) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Check if player bounding box is colliding with any solid platform
 */
export function isCollidingWithSolids(box: BoundingBox, platforms: Platform[]): boolean {
  for (const plat of platforms) {
    if (plat.type === 'solid' && checkAABB(box, plat)) {
      return true;
    }
  }
  return false;
}

/**
 * Update player horizontal physics with acceleration and damping
 */
export function updateHorizontalMotion(
  vx: number,
  moveInput: number, // -1, 0, or 1
  dt: number
): number {
  if (moveInput !== 0) {
    // Accelerate towards input direction
    const targetVx = moveInput * MOVE_SPEED;
    const diff = targetVx - vx;
    const change = Math.sign(diff) * Math.min(Math.abs(diff), ACCELERATION * dt);
    return vx + change;
  } else {
    // Decelerate to 0
    const change = Math.min(Math.abs(vx), DECELERATION * dt);
    return Math.sign(vx) * (Math.abs(vx) - change);
  }
}

/**
 * Perform sweep and resolve collisions against platforms
 */
export function updateAndResolvePhysics(
  player: Player,
  platforms: Platform[],
  inputX: number,
  jumpRequested: boolean,
  jumpHeld: boolean,
  dt: number,
  dashVelocity?: number
): {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
} {
  // Clamp dt to avoid tunneling
  const clampedDt = Math.min(dt, 0.05);

  let vx = dashVelocity ?? updateHorizontalMotion(player.vx, inputX, clampedDt);
  let vy = player.vy;
  let isGrounded = player.isGrounded;
  let coyoteTimer = isGrounded ? COYOTE_TIME : Math.max(0, player.coyoteTimer - clampedDt);
  let jumpBufferTimer = jumpRequested ? JUMP_BUFFER_TIME : Math.max(0, player.jumpBufferTimer - clampedDt);

  // Jump logic with coyote time & buffer
  if (jumpBufferTimer > 0 && coyoteTimer > 0) {
    vy = JUMP_VELOCITY;
    isGrounded = false;
    coyoteTimer = 0;
    jumpBufferTimer = 0;
  }

  // Variable jump height cut when release early while ascending
  if (!jumpHeld && vy < 0) {
    vy *= (1 - (1 - JUMP_CUT_MULTIPLIER) * Math.min(clampedDt * 20, 1));
  }

  // Apply gravity
  vy += GRAVITY * clampedDt;
  if (vy > 600) vy = 600; // Terminal velocity

  // Horizontal movement and collision
  let newX = player.x + vx * clampedDt;
  let horizontalBox: BoundingBox = {
    x: newX,
    y: player.y,
    width: player.width,
    height: player.height
  };

  for (const plat of platforms) {
    if (plat.type === 'solid' && checkAABB(horizontalBox, plat)) {
      if (vx > 0) {
        newX = plat.x - player.width;
      } else if (vx < 0) {
        newX = plat.x + plat.width;
      }
      vx = 0;
      horizontalBox.x = newX;
    }
  }

  // Vertical movement and collision
  let newY = player.y + vy * clampedDt;
  let verticalBox: BoundingBox = {
    x: newX,
    y: newY,
    width: player.width,
    height: player.height
  };

  let onGround = false;

  for (const plat of platforms) {
    if (plat.type === 'solid') {
      if (checkAABB(verticalBox, plat)) {
        if (vy > 0) {
          // Landing on floor / platform
          newY = plat.y - player.height;
          vy = 0;
          onGround = true;
        } else if (vy < 0) {
          // Hitting ceiling
          newY = plat.y + plat.height;
          vy = 0;
        }
        verticalBox.y = newY;
      }
    } else if (plat.type === 'one-way') {
      // One-way platform logic: only land if falling through top
      const prevBottom = player.y + player.height;
      const currBottom = newY + player.height;
      if (vy >= 0 && prevBottom <= plat.y + 4 && currBottom >= plat.y) {
        if (newX + player.width > plat.x && newX < plat.x + plat.width) {
          newY = plat.y - player.height;
          vy = 0;
          onGround = true;
          verticalBox.y = newY;
        }
      }
    }
  }

  // Baseline house floor protection across all rooms (ground floor at y=480)
  const floorLevel = 480 - player.height;
  if (newY >= floorLevel) {
    newY = floorLevel;
    vy = 0;
    onGround = true;
  }

  return {
    x: newX,
    y: newY,
    vx,
    vy,
    isGrounded: onGround,
    coyoteTimer,
    jumpBufferTimer
  };
}

/**
 * Smart safe ground resolver when switching timelines:
 * If the player's position in the new timeline intersects with a solid block,
 * we gently push them to the nearest unobstructed safe coordinate without large teleportation.
 */
export function resolveSafeTimelinePosition(
  currentPos: { x: number; y: number; width: number; height: number },
  targetPlatforms: Platform[]
): { x: number; y: number; shifted: boolean } {
  const solids = targetPlatforms.filter(p => p.type === 'solid');

  // If not colliding at current location, current location is perfectly safe
  if (!isCollidingWithSolids(currentPos, solids)) {
    return { x: currentPos.x, y: currentPos.y, shifted: false };
  }

  // Search spiral/offsets outwards up to 48px to gently push player out of geometry
  const offsets = [
    { x: 0, y: -8 }, { x: 0, y: -16 }, { x: 0, y: -24 }, { x: 0, y: -32 },
    { x: -12, y: 0 }, { x: 12, y: 0 }, { x: -24, y: 0 }, { x: 24, y: 0 },
    { x: -36, y: 0 }, { x: 36, y: 0 }, { x: -48, y: 0 }, { x: 48, y: 0 },
    { x: 8, y: -8 }, { x: -8, y: -8 }, { x: 0, y: -48 }
  ];

  for (const off of offsets) {
    const candidate: BoundingBox = {
      x: currentPos.x + off.x,
      y: currentPos.y + off.y,
      width: currentPos.width,
      height: currentPos.height
    };
    if (!isCollidingWithSolids(candidate, solids)) {
      return { x: candidate.x, y: candidate.y, shifted: true };
    }
  }

  // If still caught, return slightly elevated position
  return { x: currentPos.x, y: currentPos.y - 36, shifted: true };
}
