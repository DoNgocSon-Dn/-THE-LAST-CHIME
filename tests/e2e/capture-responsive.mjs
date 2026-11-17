import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const phase=process.env.CAPTURE_PHASE??'before';
const baseURL=process.env.CAPTURE_BASE_URL??'http://localhost:3000';
const directory=resolve('../../outputs/responsive',phase);await mkdir(directory,{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL??'msedge'});
const measurements=[];
const assetErrors=[];
for(const [width,height]of [[1280,720],[667,375],[375,667]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000});
 await context.addInitScript(()=>{sessionStorage.setItem('THE_LAST_CHIME_DEV_MODE','1');localStorage.setItem('THE_LAST_CHIME_PIXEL_SAVE_V1',JSON.stringify({campaignVersion:2,houseLayoutVersion:1,characterScaleVersion:3,sceneScaleVersion:2,spawnVersion:3,terrainVersion:2,player:{x:95,y:424},timeline:'PRESENT',puzzles:{currentStage:2,storyChapter:2,hasWatch:true,watchCollected:true,testedTimelineSwitch:true,firstShiftReactionSeen:true}}));});
 const page=await context.newPage();
 page.on('response',response=>{if(response.status()>=400)assetErrors.push(`${response.status()} ${response.url()}`);});
 await page.goto(`${baseURL}/?autostart=1`);
 await page.waitForFunction(()=>{const e=window.__gameEngine;return e?.isReady()&&e.gameState==='playing';});
 await page.evaluate(()=>{const e=window.__gameEngine;e.stop();e.loadStage(5,false);e.callbacks.onNotification('');e.render();});
 await page.screenshot({path:resolve(directory,`${width}x${height}-chapter3.png`)});
 await page.evaluate(()=>{const e=window.__gameEngine;e.renderer.burst(e.player.x,e.player.y+e.player.height,'dust');e.renderer.update(.12,e.timeline);e.render();});
 await page.screenshot({path:resolve(directory,`${width}x${height}-dust.png`)});
 measurements.push({width,height,...await page.evaluate(()=>{
  const selectors=['.hud-header','.encounter-hud','.hud-objective','.hud-hint-btn','.time-control','.temporal-controls','.touch-controls>div'];
  const boxes=selectors.flatMap(selector=>Array.from(document.querySelectorAll(selector)).filter(el=>el.getBoundingClientRect().width&&getComputedStyle(el).display!=='none').map(el=>{const r=el.getBoundingClientRect();return {selector,x:r.x,y:r.y,width:r.width,height:r.height};}));
  const collisions=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
   const a=boxes[i],b=boxes[j];if(a.selector==='.hud-objective'&&b.selector==='.hud-hint-btn')continue;
   if(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>1)collisions.push([a.selector,b.selector]);
  }return {boxes,collisions,zoom:window.__gameEngine.viewZoom,worldWidth:window.__gameEngine.canvas.width/window.__gameEngine.viewZoom};
 })});
 await page.evaluate(()=>window.__gameEngine.callbacks.onStartDialogue([{speaker:'AN',speakerName:'An',emotion:'determined',text:'Phải giữ đủ ba ấn, rồi mình mới có thể mở cổng vào tâm điểm.'}]));
 await page.screenshot({path:resolve(directory,`${width}x${height}-dialogue.png`)});
 await page.keyboard.press('Escape');
 await page.evaluate(()=>{const e=window.__gameEngine;e.stop();e.loadStage(6,false);e.player.x=400;e.player.y=398-e.player.height;e.pursuer.x=450;e.pursuer.y=e.player.y;e.timeline='PRESENT';e.puzzles.bossArmedTrap=0;e.puzzles.bossExposedTrap=0;e.player.interactCooldown=0;e.triggerInteract();e.renderer.update(.08,e.timeline);e.render();});
 await page.screenshot({path:resolve(directory,`${width}x${height}-boss-hit.png`)});
 for(const view of ['story','choice','ending-accept','ending-eternal','music_box','well_winch','greenhouse_console']){
  await page.goto(`${baseURL}/tests/e2e/ui-fixture.html?view=${view}`);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
  if(view==='story'){
   for(let n=1;n<=3;n++){await page.locator('.story-book-spread').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));await page.screenshot({path:resolve(directory,`${width}x${height}-story-${n}.png`)});if(n<3)await page.getByRole('button',{name:'Lật trang'}).click();}
  }else await page.screenshot({path:resolve(directory,`${width}x${height}-${view}.png`)});
  measurements.push({width,height,view,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,buttons:Array.from(document.querySelectorAll('button')).filter(el=>!el.disabled).map(el=>{const r=el.getBoundingClientRect();return {text:el.textContent.trim(),top:r.top,bottom:r.bottom,left:r.left,right:r.right};})}))});
 }
 await context.close();
}
await browser.close();if(assetErrors.length)throw new Error(`Capture has failed assets: ${assetErrors.slice(0,5).join(', ')}`);
await writeFile(resolve(directory,'measurements.json'),JSON.stringify(measurements,null,2));
console.log(`Captured ${phase}: ${directory}`);
