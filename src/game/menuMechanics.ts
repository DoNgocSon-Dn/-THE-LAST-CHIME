function cut(image:HTMLImageElement,x:number,y:number,w:number,h:number){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d')!;ctx.drawImage(image,x,y,w,h,0,0,w,h);const pixels=ctx.getImageData(0,0,w,h),d=pixels.data;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(!(r>=g&&g>b*1.06))d[i+3]=0;}ctx.putImageData(pixels,0,0);return c;}
export function prepareMenuMechanics(image:HTMLImageElement){return{watch:cut(image,8,39,192,133),large:cut(image,19,410,91,89),medium:cut(image,17,555,67,71),small:cut(image,48,689,45,44),chain:cut(image,8,786,192,103)};}
export function paintMenuMechanics(ctx:CanvasRenderingContext2D,s:ReturnType<typeof prepareMenuMechanics>,t:number){
 // The illustrated wordmark remains in front of its moving mechanism.
 ctx.save();ctx.beginPath();ctx.rect(0,0,1376,768);ctx.rect(260,143,850,93);ctx.rect(630,78,122,53);ctx.clip('evenodd');
 const gears:[number,number,number,number][]=[[430,108,96,.09],[505,156,114,-.07],[575,80,106,.08],[810,76,105,-.09],[875,135,104,.11],[977,142,96,-.08],[1038,245,88,.12],[813,292,102,-.08],[580,303,108,.07],[385,238,78,-.12]];
 gears.forEach(([x,y,w,speed],i)=>{const sprite=i%3===0?s.large:i%3===1?s.medium:s.small;ctx.save();ctx.translate(x,y);ctx.rotate(t*speed);ctx.drawImage(sprite,-w/2,-w/2,w,w);ctx.restore();});
 for(const [x,y,w,phase]of [[384,214,172,0],[844,216,180,1]]){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.8+phase)*.012);ctx.drawImage(s.chain,0,0,w,82);ctx.restore();}
 // Minute and hour hands sweep independently beneath the title lettering.
 ctx.save();ctx.translate(688,174);ctx.strokeStyle='#59432d';ctx.lineWidth=5;for(const[a,l]of [[t*.06+Math.PI,116],[t*.005+1,80]]){ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(0,-l);ctx.stroke();ctx.restore();}ctx.restore();ctx.restore();
 // Swing a single cutout around its chain attachment, avoiding frame jitter.
 ctx.save();ctx.translate(688,316);ctx.rotate(Math.sin(t*1.65)*.16);ctx.drawImage(s.watch,-96,0,192,140);ctx.restore();
}
