import {PLAYER_WIDTH,PLAYER_HEIGHT} from './entityScale';
import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGE_CONFIGS} from './levelData';
import {currentPixelRoom,chapterRooms} from './pixelLayout';
import {houseDestination,migrateHouseLocation,houseCamera} from './houseLayout';
import {INITIAL_PUZZLE_STATE} from './puzzles';
import {updateAndResolvePhysics,getActivePlatforms} from './physics';
import type {Player} from '../types/game';
const hub=STAGE_CONFIGS[2];
test('Front porch steps support walking to the door and back in both eras',()=>{
 for(const [timeline,floor]of [['PAST',438.75],['PRESENT',427.5]]as const){
  const platforms=getActivePlatforms(STAGE_CONFIGS[1].platforms,timeline);
  let player={x:960,y:480-PLAYER_HEIGHT,width:PLAYER_WIDTH,height:PLAYER_HEIGHT,vx:0,vy:0,isGrounded:true,coyoteTimer:0,jumpBufferTimer:0}as Player;
  for(let i=0;i<65;i++)player={...player,...updateAndResolvePhysics(player,platforms,1,false,false,1/60)};
  assert.ok(player.x>1100,'Can reach the front door without jumping');
  assert.equal(player.y+PLAYER_HEIGHT,floor,'Feet rest on the painted porch');
  for(let i=0;i<85;i++)player={...player,...updateAndResolvePhysics(player,platforms,-1,false,false,1/60)};
  assert.ok(player.x<1000,'Can walk back down to the courtyard');
  assert.equal(player.y+PLAYER_HEIGHT,480);
 }
});
test('An walks onto the raised past courtyard and back down without sinking or blocking',()=>{
 const yard=STAGE_CONFIGS[3];
 for(const timeline of ['PAST','PRESENT']as const){
  const platforms=getActivePlatforms(yard.platforms,timeline);
  let player={x:1010,y:480-PLAYER_HEIGHT,width:PLAYER_WIDTH,height:PLAYER_HEIGHT,vx:0,vy:0,isGrounded:true,coyoteTimer:0,jumpBufferTimer:0}as Player;
  for(let i=0;i<58;i++)player={...player,...updateAndResolvePhysics(player,platforms,1,false,false,1/60)};
  assert.ok(player.x>1150,'Can walk past the steps');
  assert.equal(player.y+PLAYER_HEIGHT,timeline==='PAST'?440:480);
  for(let i=0;i<80;i++)player={...player,...updateAndResolvePhysics(player,platforms,-1,false,false,1/60)};
  assert.ok(player.x<1060,'Can return from the raised walkway');
  assert.equal(player.y+PLAYER_HEIGHT,480);
 }
});
test('Entering the house leads to the corridor; each interior is reached and left through its door',()=>{
 assert.equal(currentPixelRoom(2,hub.spawnX).map,3);
 for(const [out,back,map]of [['hall_living','living_return',2],['hall_workshop','workshop_return_right',5],['hall_kitchen','kitchen_return',6]]as const){
  const entry=hub.interactables.find(o=>o.id===out)!,exit=hub.interactables.find(o=>o.id===back)!;
  assert.equal(currentPixelRoom(2,entry.x).map,3);
  assert.equal(currentPixelRoom(2,entry.destination!.x).map,map);
  assert.equal(currentPixelRoom(2,exit.x).map,map);
  assert.equal(currentPixelRoom(2,exit.destination!.x).map,3);
 }
 const bedroom=hub.interactables.find(o=>o.id==='hall_bedroom')!;
 assert.equal(houseDestination(bedroom,INITIAL_PUZZLE_STATE)!.locked,true);
 assert.equal(houseDestination(bedroom,{...INITIAL_PUZZLE_STATE,motherDiaryCh3Read:true},'PAST')!.locked,false);
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
 for(const [id,map]of [['living_return',3],['living_return_right',5],['workshop_return',2],['workshop_return_right',3]]as const){
  const obj=hub.interactables.find(o=>o.id===id)!;assert.ok(obj,id);
  const route=houseDestination(obj,INITIAL_PUZZLE_STATE,'PAST')!;
  assert.equal(route.locked,false);assert.equal(currentPixelRoom(route.destination.stage,route.destination.x).map,map);
 }
});

test('The first corridor door is the living room; bedroom occupies the barricaded doorway',()=>{
 const living=hub.interactables.find(o=>o.id==='hall_living')!,bed=hub.interactables.find(o=>o.id==='hall_bedroom')!;
 assert.equal(living.x,228);assert.equal(bed.x,427);
 assert.equal(houseDestination(living,INITIAL_PUZZLE_STATE,'PRESENT')!.locked,false);
});
test('Collapsed bedroom and workshop doors require the past on entry and return',()=>{
 const keyed={...INITIAL_PUZZLE_STATE,hasWatch:true,motherDiaryCh3Read:true};
 for(const [stage,id]of [[2,'hall_bedroom'],[2,'hall_workshop'],[2,'living_return_right'],[2,'workshop_return'],[2,'workshop_return_right'],[4,'bedroom_return']]as const){
  const door=STAGE_CONFIGS[stage].interactables.find(o=>o.id===id)!;
  assert.equal(houseDestination(door,keyed,'PRESENT')!.locked,true,id);
  assert.equal(houseDestination(door,keyed,'PAST')!.locked,false,id);
 }
 const bedroom=hub.interactables.find(o=>o.id==='hall_bedroom')!;
 assert.equal(houseDestination(bedroom,INITIAL_PUZZLE_STATE,'PAST')!.locked,true,'The key is still needed in the past');
 const workshop=hub.interactables.find(o=>o.id==='hall_workshop')!;
 assert.doesNotMatch(houseDestination(workshop,INITIAL_PUZZLE_STATE,'PRESENT')!.lockedMessage??'',/Nhấn Q/,'Do not reveal the power before collecting the watch');
});

test('Living room and workshop doorways form reciprocal paths at the same doorway',()=>{
 for(const [entry,back]of [['hall_living','living_return'],['hall_workshop','workshop_return_right'],['living_return_right','workshop_return'],['hall_kitchen','kitchen_return']]){
  const a=hub.interactables.find(o=>o.id===entry)!,b=hub.interactables.find(o=>o.id===back)!;
  assert.ok(Math.abs(a.destination!.x-b.x)<=50,entry);
  assert.ok(Math.abs(b.destination!.x-a.x)<=50,back);
 }
});
