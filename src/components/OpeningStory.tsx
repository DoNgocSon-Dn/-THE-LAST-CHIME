import {useEffect,useRef,useState} from 'react';
import {ArrowRight} from 'lucide-react';
function StoryScene({scene}:{scene:'dream'|'letter'|'home'}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current!,ctx=canvas.getContext('2d')!,sheet=new Image(),art=new Image();let raf=0,last=0;const start=performance.now(),motion=matchMedia('(prefers-reduced-motion: reduce)');
 sheet.src=`${import.meta.env.BASE_URL}assets/story/opening-animations.png`;art.src=`${import.meta.env.BASE_URL}assets/story/opening-reference.png`;
 const draw=(now:number)=>{raf=requestAnimationFrame(draw);if(document.hidden||now-last<100)return;last=now;const t=motion.matches?4:(now-start)/1000;ctx.imageSmoothingEnabled=false;ctx.fillStyle='#202b2c';ctx.fillRect(0,0,400,200);
 if(scene==='home'){if(art.complete&&art.naturalWidth)ctx.drawImage(art,665,610,345,165,0,0,400,200);return;}
 if(!sheet.complete||!sheet.naturalWidth)return;
 if(scene==='dream'){const sequence=[0,0,1,1,2,3,4,4,5,2];const i=sequence[Math.floor(t*1.6)%sequence.length];ctx.drawImage(sheet,38+i*188.5,52,181,142,73,0,255,200);}
 else{const sequence=[0,1,2,3,4,5];const step=Math.min(5,Math.floor(t*1.15));const i=sequence[step];ctx.drawImage(sheet,38+i*188.5,251,181,142,0,0,255,200);const lawyer=[1,2,3,3,4,0][step];ctx.save();ctx.translate(395,10);ctx.scale(-1,1);ctx.drawImage(sheet,162+lawyer*147.5,632,140,179,0,0,148,190);ctx.restore();}
 };raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);},[scene]);
 return <canvas ref={ref} width={400} height={200} role="img" aria-label={scene==='dream'?'An ngủ gục bên bàn đồng hồ và mơ thấy Linh':scene==='letter'?'Luật sư trao thư, An mở ra đọc':'An trở về trước cổng ngôi nhà cũ'}/>;
}
const pages=[
 {scene:'dream' as const,title:'Giấc mơ chưa khép',text:'Đêm đã khuya. An ngủ gục bên bàn sửa đồng hồ. Trong mơ, Linh lại đứng trước hiên nhà, vẫy tay gọi anh — như thể đêm bão mười năm trước chưa từng xảy ra.',quote:'Mười năm rồi, anh vẫn nhớ tiếng em gọi.'},
 {scene:'letter' as const,title:'Di vật của Mẹ',text:'Hôm sau, người luật sư tìm đến, trao cho An một phong thư Mẹ để lại. Bên trong là chiếc kim đồng hồ gãy và một dòng chữ:',quote:'“Đừng để nó điểm giờ lần nữa.”'},
 {scene:'home' as const,title:'Một cuộc trở về',text:'An nhận ra chiếc kim ấy. Nó thuộc về chiếc đồng hồ trong căn nhà cũ — nơi Linh đã biến mất. Anh trở về, mang theo lá thư và câu hỏi chưa ai trả lời.',quote:'Sau cánh cổng cũ, một nhịp tích tắc vẫn đang chờ.'}
];
export function OpeningStory({onContinue}:{onContinue:()=>void}){
 const [page,setPage]=useState(0),current=pages[page];
 return <section className="opening-comic story-book" aria-labelledby="opening-title"><article className="opening-comic-paper">
 <header><span>THE LAST CHIME · TRƯỚC TIẾNG CHUÔNG CUỐI</span><div className="story-book-rule" aria-hidden="true">◆</div></header>
 <div className="story-book-spread" key={page}>
 <figure><StoryScene scene={current.scene}/><figcaption>KÝ ỨC {['I','II','III'][page]}</figcaption></figure>
 <div className="story-book-copy" aria-live="polite"><span className="story-book-number">0{page+1} / 03</span><h1 id="opening-title">{current.title}</h1><p>{current.text}</p><blockquote>{current.quote}</blockquote></div>
 </div>
 <footer><button className="story-book-back" disabled={page===0} onClick={()=>setPage(page-1)}>← Trang trước</button><span>CHƯƠNG I — TRỞ VỀ</span><button onClick={()=>page<2?setPage(page+1):onContinue()}>{page<2?'Lật trang':'Trở về ngôi nhà'}<ArrowRight size={18}/></button></footer>
 </article></section>;
}
