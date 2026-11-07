import {chapterRooms,currentPixelRoom,legacyScenePoint} from './pixelLayout';
import {PLAYER_HEIGHT, ADULT_HEIGHT, CHILD_HEIGHT} from './entityScale';
import test from 'node:test';
import assert from 'node:assert/strict';
import {anFrame} from './characterAtlas';
import {removeExteriorMattePixels} from './pixelWorld';
import {STAGE_CONFIGS} from './levelData';

test('Revised An sheet supplies distinct actions without switching character identity',()=>{
 for(const tick of [0,.2,1,12]){
  for(const state of ['walk','jump','fall','idle','interact','warp'] as const)assert.match(anFrame(state,tick),/^anV2/);
  assert.match(anFrame('walk',tick,0,true),/^anV2Run/);
  assert.match(anFrame('interact',tick,0,false,'crouch'),/^anV2Crouch/);
  assert.match(anFrame('interact',tick,0,false,'think'),/^anV2Think/);
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

test('Old save positions retain the same room and floor after source-map scale calibration',()=>{
 for(let stage=1;stage<=6;stage++)for(const room of chapterRooms(stage)){
  const point=legacyScenePoint(stage,room.index*1200+600,480);
  assert.equal(currentPixelRoom(stage,point.x).map,room.map);
  assert.equal(point.y,480);
  assert.ok(point.x>=room.start&&point.x<=room.start+room.width);
 }
 assert.equal(STAGE_CONFIGS[2].width,2400);
 assert.equal(STAGE_CONFIGS[1].width,1200);
});

test('The exterior tutorial begins outside the garden gate, away from the house door',()=>{
 assert.ok(STAGE_CONFIGS[1].spawnX>=180&&STAGE_CONFIGS[1].spawnX<=300);
 const door=STAGE_CONFIGS[1].interactables.find(o=>o.id==='stage_exit_1')!;
 assert.ok(door.x-STAGE_CONFIGS[1].spawnX>600);
});
