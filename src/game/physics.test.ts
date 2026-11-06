import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkAABB,
  updateHorizontalMotion,
  isCollidingWithSolids,
  resolveSafeTimelinePosition,
  getActivePlatforms,
  MOVE_SPEED
} from './physics';
import { INITIAL_PUZZLE_STATE } from './puzzles';
import { LEVEL_PLATFORMS } from './levelData';
import { Platform } from '../types/game';

test('checkAABB detects overlapping and non-overlapping boxes', () => {
  const boxA = { x: 0, y: 0, width: 20, height: 40 };
  const boxB = { x: 10, y: 10, width: 20, height: 40 };
  const boxC = { x: 50, y: 50, width: 20, height: 40 };

  assert.equal(checkAABB(boxA, boxB), true, 'boxA and boxB should overlap');
  assert.equal(checkAABB(boxA, boxC), false, 'boxA and boxC should not overlap');
});

test('updateHorizontalMotion accelerates toward target and decelerates to zero', () => {
  let vx = 0;
  vx = updateHorizontalMotion(vx, 1, 0.1);
  assert.ok(vx > 0, 'Velocity should increase to positive');
  assert.ok(vx <= MOVE_SPEED, 'Velocity should not exceed max move speed');

  const stoppedVx = updateHorizontalMotion(vx, 0, 0.5);
  assert.ok(stoppedVx >= 0 && stoppedVx <= vx, 'Velocity should decelerate towards 0');
});

test('isCollidingWithSolids accurately identifies collision with solid platforms', () => {
  const platforms: Platform[] = [
    { id: 'floor', x: 0, y: 100, width: 200, height: 20, type: 'solid', timeline: 'both' },
    { id: 'oneway', x: 0, y: 50, width: 50, height: 10, type: 'one-way', timeline: 'both' }
  ];

  const collidingBox = { x: 50, y: 90, width: 24, height: 32 };
  const safeBox = { x: 50, y: 10, width: 24, height: 32 };

  assert.equal(isCollidingWithSolids(collidingBox, platforms), true);
  assert.equal(isCollidingWithSolids(safeBox, platforms), false);
});

test('resolveSafeTimelinePosition shifts player out of solid obstacles safely and reports shifted=true', () => {
  const solidObstacle: Platform[] = [
    { id: 'wall', x: 100, y: 100, width: 40, height: 60, type: 'solid', timeline: 'PRESENT' }
  ];

  const stuckPlayer = { x: 105, y: 105, width: 20, height: 36 };
  const safePos = resolveSafeTimelinePosition(stuckPlayer, solidObstacle);

  assert.equal(safePos.shifted, true, 'Should report shifted = true when resolving collision');
  const resolvedBox = { x: safePos.x, y: safePos.y, width: stuckPlayer.width, height: stuckPlayer.height };
  assert.equal(
    isCollidingWithSolids(resolvedBox, solidObstacle),
    false,
    'Player must be pushed outside the solid obstacle'
  );
  assert.ok(Math.abs(safePos.x - stuckPlayer.x) <= 64, 'Player x offset should be localized');
  assert.ok(Math.abs(safePos.y - stuckPlayer.y) <= 64, 'Player y offset should be localized');
});

test('getActivePlatforms respects requiresPuzzleNotSolved for doors and debris', () => {
  const initialPlatforms = getActivePlatforms(LEVEL_PLATFORMS, 'PRESENT', INITIAL_PUZZLE_STATE);
  assert.ok(
    initialPlatforms.some((p) => p.id === 'living_hallway_door'),
    'Living hallway door should block path before clock is inspected in Present'
  );
  assert.ok(
    initialPlatforms.some((p) => p.id === 'hallway_debris_pres'),
    'Hallway debris should block Present path before pulley is activated'
  );

  const unlockedState = {
    ...INITIAL_PUZZLE_STATE,
    clockInspectedPresent: true,
    hallwayPassageCleared: true
  };
  const afterPlatforms = getActivePlatforms(LEVEL_PLATFORMS, 'PRESENT', unlockedState);
  assert.equal(
    afterPlatforms.some((p) => p.id === 'living_hallway_door'),
    false,
    'Living hallway door should be removed once clockInspectedPresent is true'
  );
  assert.equal(
    afterPlatforms.some((p) => p.id === 'hallway_debris_pres'),
    false,
    'Hallway debris should be removed once hallwayPassageCleared is true'
  );
});
