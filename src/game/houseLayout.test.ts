import {PLAYER_WIDTH,PLAYER_HEIGHT} from './entityScale';
import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGE_CONFIGS} from './levelData';
import {currentPixelRoom,chapterRooms} from './pixelLayout';
import {houseDestination,migrateHouseLocation,houseCamera} from './houseLayout';
import {INITIAL_PUZZLE_STATE} from './puzzles';
import {updateAndResolvePhysics} from './physics';
import type {Player} from '../types/game';
const hub=STAGE_CONFIGS[2];
test('Entering the house leads to the corridor; each interior is reached and left through its door',()=>{
 assert.equal(currentPixelRoom(2,hub.spawnX).map,3);
 for(const [out,back,map]of [['hall_living','living_return',2],['hall_workshop','workshop_return',5],['hall_kitchen','kitchen_return',6]]as const){
  const entry=hub.interactables.find(o=>o.id===out)!,exit=hub.interactables.find(o=>o.id===back)!;
  assert.equal(currentPixelRoom(2,entry.x).map,3);
  assert.equal(currentPixelRoom(2,entry.destination!.x).map,map);
  assert.equal(currentPixelRoom(2,exit.x).map,map);
  assert.equal(currentPixelRoom(2,exit.destination!.x).map,3);
 }
 const bedroom=hub.interactables.find(o=>o.id==='hall_bedroom')!;
 assert.equal(houseDestination(bedroom,INITIAL_PUZZLE_STATE)!.locked,true);
 assert.equal(houseDestination(bedroom,{...INITIAL_PUZZLE_STATE,motherDiaryCh3Read:true})!.locked,false);
 const back=STAGE_CONFIGS[4].interactables.find(o=>o.id==='bedroom_return')!.destination!;
 assert.equal(currentPixelRoom(back.stage,back.x).map,3);
});
test('All house door destinations are inside their room and have a supporting floor',()=>{
 for(const cfg of Object.values(STAGE_CONFIGS))for(const obj of cfg.interactables){const d=obj.destination;if(!d)continue;const target=STAGE_CONFIGS[d.stage];
  assert.ok(d.x>=10&&d.x+30<target.width,obj.id);
  assert.ok(target.platforms.some(p=>p.type==='solid'&&p.y===480&&d.x>=p.x&&d.x+30<=p.x+p.width),obj.id);
 }
});
test('Interior boundaries prevent walking through neighboring rooms; camera cannot reveal the next room',()=>{
 for(const room of chapterRooms(2).slice(0,-1)){
  let player={x:room.start+room.width-50,y:480-PLAYER_HEIGHT,width:PLAYER_WIDTH,height:PLAYER_HEIGHT,vx:0,vy:0,isGrounded:true,coyoteTimer:0,jumpBufferTimer:0}as Player;
  for(let i=0;i<30;i++)player={...player,...updateAndResolvePhysics(player,hub.platforms,1,false,false,1/60)};
  assert.ok(player.x+PLAYER_WIDTH<=room.start+room.width-8+.01);
  const bounds=houseCamera(2,player.x,400,hub.width);assert.equal(bounds.min,room.start);assert.equal(bounds.max,room.start+400);
 }
});
test('Old saves migrate by physical room, not by the old chapter number alone',()=>{
 assert.deepEqual(migrateHouseLocation(2,200),{stage:2,x:1000});
 assert.deepEqual(migrateHouseLocation(2,1000),{stage:2,x:2600});
 assert.deepEqual(migrateHouseLocation(2,1800),{stage:2,x:1800});
 assert.deepEqual(migrateHouseLocation(3,400),{stage:2,x:400});
 assert.deepEqual(migrateHouseLocation(3,1400),{stage:3,x:600});
});

test('Painted open doorways on both sides of living room and workshop have return routes',()=>{
 for(const id of ['living_return','living_return_right','workshop_return','workshop_return_right']){
  const obj=hub.interactables.find(o=>o.id===id)!;assert.ok(obj,id);
  const route=houseDestination(obj,INITIAL_PUZZLE_STATE)!;
  assert.equal(route.locked,false);assert.equal(currentPixelRoom(route.destination.stage,route.destination.x).map,3);
 }
});
