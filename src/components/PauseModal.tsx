import React,{useState,useRef,useEffect} from 'react';
import {Play,RotateCcw,Home,Volume2,VolumeX} from 'lucide-react';
import {soundManager} from '../game/audio';
export function PauseModal({onResume,onRestart,onMainMenu}:{onResume:()=>void;onRestart:()=>void;onMainMenu:()=>void}){
 const [muted,setMuted]=useState(soundManager.getMuted()),[music,setMusic]=useState(soundManager.getMusicVolume()),[sfx,setSfx]=useState(soundManager.getSfxVolume());
 const panel=useRef<HTMLDivElement>(null);useEffect(()=>{panel.current?.querySelector<HTMLButtonElement>('.pause-resume')?.focus();},[]);
 return <div className="antique-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title"><div className="antique-panel pause-panel" ref={panel} onKeyDown={e=>{if(e.key!=='Tab')return;const buttons=panel.current!.querySelectorAll<HTMLElement>('button,input');const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}>
   <p className="antique-eyebrow">THE LAST CHIME</p><h2 id="pause-title">Thời gian<br/><em>tạm dừng.</em></h2>
   <div className="pause-audio"><div className="pause-audio-title"><span>Âm thanh</span><button className="antique-quiet" aria-label={muted?'Bật âm thanh':'Tắt âm thanh'} aria-pressed={!muted} onClick={()=>{soundManager.setMuted(!muted);setMuted(!muted);}}>{muted?<VolumeX size={20}/>:<Volume2 size={20}/>}<span>{muted?'Đã tắt':'Đang bật'}</span></button></div>
     <label>Nhạc nền<span>{Math.round(music*100)}%</span><input aria-label="Âm lượng nhạc nền" type="range" min={0} max={1} step={.05} value={music} onChange={e=>{const v=Number(e.target.value);setMusic(v);soundManager.setMusicVolume(v);}}/></label>
     <label>Hiệu ứng<span>{Math.round(sfx*100)}%</span><input aria-label="Âm lượng hiệu ứng" type="range" min={0} max={1} step={.05} value={sfx} onChange={e=>{const v=Number(e.target.value);setSfx(v);soundManager.setSfxVolume(v);}}/></label>
   </div>
   <div className="pause-actions"><button className="antique-primary pause-resume" onClick={onResume}><Play size={18}/>Tiếp tục chơi<kbd>Esc</kbd></button><button className="antique-secondary" onClick={onRestart}><RotateCcw size={18}/>Chơi lại từ đầu</button><button className="antique-quiet" onClick={onMainMenu}><Home size={18}/>Về màn hình chính</button></div>
 </div></div>;
}
