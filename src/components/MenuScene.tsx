import React,{useEffect,useRef} from 'react';
/** Full-bleed crop of the supplied exterior; no duplicated gameplay props on the menu. */
export function MenuScene(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
   const canvas=ref.current!,ctx=canvas.getContext('2d')!,image=new Image();
   let frame=0,start=0;
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const paint=(now:number)=>{
     if(!start)start=now;
     const scale=Math.max(canvas.width/1600,canvas.height/302);
     const drift=reduced?0:Math.sin((now-start)/18000)*10;
     ctx.imageSmoothingEnabled=false;ctx.fillStyle='#132a2c';ctx.fillRect(0,0,canvas.width,canvas.height);
     ctx.drawImage(image,0,346,1600,302,canvas.width*.76-1240*scale+drift,0,1600*scale,302*scale);
     frame=requestAnimationFrame(paint);
   };
   image.onload=()=>{frame=requestAnimationFrame(paint);};image.src=`${import.meta.env.BASE_URL}assets/pixel/map-1.jpg`;
   return()=>{image.onload=null;cancelAnimationFrame(frame);};
 },[]);
 return <canvas ref={ref} width={1600} height={900} className="menu-scene" aria-hidden="true"/>;
}
