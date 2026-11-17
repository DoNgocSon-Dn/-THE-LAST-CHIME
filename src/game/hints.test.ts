import test from 'node:test';
import assert from 'node:assert/strict';
import {getHintSet} from './hints';
import {INITIAL_PUZZLE_STATE} from './puzzles';
import {mechanismMatches,NOTE_NAMES} from './mechanisms';
import type {PuzzleState} from '../types/game';

const fixtures:[string,number,Partial<PuzzleState>,string?][]=[
 ['c1-move',1,{}],['c1-note',1,{tutorialMoved:true}],['c1-door',1,{tutorialMoved:true,motherNoteCh1Read:true}],
 ['c2-well',2,{currentStage:3}],['c2-box',2,{currentStage:3,hallwayPassageCleared:true}],['c2-linh',2,{currentStage:3,hallwayPassageCleared:true,motherDiaryCh3Read:true}],
 ['c2-music',2,{currentStage:4}],['c2-green',2,{currentStage:4,musicBoxPlayed:true}],['c2-plan',2,{currentStage:4,musicBoxPlayed:true,greenhouseAligned:true}],['c2-forest',2,{currentStage:4,musicBoxPlayed:true,greenhouseAligned:true,motherNoteCh4Read:true}],
 ['c2-hall',2,{currentStage:2},'Hành lang'],['c2-watch',2,{currentStage:2},'Phòng khách'],['c2-q',2,{currentStage:2,hasWatch:true}],
 ['c2-gear',2,{currentStage:2,hasWatch:true,testedTimelineSwitch:true}],['c2-fix',2,{currentStage:2,hasWatch:true,testedTimelineSwitch:true,clockGearFound:true}],
 ['c2-check',2,{currentStage:2,hasWatch:true,testedTimelineSwitch:true,clockRepaired:true}],['c2-back',2,{currentStage:2,hasWatch:true,testedTimelineSwitch:true,clockRepaired:true,clockInspectedPresent:true}],
 ['c3-seals',3,{}],['c3-gate',3,{chaseSealsComplete:true}],['c4-boss',4,{}],['c4-diary',4,{bossHits:[0,1,2]}],['c4-core',4,{bossHits:[0,1,2],finalDiaryCh6Read:true}],['c4-end',4,{bossHits:[0,1,2],finalDiaryCh6Read:true,finalCoreAligned:true}],['none',0,{}],
];
test('Every objective has exactly three nonempty progressive hints',()=>{
 for(const [key,chapter,overrides,room='']of fixtures){
  const hint=getHintSet({...INITIAL_PUZZLE_STATE,...overrides},chapter,room);
  assert.equal(hint.key,key);assert.equal(hint.tiers.length,3);
  for(const tier of hint.tiers)assert.ok(tier.trim().length>0,key);
 }
});
test('Explicit hints match the actual mechanism solutions, without numerical answers in earlier tiers',()=>{
 for(const [key,id,answer,pattern]of [
  ['c1-door','porch_lock',[1,2],/Trăng.*Mặt trời/],['c2-well','well_winch',[2,1],/trái.*2.*phải.*1/],
  ['c2-music','music_box',[2,4,5],new RegExp([2,4,5].map(i=>NOTE_NAMES[i]).join(' → '))],
  ['c2-green','greenhouse_console',[1,0,0],/I Sáng, II Tắt, III Tắt/],['c2-fix','clock',[3,15],/giờ 3.*phút 15/],
  ['c4-core','temporal_anchor',[3,1,5],/ngoài 3.*giữa 1.*trong 5/],
 ]as const){
  const [,chapter,overrides,room='']=fixtures.find(f=>f[0]===key)!;
  const hint=getHintSet({...INITIAL_PUZZLE_STATE,...overrides},chapter,room);
  assert.equal(mechanismMatches(id,answer),true);assert.match(hint.tiers[2],pattern);
  assert.doesNotMatch(hint.tiers.slice(0,2).join(' '),pattern);
 }
 // Actual UI starts at 000: levers A, B, C flip adjacent lanes.
 let lanes=[0,0,0];for(const i of [0,1,2])lanes=lanes.map((v,j)=>j===i||(i<2&&j===i+1)?1-v:v);
 assert.equal(mechanismMatches('greenhouse_console',lanes),true);
});
