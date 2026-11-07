import test from 'node:test';
import assert from 'node:assert/strict';
import {INITIAL_PUZZLE_STATE,processInteraction} from './puzzles';
import {areaForChapter,chapterForArea,savedChapterProgress} from './campaign';
import {bossDefeated,completeSeals,canReleaseTrap,CHASE_SEALS} from './encounters';
import {STAGE_CONFIGS} from './levelData';

test('Four story chapters group all house locations and migrate six-chapter saves',()=>{
 assert.deepEqual([1,2,3,4,5,6].map(chapterForArea),[1,2,2,2,3,4]);
 assert.deepEqual([1,2,3,4].map(areaForChapter),[1,2,5,6]);
 assert.deepEqual(savedChapterProgress({currentStage:2,storyChapter:4,furthestStage:6},1),{current:2,unlocked:4});
 assert.deepEqual(savedChapterProgress({currentStage:2,storyChapter:2,furthestChapter:3},2),{current:2,unlocked:3});
});
test('Opening requires the easy latch, but never grants time travel early',()=>{
 const locked=processInteraction('stage_exit_1','PRESENT',INITIAL_PUZZLE_STATE);
 assert.equal(locked.challenge,'porch_lock');assert.equal(locked.advanceToStage,undefined);
 assert.equal(processInteraction('stage_exit_1','PRESENT',INITIAL_PUZZLE_STATE,[2,1]).advanceToStage,undefined);
 const open=processInteraction('stage_exit_1','PRESENT',INITIAL_PUZZLE_STATE,[1,2]);assert.equal(open.advanceToStage,2);assert.equal(open.updatedPuzzles.hasWatch,false);
});
test('The well and greenhouse require manual answers in the past; clues come from the present',()=>{
 const well=processInteraction('hallway_pulley','PRESENT',INITIAL_PUZZLE_STATE);assert.equal(well.updatedPuzzles.collectedClues?.length,1);
 assert.equal(processInteraction('hallway_pulley','PAST',well.updatedPuzzles).challenge,'well_winch');
 assert.equal(processInteraction('hallway_pulley','PAST',well.updatedPuzzles,[2,1]).updatedPuzzles.hallwayPassageCleared,true);
 const circuit=processInteraction('greenhouse_console','PRESENT',INITIAL_PUZZLE_STATE);assert.equal(circuit.updatedPuzzles.greenhouseAligned,undefined);
 assert.equal(processInteraction('greenhouse_console','PAST',circuit.updatedPuzzles,[1,1,1]).updatedPuzzles.greenhouseAligned,undefined);
 assert.equal(processInteraction('greenhouse_console','PAST',circuit.updatedPuzzles,[1,0,0]).updatedPuzzles.greenhouseAligned,true);
 const partial={...INITIAL_PUZZLE_STATE,musicBoxPlayed:true};assert.equal(processInteraction('final_door','PRESENT',partial).advanceToStage,undefined);
 assert.equal(processInteraction('final_door','PRESENT',{...partial,motherNoteCh4Read:true,greenhouseAligned:true}).advanceToStage,5);
});
test('Chase seals require alternating eras, cannot duplicate, and all three gate the exit',()=>{
 let state={...INITIAL_PUZZLE_STATE,currentStage:5};
 for(let i=0;i<3;i++){
  const wrong=processInteraction(`chase_seal_${i}`,CHASE_SEALS[i].era==='PAST'?'PRESENT':'PAST',state);assert.equal(wrong.success,false);
  state=processInteraction(`chase_seal_${i}`,CHASE_SEALS[i].era,state).updatedPuzzles;
  state=processInteraction(`chase_seal_${i}`,CHASE_SEALS[i].era,state).updatedPuzzles;
  assert.equal(state.chaseSeals?.length,i+1);
 }
 assert.equal(completeSeals(state),true);assert.equal(processInteraction('stage_exit_5','PRESENT',state).advanceToStage,6);
 assert.equal(processInteraction('stage_exit_5','PRESENT',INITIAL_PUZZLE_STATE).advanceToStage,undefined);
 const gates=STAGE_CONFIGS[5].platforms.filter(p=>['chase_wall_present','chase_past_gate','chase_present_gate'].includes(p.id));
 assert.deepEqual(gates.map(p=>p.timeline),['PRESENT','PAST','PRESENT']);
});
test('Each boss trap needs past arming, live exposure and present discharge; spent traps cannot be farmed',()=>{
 let state={...INITIAL_PUZZLE_STATE,currentStage:6};
 assert.equal(processInteraction('final_core','PRESENT',{...state,finalCoreAligned:true}).triggerFinalChoice,undefined);
 for(let i=0;i<3;i++){
  state=processInteraction(`boss_trap_${i}`,'PAST',state).updatedPuzzles;
  assert.equal(canReleaseTrap(state,i,'PRESENT'),false);
  assert.equal(processInteraction(`boss_trap_${i}`,'PRESENT',state).success,false);
  state={...state,bossExposedTrap:i};
  assert.equal(canReleaseTrap(state,i,'PAST'),false);
  const hit=processInteraction(`boss_trap_${i}`,'PRESENT',state);assert.equal(hit.success,true);state=hit.updatedPuzzles;
  assert.equal(state.bossHits?.length,i+1);assert.equal(processInteraction(`boss_trap_${i}`,'PAST',state).success,false);
 }
 assert.equal(bossDefeated(state),true);assert.equal(bossDefeated({...state,bossHits:[0,0,0]}),false);
 assert.equal(processInteraction('final_core','PRESENT',{...state,finalCoreAligned:true}).triggerFinalChoice,true);
});
