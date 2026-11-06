import React,{useEffect,useRef} from 'react';
import {pixelAssets} from '../game/pixelAssets';
/** Use the game's authored pixel clock, rather than a separate illustration style. */
export function PixelMenuClock(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current!,ctx=c.getContext('2d')!,assets=pixelAssets();let frame=0;let face:{x:number;y:number}|undefined;
 const paint=(time:number)=>{ctx.clearRect(0,0,c.width,c.height);ctx.imageSmoothingEnabled=false;assets.feet(ctx,'clockPresent',80,260,235);const sprite=assets.get('clockPresent');if(sprite){
   if(!face){const d=sprite.getContext('2d')!.getImageData(0,0,sprite.width,sprite.height).data;let sx=0,sy=0,n=0;
     for(let y=0;y<sprite.height*.44;y++)for(let x=Math.floor(sprite.width*.22);x<sprite.width*.8;x++){const i=(y*sprite.width+x)*4;const lo=Math.min(d[i],d[i+1],d[i+2]),hi=Math.max(d[i],d[i+1],d[i+2]);if(d[i+3]&&lo>105&&hi-lo<38){sx+=x;sy+=y;n++;}}
     const scale=235/sprite.height;face={x:80-sprite.width*scale/2+(n?sx/n:sprite.width/2)*scale,y:25+(n?sy/n:sprite.height*.3)*scale};
   }
   ctx.strokeStyle='#302d23';ctx.lineWidth=1.5;for(const [angle,len]of [[time/1800,12],[time/10800+1,8]]){ctx.beginPath();ctx.moveTo(face.x,face.y);ctx.lineTo(face.x+Math.sin(angle)*len,face.y-Math.cos(angle)*len);ctx.stroke();}
 }frame=requestAnimationFrame(paint);};frame=requestAnimationFrame(paint);return()=>cancelAnimationFrame(frame);},[]);
 return <canvas ref={ref} width={160} height={280} className="pixel-menu-clock" aria-hidden="true"/>;
}
