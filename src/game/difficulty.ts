import type {StageConfig} from './levelData';
import {STORY_CHAPTERS,chapterForArea} from './campaign';
import {BOSS_TRAPS,CHASE_SEALS} from './encounters';
export function configureDifficulty(stages:Record<number,StageConfig>){
 for(const cfg of Object.values(stages)){const c=chapterForArea(cfg.stage);cfg.chapterTitleVi=`Chương ${c} — ${STORY_CHAPTERS[c-1].title}`;}
 stages[1].subtitleVi='Dấu vết đầu tiên và chiếc chốt cửa cũ';stages[5].subtitleVi='Đổi thời gian, giữ ba ấn và đừng để cái bóng đuổi kịp';stages[6].subtitleVi='Ba bẫy, hai thời điểm và một tiếng chuông cuối';
 const finalDoor=stages[4].interactables.find(o=>o.id==='final_door')!;Object.assign(finalDoor,{nameVi:'Cổng rừng ký ức',promptVi:'Mở cổng rừng',descriptionVi:'Chốt nhạc và mạch ánh sáng cùng giữ cổng.'});
 const sanctuaryDoor=stages[5].interactables.find(o=>o.id==='stage_exit_5')!;Object.assign(sanctuaryDoor,{nameVi:'Cổng vào lõi thời gian',promptVi:'Qua cổng ba ấn',descriptionVi:'Ba ấn cộng hưởng giữ lối vào tâm điểm.'});
 const greenhouse=stages[4];greenhouse.interactables.push({id:'greenhouse_console',name:'Greenhouse light circuit',nameVi:'Mạch ánh sáng nhà kính',descriptionVi:'Ba cần điều chỉnh dòng sáng.',promptVi:'Kiểm tra mạch ánh sáng',x:2600,y:390,width:44,height:70,type:'light_switch',timeline:'both',chapter:4,room:'stage_4',bakedIntoMap:true});
 const chase=stages[5];
 chase.platforms.push({id:'chase_past_gate',x:1450,y:190,width:26,height:290,type:'solid',timeline:'PAST',label:'Cột ký ức nguyên vẹn'},
 {id:'chase_present_gate',x:2250,y:170,width:26,height:310,type:'solid',timeline:'PRESENT',label:'Mảng đá sập'},
 {id:'chase_seal_gate',x:3430,y:120,width:28,height:360,type:'solid',timeline:'both',requiresPuzzleNotSolved:'chaseSealsComplete',label:'Cổng ba ấn'});
 for(const [i,seal]of CHASE_SEALS.entries())chase.interactables.push({id:`chase_seal_${i}`,name:`Seal ${i+1}`,nameVi:`Ấn cộng hưởng ${i+1}`,descriptionVi:'Giữ lại dấu ấn trong thời điểm đúng.',promptVi:`Chạm ấn ${i+1}`,x:seal.x,y:420,width:28,height:48,type:'temporal_anchor',timeline:'both',chapter:5,room:'stage_5'});
 const arena=stages[6];for(const [i,trap]of BOSS_TRAPS.entries())arena.interactables.push({id:`boss_trap_${i}`,name:`Temporal trap ${i+1}`,nameVi:`Bẫy cộng hưởng ${i+1}`,descriptionVi:'Cơ cấu giữ nhịp giữa hai thời điểm.',promptVi:`Thao tác bẫy ${i+1}`,x:trap.x,y:trap.y,width:34,height:i===0?50:60,type:'temporal_anchor',timeline:'both',chapter:6,room:'stage_6'});
 const anchor=arena.interactables.find(o=>o.id==='temporal_anchor')!;anchor.x=1055;anchor.y=315;anchor.height=50;
}
