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
      move('stage_exit_5',3500,288,48,80);
      cfg.platforms=cfg.platforms.filter(p=>p.id!=='ground_main');
      cfg.platforms.push({id:'ground_forest',x:0,y:480,width:1200,height:120,type:'solid',timeline:'both'},
        {id:'ground_cave',x:1200,y:480,width:680,height:120,type:'solid',timeline:'both'},
        {id:'ground_fracture',x:2400,y:480,width:300,height:120,type:'solid',timeline:'both'});
      cfg.platforms.push(ledge('cave_lip',1838,475,68),ledge('cave1',1907,440,55),ledge('cave2',1987,399,59),ledge('cave3',2072,365,124),ledge('cave4',2198,434,63),ledge('cave5',2275,460,60),ledge('cave_exit',2317,353,83));
      // Short repair planks cross the water and follow the staircase drawn in map 12.
      cfg.platforms.push(ledge('water1',2720,480,80,false),ledge('water2',2805,480,80,false),ledge('water3',2890,480,45,false));
      for(let i=0;i<10;i++)cfg.platforms.push({...ledge(`broken_stair${i}`,2900+i*12,465-i*14,20),stepHeight:16});
      cfg.platforms.push(ledge('house_island',3015,304,215),ledge('house_right',3238,319,133),ledge('last_island',3476,368,124));
    }
    if(cfg.stage===6){
      cfg.spawnY=320;
      cfg.platforms=cfg.platforms.filter(p=>p.id.startsWith('wall')||p.id==='ceiling');
      cfg.platforms.push(ledge('sanctuary_entry',0,364,169),ledge('sanctuary_drop',190,428,49),ledge('sanctuary_lower_step1',239,443,23),ledge('sanctuary_lower_step2',262,454,23),ledge('sanctuary_base',280,465,215),ledge('sanctuary_mid',350,398,150),ledge('sanctuary_high',400,338,185),ledge('sanctuary_center',580,372,130),ledge('sanctuary_end',830,375,370));
      // The rope bridge sags in the middle; follow its boards instead of floating over it.
      for(const [i,y]of [383,391,397,390].entries())cfg.platforms.push({...ledge(`sanctuary_bridge_${i}`,710+i*30,y,32),stepHeight:16});
      move('final_diary_ch6',280,425,30,40);move('temporal_anchor',650,312,40,60);move('npc_linh_ch6',950,327,30,48);move('final_core',1090,310,48,65);
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
    if(cfg.stage===5)cfg.interactables.find(o=>o.id==='stage_exit_5')!.bakedIntoMap=false;
  }
}

