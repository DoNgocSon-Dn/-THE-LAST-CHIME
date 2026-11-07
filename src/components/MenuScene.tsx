import {prepareMenuMechanics,paintMenuMechanics} from '../game/menuMechanics';
import {useEffect,useRef} from 'react';
import {pixelAssets} from '../game/pixelAssets';
export type TitleReaction={who:'linh'|'an';at:number}|null;
/** The supplied scene is kept intact; only actors, watch hands and atmosphere move. */
export function MenuScene({reaction}:{reaction:TitleReaction}){
 const ref=useRef<HTMLCanvasElement>(null),reactionRef=useRef(reaction);
 useEffect(()=>{reactionRef.current=reaction;},[reaction]);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d')!,plate=new Image(),sheet=new Image(),assets=pixelAssets();
  let mechanics:ReturnType<typeof prepareMenuMechanics>|undefined;sheet.onload=()=>{mechanics=prepareMenuMechanics(sheet);};sheet.src=`${import.meta.env.BASE_URL}assets/menu/logo-animations.png`;
  let frame=0,disposed=false,last=0;const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const paint=(now:number)=>{
   if(disposed)return;frame=requestAnimationFrame(paint);
   if(document.hidden||now-last<(motion.matches?250:1000/30))return;last=now;
   if(!plate.complete||!plate.naturalWidth)return;
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
   // Dedicated menu sheet: complete frame sequences, without deforming cutouts.
   const recent=react?Math.max(0,(now-react.at)/1000):0;
   const girlMode=girlActive?(react?.who==='linh'&&recent<2.4?'Happy':'Wave'):'Wave';
   const girlFrame=girlActive?Math.min(5,Math.floor((react?.who==='linh'&&recent<2.4?recent:t%11)*5)) : 0;
   const girl=assets.get(`menuLinh${girlMode}${girlFrame}`),girlBase=assets.get('menuLinhWave0');
   if(girl&&girlBase){const scale=96/girlBase.height;ctx.drawImage(girl,341-assets.getCharacterPivot(`menuLinh${girlMode}${girlFrame}`)*scale,639-girl.height*scale,girl.width*scale,girl.height*scale);}
   const idlePhase=t%6;
   const anFrame=motion.matches?0:anActive?Math.min(5,Math.floor((react?.who==='an'&&recent<2.6?recent:(t+4)%13)*3)):idlePhase<.16?1:idlePhase<.24?2:idlePhase>3&&idlePhase<3.7?3:idlePhase>=3.7&&idlePhase<4.4?4:0;
   const key=anActive?`menuAnBag${anFrame}`:`menuAnIdle${anFrame}`,sprite=assets.get(key),base=assets.get('menuAnIdle0');
   if(sprite&&base){const scale=130/base.height;ctx.save();ctx.translate(1075,647);ctx.scale(-1,1);ctx.drawImage(sprite,-assets.getCharacterPivot(key)*scale,-sprite.height*scale,sprite.width*scale,sprite.height*scale);ctx.restore();}
   if(mechanics)paintMenuMechanics(ctx,mechanics,t);
  };
  plate.src=`${import.meta.env.BASE_URL}assets/menu/title-mechanical-plate.png`;
  frame=requestAnimationFrame(paint);return()=>{disposed=true;cancelAnimationFrame(frame);};
 },[]);
 return <canvas ref={ref} width={1376} height={768} className="illustrated-menu-scene" aria-label="Hai ngôi nhà ở quá khứ và hiện tại; Linh vẫy tay bên trái, An đứng bên phải" role="img"/>;
}
