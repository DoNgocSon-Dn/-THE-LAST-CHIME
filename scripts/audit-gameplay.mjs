// Browser integration audit: run on the local Vite server via DevTools.
export async function runGameplayAudit(){
 const [{GameEngine},{STAGE_CONFIGS},{INITIAL_PUZZLE_STATE},{getActivePlatforms}]=await Promise.all([
  import('/src/game/engine.ts'),import('/src/game/levelData.ts'),import('/src/game/puzzles.ts'),import('/src/game/physics.ts'),
 ]);
 const log=[],notifications=[];
 const check=(condition,message)=>{if(!condition)throw new Error(message+'; last notifications: '+notifications.slice(-3).join(' | '));};
 const callbacks={onTimelineChange(){},onCooldownChange(){},onNearbyPrompt(){},onStartDialogue(){},onStageTransition(){},onTriggerFinalChoice(){log.push('final-choice');},onTriggerEnding(){log.push('ending');},onPuzzleUpdate(){},onRoomChange(){},onNotification(m){notifications.push(m);},onOpenMechanism(){}};
 const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;
 const e=new GameEngine(canvas,callbacks);e.unbindEvents();e.saveGame=()=>{};
 e.puzzles={...INITIAL_PUZZLE_STATE};e.loadStage(1,false);
 function tick(count){for(let i=0;i<count;i++){e.update(1/60);e.justPressed.clear();}}
 function position(id,era){
  e.gameState='playing';e.timeline=era;e.switchCooldown=0;e.firstWarpBeat=0;
  const cfg=STAGE_CONFIGS[e.puzzles.currentStage],obj=cfg.interactables.find(o=>o.id===id&&(o.timeline==='both'||o.timeline===era));
  check(obj,'Missing '+id+' in stage '+cfg.stage);
  const center=obj.x+obj.width/2,x=center-e.player.width/2;
  const floors=getActivePlatforms(cfg.platforms,era,e.puzzles).filter(p=>(p.id.startsWith('ground')||p.id.startsWith('terrain')||p.type==='one-way')&&x+e.player.width>p.x&&x<p.x+p.width);
  floors.sort((a,b)=>Math.abs(a.y-obj.y-obj.height)-Math.abs(b.y-obj.y-obj.height));
  check(floors.length,'No support for '+id);
  Object.assign(e.player,{x,y:floors[0].y-e.player.height,vx:0,vy:0,isGrounded:true,interactCooldown:0,interactAnimTimer:0});
  return obj;
 }
 function use(id,era='PRESENT',answer){
  position(id,era);e.checkNearbyInteractables(STAGE_CONFIGS[e.puzzles.currentStage]);
  check(e.nearbyInteractable?.id===id,'Nearest interaction is '+e.nearbyInteractable?.id+' instead of '+id);
  const result=e.triggerInteract();
  if(answer){check(e.mechanismContext,'No mechanism opened for '+id);check(e.submitMechanism(e.mechanismContext.id,answer)===true,'Mechanism failed: '+id);}
  e.gameState='playing';e.firstWarpBeat=0;e.puzzles.firstShiftReactionSeen=true;
  log.push(id);return result;
 }
 try{
  use('mother_note_ch1');use('stage_exit_1','PRESENT',[1,2]);check(e.puzzles.currentStage===2,'Front door did not enter house');
  use('hall_living');use('pocket_watch_box');check(e.puzzles.hasWatch,'Watch missing');
  use('clock');use('living_return_right','PAST');use('clock_gear','PAST');use('workshop_return','PAST');
  use('clock','PAST',[3,15]);use('clock');check(e.puzzles.clockInspectedPresent,'Clock cable remains locked');
  use('living_return');use('hall_kitchen');use('kitchen_yard');check(e.puzzles.currentStage===3,'Backyard door failed');
  use('hallway_pulley');use('hallway_pulley','PAST',[2,1]);use('mother_diary_ch3');check(e.puzzles.motherDiaryCh3Read,'Well diary missing');
  use('yard_kitchen');use('kitchen_return');use('hall_bedroom','PAST');
  use('light_switch','PAST');use('light_target','PAST');use('light_target');check(e.puzzles.lightRuneFound,'Music clues incomplete');
  use('music_box','PAST',[2,4,5]);use('bedroom_return','PAST');use('hall_kitchen','PAST');use('kitchen_yard','PAST');use('yard_garden','PAST');
  use('memory_garden','PAST');use('garden_greenhouse','PAST');use('mother_note_ch4');use('greenhouse_console');use('greenhouse_console','PAST',[1,0,0]);
  use('final_door');check(e.puzzles.currentStage===5,'Forest gate failed');
  for(const [i,era]of ['PAST','PRESENT','PAST'].entries())use('chase_seal_'+i,era);
  check(e.puzzles.chaseSealsComplete,'Seals incomplete');
  position('stage_exit_5','PAST');e.pursuer.stagger=10;tick(1);check(e.puzzles.currentStage===5,'Chapter changes without using portal');
  use('stage_exit_5','PAST');check(e.puzzles.currentStage===6,'Visible portal failed');
  use('final_diary_ch6');
  for(let i=0;i<3;i++){
   position('boss_trap_'+i,'PAST');e.pursuer.x=e.player.x+55;e.pursuer.y=e.player.y;e.pursuer.phase='PAST';e.pursuer.phaseDelay=0;
   e.triggerInteract();check(e.puzzles.bossArmedTrap===i,'Trap did not arm');
   e.switchTimeline();tick(80);check(e.puzzles.bossExposedTrap===i,'Enemy failed to expose at the armed trap');
   e.player.interactCooldown=0;e.triggerInteract();check(e.puzzles.bossHits?.includes(i),'Trap did not discharge');
   log.push('live-boss-trap-'+i);
  }
  tick(1);check(!e.pursuer.active,'Defeated boss remains active');
  e.player.y=650;tick(1);check(e.puzzles.bossHits.length===3&&!e.pursuer.active,'Falling revives the defeated boss');
  use('temporal_anchor','PAST',[3,1,5]);check(e.puzzles.finalCoreAligned,'Final anchor did not align');
  use('final_core');check(log.includes('final-choice'),'Final choice never opens');
  e.completeWithEnding('ACCEPT_TRUTH');check(e.gameState==='ending','Release ending failed');
  e.completeWithEnding('ETERNAL_MEMORY');check(e.puzzles.chosenEnding==='ETERNAL_MEMORY','Memory ending failed');
  const completed={seals:e.puzzles.chaseSeals,bossHits:e.puzzles.bossHits};
  const saveKey='THE_LAST_CHIME_PIXEL_SAVE_V1',previous=localStorage.getItem(saveKey);
  try{
   localStorage.setItem(saveKey,JSON.stringify({campaignVersion:2,houseLayoutVersion:1,characterScaleVersion:3,sceneScaleVersion:2,spawnVersion:3,
    player:{x:2100,y:480-e.player.height},timeline:'PAST',puzzles:{...INITIAL_PUZZLE_STATE,currentStage:5,storyChapter:3,hasWatch:true,watchCollected:true,chaseCompleted:true},
    checkpoint:{chapter:5,x:2100,y:480-e.player.height,timeline:'PAST'}}));
   check(e.loadSave(),'Legacy save failed to load');
   check(e.player.y+e.player.height===365&&e.checkpoint.y+e.player.height===365,'Legacy cave save/checkpoint did not move to the corrected ledge');
  }finally{if(previous===null)localStorage.removeItem(saveKey);else localStorage.setItem(saveKey,previous);}
  return {passed:true,interactions:log.length,chapters:4,...completed,endings:2,legacySaveMigration:true,log};
 }finally{e.stop();e.unbindEvents();}
}
