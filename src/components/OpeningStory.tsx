import {useEffect,useRef,useState} from 'react';
import {ArrowRight} from 'lucide-react';
function StoryScene({scene}:{scene:'dream'|'letter'|'bus'}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
   const canvas=ref.current!,ctx=canvas.getContext('2d')!,art=new Image();
   const motion=matchMedia('(prefers-reduced-motion: reduce)'),start=performance.now();
   const panel={dream:0,letter:1,bus:2}[scene];let raf=0,last=0;
   art.src=`${import.meta.env.BASE_URL}assets/story/opening-scenes-pixel.png`;
   const draw=(now:number)=>{raf=requestAnimationFrame(draw);if(document.hidden||now-last<100)return;last=now;
     if(!art.complete||!art.naturalWidth)return;
     const h=art.naturalHeight/3,t=motion.matches?0:(now-start)/1000;
     ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,256,128);
     // Each illustration is a complete scene; no separately scaled actors or props.
     ctx.drawImage(art,0,panel*h,art.naturalWidth,h,0,0,256,128);
     if(!motion.matches&&scene==='bus'){
       ctx.save();ctx.beginPath();ctx.rect(0,0,138,110);ctx.clip();ctx.strokeStyle='#b1c7c3';ctx.globalAlpha=.12;ctx.lineWidth=1;
       for(let i=0;i<16;i++){const x=(i*26-t*8+256)%256,y=(i*20+t*40)%128;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-2,y+6);ctx.stroke();}ctx.restore();
     }else if(!motion.matches){
       ctx.save();ctx.fillStyle='#f4d48d';
       for(let i=0;i<7;i++){ctx.globalAlpha=.12+(Math.sin(t+i)+1)*.06;ctx.fillRect(20+(i*26+t*2)%103,20+(i*11-t*2+64)%70,1,1);}ctx.restore();
     }
   };raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
 },[scene]);
 return <canvas ref={ref} width={256} height={128} role="img" aria-label={scene==='dream'?'An ngủ gục trên bàn sửa đồng hồ và mơ thấy Linh':scene==='letter'?'Luật sư trao di vật, An đọc lá thư của Mẹ':'An ngồi trên xe buýt, nhìn qua cửa kính mưa trên đường trở về'}/>;
}
const pages=[
 {scene:'dream' as const,title:'Giấc mơ chưa khép',text:'Đêm đã khuya. An ngủ gục bên bàn sửa đồng hồ. Trong mơ, Linh lại đứng trước hiên nhà, vẫy tay gọi anh — như thể đêm bão mười năm trước chưa từng xảy ra.',quote:'Mười năm rồi, anh vẫn nhớ tiếng em gọi.'},
 {scene:'letter' as const,title:'Di vật của Mẹ',text:'Hôm sau, người luật sư tìm đến, trao cho An một phong thư Mẹ để lại. Bên trong là chiếc kim đồng hồ gãy và một dòng chữ:',quote:'“Đừng để nó điểm giờ lần nữa.”'},
 {scene:'bus' as const,title:'Chuyến xe trở về',text:'Chiếc xe buýt rời phố trong cơn mưa chiều. An ngồi bên cửa kính. Lá thư đã được cất vào túi, nhưng lời nhắn của Mẹ vẫn quanh quẩn trong đầu. Mười năm rồi anh chưa đi lại con đường này. Lần này, anh muốn biết điều gì đã xảy ra với Linh.',quote:'Chỉ còn vài trạm nữa… Mình không quay về giữa chừng đâu.'}
];
export function OpeningStory({onContinue}:{onContinue:()=>void}){
 const [page,setPage]=useState(0),current=pages[page];
 return <section className="opening-comic story-book" aria-labelledby="opening-title"><article className="opening-comic-paper">
 <header><span>THE LAST CHIME · TRƯỚC TIẾNG CHUÔNG CUỐI</span><div className="story-book-rule" aria-hidden="true">◆</div></header>
 <div className="story-book-spread" key={page}>
 <figure><StoryScene scene={current.scene}/><figcaption>KÝ ỨC {['I','II','III'][page]}</figcaption></figure>
 <div className="story-book-copy" aria-live="polite"><span className="story-book-number">0{page+1} / 03</span><h1 id="opening-title">{current.title}</h1><p>{current.text}</p><blockquote>{current.quote}</blockquote></div>
 </div>
 <footer><button className="story-book-back" disabled={page===0} onClick={()=>setPage(page-1)}>← Trang trước</button><span>CHƯƠNG I — TRỞ VỀ</span><button onClick={()=>page<2?setPage(page+1):onContinue()}>{page<2?'Lật trang':'Xuống xe'}<ArrowRight size={18}/></button></footer>
 </article></section>;
}
