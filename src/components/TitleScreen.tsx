import {savedChapterProgress} from '../game/campaign';
import {ChapterSelect} from './ChapterSelect';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Volume2,VolumeX} from 'lucide-react';
import {soundManager} from '../game/audio';
import {MenuScene,type TitleReaction} from './MenuScene';
function MenuLabel({text}:{text:string}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{let alive=true;Promise.all([document.fonts.ready,document.fonts.load('900 30px "Be Vietnam Pro"','BẮT ĐẦU TIẾP TỤC CHỌN CHƯƠNG CÀI ĐẶT')]).then(()=>{if(!alive||!ref.current)return;const c=ref.current.getContext('2d')!;c.clearRect(0,0,300,46);c.font='900 30px "Be Vietnam Pro", sans-serif';c.textAlign='center';c.textBaseline='alphabetic';c.lineJoin='miter';c.strokeStyle='#10150e';c.lineWidth=6;c.strokeText(text.toLocaleUpperCase('vi'),150,35);c.strokeStyle='#694123';c.lineWidth=3;c.strokeText(text.toLocaleUpperCase('vi'),150,33);c.fillStyle='#e6bf79';c.fillText(text.toLocaleUpperCase('vi'),150,33);});return()=>{alive=false;};},[text]);
 return <><span className="sr-only">{text}</span><canvas ref={ref} width={300} height={46} aria-hidden="true"/></>;
}
function readChapterProgress(){try{const data=JSON.parse(localStorage.getItem('THE_LAST_CHIME_PIXEL_SAVE_V1')??'null');return savedChapterProgress(data?.puzzles??{},data?.campaignVersion);}catch{return {current:1,unlocked:1};}}
function unlockedChapter(){return readChapterProgress().unlocked;}
function currentSavedChapter(){return readChapterProgress().current;}
function MenuDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const before=document.activeElement as HTMLElement|null;ref.current?.focus();const key=(e:KeyboardEvent)=>{
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();onClose();}
  if(e.key==='Tab'){const nodes=ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input');if(!nodes?.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 };window.addEventListener('keydown',key,true);return()=>{window.removeEventListener('keydown',key,true);before?.focus();};},[onClose]);
 return <div className="title-dialog-backdrop"><div className="title-dialog" ref={ref} role="dialog" aria-modal="true" aria-labelledby="title-dialog-heading" tabIndex={-1}><header><h2 id="title-dialog-heading">{title}</h2><button onClick={onClose} aria-label="Đóng cửa sổ">×</button></header>{children}</div></div>;
}
function TitleSettings({muted,onMute}:{muted:boolean;onMute:()=>void}){
 const [music,setMusic]=useState(soundManager.getMusicVolume()),[sfx,setSfx]=useState(soundManager.getSfxVolume());
 return <div className="title-settings"><button onClick={onMute} aria-pressed={!muted}>{muted?<VolumeX size={20}/>:<Volume2 size={20}/>}Âm thanh {muted?'đã tắt':'đang bật'}</button><label>Nhạc nền <output>{Math.round(music*100)}%</output><input aria-label="Âm lượng nhạc nền" type="range" min="0" max="1" step="0.05" value={music} onChange={e=>{const value=Number(e.target.value);setMusic(value);soundManager.setMusicVolume(value);}}/></label><label>Hiệu ứng <output>{Math.round(sfx*100)}%</output><input aria-label="Âm lượng hiệu ứng" type="range" min="0" max="1" step="0.05" value={sfx} onChange={e=>{const value=Number(e.target.value);setSfx(value);soundManager.setSfxVolume(value);soundManager.playClockTick();}}/></label></div>;
}
export function TitleScreen({onStart,onContinue,onSelectChapter,hasSave}:{onStart:()=>void;onContinue:()=>void;onSelectChapter:(stage:number)=>void;hasSave:boolean}){
 const [muted,setMuted]=useState(soundManager.getMuted()),[panel,setPanel]=useState<'chapters'|'settings'|null>(null),[reaction,setReaction]=useState<TitleReaction>(null);
 const [unlocked]=useState(unlockedChapter);
 const react=(who:'linh'|'an')=>setReaction({who,at:performance.now()});
 const toggleMute=()=>{soundManager.init();soundManager.setMuted(!muted);setMuted(!muted);};
 return <section className="illustrated-title" aria-label="The Last Chime — Menu chính">
  <div className="illustrated-title-haze" aria-hidden="true"/>
  <div className="illustrated-menu-stage" inert={panel!==null}>
   <h1 className="sr-only">The Last Chime — Tiếng chuông dưới tán rêu</h1><MenuScene reaction={reaction}/>
   <button className="title-actor title-actor-linh" onClick={()=>react('linh')} onPointerEnter={()=>react('linh')} aria-label="Chào Linh"/>
   <button className="title-actor title-actor-an" onClick={()=>react('an')} onPointerEnter={()=>react('an')} aria-label="Chào An"/>
   <nav className="illustrated-menu-actions" aria-label="Menu chính">
    <button onClick={onStart}><MenuLabel text="Bắt đầu"/></button>
    <button onClick={onContinue} disabled={!hasSave} title={hasSave?'Tiếp tục hành trình đã lưu':'Chưa có hành trình đã lưu'}><MenuLabel text="Tiếp tục"/></button>
    <button onClick={()=>setPanel('chapters')}><MenuLabel text="Chọn chương"/></button>
    <button onClick={()=>setPanel('settings')}><MenuLabel text="Cài đặt"/></button>
   </nav>
   <button className="illustrated-menu-audio" aria-label={muted?'Bật âm thanh':'Tắt âm thanh'} onClick={toggleMute}>{muted?<VolumeX size={20}/>:<Volume2 size={20}/>}</button>
  </div>
  {panel==='chapters'&&<ChapterSelect unlocked={unlocked} current={hasSave?currentSavedChapter():0} onSelect={onSelectChapter} onClose={()=>setPanel(null)}/>}
  {panel==='settings'&&<MenuDialog title="Cài đặt" onClose={()=>setPanel(null)}><TitleSettings muted={muted} onMute={toggleMute}/></MenuDialog>}
 </section>;
}
