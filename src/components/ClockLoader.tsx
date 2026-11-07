import {useEffect,useRef} from 'react';
import {prepareWorkshopSprites,workshopActorFrame} from '../game/workshopLoadingArt';
type Props={progress?:number;error?:string;shattering?:boolean};
function WorkshopScene({progress,error}:Props){
 const ref=useRef<HTMLCanvasElement>(null),state=useRef({progress,error});
 useEffect(()=>{state.current={progress,error};},[progress,error]);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d')!,plate=new Image(),sheet=new Image();
  let sprites:ReturnType<typeof prepareWorkshopSprites>|undefined,frame=0,last=0,alive=true;
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),start=performance.now();
  sheet.onload=()=>{if(alive)sprites=prepareWorkshopSprites(sheet);};
  plate.src=`${import.meta.env.BASE_URL}assets/loading/workshop-plate.png`;sheet.src=`${import.meta.env.BASE_URL}assets/loading/workshop-animations.png`;
  const paint=(now:number)=>{if(!alive)return;frame=requestAnimationFrame(paint);if(document.hidden||now-last<(motion.matches?250:1000/30))return;last=now;
   if(!plate.complete||!plate.naturalWidth)return;const t=motion.matches?0:(now-start)/1000,{progress:p,error:err}=state.current;
   ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,1376,768);ctx.drawImage(plate,0,0,1376,768);
   if(sprites){
    // Four seated repair poses, mirrored to face the existing workbench.
    const i=motion.matches?0:workshopActorFrame(t),pivot=[87,91,92,95][i];ctx.save();ctx.translate(512,592);ctx.scale(-1.4,1.4);ctx.drawImage(sprites.actors[i],-pivot,-176);ctx.restore();
    const pendulum=[0,1,2,3,4,5,4,3,2,1][Math.floor(t*7)%10];ctx.drawImage(sprites.pendulums[pendulum],478,205,108,100);
    const gear=Math.floor(t*6)%6;ctx.drawImage(sprites.gears[gear],241,446,44,30);ctx.drawImage(sprites.gears[5-gear],202,444,30,23);
   }
   // Light remains subtle; the original illustration supplies all architecture.
   const glow=ctx.createRadialGradient(408,408,4,408,408,145);glow.addColorStop(0,`rgba(255,204,106,${.035+(Math.sin(t*4)+1)*.008})`);glow.addColorStop(1,'#ffd47c00');ctx.fillStyle=glow;ctx.fillRect(260,260,300,300);
   ctx.save();ctx.beginPath();ctx.rect(980,148,174,264);ctx.clip();ctx.strokeStyle='#adc9f3';ctx.globalAlpha=.18;ctx.lineWidth=2;
   for(let j=0;j<15;j++){const x=988+(j*37)%158,y=148+(j*47+t*83)%264;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+11);ctx.stroke();}ctx.restore();
   for(let j=0;j<14;j++){const x=160+(j*53+t*4)%370,y=300+(j*31-t*6)%160;ctx.globalAlpha=.25+(Math.sin(t*2+j)+1)*.15;ctx.fillStyle='#ffd888';ctx.fillRect(x,y,2,2);}ctx.globalAlpha=1;
   // The chain frame is part of the supplied plate; only its interior is filled.
   const left=54,top=680,width=1223,height=40,fill=p===undefined?0:Math.max(0,Math.min(1,p));
   ctx.fillStyle='#090e0e';ctx.fillRect(left,top,width,height);
   ctx.save();ctx.beginPath();ctx.rect(left,top,width,height);ctx.clip();
   const a=p===undefined?(t*.18%1)*width:0,w=p===undefined?width*.32:width*fill;
   const fireGradient=ctx.createLinearGradient(left,top,left+width,top);fireGradient.addColorStop(0,'#d46824');fireGradient.addColorStop(.5,'#f9b93f');fireGradient.addColorStop(1,'#ffe88a');ctx.fillStyle=fireGradient;if(!err)ctx.fillRect(left+a,top,w,height);
   if(sprites&&!err){ctx.globalAlpha=.35;for(let j=0;j<Math.ceil(w/210);j++)ctx.drawImage(sprites.fire[Math.floor(t*7+j)%4],left+a+j*210-20,644,130,95);ctx.globalAlpha=1;}
   ctx.restore();
   if(sprites&&!err){const marker=left+(p===undefined?((t*.18)%1)*.68+.16:fill)*(width-90);ctx.drawImage(sprites.watch,marker-40,643,80,104);}
   // The fixed end watch follows the moving watch with a slower hand.
   ctx.save();ctx.translate(1304,701);ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.clip();ctx.fillStyle='#d7c99e';ctx.fillRect(-30,-30,60,60);ctx.fillStyle='#675338';for(let j=0;j<12;j++){const a=j*Math.PI/6;ctx.fillRect(Math.sin(a)*23-1,Math.cos(a)*23-1,2,3);}for(const [angle,len]of [[t*.35,15],[t*1.8,22]]){ctx.save();ctx.rotate(angle);ctx.strokeStyle='#4d3d2a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,3);ctx.lineTo(0,-len);ctx.stroke();ctx.restore();}ctx.restore();
   ctx.fillStyle='#080a0b';ctx.fillRect(930,614,400,36);ctx.textAlign='right';ctx.font='700 27px "Be Vietnam Pro", sans-serif';ctx.fillStyle='#e5c17a';ctx.strokeStyle='#221c13';ctx.lineWidth=3;
   const label=err?'TẢI CHƯA HOÀN TẤT':p===undefined?'ĐANG MỞ KÝ ỨC…':`ĐANG TẢI… ${Math.round(fill*100)}%`;
   ctx.strokeText(label,1248,641);ctx.fillText(label,1248,641);
  };
  frame=requestAnimationFrame(paint);return()=>{alive=false;sheet.onload=null;cancelAnimationFrame(frame);};
 },[]);
 return <canvas ref={ref} width={1376} height={768} className="workshop-loading-canvas" aria-hidden="true"/>;
}
export function ClockLoader({progress,error,shattering=true}:Props){
 const fraction=progress===undefined?undefined:Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
 return <section className="workshop-loading" role="status" aria-live="polite" aria-label="Đang tải game">
  <div className="workshop-loading-backdrop" aria-hidden="true"/><div className="workshop-loading-stage"><WorkshopScene progress={fraction} error={error} shattering={shattering}/>
   <h1 className="sr-only">{error?'Không tải được game':fraction===undefined?'Đang chuẩn bị ký ức':`Đang tải ${Math.round(fraction*100)}%`}</h1>
   {!error&&<div className="sr-only" role="progressbar" aria-label="Tải tài nguyên" aria-valuemin={0} aria-valuemax={100} aria-valuenow={fraction===undefined?undefined:Math.round(fraction*100)}/>}
   {error&&<div className="workshop-loading-error" role="alert"><p>{error}</p><button onClick={()=>window.location.reload()}>Thử tải lại</button></div>}
  </div><div className="workshop-loading-mobile"><span>{error?'TẢI CHƯA HOÀN TẤT':fraction===undefined?'ĐANG MỞ KÝ ỨC':`ĐANG TẢI… ${Math.round(fraction*100)}%`}</span><p>{error||'Xin chờ một nhịp chuông.'}</p></div>
 </section>;
}
