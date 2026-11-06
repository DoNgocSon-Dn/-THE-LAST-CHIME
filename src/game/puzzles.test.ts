import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_PUZZLE_STATE, processInteraction } from './puzzles';

test('Chapter 1 (Trở về): An touches antique clock with broken clock hand to unlock time link', () => {
  assert.equal(INITIAL_PUZZLE_STATE.hasWatch, false, 'An starts without temporal link unlocked');

  const noteRes = processInteraction('mother_note_ch1', 'PRESENT', INITIAL_PUZZLE_STATE);
  assert.equal(noteRes.success, true);
  assert.equal(noteRes.updatedPuzzles.motherNoteCh1Read, true);

  const clockTouch = processInteraction('clock', 'PRESENT', noteRes.updatedPuzzles);
  assert.equal(clockTouch.success, true);
  assert.equal(clockTouch.updatedPuzzles.hasWatch, true, 'Touching clock unlocks temporal link');
});

test('Chapter 2 (Chiếc đồng hồ ngừng chạy): repairing clock in Past unlocks hallway door in Present', () => {
  let state = { ...INITIAL_PUZZLE_STATE, hasWatch: true };

  // Cannot unlock hallway door in Present before repairing clock in Past
  const prematurePresent = processInteraction('clock', 'PRESENT', state);
  assert.equal(prematurePresent.success, false);
  assert.equal(prematurePresent.updatedPuzzles.clockInspectedPresent, false);

  // Pick up clock gear in Past
  const gearRes = processInteraction('clock_gear', 'PAST', state);
  assert.equal(gearRes.success, true);
  assert.equal(gearRes.updatedPuzzles.clockGearFound, true);
  state = gearRes.updatedPuzzles;

  // Repair clock in Past
  const repairRes = processInteraction('clock', 'PAST', state);
  assert.equal(repairRes.success, true);
  assert.equal(repairRes.updatedPuzzles.clockRepaired, true);
  state = repairRes.updatedPuzzles;

  // Inspect clock in Present to open hallway door
  const presentRes = processInteraction('clock', 'PRESENT', state);
  assert.equal(presentRes.success, true);
  assert.equal(presentRes.updatedPuzzles.clockInspectedPresent, true);
});

test('Chapter 3 (Hành lang ký ức): pulley clears Present debris and diary triggers Kẻ Lạc Giờ omen', () => {
  let state = {
    ...INITIAL_PUZZLE_STATE,
    hasWatch: true,
    clockGearFound: true,
    clockRepaired: true,
    clockInspectedPresent: true
  };

  const pulleyRes = processInteraction('hallway_pulley', 'PAST', state);
  assert.equal(pulleyRes.success, true);
  assert.equal(pulleyRes.updatedPuzzles.hallwayPassageCleared, true);
  state = pulleyRes.updatedPuzzles;

  const diaryRes = processInteraction('mother_diary_ch3', 'PRESENT', state);
  assert.equal(diaryRes.success, true);
  assert.equal(diaryRes.updatedPuzzles.motherDiaryCh3Read, true);
  assert.equal(diaryRes.triggerOmen, true, 'Reading Chapter 3 diary triggers first omen of Kẻ Lạc Giờ');
});

test('Chapters 4 to 6: Study room puzzle, Chase door unlock, and Chapter 6 Final Choice', () => {
  let state = {
    ...INITIAL_PUZZLE_STATE,
    hasWatch: true,
    clockGearFound: true,
    clockRepaired: true,
    clockInspectedPresent: true,
    hallwayPassageCleared: true,
    motherDiaryCh3Read: true
  };

  // Turn on light switch in Past
  state = processInteraction('light_switch', 'PAST', state).updatedPuzzles;
  assert.equal(state.lightSwitchOn, true);

  // Inspect light target in Present
  state = processInteraction('light_target', 'PRESENT', state).updatedPuzzles;
  assert.equal(state.lightRuneFound, true);

  // Read Mother's note in Chapter 4
  state = processInteraction('mother_note_ch4', 'PRESENT', state).updatedPuzzles;
  assert.equal(state.motherNoteCh4Read, true);

  // Play music box in Past
  const mbRes = processInteraction('music_box', 'PAST', state);
  assert.equal(mbRes.success, true);
  state = mbRes.updatedPuzzles;
  assert.equal(state.musicBoxPlayed, true);

  // Unlock final door in Present -> opens path to Chapter 5 (Chase)
  const doorRes = processInteraction('final_door', 'PRESENT', state);
  assert.equal(doorRes.success, true);
  state = doorRes.updatedPuzzles;
  assert.equal(state.finalDoorUnlocked, true);

  // Chapter 6: Read final diary, align temporal anchor in Past, and activate final core
  const finalDiary = processInteraction('final_diary_ch6', 'PRESENT', state);
  assert.equal(finalDiary.success, true);
  state = finalDiary.updatedPuzzles;
  assert.equal(state.finalDiaryCh6Read, true);

  const anchorRes = processInteraction('temporal_anchor', 'PAST', state);
  assert.equal(anchorRes.success, true);
  state = anchorRes.updatedPuzzles;
  assert.equal(state.finalCoreAligned, true);

  const coreRes = processInteraction('final_core', 'PRESENT', state);
  assert.equal(coreRes.success, true);
  assert.equal(coreRes.triggerFinalChoice, true, 'Interacting with aligned core triggers Final Choice modal');
});
