const assetNames=[...Array.from({length:13},(_,i)=>`map-${i+1}`),'an','npc','pursuer','animations','furniture','objects','memories','scenes'];
export async function preloadGameAssets(onProgress:(fraction:number)=>void):Promise<void>{
  let loaded=0;
  await Promise.all(assetNames.map(name=>new Promise<void>((resolve,reject)=>{
    const image=new Image();
    image.onload=async()=>{try{await image.decode();loaded++;onProgress(loaded/assetNames.length);resolve();}catch{reject(new Error(`Không đọc được ảnh ${name}.`));}};
    image.onerror=()=>reject(new Error(`Không tải được ảnh ${name}.`));
    image.src=`${import.meta.env.BASE_URL}assets/pixel/${name}.jpg`;
  })));
  await document.fonts.ready;
}
