import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_PUZZLE_STATE, processInteraction } from './puzzles';

test('Chapter 1 teaches interaction and lets An enter the house without a watch or Q',()=>{
  const note=processInteraction('mother_note_ch1','PRESENT',INITIAL_PUZZLE_STATE);
  assert.equal(note.updatedPuzzles.motherNoteCh1Read,true);
  assert.equal(note.updatedPuzzles.hasWatch,false);
  const door=processInteraction('stage_exit_1','PRESENT',note.updatedPuzzles,[1,2]);
  assert.equal(door.advanceToStage,2);
  assert.equal(door.updatedPuzzles.hasWatch,false);
  assert.equal(door.updatedPuzzles.testedTimelineSwitch,false);
});
test('The watch is collected in Chapter 2; an exterior clock or pickup cannot unlock Q',()=>{
  assert.equal(processInteraction('clock','PRESENT',INITIAL_PUZZLE_STATE).updatedPuzzles.hasWatch,false);
  assert.equal(processInteraction('pocket_watch_box','PRESENT',INITIAL_PUZZLE_STATE).updatedPuzzles.hasWatch,false);
  const state={...INITIAL_PUZZLE_STATE,currentStage:2};
  assert.equal(processInteraction('clock','PRESENT',state).updatedPuzzles.hasWatch,false);
  const pickup=processInteraction('pocket_watch_box','PRESENT',state);
  assert.equal(pickup.success,true);
  assert.equal(pickup.updatedPuzzles.hasWatch,true);
  assert.equal(pickup.updatedPuzzles.watchCollected,true);
});
test('Repairing the grandfather clock requires the actual gear pickup',()=>{
  const state={...INITIAL_PUZZLE_STATE,currentStage:2,hasWatch:true};
  assert.equal(processInteraction('clock','PAST',state).updatedPuzzles.clockRepaired,false);
});

test('Chapter 2 (Chiếc đồng hồ ngừng chạy): repairing clock in Past unlocks hallway door in Present', () => {
  let state = { ...INITIAL_PUZZLE_STATE, currentStage:2, hasWatch: true };

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
  const repairRes = processInteraction('clock', 'PAST', state, [3,15]);
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

  const pulleyRes = processInteraction('hallway_pulley', 'PAST', state,[2,1]);
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

  // The two timelines reveal different halves of the music clue.
  state = processInteraction('light_target', 'PAST', state).updatedPuzzles;
  state = processInteraction('light_target', 'PRESENT', state).updatedPuzzles;
  assert.equal(state.lightRuneFound, true);

  // Read Mother's note in Chapter 4
  state = processInteraction('mother_note_ch4', 'PRESENT', state).updatedPuzzles;
  assert.equal(state.motherNoteCh4Read, true);

  // Play music box in Past
  const mbRes = processInteraction('music_box', 'PAST', state, [2,4,5]);
  assert.equal(mbRes.success, true);
  state = mbRes.updatedPuzzles;
  assert.equal(state.musicBoxPlayed, true);

  // Unlock final door in Present -> opens path to Chapter 5 (Chase)
  state=processInteraction('greenhouse_console','PAST',state,[1,0,0]).updatedPuzzles;
  const doorRes = processInteraction('final_door', 'PRESENT', state);
  assert.equal(doorRes.success, true);
  state = doorRes.updatedPuzzles;
  assert.equal(state.finalDoorUnlocked, true);

  // Chapter 6: Read final diary, align temporal anchor in Past, and activate final core
  const finalDiary = processInteraction('final_diary_ch6', 'PRESENT', state);
  assert.equal(finalDiary.success, true);
  state = finalDiary.updatedPuzzles;
  assert.equal(state.finalDiaryCh6Read, true);

  state={...state,bossHits:[0,1,2]};
  const anchorRes = processInteraction('temporal_anchor', 'PAST', state, [3,1,5]);
  assert.equal(anchorRes.success, true);
  state = anchorRes.updatedPuzzles;
  assert.equal(state.finalCoreAligned, true);

  const coreRes = processInteraction('final_core', 'PRESENT', state);
  assert.equal(coreRes.success, true);
  assert.equal(coreRes.triggerFinalChoice, true, 'Interacting with aligned core triggers Final Choice modal');
});

test('Discoveries do not reveal their author or puzzle solution before inspection',()=>{
  const note=processInteraction('mother_note_ch1','PRESENT',INITIAL_PUZZLE_STATE);
  assert.match(note.dialogue![0].text,/Một mẩu giấy/);
  const repeated=processInteraction('mother_note_ch1','PRESENT',note.updatedPuzzles);
  assert.equal(repeated.dialogue,undefined);
  const watch=processInteraction('pocket_watch_box','PRESENT',{...INITIAL_PUZZLE_STATE,currentStage:2});
  assert.equal(watch.dialogue!.some(line=>line.speaker==='ME'),false);
  assert.equal(watch.dialogue!.some(line=>/Nhấn|ba giây|Màn \d/.test(line.text)),false);
  const clock=processInteraction('clock','PAST',watch.updatedPuzzles);
  assert.doesNotMatch(clock.messageVi,/xưởng|dự phòng/);
  assert.equal(clock.updatedPuzzles.clockRepaired,false);
});

test('Manual clock repair needs a complete correct time, not a single interaction',()=>{
 const state={...INITIAL_PUZZLE_STATE,currentStage:2,hasWatch:true,clockGearFound:true};
 for(const answer of [undefined,[],[3],[3,0],[3,15,0],[NaN,15]]){
  const result=processInteraction('clock','PAST',state,answer);
  assert.equal(result.challenge,'clock');assert.equal(result.updatedPuzzles.clockRepaired,false);
 }
 assert.equal(processInteraction('clock','PAST',state,[3,15]).updatedPuzzles.clockRepaired,true);
 assert.equal(processInteraction('clock','PRESENT',state,[3,15]).updatedPuzzles.clockRepaired,false);
});

test('Melody must be entered in order; lighting alone cannot solve the box',()=>{
 const state={...INITIAL_PUZZLE_STATE,currentStage:4,lightSwitchOn:true};
 for(const answer of [undefined,[5,4,2],[2,4],[2,4,5,0]])assert.equal(processInteraction('music_box','PAST',state,answer).updatedPuzzles.musicBoxPlayed,false);
 const past=processInteraction('light_target','PAST',state);
 assert.equal(past.updatedPuzzles.lightRuneFound,false);
 assert.equal(past.updatedPuzzles.collectedClues!.length,1);
 const present=processInteraction('light_target','PRESENT',past.updatedPuzzles);
 assert.equal(present.updatedPuzzles.lightRuneFound,true);
 assert.equal(processInteraction('light_target','PRESENT',present.updatedPuzzles).updatedPuzzles.collectedClues!.length,2);
 const solved=processInteraction('music_box','PAST',present.updatedPuzzles,[2,4,5]);
 assert.equal(solved.updatedPuzzles.musicBoxPlayed,true);
 assert.equal(processInteraction('music_box','PAST',solved.updatedPuzzles).challenge,undefined);
});

test('Anchor requires the diary and correctly ordered rings, and failed attempts preserve progression',()=>{
 const state={...INITIAL_PUZZLE_STATE,currentStage:6,bossHits:[0,1,2]};
 assert.equal(processInteraction('temporal_anchor','PAST',state,[3,1,5]).updatedPuzzles.finalCoreAligned,false);
 const diary=processInteraction('final_diary_ch6','PRESENT',state).updatedPuzzles;
 assert.equal(diary.collectedClues!.length,1);
 for(const answer of [undefined,[1,3,5],[3,5,1]])assert.equal(processInteraction('temporal_anchor','PAST',diary,answer).updatedPuzzles.finalCoreAligned,false);
 assert.equal(processInteraction('temporal_anchor','PAST',diary,[3,1,5]).updatedPuzzles.finalCoreAligned,true);
 assert.deepEqual(state,{...INITIAL_PUZZLE_STATE,currentStage:6,bossHits:[0,1,2]});
});


test('Well feedback follows the active era and preserves a bucket raised in the past',()=>{
 const state={...INITIAL_PUZZLE_STATE,currentStage:3};
 const past=processInteraction('mother_diary_ch3','PAST',state);
 assert.match(past.messageVi,/tay quay bên cạnh/);
 assert.doesNotMatch(past.messageVi,/đã gãy/);
 const raised=processInteraction('hallway_pulley','PRESENT',{...state,hallwayPassageCleared:true});
 assert.match(raised.messageVi,/miệng giếng/);assert.doesNotMatch(raised.messageVi,/kẹt dưới/);
 const music=processInteraction('music_box','PRESENT',{...state,musicBoxPlayed:true});
 assert.doesNotMatch(music.messageVi,/ngân khẽ/);
});
test('Family mementos describe their own era without revealing unvisited scenes',()=>{
 for(const id of ['memory_kitchen','memory_workshop','memory_well','memory_garden','memory_greenhouse']){
  const past=processInteraction(id,'PAST',INITIAL_PUZZLE_STATE),present=processInteraction(id,'PRESENT',INITIAL_PUZZLE_STATE);
  assert.notEqual(past.dialogue?.[0].text,present.dialogue?.[0].text);
  assert.doesNotMatch(past.dialogue?.[0].text??'',/quái vật|Cái bóng bên giếng/);
 }
});
