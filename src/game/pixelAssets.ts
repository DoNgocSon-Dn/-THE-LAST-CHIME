import { InteractableObject, PuzzleState } from '../types/game';
export type SpriteRect = { x:number; y:number; width:number; height:number };
type Cut = [string,number,number,number,number];
const cuts:Record<string,Cut>={
  ledge:['map-13',778,370,166,85],
  clockPast:['objects',40,20,215,395],clockPresent:['objects',280,20,235,395],
  gear:['objects',550,95,135,115],gearRust:['objects',710,95,140,115],hand:['objects',40,450,155,140],
  tools:['objects',220,460,140,130],key:['objects',380,460,90,135],box:['objects',490,470,145,125],
  diary:['objects',650,470,100,125],letter:['objects',765,470,100,125],ribbon:['objects',45,685,145,140],
  bear:['objects',245,675,135,150],doll:['objects',440,680,125,150],watch:['objects',635,690,100,130],
  doorPast:['objects',25,895,185,240],doorPresent:['objects',220,890,185,245],gate:['objects',420,890,260,245],portal:['objects',690,890,190,250],
  sofaPast:['furniture',20,65,235,115],sofaPresent:['furniture',465,60,235,120],
  tablePast:['furniture',100,155,155,65],tablePresent:['furniture',545,155,155,70],
  lampPast:['furniture',264,48,65,140],lampPresent:['furniture',695,61,55,135],
  cabinetPast:['furniture',333,30,115,165],cabinetPresent:['furniture',755,25,120,180],
  diningPast:['furniture',25,240,335,150],diningPresent:['furniture',462,250,265,140],
  bedPast:['furniture',25,455,102,133],bedPresent:['furniture',464,465,111,125],
  deskPast:['furniture',125,457,120,133],deskPresent:['furniture',572,490,95,95],
  booksPast:['furniture',243,444,98,145],booksPresent:['furniture',668,464,95,120],
  wardrobePast:['furniture',340,420,110,170],wardrobePresent:['furniture',763,416,115,180],
  benchPast:['furniture',35,640,190,150],benchPresent:['furniture',466,633,185,155],
  workshopPast:['furniture',235,625,205,165],workshopPresent:['furniture',657,625,210,165],
  windowPast:['furniture',35,826,170,122],windowPresent:['furniture',467,826,170,122],
  rugPast:['furniture',70,953,345,65],rugPresent:['furniture',515,953,345,65],
  crack:['furniture',30,1050,143,140],debris:['furniture',190,1050,140,140],vines:['furniture',347,1048,206,145],web:['furniture',575,1050,143,140],moss:['furniture',743,1050,130,140],
  familyPast:['memories',30,54,212,170],familyPresent:['memories',269,54,218,174],
  linhPhotoPast:['memories',525,60,137,159],linhPhotoPresent:['memories',715,60,135,159],
  familyWork:['memories',130,298,255,165],familyWorkPresent:['memories',477,296,214,167],
  lock:['memories',38,1007,145,140],parts:['memories',205,1010,157,140],book:['memories',380,1010,162,135],seal:['memories',552,1007,165,140],redThread:['memories',730,1005,151,140],
};
for(const [row,action]of ['Idle','Walk','Run','Jump','Interact','Menu'].entries())for(let i=0;i<8;i++)cuts[`anUnified${action}${i}`]=['an-unified',i,row,1,1];
for(const [row,action]of ['Repair','Story'].entries())for(let i=0;i<8;i++)cuts[`anSeated${action}${i}`]=['an-seated',i,row,1,1];
for(let i=0;i<6;i++){
  const x=i*200+35;
  cuts[`menuLinhWave${i}`]=['menu-actors',x,45,145,180];
  cuts[`menuLinhHappy${i}`]=['menu-actors',x,262,145,181];
}
for(let i=0;i<9;i++){
  cuts[`lost${i}`]=['pursuer',i%3*298,Math.floor(i/3)*400,298,400];
  cuts[`npc${i}`]=['npc',i%3*298,Math.floor(i/3)*400,298,400];
}
for(let i=0;i<6;i++){
  cuts[`walk${i}`]=['animations',Math.floor(i*896/6),20,Math.floor(896/6),225];
  cuts[`jump${i}`]=['animations',Math.floor(i*896/6),250,Math.floor(896/6),300];
}
for(const [i,x,w]of [[0,45,185],[1,240,170],[2,410,140]])cuts[`interact${i}`]=['animations',x,563,w,225];
for(let i=0;i<4;i++){
  cuts[`linhIdle${i}`]=['animations',i*220,800,220,185];
  cuts[`linhGesture${i}`]=['animations',i*220,985,220,215];
}
for(let i=0;i<6;i++)cuts[`lostAction${i}`]=['memories',i%3*298,548+Math.floor(i/3)*210,298,205];

/** Deterministic import of JPG sprite sheets: remove only border-connected white.
 * Enclosed highlights (eyes, paper, clothing) retain their original pixels.
 */
export function removeSheetBackground(canvas:HTMLCanvasElement,trim=true,character=false):HTMLCanvasElement{
  const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
  const {width:w,height:h}=canvas;const pixels=ctx.getImageData(0,0,w,h);const d=pixels.data;
  const seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
  const push=(p:number)=>{
    if(p<0||p>=w*h||seen[p])return;seen[p]=1;
    const j=p*4,r=d[j],g=d[j+1],b=d[j+2];
    if(Math.min(r,g,b)>(character?140:220)&&Math.max(r,g,b)-Math.min(r,g,b)<(character?48:32)){queue[tail++]=p;d[j+3]=0;}
  };
  for(let x=0;x<w;x++){push(x);push((h-1)*w+x);}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}
  while(head<tail){const p=queue[head++];if(p%w)push(p-1);if(p%w<w-1)push(p+1);if(p>=w)push(p-w);if(p<w*(h-1))push(p+w);if(character){if(p%w&&p>=w)push(p-w-1);if(p%w<w-1&&p>=w)push(p-w+1);if(p%w&&p<w*(h-1))push(p+w-1);if(p%w<w-1&&p<w*(h-1))push(p+w+1);}}
  if(character){
    // Remove disconnected JPEG flecks, while retaining all interior skin/eye highlights.
    const visited=new Uint8Array(w*h);let largest:number[]=[];
    for(let seed=0;seed<w*h;seed++)if(d[seed*4+3]&&!visited[seed]){
      const component:number[]=[seed];visited[seed]=1;
      for(let k=0;k<component.length;k++){
        const at=component[k],x=at%w,y=Math.floor(at/w);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          const nx=x+dx,ny=y+dy;if(nx<0||nx>=w||ny<0||ny>=h)continue;
          const next=ny*w+nx;if(!visited[next]&&d[next*4+3]){visited[next]=1;component.push(next);}
        }
      }
      if(component.length>largest.length)largest=component;
    }
    const keep=new Uint8Array(w*h);for(const at of largest)keep[at]=1;
    for(let at=0;at<w*h;at++)if(!keep[at])d[at*4+3]=0;
  }
  ctx.putImageData(pixels,0,0);
  if(!trim)return canvas;
  let left=w,right=-1,top=h,bottom=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>0){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right<left)return canvas;
  const out=document.createElement('canvas');out.width=right-left+1;out.height=bottom-top+1;
  out.getContext('2d')!.drawImage(canvas,left,top,out.width,out.height,0,0,out.width,out.height);return out;
}

export class PixelAssets{
  private sprites=new Map<string,HTMLCanvasElement>();
  private characterPivots=new Map<string,number>();
  readonly ready:Promise<void>;
  constructor(){
    this.ready=Promise.all([...new Set(Object.values(cuts).map(c=>c[0]))].map(name=>new Promise<void>((resolve,reject)=>{
      const img=new Image();img.onload=()=>{try{
        for(const [key,[sheet,x,y,w,h]]of Object.entries(cuts))if(sheet===name){
          const gridRows=sheet==='an-unified'?6:sheet==='an-seated'?2:0;
          const sx=gridRows?Math.round(x*img.width/8):x,sy=gridRows?Math.round(y*img.height/gridRows):y,sw=gridRows?Math.round((x+1)*img.width/8)-sx:w,sh=gridRows?Math.round((y+1)*img.height/gridRows)-sy:h;
          const canvas=document.createElement('canvas');canvas.width=sw;canvas.height=sh;
          canvas.getContext('2d')!.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
          if(gridRows){
            const ctx=canvas.getContext('2d')!,pixels=ctx.getImageData(0,0,sw,sh);
            for(let j=3;j<pixels.data.length;j+=4)pixels.data[j]=pixels.data[j]<128?0:255;
            ctx.putImageData(pixels,0,0);
          }
          const character=/^(menuLinh|anUnified|anSeated|npc\d|walk\d|jump\d|interact\d|linhIdle\d|linhGesture\d|clockPast$|clockPresent$)/.test(key);
          const sprite=removeSheetBackground(canvas,true,character);
          this.sprites.set(key,sprite);
          if(key.startsWith('anUnified')||key.startsWith('anSeated')||key.startsWith('menu')){
            const headRows=Math.max(1,Math.floor(sprite.height*.23));
            const pixels=sprite.getContext('2d')!.getImageData(0,0,sprite.width,headRows).data;
            let sum=0,count=0;
            for(let y=0;y<headRows;y++)for(let x=0;x<sprite.width;x++)if(pixels[(y*sprite.width+x)*4+3]>128){sum+=x+.5;count++;}
            this.characterPivots.set(key,count?sum/count:sprite.width/2);
          }
        }
        resolve();
      }catch(error){reject(error);}};img.onerror=()=>reject(new Error(`Không tải được nhân vật ${name}.`));img.src=`${import.meta.env.BASE_URL}assets/pixel/${name}.${name==='menu-actors'||name==='an-unified'||name==='an-seated'?'png':'jpg'}`;
    }))).then(()=>undefined);
  }
  isReady(){return this.sprites.size===Object.keys(cuts).length;}
  getCharacterPivot(key:string){return this.characterPivots.get(key)??(this.get(key)?.width??0)/2;}
  get(key:string){return this.sprites.get(key);}
  draw(ctx:CanvasRenderingContext2D,key:string,x:number,y:number,w:number,h:number):boolean{
    const sprite=this.get(key);if(!sprite)return false;
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(sprite,Math.round(x),Math.round(y),Math.round(w),Math.round(h));ctx.restore();return true;
  }
  feet(ctx:CanvasRenderingContext2D,key:string,cx:number,bottom:number,height:number,flip=false):boolean{
    const sprite=this.get(key);if(!sprite)return false;const w=height*sprite.width/sprite.height;
    ctx.save();ctx.translate(Math.round(cx),Math.round(bottom));if(flip)ctx.scale(-1,1);
    this.draw(ctx,key,-w/2,-height,w,height);ctx.restore();return true;
  }
  object(ctx:CanvasRenderingContext2D,obj:InteractableObject,past:boolean,puzzles:PuzzleState,tick:number):boolean{
    let key='';
    if(obj.id.startsWith('chase_seal_')||obj.id.startsWith('boss_trap_')){
      const index=Number(obj.id.slice(-1)),chase=obj.id.startsWith('chase_');
      const used=chase?puzzles.chaseSeals?.includes(index):puzzles.bossHits?.includes(index);
      if(used)return true;
      const era=chase?(index===1?!past:past):past;
      ctx.save();ctx.globalAlpha=era?1:.35;
      const active=!chase&&(puzzles.bossExposedTrap===index||puzzles.bossArmedTrap===index);
      if(!chase){ctx.strokeStyle=active?'#ffe4a0':'#719b85';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(obj.x+obj.width/2,obj.y+obj.height,35,7,0,0,Math.PI*2);ctx.stroke();}
      ctx.shadowColor=active?'#ffe4a0':'#64b9a2';ctx.shadowBlur=active?20:8;
      this.feet(ctx,'seal',obj.x+obj.width/2,obj.y+obj.height,36);
      ctx.font='bold 8px "VT323", monospace';ctx.textAlign='center';ctx.fillStyle='#e5c77d';ctx.fillText(String(index+1),obj.x+obj.width/2,obj.y+15);ctx.restore();return true;
    }
    if(obj.bakedIntoMap||obj.type==='npc_memory'||obj.id==='light_target')return true;
    if(obj.id==='pocket_watch_box'&&puzzles.hasWatch)return true;
    if(obj.id==='clock_gear'&&puzzles.clockGearFound)return true;
    if(obj.id==='mother_note_ch1'){
      if(puzzles.motherNoteCh1Read)return true;
      const sprite=this.get('letter');if(!sprite)return false;
      ctx.save();ctx.imageSmoothingEnabled=false;
      ctx.translate(Math.round(obj.x+obj.width/2),Math.round(obj.y+obj.height-2));
      ctx.fillStyle='rgba(9,17,14,.4)';ctx.fillRect(-5,0,11,2);
      ctx.transform(1,-.12,.45,.35,0,0);ctx.globalAlpha=.82;
      ctx.drawImage(sprite,-5,-9,10,9);ctx.restore();return true;
    }
    if(obj.id==='clock'&&puzzles.currentStage===2)return true; // clock is already painted into map 2
    if(obj.id.startsWith('stage_exit')||obj.id==='final_door')key=past?'doorPast':'doorPresent';
    const keys:Record<string,string>={clock:past?'clockPast':'clockPresent',pocket_watch_box:'watch',clock_gear:'gear',family_portrait:past?'familyPast':'familyPresent',fireplace:past?'benchPast':'benchPresent',hallway_pulley:'gear',light_switch:'key',mother_note_ch4:'book',music_box:'box',entrance_journal:'letter',mother_note_ch1:'letter',mother_diary_ch3:'diary',final_diary_ch6:'diary',temporal_anchor:'seal',final_core:'portal'};
    key=keys[obj.id]||key;if(obj.id.startsWith('memory_'))key=obj.id==='memory_garden'?'ribbon':'diary';if(!key)return false;
    const heights:Record<string,number>={clock:128,final_core:90,letter:24,diary:27,gear:23,ribbon:25,book:30,box:24,key:20,seal:44,watch:14};
    const h=obj.chapter===1&&key==='letter'?10:heights[obj.id]??heights[key]??obj.height;
    const cy=obj.y+obj.height;
    return this.feet(ctx,key,obj.x+obj.width/2,cy,h);
  }
}
let shared:PixelAssets|undefined;
export function pixelAssets(){return shared??=new PixelAssets();}
