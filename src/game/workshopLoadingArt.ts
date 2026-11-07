type Point=readonly[number,number];
export const SHEET_COLUMNS=[18,212,408,604,800,994];
const masks:Point[][]=[
 [[85,72],[112,73],[126,79],[132,91],[128,106],[122,120],[112,126],[111,131],[134,139],[143,140],[144,148],[137,154],[122,154],[111,150],[113,178],[111,190],[107,205],[117,214],[117,228],[101,231],[91,226],[91,209],[83,194],[66,187],[59,176],[59,153],[64,132],[74,120],[76,105],[75,88]],
 [[288,79],[314,80],[327,87],[330,101],[323,115],[317,126],[323,132],[346,139],[352,149],[347,156],[328,154],[319,151],[319,173],[324,190],[316,207],[321,218],[321,230],[304,230],[294,220],[295,204],[275,199],[259,186],[255,172],[260,148],[265,129],[275,119],[277,105],[276,91]],
 [[489,79],[515,80],[534,88],[538,101],[532,115],[524,126],[529,132],[537,140],[549,128],[557,131],[552,143],[542,154],[537,166],[524,166],[520,185],[518,201],[526,219],[522,230],[505,230],[499,217],[500,204],[480,201],[467,192],[455,180],[456,159],[465,136],[478,121],[480,109],[477,95]],
 [[683,87],[707,86],[729,96],[737,107],[733,120],[724,132],[716,137],[728,143],[741,154],[744,166],[737,171],[720,165],[716,176],[724,191],[720,204],[721,220],[719,230],[699,230],[694,218],[694,205],[672,204],[657,192],[650,179],[652,158],[663,139],[670,127],[668,111],[671,96]]
];
function crop(image:HTMLImageElement,x:number,y:number,w:number,h:number){const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d')!.drawImage(image,x,y,w,h,0,0,w,h);return c;}
function warmCut(canvas:HTMLCanvasElement,fire=false){
 const c=canvas.getContext('2d')!,pixels=c.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
 for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];const keep=fire?r>190&&g>145&&b<145&&r>g*1.04:r>g*1.1&&g>b*1.08;if(!keep)d[i+3]=0;}
 c.putImageData(pixels,0,0);return canvas;
}
export function prepareWorkshopSprites(image:HTMLImageElement){
 const actors=masks.map((points,i)=>{const c=document.createElement('canvas');c.width=190;c.height=176;const ctx=c.getContext('2d')!;ctx.beginPath();points.forEach(([x,y],j)=>j?ctx.lineTo(x-SHEET_COLUMNS[i],y-57):ctx.moveTo(x-SHEET_COLUMNS[i],y-57));ctx.closePath();ctx.clip();ctx.drawImage(image,SHEET_COLUMNS[i],57,190,176,0,0,190,176);return c;});
 const pendulums=SHEET_COLUMNS.map(x=>warmCut(crop(image,x,291,186,160)));
 const gears=SHEET_COLUMNS.map(x=>{const c=warmCut(crop(image,x+4,550,100,108)),ctx=c.getContext('2d')!;ctx.globalCompositeOperation='destination-in';ctx.beginPath();ctx.arc(48,50,48,0,Math.PI*2);ctx.fill();return c;});
 const fire=SHEET_COLUMNS.slice(0,4).map(x=>warmCut(crop(image,x+30,724,140,155),true));
 const watch=warmCut(crop(image,850,738,100,130));
 return {actors,pendulums,gears,fire,watch};
}
export function workshopActorFrame(seconds:number){const phase=seconds%5;if(phase<2.3)return 0;return [0,1,2,3,2,1,0][Math.min(6,Math.floor((phase-2.3)*3))];}
