import {PLAYER_HEIGHT} from './entityScale';
import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTER_ROOMS,MAP_CROPS} from './pixelLayout';
import {STAGE_CONFIGS} from './levelData';
import {getActivePlatforms,GRAVITY,JUMP_VELOCITY,MOVE_SPEED} from './physics';
import {INITIAL_PUZZLE_STATE} from './puzzles';

test('All 13 supplied maps occur exactly once in the six chapter route; crops exclude sheet headings',()=>{
 const maps=Object.values(CHAPTER_ROOMS).flat().map(r=>r.map).sort((a,b)=>a-b);
 assert.deepEqual(maps,Array.from({length:13},(_,i)=>i+1));
 for(const era of Object.values(MAP_CROPS).flatMap(c=>[c.past,c.present])){
   assert.ok(era.x>=0&&era.y>=0&&era.x+era.w<=1600&&era.y+era.h<=672);
   assert.ok(era.floor>=era.y&&era.floor<=era.y+era.h);
 }
});
test('Chapter spawns have a supporting floor and every interaction is inside its chapter',()=>{
 for(const cfg of Object.values(STAGE_CONFIGS)){
   assert.ok(cfg.platforms.some(p=>p.timeline==='both'&&cfg.spawnX>=p.x&&cfg.spawnX<=p.x+p.width&&Math.abs(p.y-cfg.spawnY-PLAYER_HEIGHT)<1),`chapter ${cfg.stage} spawn`);
   for(const obj of cfg.interactables)assert.ok(obj.x>=0&&obj.x+obj.width<=cfg.width,`${obj.id} bounds`);
 }
});
test('Cave/fracture and sanctuary routes have no gaps or rises beyond the actual full-jump envelope',()=>{
 const solved={...INITIAL_PUZZLE_STATE,hasWatch:true,clockInspectedPresent:true,hallwayPassageCleared:true,finalDoorUnlocked:true};
 for(const stage of [5,6]){
   const cfg=STAGE_CONFIGS[stage];
   const floors=getActivePlatforms(cfg.platforms,'PRESENT',solved).filter(p=>p.id.startsWith('ground')||p.type==='one-way');
   const start=floors.findIndex(p=>cfg.spawnX>=p.x&&cfg.spawnX<=p.x+p.width&&Math.abs(p.y-cfg.spawnY-PLAYER_HEIGHT)<1);
   const visited=new Set<number>([start]);const queue=[start];
   while(queue.length){
     const from=floors[queue.shift()!];
     floors.forEach((to,i)=>{
       if(visited.has(i))return;
       const discriminant=JUMP_VELOCITY**2+2*GRAVITY*(to.y-from.y);
       if(discriminant<0)return;
       const flight=(-JUMP_VELOCITY+Math.sqrt(discriminant))/GRAVITY;
       const gap=Math.max(0,to.x-(from.x+from.width),from.x-(to.x+to.width));
       if(gap+10<MOVE_SPEED*flight){visited.add(i);queue.push(i);}
     });
   }
   const destination=stage===5?cfg.width-90:1110;
   assert.ok([...visited].some(i=>destination>=floors[i].x&&destination<=floors[i].x+floors[i].width),`chapter ${stage} exit reachable`);
 }
});
