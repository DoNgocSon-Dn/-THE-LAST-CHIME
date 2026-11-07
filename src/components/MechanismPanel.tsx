import {Leaf,Moon,Sun,RotateCcw,RotateCw} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import {MECHANISMS,NOTE_NAMES,PORCH_SYMBOLS,type MechanismId} from '../game/mechanisms';
import {soundManager} from '../game/audio';

export function MechanismPanel({id,clues,onClose,onSubmit}:{id:MechanismId;clues:string[];onClose:()=>void;onSubmit:(values:number[])=>boolean}){
 const [values,setValues]=useState<number[]>(id==='clock'?[12,0]:id==='music_box'?[]:(id==='porch_lock'||id==='well_winch')?[0,0]:[0,0,0]);
 const [feedback,setFeedback]=useState('');
 const [journal,setJournal]=useState(false);
 const [lastNote,setLastNote]=useState<number|null>(null);
 const root=useRef<HTMLDivElement>(null);
 const info=MECHANISMS[id];
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;root.current?.focus();
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();onClose();}
   if(e.key==='Tab'&&root.current){const controls=Array.from(root.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));const first=controls[0],last=controls.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===root.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  };window.addEventListener('keydown',key,true);return()=>{window.removeEventListener('keydown',key,true);previous?.focus();};
 },[onClose]);
 const turn=(i:number,d:number,max:number,min=0)=>{setValues(old=>old.map((v,n)=>n===i?((v-min+d+max)%max)+min:v));setFeedback('');soundManager.playClockTick();};
 const note=(n:number)=>{setValues(old=>old.length===3?[n]:[...old,n]);setLastNote(n);setFeedback('');soundManager.playPuzzleNote(n);};
 const submit=()=>{if(!onSubmit(values)){setFeedback(id==='music_box'?'Khúc nhạc ngắt giữa chừng. Các chốt vẫn giữ nguyên.':'Cơ cấu rung nhẹ rồi dừng. Các dấu vẫn chưa khớp.');soundManager.playClockTick();}};
 return <div className="mechanism-backdrop"><div ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="mechanism-title" className="mechanism-panel">
  <header><span>KIỂM TRA ĐỒ VẬT</span><button onClick={onClose} aria-label="Rời cơ cấu">Đặt xuống ×</button></header>
  <h2 id="mechanism-title">{info.title}</h2><p className="mechanism-description">{info.description}</p>
  {id==='clock'&&<><div className="mechanism-dial" aria-label={`Đồng hồ đang chỉ ${values[0]} giờ ${values[1]} phút`}>
    {Array.from({length:12},(_,i)=><span key={i} style={{transform:`rotate(${i*30}deg) translateY(-83px) rotate(${-i*30}deg)`}}>{i===0?12:i}</span>)}
    <i className="dial-hour" style={{transform:`rotate(${values[0]*30+values[1]/2}deg)`}}/><i className="dial-minute" style={{transform:`rotate(${values[1]*6}deg)`}}/><b/>
   </div><div className="mechanism-controls">{['Giờ','Phút'].map((name,i)=><div key={name}><label>{name}</label><div><button aria-label={`Giảm ${name.toLowerCase()}`} onClick={()=>turn(i,i===0?-1:-5,i===0?12:60,i===0?1:0)}>−</button><output>{String(values[i]).padStart(2,'0')}</output><button aria-label={`Tăng ${name.toLowerCase()}`} onClick={()=>turn(i,i===0?1:5,i===0?12:60,i===0?1:0)}>+</button></div></div>)}</div></>}
  {id==='music_box'&&<div className="mechanism-music"><div className="melody-slots" aria-label="Đoạn nhạc đã chọn">{[0,1,2].map(i=><span key={i}>{values[i]===undefined?'·':NOTE_NAMES[values[i]]}</span>)}</div>
    <div className="music-keys">{NOTE_NAMES.map((name,n)=><button key={name} className={lastNote===n?'struck':''} onClick={()=>note(n)} aria-label={`Gảy ${name}`}>{name}</button>)}</div>
    <button className="mechanism-reset" onClick={()=>{setValues([]);setLastNote(null);setFeedback('');}}>Xóa đoạn nhạc</button></div>}
  {(id==='porch_lock'||id==='well_winch')&&<div className="mechanism-rings">{['Bên trái','Bên phải'].map((name,i)=><div key={name}><label>{name}</label><div className="number-ring symbol-ring"><button aria-label={`Giảm ${name.toLowerCase()}`} onClick={()=>turn(i,-1,id==='porch_lock'?3:4)}><RotateCcw size={19} aria-hidden="true"/></button><output aria-label={id==='porch_lock'?`${name}: ${PORCH_SYMBOLS[values[i]]}`:`${name}: ${values[i]}`} aria-live="polite">{id==='porch_lock'?(()=>{const Symbol=[Leaf,Moon,Sun][values[i]];return <Symbol size={42} strokeWidth={1.6} aria-hidden="true"/>;})():values[i]}</output><button aria-label={`Tăng ${name.toLowerCase()}`} onClick={()=>turn(i,1,id==='porch_lock'?3:4)}><RotateCw size={19} aria-hidden="true"/></button></div></div>)}</div>}
  {id==='greenhouse_console'&&<div className="light-circuit"><div className="circuit-lanes">{values.map((v,i)=><span className={v?'is-lit':''} key={i}>Dải {['I','II','III'][i]} · {v?'Sáng':'Tắt'}</span>)}</div><div className="circuit-levers">{['A','B','C'].map((n,i)=><button key={n} onClick={()=>{setValues(old=>old.map((v,j)=>j===i||(i<2&&j===i+1)?1-v:v));setFeedback('');soundManager.playSwitchFlip();}}>Cần {n}<small>{['I + II','II + III','III'][i]}</small></button>)}</div></div>}
  {id==='temporal_anchor'&&<div className="mechanism-rings">{['Vòng ngoài','Vòng giữa','Vòng trong'].map((name,i)=><div key={name}><label>{name}</label><div className="number-ring"><button aria-label={`Xoay ${name.toLowerCase()} ngược chiều`} onClick={()=>turn(i,-1,10)}>↶</button><output>{values[i]}</output><button aria-label={`Xoay ${name.toLowerCase()} thuận chiều`} onClick={()=>turn(i,1,10)}>↷</button></div></div>)}</div>}
  <p role="status" className="mechanism-feedback">{feedback||'Có thể đặt xuống và quay lại bất cứ lúc nào.'}</p>
  <button className="mechanism-submit" disabled={id==='music_box'&&values.length!==3} onClick={submit}>{id==='clock'?'Lên dây cót':id==='music_box'?'Kéo cần phát nhạc':id==='porch_lock'?'Kéo chốt cửa':id==='well_winch'?'Quay tay giếng':id==='greenhouse_console'?'Kiểm tra dòng sáng':'Ghép nhịp'}</button>
  <button className="mechanism-journal-toggle" aria-expanded={journal} onClick={()=>setJournal(!journal)}>Sổ tay của An {journal?'−':'+'}</button>
  {journal&&<aside className="mechanism-journal"><h3>Dấu vết đã ghi lại</h3>{clues.length?clues.map(c=><p key={c}>{c}</p>):<p>Chưa ghi được dấu vết nào. Có thể kiểm tra căn phòng ở thời điểm còn lại.</p>}</aside>}
 </div></div>;
}
