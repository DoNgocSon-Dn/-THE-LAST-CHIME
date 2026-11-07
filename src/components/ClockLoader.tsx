import {useEffect,useRef} from 'react';
/** The same brass pocket watch as the game, animated on the sprite pixel grid. */
function LoadingWatch({shattering}:{shattering:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d')!,image=new Image(),face=document.createElement('canvas');face.width=320;face.height=320;const c=face.getContext('2d')!;
  image.src=`${import.meta.env.BASE_URL}assets/menu/title-reference.png`;
  let frame=0,last=0;const start=performance.now(),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const paint=(now:number)=>{frame=requestAnimationFrame(paint);if(document.hidden||now-last<(motion.matches?200:1000/30))return;last=now;
   if(!image.complete||!image.naturalWidth)return;const t=motion.matches?0:(now-start)/1000;
   c.clearRect(0,0,320,320);c.imageSmoothingEnabled=false;
   c.save();c.beginPath();c.arc(160,182,89,0,Math.PI*2);c.rect(151,78,18,35);c.moveTo(183,63);c.arc(160,63,23,0,Math.PI*2);c.clip();
   c.drawImage(image,160-688*2.4,182-425*2.4,1376*2.4,768*2.4);c.restore();
   // Rebuild only the small face, keeping the supplied brass case and crown.
   c.save();c.translate(160,182);c.beginPath();c.arc(0,0,60,0,Math.PI*2);c.fillStyle='#d1c08c';c.fill();c.fillStyle='#685332';
   for(let i=0;i<12;i++){const a=i*Math.PI/6;c.fillRect(Math.round(Math.sin(a)*49)-2,Math.round(-Math.cos(a)*49)-2,4,5);}
   for(const [angle,length,width]of [[t*1.3+1,27,5],[t*4,43,3]]){c.save();c.rotate(angle);c.strokeStyle='#352e20';c.lineWidth=width;c.beginPath();c.moveTo(0,7);c.lineTo(0,-length);c.stroke();c.restore();}c.fillStyle='#7b562e';c.fillRect(-4,-4,8,8);c.restore();
   const phase=t%2.6,burst=shattering&&!motion.matches?Math.sin(Math.max(0,Math.min(1,(phase-.95)/1.4))*Math.PI):0;
   ctx.clearRect(0,0,320,320);ctx.imageSmoothingEnabled=false;
   if(!burst)ctx.drawImage(face,0,0);else for(let i=0;i<8;i++){
    const a=i*Math.PI/4,b=a+Math.PI/4,m=(a+b)/2;ctx.save();ctx.translate(Math.cos(m)*burst*19,Math.sin(m)*burst*19);
    ctx.beginPath();ctx.moveTo(160,182);ctx.lineTo(160+Math.cos(a)*480,182+Math.sin(a)*480);ctx.lineTo(160+Math.cos(b)*480,182+Math.sin(b)*480);ctx.closePath();ctx.clip();ctx.drawImage(face,0,0);ctx.restore();
   }
  };frame=requestAnimationFrame(paint);return()=>cancelAnimationFrame(frame);
 },[shattering]);
 return <canvas ref={ref} width={320} height={320} className="pixel-loading-watch" aria-hidden="true"/>;
}
export function ClockLoader({progress,error,shattering=true}:{progress?:number;error?:string;shattering?:boolean}){
 const fraction=progress===undefined?undefined:Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
 return <section className="pixel-loading" role="status" aria-live="polite" aria-label="Đang tải game">
  <div className="pixel-loading-art" aria-hidden="true"/><div className="pixel-loading-split" aria-hidden="true"/>
  <header><span>THE LAST CHIME</span><span>QUÁ KHỨ <i>│</i> HIỆN TẠI</span></header>
  <div className="pixel-loading-content"><LoadingWatch shattering={shattering&&!error}/><h1>{error?'Chưa mở được ký ức':shattering?'Đang ghép lại ký ức':'Đang mở cánh cửa'}</h1><p>{error||'Xin chờ một nhịp chuông.'}</p>
   {!error&&<div className="pixel-loading-progress">{fraction!==undefined?<><div className="pixel-loading-track" role="progressbar" aria-label="Tải tài nguyên" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(fraction*100)}><span style={{width:`${fraction*100}%`}}/></div><output>{fraction===1?'ĐANG CHUYỂN CẢNH':`${Math.round(fraction*100)}%`}</output></>:<div className="pixel-loading-wait" aria-label="Đang chuẩn bị màn chơi"><i/><i/><i/></div>}</div>}
   {error&&<button className="pixel-loading-retry" onClick={()=>window.location.reload()}>Thử tải lại</button>}
  </div><footer>TIẾNG CHUÔNG DƯỚI TÁN RÊU</footer>
 </section>;
}
