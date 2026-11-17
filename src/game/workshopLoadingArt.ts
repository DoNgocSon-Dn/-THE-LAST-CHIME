const SHEET_COLUMNS=[18,212,408,604,800,994];
function crop(image:HTMLImageElement,x:number,y:number,w:number,h:number){const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d',{willReadFrequently:true})!.drawImage(image,x,y,w,h,0,0,w,h);return c;}
function warmCut(canvas:HTMLCanvasElement,fire=false){
 const c=canvas.getContext('2d')!,pixels=c.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
 for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];const keep=fire?r>190&&g>145&&b<145&&r>g*1.04:r>g*1.1&&g>b*1.08;if(!keep)d[i+3]=0;}
 c.putImageData(pixels,0,0);return canvas;
}
export function prepareWorkshopSprites(image:HTMLImageElement){
 const pendulums=SHEET_COLUMNS.map(x=>warmCut(crop(image,x,291,186,160)));
 const gears=SHEET_COLUMNS.map(x=>{const c=warmCut(crop(image,x+4,550,100,108)),ctx=c.getContext('2d')!;ctx.globalCompositeOperation='destination-in';ctx.beginPath();ctx.arc(48,50,48,0,Math.PI*2);ctx.fill();return c;});
 return {pendulums,gears};
}

/**
 * Pendulum frames are the same bar+rod+bob at different angles. Cross-fading them shows two bobs at once,
 * so instead take the most vertical frame, keep its suspension bar fixed and rotate only the rod and bob
 * (everything below the bar) about the point where the rod leaves the bar.
 */
export function pendulumRig(frames:HTMLCanvasElement[]){
 const analyse=(c:HTMLCanvasElement)=>{
  const w=c.width,h=c.height,d=c.getContext('2d',{willReadFrequently:true})!.getImageData(0,0,w,h).data;
  const count=(y:number)=>{let n=0;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>0)n++;return n;};
  const widths=Array.from({length:h},(_,y)=>count(y));
  const top=widths.findIndex(n=>n>0);
  if(top<0)return {px:w/2,barBottom:0,angle:0};
  const maxW=Math.max(...widths.slice(top,top+Math.ceil(h*.4)));
  // The bar is the run of wide rows at the top; the rod starts on the first narrow row after it.
  let y=top;while(y<h&&widths[y]<maxW*.45)y++;
  while(y<h&&widths[y]>=maxW*.45)y++;
  const barBottom=Math.min(h-1,y);
  let sx=0,n=0;for(let x=0;x<w;x++)if(d[(barBottom*w+x)*4+3]>0){sx+=x;n++;}
  const px=n?sx/n:w/2;let bx=0,by=0,bn=0;
  for(let yy=Math.floor(h*.6);yy<h;yy++)for(let x=0;x<w;x++)if(d[(yy*w+x)*4+3]>0){bx+=x;by+=yy;bn++;}
  const angle=bn?Math.atan2(bx/bn-px,by/bn-barBottom):0;
  return {px,barBottom,angle};
 };
 const info=frames.map(analyse);
 let base=0;info.forEach((f,i)=>{if(Math.abs(f.angle)<Math.abs(info[base].angle))base=i;});
 const maxAngle=Math.max(...info.map(f=>Math.abs(f.angle-info[base].angle)),.05);
 return {frame:frames[base],pivotX:info[base].px,pivotY:info[base].barBottom,maxAngle:Math.min(maxAngle,.5)};
}
