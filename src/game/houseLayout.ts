import type {StageConfig} from './levelData';
import type {InteractableObject,PuzzleState} from '../types/game';
import {chapterRooms,currentPixelRoom} from './pixelLayout';

export function houseDestination(obj:InteractableObject,puzzles:PuzzleState){
 const destination=obj.destination;if(!destination)return null;
 return {destination,locked:!!(destination.requiresPuzzle&&!puzzles[destination.requiresPuzzle])};
}
export function migrateHouseLocation(stage:number,x:number){
 if(stage===2){const oldRoom=Math.min(2,Math.max(0,Math.floor(x/800)));return {stage:2,x:oldRoom===0?x+800:oldRoom===1?x+1600:x};}
 if(stage===3)return x<800?{stage:2,x}:{stage:3,x:x-800};
 return {stage,x};
}
export function houseCamera(stage:number,x:number,viewport:number,width:number){
 const isolated=stage===2||stage===4;
 const room=currentPixelRoom(stage,x),min=isolated?room.start:0,max=Math.max(min,(isolated?room.start+room.width:width)-viewport);
 return {min,max};
}
/** Doors are added after scale normalization; every destination uses actual world coordinates. */
export function configureHouseLayout(stages:Record<number,StageConfig>){
 const two=stages[2],three=stages[3],four=stages[4];
 const move=(cfg:StageConfig,id:string,x:number,y?:number)=>{for(const o of cfg.interactables)if(o.id===id){o.x=x;if(y!==undefined)o.y=y;}};
 two.spawnX=95;two.roomNameVi='Hành lang & các phòng trong nhà';two.subtitleVi='Những cánh cửa cũ và chiếc đồng hồ của Ông Ngoại';
 two.interactables=two.interactables.filter(o=>o.id!=='stage_exit_2');
 for(const id of ['clock','pocket_watch_box','family_portrait'])for(const o of two.interactables.filter(o=>o.id===id))o.x+=800;
 move(two,'memory_kitchen',2740);
 two.platforms=two.platforms.filter(p=>p.id!=='living_hallway_door');
 const door=(cfg:StageConfig,id:string,name:string,x:number,destination:NonNullable<InteractableObject['destination']>)=>cfg.interactables.push({id,name,nameVi:name,descriptionVi:name,promptVi:name,x,y:370,width:32,height:104,timeline:'both',room:`stage_${cfg.stage}`,chapter:cfg.stage,type:'room_door',bakedIntoMap:true,destination});
 door(two,'hall_front','Ra hiên nhà',45,{stage:1,x:1050});
 door(two,'hall_bedroom','Phòng của Linh',228,{stage:4,x:90,requiresPuzzle:'motherDiaryCh3Read',lockedMessage:'Cửa phòng Linh đang khóa. Trên ổ khóa có buộc một sợi chỉ đỏ.'});
 door(two,'hall_kitchen','Nhà bếp',326,{stage:2,x:2460});
 door(two,'hall_living','Phòng khách',427,{stage:2,x:860});
 door(two,'hall_workshop','Xưởng đồng hồ',702,{stage:2,x:1660});
 door(two,'living_return','Ra hành lang',830,{stage:2,x:445});
 door(two,'living_return_right','Ra hành lang',1520,{stage:2,x:445});
 door(two,'workshop_return','Ra hành lang',1635,{stage:2,x:695});
 door(two,'workshop_return_right','Ra hành lang',2340,{stage:2,x:695});
 door(two,'kitchen_return','Ra hành lang',2435,{stage:2,x:340});
 door(two,'kitchen_yard','Mở cửa ra sân sau',3115,{stage:3,x:90,requiresPuzzle:'clockInspectedPresent',lockedMessage:'Chốt cửa sau vẫn bị dây cáp giữ. Sợi cáp chạy về phía phòng khách.'});
 // Separate interiors cannot be crossed by walking through the image boundary.
 for(const cfg of [two,four])for(const room of chapterRooms(cfg.stage).slice(1))cfg.platforms.push({id:`wall_room_${cfg.stage}_${room.index}`,x:room.start-8,y:0,width:16,height:600,type:'solid',timeline:'both',bakedIntoMap:true});
 three.chapterTitleVi='Chương 3 — Dấu vết bên giếng';three.roomNameVi='Sân sau & giếng cũ';three.subtitleVi='Sợi chỉ đỏ, chiếc gàu kẹt và hộp sắt của Mẹ';three.spawnX=90;three.spawnY=396;
 three.platforms=three.platforms.filter(p=>p.id==='ground_main'||p.id.startsWith('wall_')||p.id==='ceiling');
 three.interactables=three.interactables.filter(o=>['hallway_pulley','mother_diary_ch3','memory_well'].includes(o.id));three.memoryNPCs=[];
 move(three,'hallway_pulley',390,400);move(three,'mother_diary_ch3',480,415);move(three,'memory_well',970,415);
 const pulley=three.interactables.find(o=>o.id==='hallway_pulley')!;Object.assign(pulley,{nameVi:'Tay quay giếng cũ',promptVi:'Quay tay kéo gàu giếng',bakedIntoMap:true});
 const diary=three.interactables.find(o=>o.id==='mother_diary_ch3')!;Object.assign(diary,{nameVi:'Hộp sắt trong gàu giếng',promptVi:'Mở hộp sắt trong gàu',bakedIntoMap:true});
 door(three,'yard_kitchen','Trở vào nhà bếp',65,{stage:2,x:3070});
 door(three,'yard_garden','Mở cổng ra vườn',1080,{stage:4,x:900,requiresPuzzle:'motherDiaryCh3Read',lockedMessage:'Cổng vườn bị khóa. Sợi chỉ đỏ vướng trên tay quay giếng.'});
 door(four,'bedroom_return','Ra hành lang',55,{stage:2,x:250});
 door(four,'garden_yard','Trở lại sân sau',835,{stage:3,x:1030});
 door(four,'garden_greenhouse','Vào nhà kính',1910,{stage:4,x:2050});
 door(four,'greenhouse_garden','Ra khu vườn',2030,{stage:4,x:1850});
}
