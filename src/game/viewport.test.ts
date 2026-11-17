import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneZoom,viewportZoom} from './pixelLayout';

test('Portrait camera shows at least 520 world pixels without changing landscape zoom',()=>{
 for(const stage of [1,2,5,6]){
  const width=562*375/667,zoom=viewportZoom(stage,95,width,562);
  assert.ok(width/zoom>=520);
  assert.equal(viewportZoom(stage,95,562*667/375,562),sceneZoom(stage,95));
  assert.equal(viewportZoom(stage,95,562*1280/720,562),sceneZoom(stage,95));
 }
});
