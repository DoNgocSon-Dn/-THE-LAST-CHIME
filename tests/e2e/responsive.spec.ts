import {test,expect,type Page} from '@playwright/test';

export async function openChapter(page:Page,stage=5){
 await page.addInitScript(()=>{sessionStorage.setItem('THE_LAST_CHIME_DEV_MODE','1');localStorage.setItem('THE_LAST_CHIME_PIXEL_SAVE_V1',JSON.stringify({campaignVersion:2,houseLayoutVersion:1,characterScaleVersion:3,sceneScaleVersion:2,spawnVersion:3,terrainVersion:2,player:{x:95,y:424},timeline:'PRESENT',puzzles:{currentStage:2,storyChapter:2,hasWatch:true,watchCollected:true,testedTimelineSwitch:true,firstShiftReactionSeen:true}}));});
 await page.goto('/?autostart=1');
 await page.waitForFunction(()=>{const e=(window as any).__gameEngine;return e?.isReady()&&e.gameState==='playing';});
 await page.evaluate(stage=>{const e=(window as any).__gameEngine;e.stop();e.loadStage(stage,false);e.callbacks.onNotification('');e.render();},stage);
 await expect(page.locator('.hud-location>span')).toContainText(stage===5?'CHƯƠNG 3':'CHƯƠNG 4');
}

async function hudGeometry(page:Page){
 return page.evaluate(()=>{
  const selectors=['.hud-header','.encounter-hud','.hud-objective-bar','.hud-objective-details','.hud-objective:not(.hud-objective-compact)','.hud-hint-btn','.time-control','.interaction-control','.hud-toast','.hud-journal','.touch-controls>div'];
  const elements=selectors.flatMap(s=>Array.from(document.querySelectorAll<HTMLElement>(s))).filter(el=>el.checkVisibility()&&el.getBoundingClientRect().width>0);
  const collisions:string[]=[],outside:string[]=[];
  for(const el of elements){const a=el.getBoundingClientRect();if(a.left<-.5||a.top<-.5||a.right>innerWidth+.5||a.bottom>innerHeight+.5)outside.push(el.className);
   for(const other of elements){if(el===other||el.contains(other)||other.contains(el))continue;const b=other.getBoundingClientRect();if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)collisions.push(`${el.className} / ${other.className}`);}
  }
  const hint=document.querySelector<HTMLElement>('.hud-hint-btn');const r=hint?.getBoundingClientRect();
  const hit=r&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
  return {collisions,outside,hintUncovered:!!hint&&(hint===hit||hint.contains(hit!))};
 });
}

test('portrait widens the camera and rotation preserves physics and difficulty',async({page})=>{
 await openChapter(page);
 const before=await page.evaluate(()=>{const e=(window as any).__gameEngine;return {x:e.player.x,y:e.player.y,pursuerX:e.pursuer.x,pursuerY:e.pursuer.y,cooldown:e.switchCooldown,worldWidth:e.canvas.width/e.viewZoom};});
 if(page.viewportSize()!.height>page.viewportSize()!.width)expect(before.worldWidth).toBeGreaterThanOrEqual(519.99);
 const original=page.viewportSize()!;await page.setViewportSize({width:original.height,height:original.width});
 await page.waitForFunction(()=>{const e=(window as any).__gameEngine;return Math.abs(e.canvas.width/e.canvas.height-innerWidth/innerHeight)<.01;});
 const after=await page.evaluate(()=>{const e=(window as any).__gameEngine;return {x:e.player.x,y:e.player.y,pursuerX:e.pursuer.x,pursuerY:e.pursuer.y,cooldown:e.switchCooldown};});
 expect(after).toEqual({x:before.x,y:before.y,pursuerX:before.pursuerX,pursuerY:before.pursuerY,cooldown:before.cooldown});
});

test('dust remains visible past 400ms and reduced motion suppresses bursts and shake',async({page},info)=>{
 await openChapter(page);
 const particles=await page.evaluate(()=>{const e=(window as any).__gameEngine,r=e.renderer;r.bursts=[];r.burst(e.player.x,e.player.y+e.player.height,'dust');const sizes=r.bursts.map((p:any)=>p.size);r.update(.4,e.timeline);e.render();return {sizes,remaining:r.bursts.length};});
 expect(particles.remaining).toBe(4);expect(Math.min(...particles.sizes)).toBeGreaterThan(3);
 await page.screenshot({path:info.outputPath('dust-400ms.png')});
 await page.emulateMedia({reducedMotion:'reduce'});
 const reduced=await page.evaluate(async()=>{const path='/src/game/renderer.ts';const {GameRenderer}=await import(/* @vite-ignore */path);const r=new GameRenderer();r.burst(100,100,'dust');r.burst(100,100,'spark');r.shake();return {particles:r.bursts.length,shake:r.shakeTime};});
 expect(reduced).toEqual({particles:0,shake:0});
});

test('HUD rows, expanded hints and touch targets do not overlap in chapters 3 and 4',async({page},info)=>{
 for(const stage of [5,6]){
  await openChapter(page,stage);
  const compact=page.viewportSize()!.width<=700||page.viewportSize()!.height<=500;
  if(compact){
   await expect(page.locator('.hud-objective-chip')).toHaveAttribute('aria-expanded','false');
   await expect(page.locator('.hud-hint-btn')).toHaveText('Gợi ý');
  }
  expect(await hudGeometry(page)).toEqual({collisions:[],outside:[],hintUncovered:true});
  for(let level=0;level<3;level++){
   await page.locator('.hud-hint-btn').click();
   await expect(page.locator('.hud-hint-line')).toHaveCount(level+1);
   expect(await hudGeometry(page)).toEqual({collisions:[],outside:[],hintUncovered:true});
  }
  await page.screenshot({path:info.outputPath(`chapter-${stage===5?3:4}-expanded.png`)});
  if(compact){await page.getByRole('button',{name:'Thu gọn mục tiêu'}).click();await expect(page.locator('.hud-objective-details')).toHaveCount(0);}
  await page.evaluate(stage=>{const e=(window as any).__gameEngine;e.player.x=stage===5?900:400;e.player.y=(stage===5?480:398)-e.player.height;e.player.vx=0;e.player.vy=0;e.update(1/60);e.justPressed.clear();},stage);
  await expect(page.locator('.interaction-control')).toBeVisible();
  expect(await hudGeometry(page)).toEqual({collisions:[],outside:[],hintUncovered:true});
  await page.getByRole('button',{name:'Mở sổ tay'}).click();await expect(page.locator('.hud-journal')).toBeVisible();
  const journalGeometry=await hudGeometry(page);expect(journalGeometry.collisions).toEqual([]);expect(journalGeometry.outside).toEqual([]);
  await page.getByRole('button',{name:'Đóng sổ tay'}).click();
  await page.evaluate(()=>{const e=(window as any).__gameEngine;e.callbacks.onStartDialogue([{speaker:'AN',speakerName:'An',emotion:'normal',text:'Mình cần đi tiếp và giữ đủ ba ấn.'}]);});
  await expect(page.getByTestId('dialogue-box')).toBeVisible();
  await expect(page.locator('.game-hud')).toBeHidden();await expect(page.locator('.touch-controls')).toBeHidden();
  await page.keyboard.press('Escape');
 }
});

async function buttonReachable(page:Page,selector:string){
 const button=page.locator(selector);await button.scrollIntoViewIfNeeded();
 expect(await button.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&(hit===el||el.contains(hit));})).toBe(true);
}

test('story pages and endings keep navigation reachable and text unclipped',async({page},info)=>{
 for(const view of ['story','choice','ending-accept','ending-eternal']){
  await page.goto(`/tests/e2e/ui-fixture.html?view=${view}`);await page.evaluate(()=>document.fonts.ready);
  const panel=page.locator(view==='story'?'.opening-comic-paper':'.memory-panel');
  expect(await panel.evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;})).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(view==='story'){
   for(let n=1;n<=3;n++){
    await page.locator('.story-book-spread').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
    await buttonReachable(page,'.story-book footer button:last-child');
    expect(await page.locator('.story-book-spread').evaluate(el=>el.scrollTop)).toBe(0);
    await page.screenshot({path:info.outputPath(`story-${n}.png`)});
    await page.locator('.story-book footer button:last-child').click();
   }
   expect(await page.evaluate(()=>(window as any).__fixtureResult)).toBe('continued');
  }else{
   const buttons=await panel.locator('button').count();
   for(let i=0;i<buttons;i++){const button=panel.locator('button').nth(i);await button.scrollIntoViewIfNeeded();await button.click({trial:true});}
   if(view!=='choice'){await buttonReachable(page,'[data-start]');await buttonReachable(page,'[data-testid="switch-other-ending-btn"]');}
   await page.screenshot({path:info.outputPath(`${view}.png`)});
  }
 }
});

test('well music and greenhouse controls scroll without obscuring confirmation',async({page},info)=>{
 for(const view of ['well_winch','music_box','greenhouse_console']){
  await page.goto(`/tests/e2e/ui-fixture.html?view=${view}`);await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByRole('dialog')).toBeVisible();
  await buttonReachable(page,'.mechanism-submit');
  await page.screenshot({path:info.outputPath(`${view}.png`)});
  if(view==='well_winch'){
   for(let i=0;i<2;i++)await page.getByRole('button',{name:'Tăng bên trái'}).click();
   await page.getByRole('button',{name:'Tăng bên phải'}).click();
  }else if(view==='music_box'){
   for(const name of ['Mi','Sol','Đô cao'])await page.getByRole('button',{name:`Gảy ${name}`,exact:true}).click();
  }else for(const name of ['A','B','C'])await page.getByRole('button',{name:new RegExp(`^Cần ${name}`)}).click();
  await buttonReachable(page,'.mechanism-submit');await page.locator('.mechanism-submit').click();
  expect(await page.evaluate(()=>(window as any).__fixtureResult.valid)).toBe(true);
  expect(await page.locator('.mechanism-body').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 }
});

test('boss trap feedback and dialogue animation remain stable',async({page},info)=>{
 await openChapter(page,6);
 const combat=await page.evaluate(()=>{
  const e=(window as any).__gameEngine;e.timeline='PAST';e.player.x=400;e.player.y=398-e.player.height;e.player.interactCooldown=0;
  Object.assign(e.pursuer,{x:455,y:e.player.y,phase:'PAST',phaseDelay:0,stagger:0});e.triggerInteract();e.switchCooldown=0;e.switchTimeline();
  for(let i=0;i<80;i++){e.update(1/60);e.justPressed.clear();}
  const exposed=e.puzzles.bossExposedTrap;e.player.interactCooldown=0;e.triggerInteract();e.renderer.update(.08,e.timeline);e.render();
  return {exposed,hits:e.puzzles.bossHits,particles:e.renderer.bursts.length};
 });
 expect(combat.exposed).toBe(0);expect(combat.hits).toEqual([0]);expect(combat.particles).toBeGreaterThan(0);
 expect(await hudGeometry(page)).toEqual({collisions:[],outside:[],hintUncovered:true});
 await page.screenshot({path:info.outputPath('boss-hit.png')});
 await page.evaluate(()=>{(window as any).__gameEngine.callbacks.onStartDialogue([{speaker:'AN',speakerName:'An',emotion:'normal',text:'Những vệt sáng đã tan. Mình vẫn nghe tiếng chuông từ phía lõi. '.repeat(4)}]);});
 const card=page.locator('.dialogue-card');await expect(card).toBeVisible();const before=await card.boundingBox();
 await page.keyboard.press('e');const after=await card.boundingBox();
 expect(Math.abs(before!.height-after!.height)).toBeLessThanOrEqual(1);expect(Math.abs(before!.y-after!.y)).toBeLessThanOrEqual(1);
 expect(after!.y).toBeGreaterThanOrEqual(0);
});
