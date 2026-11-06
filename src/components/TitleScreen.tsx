import React,{useState} from 'react';
import {Play,Volume2,VolumeX,ArrowRight} from 'lucide-react';
import {soundManager} from '../game/audio';
import {ClockFace} from './ClockFace';
export function TitleScreen({onStart,onContinue,hasSave}:{onStart:()=>void;onContinue:()=>void;hasSave:boolean}){
 const [muted,setMuted]=useState(soundManager.getMuted());
 return <section className="clock-home rust-world">
   <header className="clock-home-header"><span>THE LAST CHIME</span><button className="antique-quiet" aria-label={muted?'Bật âm thanh':'Tắt âm thanh'} onClick={()=>{soundManager.init();soundManager.setMuted(!muted);setMuted(!muted);}}>{muted?<VolumeX size={20}/>:<Volume2 size={20}/>}<span>{muted?'Âm thanh tắt':'Âm thanh bật'}</span></button></header>
   <main className="clock-home-content">
     <div className="clock-home-emblem"><ClockFace hero/><span className="emblem-caption">MỖI VẾT NỨT GIỮ MỘT KÝ ỨC</span></div>
     <div className="clock-home-copy"><p className="antique-eyebrow">MỘT CUỘC TRỞ VỀ · HAI MIỀN THỜI GIAN</p><h1>Tiếng chuông<br/><em>dưới tán rêu.</em></h1><p className="clock-home-description">Có những điều đã ngủ quên mười năm.<br/>Có một người vẫn đợi bạn trở về.</p>
       <div className="clock-home-actions"><button className="antique-primary" onClick={onStart}><Play size={18} fill="currentColor"/>Chơi</button>{hasSave&&<button className="antique-secondary" onClick={onContinue}>Tiếp tục<ArrowRight size={18}/></button>}</div>
     </div>
   </main>
   <footer className="clock-home-footer"><span>PHIÊU LƯU · GIẢI ĐỐ · KÝ ỨC</span><span>“Đừng để nó điểm giờ lần nữa.”</span></footer>
 </section>;
}
