import {test,expect,type Page} from '@playwright/test';

async function seed(page:Page,keys:Record<string,string>={}){
 await page.addInitScript(({keys})=>{
  if(!localStorage.getItem('THE_LAST_CHIME_CONTROLS'))localStorage.setItem('THE_LAST_CHIME_CONTROLS',JSON.stringify({keys,difficulty:'normal'}));
  if(!localStorage.getItem('THE_LAST_CHIME_PIXEL_SAVE_V1'))localStorage.setItem('THE_LAST_CHIME_PIXEL_SAVE_V1',JSON.stringify({campaignVersion:2,houseLayoutVersion:1,characterScaleVersion:3,sceneScaleVersion:2,spawnVersion:3,terrainVersion:2,
   player:{x:1100,y:424},timeline:'PRESENT',checkpoint:{chapter:2,x:1100,y:424,timeline:'PRESENT'},
   puzzles:{currentStage:2,storyChapter:2,hasWatch:true,watchCollected:true,testedTimelineSwitch:true,firstShiftReactionSeen:true,clockGearFound:true,clockRepaired:true,musicBoxPlayed:true},
  }));
 },{keys});
}
async function ready(page:Page){
 await expect(page.getByTestId('game-canvas')).toBeVisible();
 await page.waitForFunction(()=>{const e=(window as any).__gameEngine;return e?.isReady()&&e.gameState==='playing';});
}

test('settings persist rebindings; HUD displays configured labels',async({page},info)=>{
 await seed(page);await page.goto('/');
 await page.getByRole('button',{name:'Cài đặt',exact:true}).click();
 for(const [action,key]of [['Đi trái','j'],['Đi phải','l'],['Nhảy','x'],['Đổi thời gian','z'],['Tương tác','f'],['Sóng chuông','c'],['Lướt','v']]){
  const button=page.getByRole('button',{name:`Đổi phím ${action}`,exact:true});
  await button.click();await page.keyboard.press(key);await expect(button).toHaveText(key.toUpperCase());
 }
 await page.getByRole('radio',{name:/^Dễ/}).check();
 await expect(page.getByRole('dialog')).toContainText('Hội thoại dùng F / X hoặc Enter.');
 await page.screenshot({path:info.outputPath('settings.png')});
 // The persisted data survives reload without resetting it through the init fixture.
 const settings=await page.evaluate(()=>localStorage.getItem('THE_LAST_CHIME_CONTROLS'));
 expect(JSON.parse(settings!).keys.interact).toBe('f');
  await page.reload();await page.getByRole('button',{name:'Cài đặt',exact:true}).click();
  await expect(page.getByRole('button',{name:'Đổi phím Tương tác',exact:true})).toHaveText('F');
  await expect(page.getByRole('radio',{name:/^Dễ/})).toBeChecked();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.getByRole('button',{name:'Đóng cửa sổ'}).click();
 await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();await ready(page);
 await expect(page.locator('.time-dial')).toHaveText('Z');
 await expect(page.locator('.temporal-controls')).toContainText('V');
 await expect(page.locator('.temporal-controls')).toContainText('C');
 await expect(page.locator('.hud-objective')).toContainText('Nhấn Z');
 await page.evaluate(async()=>{const path='/src/game/levelData.ts';const {STAGE_CONFIGS}=await import(/* @vite-ignore */path);const e=(window as any).__gameEngine,clock=STAGE_CONFIGS[2].interactables.find((o:any)=>o.id==='clock');e.player.x=clock.x+clock.width/2-e.player.width/2;e.player.y=480-e.player.height;e.player.vx=0;e.player.vy=0;});
 await expect(page.locator('.interaction-control kbd')).toHaveText('F');
 await page.screenshot({path:info.outputPath('hud.png')});
});

test('dialogue consumes rebound keys once, rejects old keys and key repeat',async({page},info)=>{
 await seed(page,{interact:'f',jump:'x',time:'z',dash:'v',pulse:'c'});await page.goto('/?autostart=1');await ready(page);
 await page.evaluate(()=>{const e=(window as any).__gameEngine;e.callbacks.onStartDialogue([
  {speaker:'AN',speakerName:'An',emotion:'normal',text:'Dùng [Q] để đổi thời gian và [Shift] để lướt.'},
  {speaker:'AN',speakerName:'An',emotion:'normal',text:'Nhấn [R] khi cái bóng tới gần. '.repeat(10)},
 ]);});
 const box=page.getByTestId('dialogue-box');await expect(box).toContainText('[F] / [X]');
 await page.keyboard.press('f');await expect(box).toContainText('Dùng [Z] để đổi thời gian và [V] để lướt.');
 for(const key of ['e','Space']){await page.keyboard.press(key);await expect(box).toContainText('(1/2)');}
 await page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'f',repeat:true,bubbles:true})));
 await expect(box).toContainText('(1/2)');
 await page.keyboard.press('f');await expect(box).toContainText('(2/2)');
 await page.keyboard.press('x');await expect(box).toContainText('Nhấn [C] khi cái bóng tới gần.');
 await page.screenshot({path:info.outputPath('dialogue.png')});
 await page.keyboard.press('x');await expect(box).toHaveCount(0);
 // A consumed dialogue key must not leak into the resumed game.
 expect(await page.evaluate(()=>Array.from((window as any).__gameEngine.keysPressed))).not.toContain('e');
 await page.keyboard.press('q');expect(await page.evaluate(()=>(window as any).__gameEngine.timeline)).toBe('PRESENT');
 await page.keyboard.press('z');await expect(page.locator('.time-control strong')).toHaveText('Quá khứ');
});

test('engine difficulty changes pursuit/cooldown/exposure while normal stays exact',async({page})=>{
 await seed(page);await page.goto('/?autostart=1');await ready(page);
 const results=await page.evaluate(async()=>{
  const path='/src/game/controls.ts';const controls=await import(/* @vite-ignore */path);const e=(window as any).__gameEngine;e.stop();
  const results=[];
  for(const difficulty of ['easy','normal','hard']){
   controls.setDifficulty(difficulty);e.loadStage(5,false);e.player.x=1000;e.player.y=424;
   Object.assign(e.pursuer,{x:50,y:424,phase:'PRESENT',phaseDelay:0,stagger:0});e.contactCooldown=10;e.update(.1);
   const speed=(e.pursuer.x-50)/.1;e.switchCooldown=0;e.switchTimeline();const cooldown=e.switchCooldown;
   const windows=[];
   for(let hits=0;hits<3;hits++){
    e.loadStage(6,false);e.puzzles.bossHits=Array.from({length:hits},(_,i)=>i+1);e.timeline='PRESENT';
    Object.assign(e.pursuer,{x:450,y:398-e.pursuer.height,phase:'PRESENT',phaseDelay:0,stagger:0});
    e.puzzles.bossArmedTrap=0;e.bossArmSeconds=10;e.bossExposedSeconds=0;e.update(.01);
    windows.push(e.bossExposedSeconds);
   }
   results.push({difficulty,speed,cooldown,windows});
  }
  controls.setDifficulty('normal');return results;
 });
 for(const [i,speedScale,windowScale,cooldown]of [[0,.85,1.4,1.5],[1,1,1,3],[2,1.08,.8,4.5]]){
  expect(results[i].speed).toBeCloseTo(145*speedScale,8);expect(results[i].cooldown).toBe(cooldown);
  for(let hits=0;hits<3;hits++)expect(results[i].windows[hits]).toBeCloseTo((3-hits*.6)*windowScale,8);
 }
});

test('third hint reveals the answer and follows interaction/time bindings',async({page},info)=>{
 await seed(page,{interact:'f',time:'z'});await page.goto('/?autostart=1');await ready(page);
 await page.evaluate(()=>{
  const e=(window as any).__gameEngine;e.stop();e.puzzles.bossHits=[0,1,2];e.puzzles.finalDiaryCh6Read=true;e.puzzles.finalCoreAligned=false;
  e.loadStage(6,false,true);e.callbacks.onPuzzleUpdate({...e.puzzles});e.render();
 });
 for(let level=0;level<3;level++)await page.getByRole('button',{name:/^Gợi ý/}).click();
 await expect(page.locator('.hud-hint-line').last()).toContainText('ngoài 3, vòng giữa 1, vòng trong 5');
 await expect(page.locator('.hud-hint-line').last()).toContainText('Q về Quá khứ'.replace('Q','Z'));
 await expect(page.getByRole('button',{name:'Hết gợi ý'})).toBeDisabled();
 await page.screenshot({path:info.outputPath('hint-level-3.png')});
});
