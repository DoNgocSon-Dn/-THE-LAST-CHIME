import React from 'react';
const numerals=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
export function ClockFace({shattering=false,hero=false}:{shattering?:boolean;hero?:boolean}){
 return <div className={`antique-clock-wrap ${hero?'hero-clock':''} ${shattering?'clock-shattering':''}`} aria-hidden="true">
   <div className="clock-crown"/><div className="loading-clock">
     <div className="clock-outer-ring"/><div className="clock-ticks"/>
     <div className="clock-numerals">{numerals.map((n,i)=><span key={n} style={{transform:`rotate(${i*30}deg) translateY(-72px) rotate(${-i*30}deg)`}}>{n}</span>)}</div>
     <i className="clock-hand clock-hour"/><i className="clock-hand clock-minute"/><i className="clock-pin"/>
     <span className="clock-engraving">KÝ ỨC · THỜI GIAN</span>
     <span className="clock-moss moss-one"/><span className="clock-moss moss-two"/>
     {shattering&&<svg className="clock-cracks" viewBox="0 0 210 210"><path d="M105 105L86 76 93 53 64 24M105 105L135 87 151 93 184 58M105 105L114 133 98 155 118 197M105 105L71 122 49 115 12 146"/></svg>}
   </div>
   {shattering&&[-1,1,-2,2,0].map((v,i)=><i key={i} className={`clock-shard shard-${i}`}/>)}
 </div>;
}
