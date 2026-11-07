import {useEffect,useRef} from 'react';
import {pixelAssets} from '../game/pixelAssets';
export type TitleReaction={who:'linh'|'an';at:number}|null;
const girlBody=[[337,541],[355,544],[365,555],[365,576],[357,583],[360,598],[364,615],[360,626],[363,637],[349,639],[344,633],[338,639],[326,638],[326,632],[329,624],[319,623],[317,612],[312,607],[311,600],[318,590],[320,580],[315,575],[316,558],[323,550]];
const girlArm=[[353,584],[362,574],[367,557],[372,552],[376,555],[375,562],[370,576],[360,592]];
/** The supplied scene is kept intact; only actors, watch hands and atmosphere move. */
export function MenuScene({reaction}:{reaction:TitleReaction}){
 const ref=useRef<HTMLCanvasElement>(null),reactionRef=useRef(reaction);
 useEffect(()=>{reactionRef.current=reaction;},[reaction]);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d')!,plate=new Image(),source=new Image(),assets=pixelAssets();
  let frame=0,disposed=false,last=0;const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const cut=(points:number[][])=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.drawImage(source,0,0,1376,768);};
  const paint=(now:number)=>{
   if(disposed)return;frame=requestAnimationFrame(paint);
   if(document.hidden||now-last<(motion.matches?250:1000/30))return;last=now;
   if(!plate.complete||!plate.naturalWidth||!source.complete||!source.naturalWidth)return;
   const t=motion.matches?0:now/1000,react=reactionRef.current;
   const girlActive=!motion.matches&&((react?.who==='linh'&&now-react.at<2400)||t%11<2.4);
   const anActive=!motion.matches&&((react?.who==='an'&&now-react.at<2600)||(t+4)%13<2.8);
   ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,1376,768);ctx.drawImage(plate,0,0,1376,768);
   // Warm drifting pollen in the past, fine rain in the present.
   for(let i=0;i<24;i++){
    const x=(i*137.3+t*(6+i%3))%670,y=285+(i*67.7-t*(4+i%4))%380;
    ctx.globalAlpha=.16+Math.sin(t+i)*.1;ctx.fillStyle='#fff1a1';ctx.fillRect(x,y,2+i%2,2+i%2);
   }
   ctx.globalAlpha=.1;ctx.strokeStyle='#adc9c0';ctx.lineWidth=1;
   for(let i=0;i<24;i++){const x=710+(i*83.7-t*16)%660,y=(i*67+t*110)%720;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+12);ctx.stroke();}ctx.globalAlpha=1;
   // Linh stays planted on the steps, breathes and waves her raised arm.
   ctx.save();ctx.translate(341,639);ctx.rotate(motion.matches?0:Math.sin(t*1.7)*.009);ctx.scale(1,1+(motion.matches?0:Math.sin(t*2.3)*.008));ctx.translate(-341,-639);
   ctx.save();cut(girlBody);ctx.restore();
   ctx.save();ctx.translate(355,585);ctx.rotate(girlActive?Math.sin(t*8)*.18:Math.sin(t*2)*.025);ctx.translate(-355,-585);cut(girlArm);ctx.restore();
   const blink=!motion.matches&&(t%5.3<.13);if(blink){ctx.fillStyle='#cc9a5f';ctx.fillRect(334,567,5,3);ctx.fillRect(347,567,5,3);}ctx.restore();
   // An shares the revised gameplay art and looks across the two timelines.
   const key=anActive?`anV2Think${Math.min(2,Math.floor((t%2.8)*1.4))}`:'anV2Idle0',sprite=assets.get(key),base=assets.get('anV2Idle0');
   if(sprite&&base){const scale=130/base.height,pivot=assets.getCharacterPivot(key);ctx.save();ctx.translate(1075,647);ctx.scale(-1,1+(motion.matches?0:Math.sin(t*2)*.006));ctx.drawImage(sprite,-pivot*scale,-sprite.height*scale,sprite.width*scale,sprite.height*scale);ctx.restore();}
   // Restore the pocket-watch face and animate its hands independently of the logo.
   ctx.save();ctx.beginPath();ctx.arc(688,425,23,0,Math.PI*2);ctx.clip();ctx.fillStyle='#cfbd88';ctx.fillRect(663,400,50,50);ctx.fillStyle='#665437';
   for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.fillRect(687+Math.sin(a)*18,424-Math.cos(a)*18,2,3);}
   ctx.translate(688,425);ctx.strokeStyle='#3a3020';ctx.lineCap='square';ctx.lineWidth=3;
   for(const [angle,length]of [[t*.14+1,10],[t*.7,16]]){ctx.save();ctx.rotate(angle);ctx.beginPath();ctx.moveTo(0,2);ctx.lineTo(0,-length);ctx.stroke();ctx.restore();}ctx.fillStyle='#3a3020';ctx.fillRect(-2,-2,4,4);ctx.restore();
  };
  plate.src=`${import.meta.env.BASE_URL}assets/menu/title-plate.png`;source.src=`${import.meta.env.BASE_URL}assets/menu/title-reference.png`;
  frame=requestAnimationFrame(paint);return()=>{disposed=true;cancelAnimationFrame(frame);};
 },[]);
 return <canvas ref={ref} width={1376} height={768} className="illustrated-menu-scene" aria-label="Hai ngôi nhà ở quá khứ và hiện tại; Linh vẫy tay bên trái, An đứng bên phải" role="img"/>;
}
