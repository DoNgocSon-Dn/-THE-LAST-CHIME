import React,{useState} from 'react';
import {Play,Volume2,VolumeX} from 'lucide-react';
import {soundManager} from '../game/audio';
import {MenuScene} from './MenuScene';
import {PixelMenuClock} from './PixelMenuClock';
export function TitleScreen({onStart,onContinue,hasSave}:{onStart:()=>void;onContinue:()=>void;hasSave:boolean}){
 const [muted,setMuted]=useState(soundManager.getMuted());
 return <section className="pixel-title">
   <MenuScene/><div className="pixel-title-shade"/>
   <button className="pixel-audio" aria-label={muted?'Bật âm thanh':'Tắt âm thanh'} onClick={()=>{soundManager.init();soundManager.setMuted(!muted);setMuted(!muted);}}>{muted?<VolumeX size={20}/>:<Volume2 size={20}/>}</button>
   <main className="pixel-title-layout"><div className="pixel-title-copy"><p className="pixel-title-name">THE LAST CHIME</p><h1>Tiếng chuông<br/>dưới tán rêu</h1><nav aria-label="Menu chính"><button className="pixel-menu-primary" onClick={onStart}><Play size={17} fill="currentColor"/>Chơi mới</button>{hasSave&&<button onClick={onContinue}>Tiếp tục</button>}</nav></div><PixelMenuClock/></main>
   <footer>“Đừng để nó điểm giờ lần nữa.”</footer>
 </section>;
}
