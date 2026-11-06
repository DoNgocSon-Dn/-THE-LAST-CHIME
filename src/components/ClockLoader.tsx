import React from 'react';
import {ClockFace} from './ClockFace';
export function ClockLoader({progress,error,shattering=true}:{progress?:number;error?:string;shattering?:boolean}){
 return <section className={`clock-loading rust-world ${error?'has-error':''}`} role="status" aria-live="polite" aria-label="Đang tải game">
   <span className="loading-wordmark">THE LAST CHIME</span>
   <ClockFace shattering={shattering}/>
   <h1>{error?'Một nhịp chuông lỡ.':'Ký ức đang thức giấc.'}</h1>
   <p>{error||'Những mảnh thời gian đang tìm về với nhau.'}</p>
   {!error&&<div className="loading-progress">{progress!==undefined?<><div className="loading-track" role="progressbar" aria-label="Tải tài nguyên" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress*100)}><span style={{width:`${progress*100}%`}}/></div><span>{Math.round(progress*100)}%</span></>:<span className="loading-preparing">ĐANG MỞ CÁNH CỬA KÝ ỨC</span>}</div>}
   {error&&<button className="antique-primary" onClick={()=>window.location.reload()}>Thử tải lại</button>}
   <span className="loading-bottom">TIẾNG CHUÔNG DƯỚI TÁN RÊU</span>
 </section>;
}
