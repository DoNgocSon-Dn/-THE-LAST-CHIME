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
  const selectors=['.hud-header','.encounter-hud','.hud-objective-bar','.hud-objective-details','.hud-objective:not(.hud-objective-compact)','.hud-hint-btn','.time-control','.interaction-control','.hud-toast','.touch-controls>div'];
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
  await page.evaluate(()=>{const e=(window as any).__gameEngine;e.callbacks.onStartDialogue([{speaker:'AN',speakerName:'An',emotion:'normal',text:'Mình cần đi tiếp và giữ đủ ba ấn.'}]);});
  await expect(page.getByTestId('dialogue-box')).toBeVisible();
  await expect(page.locator('.game-hud')).toBeHidden();await expect(page.locator('.touch-controls')).toBeHidden();
  await page.keyboard.press('Escape');
 }
});
