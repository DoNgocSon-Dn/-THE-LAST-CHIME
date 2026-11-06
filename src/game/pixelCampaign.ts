import { PLAYER_HEIGHT, CHILD_HEIGHT, ADULT_HEIGHT, ELDER_HEIGHT } from './entityScale';
import type {StageConfig} from './levelData';
import type {Platform,InteractableObject} from '../types/game';
import {CHAPTER_ROOMS,ROOM_WIDTH} from './pixelLayout';
const ledge=(id:string,x:number,y:number,width:number,baked=true):Platform=>({id:(baked?'terrain_':'')+id,x,y,width,height:14,type:'one-way',timeline:'both'});
const note=(id:string,name:string,x:number,stage:number):InteractableObject=>({id,name,nameVi:name,descriptionVi:name,promptVi:'Đọc dấu vết ký ức',x,y:415,width:30,height:45,timeline:'both',room:`stage_${stage}`,chapter:stage,type:'journal_entry'});

/** Thirteen supplied maps form thirteen rooms across the existing six story chapters. */
export function configurePixelCampaign(stages:Record<number,StageConfig>){
  for(const cfg of Object.values(stages)){
    cfg.width=CHAPTER_ROOMS[cfg.stage].length*ROOM_WIDTH;
    cfg.platforms=cfg.platforms.map(p=>p.id==='ground_main'?{...p,width:cfg.width}:p.id==='wall_right'?{...p,x:cfg.width}:p.id==='ceiling'?{...p,width:cfg.width}:p);
    const move=(id:string,x:number,y?:number,w?:number,h?:number)=>{
      for(const obj of cfg.interactables)if(obj.id===id)Object.assign(obj,{x,...y!==undefined?{y}:{},...w!==undefined?{width:w}:{},...h!==undefined?{height:h}:{}});
    };
    if(cfg.stage===1){
      cfg.spawnX=220;
      cfg.interactables=cfg.interactables.filter(o=>o.id==='mother_note_ch1'||o.id==='stage_exit_1');
      move('mother_note_ch1',490,421,18,12);
      move('stage_exit_1',1075,354,50,92);
      cfg.interactables.find(o=>o.id==='stage_exit_1')!.promptVi='Mở cửa vào nhà';
      cfg.platforms=cfg.platforms.filter(p=>p.id!=='porch_bench'&&p.id!=='foyer_table');
      cfg.subtitleVi='Làm quen di chuyển, nhảy và tương tác trước khi vào nhà';
    }
    if(cfg.stage===2){
      move('clock',705,300,85,180);
      cfg.interactables=cfg.interactables.filter(o=>o.id!=='fireplace');
      cfg.interactables.push({id:'pocket_watch_box',name:'Grandfather pocket watch',nameVi:'Đồng hồ bỏ túi của Ông Ngoại',descriptionVi:'Chiếc đồng hồ nằm trên bàn cạnh đèn trong phòng khách.',promptVi:'Nhặt đồng hồ bỏ túi',x:592,y:410,width:16,height:14,timeline:'PRESENT',room:'stage_2',chapter:2,type:'pocket_watch'});move('clock_gear',2835,398,20,20);move('npc_mother_ch2',2680,416);move('fireplace',1945,410);move('stage_exit_2',3510);move('family_portrait',410,335,85,65);
      const portrait=cfg.interactables.find(o=>o.id==='family_portrait')!;
      portrait.timeline='PAST';
      cfg.interactables.push({...portrait,timeline:'PRESENT',x:285,y:415,width:32,height:26,bakedIntoMap:false});
      cfg.platforms=cfg.platforms.filter(p=>p.id.startsWith('ground')||p.id.startsWith('wall')||p.id==='ceiling'||p.id==='living_hallway_door');
      for(const p of cfg.platforms)if(p.id==='living_hallway_door')Object.assign(p,{x:3515,y:350,height:130,bakedIntoMap:true});
      cfg.memoryNPCs[0].x=2680;
      cfg.interactables.push(note('memory_kitchen','Bữa cơm còn dang dở',1710,2),note('memory_workshop','Ghi chép về chiếc kim',3080,2));
      cfg.memoryNPCs.push({id:'npc_grandfather',character:'ONG',nameVi:'Ký ức Ông Ngoại',x:3280,y:414,width:26,height:66,timeline:'PAST',stage:2,ambientQuoteVi:'Đồng hồ giữ ký ức, không giữ được một đời người.'});
      cfg.interactables.push({...note('npc_grandfather','Ký ức Ông Ngoại',3280,2),timeline:'PAST',type:'npc_memory',y:414,height:66});
    }
    if(cfg.stage===3){move('mother_diary_ch3',1680);move('stage_exit_3',2310);cfg.memoryNPCs[0].x=1640;cfg.interactables.push(note('memory_well','Sợi dây bên giếng cũ',2010,3));}
    if(cfg.stage===4){
      move('mother_note_ch4',2830,402);move('final_door',3510);for(const p of cfg.platforms)if(p.id==='final_door_barrier')Object.assign(p,{x:3515,y:350,height:130,bakedIntoMap:true});
      cfg.interactables.push(note('memory_garden','Chiếc nơ trong vườn',1870,4),note('memory_greenhouse','Bản đồ rừng ký ức',3100,4));
    }
    if(cfg.stage===5){
      move('stage_exit_5',3500,300,48,90);
      cfg.platforms=cfg.platforms.filter(p=>p.id!=='ground_main');
      cfg.platforms.push({id:'ground_forest',x:0,y:480,width:1200,height:120,type:'solid',timeline:'both'},
        {id:'ground_cave',x:1200,y:480,width:680,height:120,type:'solid',timeline:'both'},
        {id:'ground_fracture',x:2400,y:480,width:300,height:120,type:'solid',timeline:'both'});
      cfg.platforms.push(ledge('cave1',1890,460,85),ledge('cave2',1980,414,75),ledge('cave3',2060,370,125),ledge('cave4',2200,425,75),ledge('cave5',2290,450,65),ledge('cave_exit',2350,455,50,false));
      // Short repair planks cross the water and follow the staircase drawn in map 12.
      cfg.platforms.push(ledge('water1',2710,475,85,false),ledge('water2',2800,450,80,false),ledge('water3',2890,425,80,false));
      for(let i=0;i<6;i++)cfg.platforms.push(ledge(`broken_stair${i}`,2890+i*22,425-i*25,45));
      cfg.platforms.push(ledge('house_island',3020,300,215),ledge('house_right',3240,325,130),ledge('last_island',3480,375,120));
    }
    if(cfg.stage===6){
      cfg.spawnY=320;
      cfg.platforms=cfg.platforms.filter(p=>p.id.startsWith('wall')||p.id==='ceiling');
      cfg.platforms.push(ledge('sanctuary_entry',0,364,169),ledge('sanctuary_drop',190,428,125),ledge('sanctuary_base',310,465,180),ledge('sanctuary_mid',350,398,150),ledge('sanctuary_high',420,349,180),ledge('sanctuary_center',580,372,130),ledge('sanctuary_bridge',710,383,130),ledge('sanctuary_end',830,375,370));
      move('final_diary_ch6',280,386,30,40);move('temporal_anchor',650,312,40,60);move('npc_linh_ch6',950,327,30,48);move('final_core',1090,300,48,65);
      cfg.memoryNPCs[0].x=950;cfg.memoryNPCs[0].y=327;
    }
    cfg.spawnY+=44-PLAYER_HEIGHT;
    for(const npc of cfg.memoryNPCs){
      const feet=npc.y+npc.height;
      npc.height=npc.character==='LINH'?CHILD_HEIGHT:npc.character==='ONG'?ELDER_HEIGHT:ADULT_HEIGHT;
      npc.y=feet-npc.height;
      const interaction=cfg.interactables.find(o=>o.id===npc.id);
      if(interaction){interaction.y=npc.y;interaction.height=npc.height;}
    }
    for(const obj of cfg.interactables)if(obj.id.startsWith('stage_exit_')||obj.id==='final_door'||(obj.id==='family_portrait'&&obj.timeline==='PAST')||(obj.id==='clock'&&cfg.stage===2))obj.bakedIntoMap=true;
  }
}

