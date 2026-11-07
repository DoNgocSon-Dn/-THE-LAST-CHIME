import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceGait,WALK_STRIDE} from './locomotion';
import {anFrame} from './characterAtlas';

test('Walking cadence follows distance at 30, 60 and 120fps with two footfalls per stride',()=>{
 for(const fps of [30,60,120]){
  let phase=0,steps=0;
  for(let i=0;i<fps;i++){const gait=advanceGait(phase,180/fps,true);phase=gait.phase;steps+=Number(gait.step);}
  assert.ok(Math.abs(phase-(180/WALK_STRIDE)%1)<1e-9);assert.equal(steps,3);
 }
});
test('Standing, walls and airborne movement never advance ground steps',()=>{
 assert.deepEqual(advanceGait(.3,0,true),{phase:.3,step:false});
 assert.deepEqual(advanceGait(.3,20,false),{phase:.3,step:false});
 assert.equal(advanceGait(.2,-24,true).phase,advanceGait(.2,24,true).phase);
});
test('Walk phase is distance-driven; idle breathes slowly within the same character model',()=>{
 for(const tick of [0,.2,1,100]){
  assert.equal(anFrame('walk',tick,0,false,'think',.4),'anUnifiedWalk3');
  assert.match(anFrame('idle',tick),/^anUnifiedIdle[0-7]$/);
 }
 assert.equal(anFrame('walk',0,0,true,'think',.8),'anUnifiedRun6');
});

test('Walking uses eight distinct stride poses and never the standing pose',()=>{
 const frames=Array.from({length:8},(_,i)=>anFrame('walk',0,0,false,'think',(i+.1)/8));
 assert.equal(new Set(frames).size,8);
 assert.ok(frames.every(frame=>frame!==anFrame('idle',0)));
});
