import { Platform } from '../types/game';
import { pixelAssets, removeSheetBackground } from './pixelAssets';
import { CHAPTER_ROOMS, MAP_CROPS, ROOM_WIDTH } from './pixelLayout';
export function removeExteriorMattePixels(d:Uint8ClampedArray){
  for(let i=0;i<d.length;i+=4){
    const lo=Math.min(d[i],d[i+1],d[i+2]),hi=Math.max(d[i],d[i+1],d[i+2]);
    if(lo>220&&hi-lo<22)d[i+3]=0;
  }
}
export class PixelWorld {
  private maps=new Map<string,HTMLCanvasElement>();
  private assets=pixelAssets();
  constructor(){
    for(let number=1;number<=13;number++){
      const img=new Image();img.onload=()=>{
        for(const era of ['past','present']as const){
          const c=MAP_CROPS[number][era],canvas=document.createElement('canvas');canvas.width=c.w;canvas.height=c.h;
          canvas.getContext('2d')!.drawImage(img,c.x,c.y,c.w,c.h,0,0,c.w,c.h);
          const clean=removeSheetBackground(canvas,false);
          // Exterior sheets use white as a matte even inside closed arches/fences.
          // Interior sheets keep their painted white dishes and window highlights.
          if([1,7,8,10,11,12,13].includes(number)){
            const context=clean.getContext('2d')!,pixels=context.getImageData(0,0,clean.width,clean.height),d=pixels.data;
            removeExteriorMattePixels(d);
            context.putImageData(pixels,0,0);
          }
          this.maps.set(`${number}-${era}`,clean);
        }
      };img.src=`${import.meta.env.BASE_URL}assets/pixel/map-${number}.jpg`;
    }
  }
  isReady(){return this.maps.size===26;}
  background(ctx:CanvasRenderingContext2D,camera:number,viewport:number,width:number,past:boolean,stage:number){
    ctx.save();ctx.imageSmoothingEnabled=false;
    const sky=ctx.createLinearGradient(0,180,0,600);
    sky.addColorStop(0,past?'#c5a979':'#152e37');sky.addColorStop(1,past?'#6c7560':'#080f17');
    ctx.fillStyle=sky;ctx.fillRect(camera,0,viewport,600);
    const rooms=CHAPTER_ROOMS[stage];
    rooms.forEach((room,index)=>{
      const x=index*ROOM_WIDTH;if(x>camera+viewport||x+ROOM_WIDTH<camera)return;
      const era=past?'past':'present',crop=MAP_CROPS[room.map][era],image=this.maps.get(`${room.map}-${era}`),scale=ROOM_WIDTH/crop.w;
      if(image){
        const y=480-(crop.floor-crop.y)*scale;
        ctx.drawImage(image,x,y,ROOM_WIDTH,crop.h*scale);
        // Extend the soil beneath each painted floor without adding a second grass strip.
        const bottom=y+crop.h*scale;
        ctx.fillStyle=past?'#292b23':'#0c171b';ctx.fillRect(x,bottom,ROOM_WIDTH,Math.max(0,600-bottom));
      }
      if(index>0){ctx.fillStyle=past?'#3c3226':'#142023';ctx.fillRect(x-2,210,4,270);}
    });
    ctx.restore();
  }
  platforms(ctx:CanvasRenderingContext2D,platforms:Platform[],past:boolean){
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(const p of platforms){
      if(p.bakedIntoMap||p.id.startsWith('ground')||p.id.startsWith('terrain_')||p.id==='ceiling'||p.id.startsWith('wall_'))continue;
      if(p.type==='one-way'||p.id.includes('stairs')||p.id.includes('crate')){
        ctx.fillStyle=past?'#6d5335':'#394638';ctx.fillRect(p.x,p.y,p.width,p.height);
        ctx.fillStyle=past?'#a18453':'#6a7954';ctx.fillRect(p.x,p.y,p.width,3);
        ctx.strokeStyle='#1b241c';ctx.lineWidth=1;ctx.strokeRect(p.x,p.y,p.width,p.height);
        if(p.id.includes('crate'))this.assets.draw(ctx,'box',p.x,p.y,p.width,p.height);
        else if(p.id.startsWith('water')||p.id==='cave_exit')this.assets.draw(ctx,'ledge',p.x,p.y-2,p.width,Math.max(22,p.width*.35));
      }else{
        this.assets.draw(ctx,past?'gate':'doorPresent',p.x-4,p.y,p.width+8,p.height);
      }
    }
    ctx.restore();
  }
  foreground(ctx:CanvasRenderingContext2D,camera:number,viewport:number,width:number,tick:number){
    ctx.save();
    const mist=ctx.createLinearGradient(0,455,0,550);mist.addColorStop(0,'#afc7b600');mist.addColorStop(.4,'#afc7b60c');mist.addColorStop(1,'#afc7b600');
    ctx.fillStyle=mist;ctx.fillRect(camera,455,viewport,95);
    const vignette=ctx.createRadialGradient(camera+viewport*.5,370,100,camera+viewport*.5,370,viewport*.72);
    vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#000b164c');ctx.fillStyle=vignette;ctx.fillRect(camera,0,viewport,600);
    ctx.restore();
  }
}
