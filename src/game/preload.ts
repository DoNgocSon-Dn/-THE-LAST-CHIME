const assetNames=[...Array.from({length:13},(_,i)=>`map-${i+1}`),'an','an-v2','menu-actors','npc','pursuer','animations','furniture','objects','memories','scenes'];
const assetPaths=[...assetNames.map(name=>`assets/pixel/${name}.${name==='menu-actors'?'png':'jpg'}`),'assets/loading/workshop-plate.png','assets/loading/workshop-animations.png'];
export async function preloadGameAssets(onProgress:(fraction:number)=>void):Promise<void>{
  let loaded=0;
  await Promise.all(assetPaths.map(path=>new Promise<void>((resolve,reject)=>{
    const image=new Image();
    image.onload=async()=>{try{await image.decode();loaded++;onProgress(loaded/assetPaths.length);resolve();}catch{reject(new Error(`Không đọc được ảnh ${path}.`));}};
    image.onerror=()=>reject(new Error(`Không tải được ảnh ${path}.`));
    image.src=`${import.meta.env.BASE_URL}${path}`;
  })));
  await document.fonts.ready;
}
