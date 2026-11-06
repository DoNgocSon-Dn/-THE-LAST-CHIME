import React from 'react';
import {ArrowRight} from 'lucide-react';
export function OpeningStory({onContinue}:{onContinue:()=>void}){
 return <section className="opening-story rust-world" aria-labelledby="opening-title">
   <article className="opening-story-paper"><p className="antique-eyebrow">TRƯỚC TIẾNG CHUÔNG CUỐI</p><h1 id="opening-title">Một lá thư.<br/><em>Một cuộc trở về.</em></h1>
   <div className="opening-prose"><p>Mười năm trước, chiếc đồng hồ cổ điểm một tiếng chuông lạ. Linh biến mất trong đêm bão ấy. Ký ức của An chỉ còn những mảnh rời rạc.</p><p>Giờ đây, luật sư trao lại di vật Mẹ để lại: một chiếc kim gãy và lời nhắn <em>“Đừng để nó điểm giờ lần nữa.”</em></p><p>An trở về ngôi nhà đã bị rêu phủ kín. Phía sau cánh cửa cũ, một nhịp tích tắc vẫn đang chờ.</p></div>
   <button className="antique-primary" onClick={onContinue}>Trở về ngôi nhà<ArrowRight size={18}/></button><span className="opening-chapter">CHƯƠNG I — TRỞ VỀ</span></article>
 </section>;
}
