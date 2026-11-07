import {useEffect,useRef} from 'react';
import {Lock,ArrowLeft,ArrowUpRight} from 'lucide-react';
import {MAP_CROPS,CHAPTER_ROOMS} from '../game/pixelLayout';
import {removeExteriorMattePixels} from '../game/pixelWorld';
const chapters=[
 ['Trở về','Cổng nhà & hiên trước'],['Chiếc đồng hồ ngừng chạy','Phòng khách & xưởng đồng hồ'],['Hành lang ký ức','Hành lang & sân sau'],['Căn phòng bị khóa','Phòng của Linh & khu vườn'],['Cuộc truy đuổi','Rừng ký ức & hang đồng hồ'],['Hai phía của thời gian','Tâm điểm thời gian']
];
function ChapterPreview({stage}:{stage:number}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current!,ctx=canvas.getContext('2d')!,image=new Image(),map=CHAPTER_ROOMS[stage][0].map;let alive=true;
  image.onload=()=>{if(!alive)return;ctx.imageSmoothingEnabled=false;
   for(const [era,side]of [['past',0],['present',1]]as const){const crop=MAP_CROPS[map][era],cut=document.createElement('canvas');cut.width=crop.w;cut.height=crop.h;const c=cut.getContext('2d')!;c.drawImage(image,crop.x,crop.y,crop.w,crop.h,0,0,crop.w,crop.h);if([1,7,8].includes(map)){const pixels=c.getImageData(0,0,crop.w,crop.h);removeExteriorMattePixels(pixels.data);c.putImageData(pixels,0,0);}ctx.save();ctx.beginPath();ctx.rect(side*240,0,240,180);ctx.clip();ctx.fillStyle=side?'#254143':'#cfac62';ctx.fillRect(0,0,480,180);const scale=Math.max(480/crop.w,180/crop.h);ctx.drawImage(cut,(480-crop.w*scale)/2,180-crop.h*scale,crop.w*scale,crop.h*scale);ctx.restore();}
   ctx.fillStyle='#dfbe7144';ctx.fillRect(239,0,2,180);
  };image.src=`${import.meta.env.BASE_URL}assets/pixel/map-${map}.jpg`;return()=>{alive=false;image.onload=null;};
 },[stage]);
 return <canvas ref={ref} width={480} height={180} aria-hidden="true"/>;
}
export function ChapterSelect({unlocked,current=1,onSelect,onClose}:{unlocked:number;current?:number;onSelect:(stage:number)=>void;onClose:()=>void}){
 const ref=useRef<HTMLDivElement>(null),limit=Math.max(1,Math.min(6,unlocked));
 useEffect(()=>{const before=document.activeElement as HTMLElement|null;ref.current?.focus();const key=(e:KeyboardEvent)=>{
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();onClose();}
  if(e.key==='Tab'){const nodes=ref.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');if(!nodes?.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 };window.addEventListener('keydown',key,true);return()=>{window.removeEventListener('keydown',key,true);before?.focus();};},[onClose]);
 return <div className="chapter-select-backdrop"><div className="chapter-select-panel" ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="chapter-select-title">
  <header><div><span>THE LAST CHIME</span><h2 id="chapter-select-title">Chọn chương</h2><p>{String(limit).padStart(2,'0')} / 06 chương đã mở</p></div><button className="chapter-select-back" onClick={onClose} aria-label="Đóng chọn chương"><ArrowLeft size={18}/>Trở lại</button></header>
  <div className="chapter-select-grid">{chapters.map(([name,place],i)=>{const stage=i+1,locked=stage>limit;return <button key={stage} className={`chapter-card ${locked?'is-locked':''} ${stage===current?'is-current':''}`} data-testid={`stage-select-${stage}`} disabled={locked} onClick={()=>onSelect(stage)} aria-label={`Chương ${stage}: ${name}${locked?' — Chưa mở':''}`} aria-current={stage===current?'step':undefined}>
   <div className="chapter-card-scene"><ChapterPreview stage={stage}/><span className="chapter-card-number">{String(stage).padStart(2,'0')}</span>{locked&&<span className="chapter-card-lock"><Lock size={24}/></span>}</div>
   <div className="chapter-card-copy"><h3>{name}</h3><p>{place}</p><footer><span>{locked?'Chưa mở':stage===current?'Đang chơi':'Đã mở'}</span>{!locked&&<ArrowUpRight size={18}/>}</footer></div>
  </button>;})}</div>
  <footer className="chapter-select-note"><span className="chapter-era-past">QUÁ KHỨ</span><i/><span className="chapter-era-present">HIỆN TẠI</span><p>Các chương tiếp theo mở khi bạn đi tiếp trong câu chuyện.</p></footer>
 </div></div>;
}
