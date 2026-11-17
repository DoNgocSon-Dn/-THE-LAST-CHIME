import test from 'node:test';
import assert from 'node:assert/strict';
import {chaseSpeed,bossExposureDuration} from './encounters';
import {setDifficulty,cooldownLabel} from './controls';

test('Normal preserves all original chase speeds and boss exposure windows exactly',()=>{
 for(const [x,speed]of [[0,145],[1199,145],[1200,158],[2399,158],[2400,170],[3500,170]])assert.equal(chaseSpeed(x,'normal'),speed);
 for(const hits of [0,1,2])assert.equal(bossExposureDuration(hits,'normal'),3-hits*.6);
});
test('Difficulty affects chase speed and every live boss round in the intended direction',()=>{
 for(const x of [900,1750,2630])assert.ok(chaseSpeed(x,'easy')<chaseSpeed(x,'normal')&&chaseSpeed(x,'normal')<chaseSpeed(x,'hard'));
 for(const hits of [0,1,2])assert.ok(bossExposureDuration(hits,'easy')>bossExposureDuration(hits,'normal')&&bossExposureDuration(hits,'normal')>bossExposureDuration(hits,'hard')&&bossExposureDuration(hits,'hard')>0);
 setDifficulty('easy');assert.equal(chaseSpeed(900),145*.85);assert.equal(bossExposureDuration(2),1.8*1.4);assert.equal(cooldownLabel(),'1,5');
 setDifficulty('hard');assert.equal(chaseSpeed(2630),170*1.08);assert.equal(cooldownLabel(),'4,5');
 setDifficulty('normal');assert.equal(cooldownLabel(),'3');
});
