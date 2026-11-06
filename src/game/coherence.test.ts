import {PLAYER_HEIGHT, ADULT_HEIGHT, CHILD_HEIGHT} from './entityScale';
import test from 'node:test';
import assert from 'node:assert/strict';
import {anFrame} from './characterAtlas';
import {removeExteriorMattePixels} from './pixelWorld';
import {STAGE_CONFIGS} from './levelData';

test('Character interactions and warp retain the idle identity without an unrelated held clock',()=>{
 for(const tick of [0,.2,1,12]){
  assert.equal(anFrame('interact',tick),anFrame('idle',tick));
  assert.equal(anFrame('warp',tick),anFrame('idle',tick));
  for(const state of ['walk','jump','fall'] as const)assert.match(anFrame(state,tick),/^an[0-8]$/);
 }
});
test('Closed exterior white matte holes are transparent while colored architecture is retained',()=>{
 const pixels=new Uint8ClampedArray([255,255,255,255,237,238,236,255,70,95,68,255,224,185,120,255]);
 removeExteriorMattePixels(pixels);
 assert.deepEqual([pixels[3],pixels[7],pixels[11],pixels[15]],[0,0,255,255]);
});
test('Exterior tutorial has no freestanding clock; doors use their painted architecture',()=>{
 assert.equal(STAGE_CONFIGS[1].interactables.some(o=>o.id==='clock'||o.type==='pocket_watch'),false);
 assert.ok(STAGE_CONFIGS[2].interactables.some(o=>o.type==='pocket_watch'));
 for(const cfg of Object.values(STAGE_CONFIGS))for(const obj of cfg.interactables)
  if(obj.id.startsWith('stage_exit_')||obj.id==='final_door')assert.equal(obj.bakedIntoMap,true);
});

test('Actor art, collision spawns and adult/child proportions share a world scale',()=>{
 assert.equal(PLAYER_HEIGHT,ADULT_HEIGHT);
 assert.ok(CHILD_HEIGHT<PLAYER_HEIGHT);
 for(const cfg of Object.values(STAGE_CONFIGS)){
  assert.ok(cfg.platforms.some(p=>cfg.spawnX>=p.x&&cfg.spawnX<=p.x+p.width&&Math.abs(cfg.spawnY+PLAYER_HEIGHT-p.y)<1));
  for(const npc of cfg.memoryNPCs)assert.ok(npc.character==='LINH'?npc.height<PLAYER_HEIGHT:Math.abs(npc.height-PLAYER_HEIGHT)<=2);
 }
});
