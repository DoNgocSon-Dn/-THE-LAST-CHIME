import {REBUILT_OUTDOOR_MAPS,rebuiltOutdoorPath} from './outdoorAssets';
import { Platform } from '../types/game';
import { pixelAssets, removeSheetBackground } from './pixelAssets';
import { chapterRooms, MAP_CROPS } from './pixelLayout';
export function removeExteriorMattePixels(d:Uint8ClampedArray){
  for(let i=0;i<d.length;i+=4){
    const lo=Math.min(d[i],d[i+1],d[i+2]),hi=Math.max(d[i],d[i+1],d[i+2]);
    if(lo>220&&hi-lo<22)d[i+3]=0;
  }
}
export class PixelWorld {
  private maps=new Map<string,HTMLCanvasElement>();
  private assets=pixelAssets();
  private outdoorSky=new Map<string,string>();
  constructor(){
    for(const number of REBUILT_OUTDOOR_MAPS)this.loadRebuiltOutdoor(number);
    for(let number=1;number<=13;number++){
      if((REBUILT_OUTDOOR_MAPS as readonly number[]).includes(number))continue;
      const img=new Image();img.onload=()=>{
        for(const era of ['past','present']as const){
          const c=MAP_CROPS[number][era],canvas=document.createElement('canvas');canvas.width=c.w;canvas.height=c.h;
          canvas.getContext('2d')!.drawImage(img,c.x,c.y,c.w,c.h,0,0,c.w,c.h);
          const clean=removeSheetBackground(canvas,false);
          // Exterior sheets use white as a matte even inside closed arches/fences.
          // Interior sheets keep their painted white dishes and window highlights.
          if([10,11,12,13].includes(number)){
            const context=clean.getContext('2d')!,pixels=context.getImageData(0,0,clean.width,clean.height),d=pixels.data;
            removeExteriorMattePixels(d);
            context.putImageData(pixels,0,0);
          }
          this.maps.set(`${number}-${era}`,clean);
        }
      };img.src=`${import.meta.env.BASE_URL}assets/pixel/map-${number}.jpg`;
    }
  }
  private loadRebuiltOutdoor(number:number){
    const image=new Image();image.onload=()=>{
      for(const era of ['past','present']as const){
        const crop=MAP_CROPS[number][era],canvas=document.createElement('canvas');
        canvas.width=crop.w;canvas.height=crop.h;
        const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
        ctx.imageSmoothingEnabled=false;
        const sx=image.naturalWidth/1600,sy=image.naturalHeight/672;
        // Retain the collision grid; no white keying or edge erosion of the painting.
        ctx.drawImage(image,crop.x*sx,crop.y*sy,crop.w*sx,crop.h*sy,0,0,crop.w,crop.h);
        const sky=ctx.getImageData(640,0,1,1).data;
        this.outdoorSky.set(`${number}-${era}`,`rgb(${sky[0]},${sky[1]},${sky[2]})`);
        this.maps.set(`${number}-${era}`,canvas);
      }
    };image.src=`${import.meta.env.BASE_URL}${rebuiltOutdoorPath(number)}`;
  }
  isReady(){return this.maps.size===26;}
  background(ctx:CanvasRenderingContext2D,camera:number,viewport:number,width:number,past:boolean,stage:number){
    ctx.save();ctx.imageSmoothingEnabled=false;
    const sky=ctx.createLinearGradient(0,180,0,600);
    sky.addColorStop(0,past?'#c5a979':'#152e37');sky.addColorStop(1,past?'#6c7560':'#080f17');
    ctx.fillStyle=sky;ctx.fillRect(camera,0,viewport,600);
    const rooms=chapterRooms(stage);
    const visible=rooms.find(room=>room.start<=camera+viewport/2&&room.start+room.width>camera+viewport/2);
    const skyColor=visible&&this.outdoorSky.get(`${visible.map}-${past?'past':'present'}`);
    if(skyColor){ctx.fillStyle=skyColor;ctx.fillRect(camera,0,viewport,600);}
    rooms.forEach((room,index)=>{
      const x=room.start,roomWidth=room.width;if(x>camera+viewport||x+roomWidth<camera)return;
      const era=past?'past':'present',crop=MAP_CROPS[room.map][era],image=this.maps.get(`${room.map}-${era}`),scale=roomWidth/crop.w;
      if(image){
        const y=480-(crop.floor-crop.y)*scale;
        ctx.drawImage(image,x,y,roomWidth,crop.h*scale);
        if((REBUILT_OUTDOOR_MAPS as readonly number[]).includes(room.map)){
          const color=this.outdoorSky.get(`${room.map}-${era}`);
          if(color){
            // Blend the painted clouds into the sky above the finite source panel.
            const haze=ctx.createLinearGradient(0,y,0,y+28);
            haze.addColorStop(0,color);haze.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=haze;ctx.fillRect(x,y,roomWidth,28);
          }
        }
        if(room.map===3&&past){
          // Live plaque follows the new room assignment instead of the source sheet's bedroom text.
          const px=x+545*scale,py=y+(145-crop.y)*scale;
          ctx.fillStyle='#60452a';ctx.fillRect(px,py,64*scale,34*scale);
          ctx.fillStyle='#c5a36e';ctx.fillRect(px+3*scale,py+3*scale,58*scale,28*scale);
          ctx.fillStyle='#352718';ctx.font=`600 ${10*scale}px "VT323", monospace`;ctx.textAlign='center';ctx.fillText('Phòng khách',px+32*scale,py+23*scale);
        }
        // Extend the soil beneath each painted floor without adding a second grass strip.
        const bottom=y+crop.h*scale;
        ctx.fillStyle=past?'#292b23':'#0c171b';ctx.fillRect(x,bottom,roomWidth,Math.max(0,600-bottom));
      }
      if(index>0){ctx.fillStyle=past?'#3c3226':'#142023';ctx.fillRect(x-2,210,4,270);}
    });
    ctx.restore();
  }
  platforms(ctx:CanvasRenderingContext2D,platforms:Platform[],past:boolean){
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(const p of platforms){
      if(p.bakedIntoMap||p.id.startsWith('ground')||p.id.startsWith('terrain_')||p.id==='ceiling'||p.id.startsWith('wall_'))continue;
      if(p.id.startsWith('chase_')&&p.type==='solid'&&!p.id.includes('crate')&&!p.id.includes('barricade')){
        ctx.fillStyle=past?'#745b3288':'#183c3fbb';ctx.fillRect(p.x,p.y,p.width,p.height);ctx.strokeStyle=past?'#c7a25a':'#5fa395';ctx.lineWidth=2;ctx.strokeRect(p.x,p.y,p.width,p.height);this.assets.draw(ctx,'vines',p.x-9,p.y,p.width+18,p.height);continue;
      }
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
