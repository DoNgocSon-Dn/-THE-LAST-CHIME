const SHEET_COLUMNS=[18,212,408,604,800,994];
function crop(image:HTMLImageElement,x:number,y:number,w:number,h:number){const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d')!.drawImage(image,x,y,w,h,0,0,w,h);return c;}
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
