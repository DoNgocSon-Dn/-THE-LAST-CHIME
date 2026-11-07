import {PixelWorld} from '../game/pixelWorld';
import {pixelAssets} from '../game/pixelAssets';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight} from 'lucide-react';
function StoryScene({scene}:{scene:'dream'|'letter'|'home'}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
   const canvas=ref.current!,ctx=canvas.getContext('2d')!,art=new Image();
   const motion=matchMedia('(prefers-reduced-motion: reduce)'),start=performance.now();
   const panel={dream:0,letter:1,home:2}[scene],world=scene==='home'?new PixelWorld():null,assets=pixelAssets();let raf=0,last=0;
   art.src=`${import.meta.env.BASE_URL}assets/story/opening-scenes.png`;
   const draw=(now:number)=>{raf=requestAnimationFrame(draw);if(document.hidden||now-last<100)return;last=now;
     if(!art.complete||!art.naturalWidth)return;
     const h=art.naturalHeight/3,t=motion.matches?0:(now-start)/1000;
     ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,400,200);
     // Each illustration is a complete scene; no separately scaled actors or props.
     if(scene==='home'){
       if(!world?.isReady())return;
       // Same map, scale and feet baseline as gameplay: no invented house or stretched art.
       ctx.save();ctx.scale(.4,.4);ctx.translate(-200,-200);
       world.background(ctx,200,1000,1200,false,1);
       assets.feet(ctx,'anUnifiedIdle0',350,480,84);
       ctx.restore();
     }else ctx.drawImage(art,0,panel*h,art.naturalWidth,h,0,0,400,200);
     if(!motion.matches&&scene==='home'){
       ctx.save();ctx.strokeStyle='#b1c7c3';ctx.globalAlpha=.12;ctx.lineWidth=1;
       for(let i=0;i<16;i++){const x=(i*41-t*12+400)%400,y=(i*31+t*62)%200;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-2,y+6);ctx.stroke();}ctx.restore();
     }else if(!motion.matches){
       ctx.save();ctx.fillStyle='#f4d48d';
       for(let i=0;i<7;i++){ctx.globalAlpha=.12+(Math.sin(t+i)+1)*.06;ctx.fillRect(32+(i*41+t*2)%160,30+(i*17-t*2+100)%110,1,1);}ctx.restore();
     }
   };raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
 },[scene]);
 return <canvas ref={ref} width={400} height={scene==='home'?150:200} style={{aspectRatio:scene==='home'?'8 / 3':'2 / 1'}} role="img" aria-label={scene==='dream'?'An ngủ gục trên bàn sửa đồng hồ và mơ thấy Linh':scene==='letter'?'Luật sư trao di vật, An đọc lá thư của Mẹ':'An đứng trên lối lát đá bên cổng ngôi nhà cũ'}/>;
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
