import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYER_WIDTH,PLAYER_HEIGHT} from './entityScale';
import {STAGE_CONFIGS} from './levelData';
import {INITIAL_PUZZLE_STATE} from './puzzles';
import {getActivePlatforms,isCollidingWithSolids,MOVE_SPEED,updateAndResolvePhysics,supportedPosition,resolveSafeTimelinePosition} from './physics';
import type {Platform,Player,Timeline} from '../types/game';

const actor=(x:number,floor:number):Player=>({x,y:floor-PLAYER_HEIGHT,width:PLAYER_WIDTH,height:PLAYER_HEIGHT,vx:0,vy:0,isGrounded:true,coyoteTimer:0,jumpBufferTimer:0,facing:'right',state:'idle',animFrame:0,animTimer:0,interactCooldown:0,interactAnimTimer:0});

test('Well clue is actually interactable in the present, where the answer is inscribed',()=>{
 assert.ok(STAGE_CONFIGS[3].interactables.some(o=>o.id==='hallway_pulley'&&(o.timeline==='both'||o.timeline==='PRESENT')));
});

test('Timeline shifts clear a raised porch exactly and reject completely enclosing walls',()=>{
 const player=actor(1100,480),porch:Platform={id:'porch',x:1000,y:427.5,width:200,height:173,type:'solid',timeline:'PRESENT'};
 const safe=resolveSafeTimelinePosition(player,[porch]);
 assert.equal(safe.y+PLAYER_HEIGHT,427.5);
 assert.equal(isCollidingWithSolids({...player,...safe},[porch]),false);
 const enclosed:Platform={id:'wall',x:0,y:0,width:2000,height:1000,type:'solid',timeline:'PRESENT'};
 assert.equal(resolveSafeTimelinePosition(player,[enclosed]).shifted,false);
});

test('Old cave save positions restore to a real local ledge rather than the former phantom floor',()=>{
 const platforms=getActivePlatforms(STAGE_CONFIGS[5].platforms,'PAST',{...INITIAL_PUZZLE_STATE,chaseSealsComplete:true});
 const old=actor(2100,480),safe=supportedPosition(old,platforms);
 assert.ok(safe);assert.equal(safe.y+PLAYER_HEIGHT,365);
 assert.equal(isCollidingWithSolids({...old,...safe},platforms),false);
});

test('A real gap has no invisible safety floor; falling can reach the checkpoint threshold',()=>{
 let player=actor(100,480);
 for(let frame=0;frame<100;frame++)player={...player,...updateAndResolvePhysics(player,[],0,false,false,1/60)};
 assert.ok(player.y>640);
 assert.equal(player.isGrounded,false);
});

test('The drawn fracture staircase can be climbed on foot from the water planks',()=>{
 const platforms=getActivePlatforms(STAGE_CONFIGS[5].platforms,'PAST',{...INITIAL_PUZZLE_STATE,chaseSealsComplete:true});
 let player=actor(2892,480);
 for(let frame=0;frame<45;frame++)player={...player,...updateAndResolvePhysics(player,platforms,1,false,false,1/60)};
 assert.ok(player.x>2990);
 assert.ok(player.y+PLAYER_HEIGHT<=353);
});

for(const stage of [5,6])test(`Chapter ${stage===5?3:4} routes and objectives are reachable using actual jump collision`,()=>{
 const cfg=STAGE_CONFIGS[stage],solved={...INITIAL_PUZZLE_STATE,chaseSealsComplete:true};
 const floors=cfg.platforms.filter(p=>p.id.startsWith('ground')||p.type==='one-way');
 const visited=new Set<string>(),queue:{index:number;era:Timeline}[]=[];
 const add=(index:number,era:Timeline)=>{const key=`${index}:${era}`;if(!visited.has(key)){visited.add(key);queue.push({index,era});}};
 const supports=(p:Platform,x:number,feet:number)=>Math.abs(p.y-feet)<.1&&x+PLAYER_WIDTH>p.x&&x<p.x+p.width;
 const start=floors.findIndex(p=>supports(p,cfg.spawnX,cfg.spawnY+PLAYER_HEIGHT));
 assert.ok(start>=0);add(start,'PRESENT');
 while(queue.length){
  const {index,era}=queue.shift()!,floor=floors[index],platforms=getActivePlatforms(cfg.platforms,era,solved);
  const positions=[floor.x+2,floor.x+floor.width/2-PLAYER_WIDTH/2,floor.x+floor.width-PLAYER_WIDTH-2];
  for(const x of positions){
   if(x<10||x+PLAYER_WIDTH>cfg.width-8)continue;
   const initial=actor(x,floor.y);
   if(isCollidingWithSolids(initial,platforms))continue;
   const otherEra=era==='PAST'?'PRESENT':'PAST';
   if(!isCollidingWithSolids(initial,getActivePlatforms(cfg.platforms,otherEra,solved)))add(index,otherEra);
   for(const direction of [-1,1])for(const hold of [0,10,20,60]){
    let player={...initial,vx:direction*MOVE_SPEED};
    for(let frame=0;frame<100;frame++){
     player={...player,...updateAndResolvePhysics(player,platforms,direction,hold>0&&frame===0,hold>frame,1/60)};
     if(player.y>640||player.x<10||player.x+PLAYER_WIDTH>cfg.width-8)break;
     if(frame>3&&player.isGrounded){
      const landing=floors.findIndex(p=>supports(p,player.x,player.y+PLAYER_HEIGHT));
      if(landing>=0&&landing!==index){add(landing,era);break;}
      if(hold>0&&frame>10)break;
     }
    }
   }
  }
 }
 const objectives=cfg.interactables.filter(o=>stage===5?o.id.startsWith('chase_seal_')||o.id==='stage_exit_5':o.id.startsWith('boss_trap_')||['final_diary_ch6','temporal_anchor','final_core'].includes(o.id));
 for(const objective of objectives){
  const reachable=[...visited].some(key=>{
   const floor=floors[Number(key.split(':')[0])];
   return objective.x+objective.width/2>=floor.x-50&&objective.x+objective.width/2<=floor.x+floor.width+50&&Math.abs(floor.y-PLAYER_HEIGHT/2-(objective.y+objective.height/2))<85;
  });
  assert.ok(reachable,`${objective.id} has no physically reachable interaction position; reached: ${[...visited].map(key=>floors[Number(key.split(':')[0])].id).join(',')}`);
 }
});
