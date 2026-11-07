import {RESTORED_OUTDOOR_MAPS,restoredOutdoorPath} from './outdoorAssets';
import {pixelAssets} from './pixelAssets';
const assetNames=[...Array.from({length:13},(_,i)=>`map-${i+1}`),'an-unified','an-seated','menu-actors','npc','pursuer','animations','furniture','objects','memories','scenes'];
const assetPaths=[...RESTORED_OUTDOOR_MAPS.map(restoredOutdoorPath),...assetNames.map(name=>`assets/pixel/${name}.${name==='menu-actors'||name==='an-unified'||name==='an-seated'?'png':'jpg'}`),'assets/story/opening-scenes-pixel.png','assets/menu/title-mechanical-plate.png','assets/menu/logo-animations.png','assets/loading/workshop-plate.png','assets/loading/workshop-animations.png'];
export async function preloadGameAssets(onProgress:(fraction:number)=>void):Promise<void>{
  let loaded=0;
  await Promise.all(assetPaths.map(path=>new Promise<void>((resolve,reject)=>{
    const image=new Image();
    image.onload=async()=>{try{await image.decode();loaded++;onProgress(loaded/assetPaths.length);resolve();}catch{reject(new Error(`Không đọc được ảnh ${path}.`));}};
    image.onerror=()=>reject(new Error(`Không tải được ảnh ${path}.`));
    image.src=`${import.meta.env.BASE_URL}${path}`;
  })));
  await Promise.all([document.fonts.ready,pixelAssets().ready]);
}
