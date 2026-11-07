import React,{useEffect,useRef} from 'react';
import {pixelAssets} from '../game/pixelAssets';
import {SpeakerId,DialogueEmotion} from '../types/game';
export function PixelPortrait({speaker,emotion}:{speaker:SpeakerId;emotion?:DialogueEmotion}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
   let frame=0;
   const paint=()=>{
     const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d')!;
     const key=speaker==='LINH'?'npc0':speaker==='ME'?'npc3':speaker==='ONG'?'npc6':speaker==='KE_LAC_GIO'?'lost0':emotion==='surprised'?'anSeatedStory4':emotion==='sad'||emotion==='whisper'?'anUnifiedIdle2':'anUnifiedIdle0';
     const sprite=pixelAssets().get(key);ctx.fillStyle='#183329';ctx.fillRect(0,0,96,96);
     if(sprite){ctx.imageSmoothingEnabled=false;const crop=Math.min(sprite.width,sprite.height*.58);ctx.drawImage(sprite,(sprite.width-crop)/2,0,crop,crop,0,0,96,96);}
     else frame=requestAnimationFrame(paint);
   };paint();return()=>cancelAnimationFrame(frame);
 },[speaker,emotion]);
 return <canvas ref={ref} width={96} height={96} className="w-full h-full" aria-label={`Chân dung ${speaker}`}/>;
}
