import {pixelAssets} from '../game/pixelAssets';
import {useEffect,useRef} from 'react';
import {prepareWorkshopSprites} from '../game/workshopLoadingArt';
type Props={progress?:number;error?:string;shattering?:boolean};
function WorkshopScene({progress,error}:Props){
 const ref=useRef<HTMLCanvasElement>(null),state=useRef({progress,error});
 useEffect(()=>{state.current={progress,error};},[progress,error]);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d')!,plate=new Image(),sheet=new Image(),actors=pixelAssets();
  let sprites:ReturnType<typeof prepareWorkshopSprites>|undefined,frame=0,last=0,alive=true,displayed=0;
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),start=performance.now();
  sheet.onload=()=>{if(alive)sprites=prepareWorkshopSprites(sheet);};
  plate.src=`${import.meta.env.BASE_URL}assets/loading/workshop-plate.png`;sheet.src=`${import.meta.env.BASE_URL}assets/loading/workshop-animations.png`;
  const paint=(now:number)=>{if(!alive)return;frame=requestAnimationFrame(paint);if(document.hidden||now-last<(motion.matches?250:1000/30))return;const dt=Math.min(.1,(now-last)/1000);last=now;
   if(!plate.complete||!plate.naturalWidth)return;const t=motion.matches?0:(now-start)/1000,{progress:p,error:err}=state.current;
   ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,1376,768);ctx.drawImage(plate,0,0,1376,768);
   if(sprites){
    // Same An model as the game, seated companion atlas.
    const key=`anSeatedRepair${motion.matches?0:Math.floor(t*4)%8}`,actor=actors.get(key),base=actors.get('anSeatedRepair0');
    if(actor&&base){const scale=224/base.height;ctx.save();ctx.translate(512,592);ctx.scale(-scale,scale);ctx.drawImage(actor,-actors.getCharacterPivot(key),-actor.height);ctx.restore();}
    const pendulum=[0,1,2,3,4,5,4,3,2,1][Math.floor(t*7)%10];ctx.drawImage(sprites.pendulums[pendulum],478,205,108,100);
    const gear=Math.floor(t*6)%6;ctx.drawImage(sprites.gears[gear],241,446,44,30);ctx.drawImage(sprites.gears[5-gear],202,444,30,23);
   }
   // Light remains subtle; the original illustration supplies all architecture.
   const glow=ctx.createRadialGradient(408,408,4,408,408,145);glow.addColorStop(0,`rgba(255,204,106,${.035+(Math.sin(t*4)+1)*.008})`);glow.addColorStop(1,'#ffd47c00');ctx.fillStyle=glow;ctx.fillRect(260,260,300,300);
   ctx.save();ctx.beginPath();ctx.rect(980,148,174,264);ctx.clip();ctx.strokeStyle='#adc9f3';ctx.globalAlpha=.18;ctx.lineWidth=2;
   for(let j=0;j<15;j++){const x=988+(j*37)%158,y=148+(j*47+t*83)%264;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+11);ctx.stroke();}ctx.restore();
   for(let j=0;j<14;j++){const x=160+(j*53+t*4)%370,y=300+(j*31-t*6)%160;ctx.globalAlpha=.25+(Math.sin(t*2+j)+1)*.15;ctx.fillStyle='#ffd888';ctx.fillRect(x,y,2,2);}ctx.globalAlpha=1;
   const target=p===undefined?0:Math.max(0,Math.min(1,p));
   displayed=Math.min(target,displayed+dt*.24);
   const fill=motion.matches?target:displayed;
   // A restrained brass instrument panel replaces the noisy baked loading strip.
   const panel=ctx.createLinearGradient(0,610,0,768);panel.addColorStop(0,'#101712');panel.addColorStop(1,'#080d0b');ctx.fillStyle=panel;ctx.fillRect(0,610,1376,158);
   ctx.fillStyle='#75603c';ctx.fillRect(160,611,1056,1);
   const left=205,top=686,width=900,height=14;
   ctx.textAlign='left';ctx.font='600 20px "VT323", monospace';ctx.fillStyle='#cdb88b';
   ctx.fillText(err?'TẢI CHƯA HOÀN TẤT':p===undefined?'ĐANG MỞ KÝ ỨC':'ĐANG CHUẨN BỊ HÀNH TRÌNH',left,657);
   ctx.textAlign='right';ctx.font='600 24px "VT323", monospace';ctx.fillStyle='#f2d69b';ctx.fillText(p===undefined?'…':`${Math.floor(fill*100)}%`,left+width,657);
   ctx.fillStyle='#6d5735';ctx.fillRect(left-3,top-3,width+6,height+6);ctx.fillStyle='#0b120f';ctx.fillRect(left-1,top-1,width+2,height+2);
   ctx.save();ctx.beginPath();ctx.rect(left,top,width,height);ctx.clip();
   const w=p===undefined?width*.2:width*fill,x=p===undefined?(Math.sin(t*.7)+1)*.4*width:0;
   if(!err){const gold=ctx.createLinearGradient(left,top,left,top+height);gold.addColorStop(0,'#e7cc8e');gold.addColorStop(.4,'#bb9150');gold.addColorStop(1,'#79542e');ctx.fillStyle=gold;ctx.fillRect(left+x,top,w,height);ctx.fillStyle='#f7e2ac';ctx.fillRect(left+x,top,w,2);
   if(!motion.matches){const shine=ctx.createLinearGradient(left+t*90%1000-100,0,left+t*90%1000,0);shine.addColorStop(0,'#fff0');shine.addColorStop(.5,'#fff4ce33');shine.addColorStop(1,'#fff0');ctx.fillStyle=shine;ctx.fillRect(left+x,top,w,height);}}
   ctx.restore();
   // One pocket watch, with a complete face and moving hands, anchors the panel.
   ctx.save();ctx.translate(1172,678);ctx.strokeStyle='#997447';ctx.lineWidth=5;ctx.strokeRect(-7,-46,14,11);ctx.fillStyle='#a87c42';ctx.beginPath();ctx.arc(0,0,34,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3b2c1e';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#e2d1a3';ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();ctx.fillStyle='#655135';for(let j=0;j<12;j++){ctx.save();ctx.rotate(j*Math.PI/6);ctx.fillRect(-1,-25,2,j%3===0?5:3);ctx.restore();}for(const [angle,len]of [[t*.12+1,14],[t*.7,21]]){ctx.save();ctx.rotate(angle);ctx.strokeStyle='#493822';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,3);ctx.lineTo(0,-len);ctx.stroke();ctx.restore();}ctx.fillStyle='#493822';ctx.fillRect(-2,-2,4,4);ctx.restore();

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
