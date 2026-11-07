import {useEffect,useRef} from 'react';
import {ArrowRight} from 'lucide-react';
function StoryScene({scene}:{scene:'dream'|'letter'|'home'}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current!,ctx=canvas.getContext('2d')!,sheet=new Image(),art=new Image();let raf=0,last=0;const start=performance.now(),motion=matchMedia('(prefers-reduced-motion: reduce)');
 sheet.src=`${import.meta.env.BASE_URL}assets/story/opening-animations.png`;art.src=`${import.meta.env.BASE_URL}assets/story/opening-reference.png`;
 const draw=(now:number)=>{raf=requestAnimationFrame(draw);if(document.hidden||now-last<100)return;last=now;const t=motion.matches?4:(now-start)/1000;ctx.imageSmoothingEnabled=false;ctx.fillStyle='#202b2c';ctx.fillRect(0,0,400,200);
 if(scene==='home'){if(art.complete&&art.naturalWidth)ctx.drawImage(art,665,610,345,165,0,0,400,200);return;}
 if(!sheet.complete||!sheet.naturalWidth)return;
 if(scene==='dream'){const sequence=[0,0,1,1,2,3,4,4,5,2];const i=sequence[Math.floor(t*1.6)%sequence.length];ctx.drawImage(sheet,38+i*188.5,52,181,142,73,0,255,200);}
 else{const sequence=[0,1,2,3,4,5,5,5,4,5];const i=sequence[Math.floor(t*1.4)%sequence.length];ctx.drawImage(sheet,38+i*188.5,251,181,142,0,0,255,200);const lawyer=Math.min(5,Math.floor(t*.8)%6);ctx.drawImage(sheet,162+lawyer*147.5,632,140,179,247,10,148,190);}
 };raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);},[scene]);
 return <canvas ref={ref} width={400} height={200} role="img" aria-label={scene==='dream'?'An ngủ gục bên bàn đồng hồ và mơ thấy Linh':scene==='letter'?'Luật sư trao thư, An mở ra đọc':'An trở về trước cổng ngôi nhà cũ'}/>;
}
export function OpeningStory({onContinue}:{onContinue:()=>void}){
 return <section className="opening-comic" aria-labelledby="opening-title"><article className="opening-comic-paper">
 <header><span>TRƯỚC TIẾNG CHUÔNG CUỐI</span><h1 id="opening-title">Một cuộc trở về</h1><div className="story-wax" aria-hidden="true">◷</div></header>
 <div className="opening-comic-row"><p>Đêm đã khuya. An ngủ gục bên bàn sửa đồng hồ. Trong mơ, Linh lại đứng trước hiên nhà, vẫy tay gọi anh — như thể đêm bão mười năm trước chưa từng xảy ra.</p><figure><StoryScene scene="dream"/><figcaption>Giấc mơ cũ</figcaption></figure></div>
 <div className="opening-comic-row reverse"><figure><StoryScene scene="letter"/><figcaption>Di vật của Mẹ</figcaption></figure><p>Hôm sau, người luật sư tìm đến, trao cho An một phong thư Mẹ để lại. Bên trong là chiếc kim đồng hồ gãy và một dòng chữ: <em>“Đừng để nó điểm giờ lần nữa.”</em></p></div>
 <div className="opening-comic-row"><p>An nhận ra chiếc kim ấy. Nó thuộc về chiếc đồng hồ trong căn nhà cũ — nơi Linh đã biến mất. Anh trở về, mang theo lá thư và câu hỏi chưa ai trả lời.</p><figure><StoryScene scene="home"/><figcaption>Ngôi nhà vẫn đợi</figcaption></figure></div>
 <footer><span>CHƯƠNG I — TRỞ VỀ</span><button onClick={onContinue}>Trở về ngôi nhà <ArrowRight size={20}/></button></footer>
 </article></section>;
}
