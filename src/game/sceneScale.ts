import type {StageConfig} from './levelData';
import {chapterRooms,legacyScenePoint} from './pixelLayout';
import {PLAYER_HEIGHT} from './entityScale';

/** Normalize source sheets with different furniture scales to the same human height. */
export function normalizeSceneScales(stages:Record<number,StageConfig>){
 for(const cfg of Object.values(stages)){
  const rooms=chapterRooms(cfg.stage),last=rooms[rooms.length-1];cfg.width=last.start+last.width;
  const spawn=legacyScenePoint(cfg.stage,cfg.spawnX,cfg.spawnY+PLAYER_HEIGHT);cfg.spawnX=spawn.x;cfg.spawnY=spawn.y-PLAYER_HEIGHT;
  for(const p of cfg.platforms){
   if(p.id==='ground_main'){p.width=cfg.width;continue;}
   if(p.id==='wall_right'){p.x=cfg.width;continue;}
   if(p.id==='wall_left')continue;
   if(p.id==='ceiling'){p.width=cfg.width;continue;}
   const next=legacyScenePoint(cfg.stage,p.x,p.y);p.x=next.x;p.y=next.y;p.width*=next.scale;p.height*=next.scale;
  }
  for(const npc of cfg.memoryNPCs){const next=legacyScenePoint(cfg.stage,npc.x,npc.y+npc.height);npc.x=next.x;npc.y=next.y-npc.height;}
  for(const obj of cfg.interactables){
   const npc=cfg.memoryNPCs.find(n=>n.id===obj.id);
   if(npc){obj.x=npc.x;obj.y=npc.y;obj.height=npc.height;continue;}
   const next=legacyScenePoint(cfg.stage,obj.x,obj.y);obj.x=next.x;obj.y=next.y;obj.width*=next.scale;obj.height*=next.scale;
  }
 }
}
