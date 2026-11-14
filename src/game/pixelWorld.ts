import {RESTORED_OUTDOOR_MAPS,restoredOutdoorPath} from './outdoorAssets';
import { Platform } from '../types/game';
import { pixelAssets, removeSheetBackground } from './pixelAssets';
import { chapterRooms, MAP_CROPS } from './pixelLayout';
export function removeExteriorMattePixels(d:Uint8ClampedArray){
  for(let i=0;i<d.length;i+=4){
    const lo=Math.min(d[i],d[i+1],d[i+2]),hi=Math.max(d[i],d[i+1],d[i+2]);
    if(lo>220&&hi-lo<22)d[i+3]=0;
  }
}
const restoredPastCrop=(number:number)=>number===8?{...MAP_CROPS[number].past,y:0,h:336}:MAP_CROPS[number].past;
export class PixelWorld {
  private maps=new Map<string,HTMLCanvasElement>();
  private assets=pixelAssets();
  private pastSky=new Map<number,string>();
  constructor(){
    for(const number of RESTORED_OUTDOOR_MAPS)this.loadRestoredPast(number);
    for(let number=1;number<=13;number++){
      const img=new Image();img.onload=()=>{
        for(const era of ['past','present']as const){
          if(era==='past'&&(RESTORED_OUTDOOR_MAPS as readonly number[]).includes(number))continue;
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
  private loadRestoredPast(number:number){
    const image=new Image();image.onload=()=>{
      const crop=restoredPastCrop(number),canvas=document.createElement('canvas');canvas.width=crop.w;canvas.height=crop.h;
      const ctx=canvas.getContext('2d',{willReadFrequently:true})!;ctx.imageSmoothingEnabled=false;
      // Generated restoration retains the two-panel reference layout, normalized to its source grid.
      const sx=image.naturalWidth/1600,sy=image.naturalHeight/672;
      ctx.drawImage(image,crop.x*sx,crop.y*sy,crop.w*sx,crop.h*sy,0,0,crop.w,crop.h);
      const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
      const skyColors=new Map<string,{count:number;r:number;g:number;b:number}>();
      for(let y=0;y<Math.min(24,canvas.height);y++)for(let x=0;x<canvas.width;x++){
        const i=(y*canvas.width+x)*4,r=d[i],g=d[i+1],b=d[i+2];
        if(r>160&&g>135&&b>80&&r>g&&g>b&&r-b>25){const key=`${r>>4},${g>>4},${b>>4}`,c=skyColors.get(key)??{count:0,r:0,g:0,b:0};c.count++;c.r+=r;c.g+=g;c.b+=b;skyColors.set(key,c);}
      }
      const color=[...skyColors.values()].sort((a,b)=>b.count-a.count)[0];
      const rgb=color?[Math.round(color.r/color.count),Math.round(color.g/color.count),Math.round(color.b/color.count)]:[226,202,148];
      // Keep restored memories opaque: never key the new sky back out as white matte.
      for(let i=0;i<d.length;i+=4)if(Math.min(d[i],d[i+1],d[i+2])>235&&Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2])<18){d[i]=rgb[0];d[i+1]=rgb[1];d[i+2]=rgb[2];d[i+3]=255;}
      ctx.putImageData(pixels,0,0);this.pastSky.set(number,`rgb(${rgb.join(',')})`);this.maps.set(`${number}-past`,canvas);
    };image.src=`${import.meta.env.BASE_URL}${restoredOutdoorPath(number)}`;
  }
  isReady(){return this.maps.size===26;}
  background(ctx:CanvasRenderingContext2D,camera:number,viewport:number,width:number,past:boolean,stage:number){
    ctx.save();ctx.imageSmoothingEnabled=false;
    const sky=ctx.createLinearGradient(0,180,0,600);
    sky.addColorStop(0,past?'#c5a979':'#152e37');sky.addColorStop(1,past?'#6c7560':'#080f17');
    ctx.fillStyle=sky;ctx.fillRect(camera,0,viewport,600);
    const rooms=chapterRooms(stage);
    if(past){const visible=rooms.find(room=>room.start<=camera+viewport/2&&room.start+room.width>camera+viewport/2),color=visible&&this.pastSky.get(visible.map);if(color){ctx.fillStyle=color;ctx.fillRect(camera,0,viewport,600);}}
    rooms.forEach((room,index)=>{
      const x=room.start,roomWidth=room.width;if(x>camera+viewport||x+roomWidth<camera)return;
      const era=past?'past':'present',crop=past&&(RESTORED_OUTDOOR_MAPS as readonly number[]).includes(room.map)?restoredPastCrop(room.map):MAP_CROPS[room.map][era],image=this.maps.get(`${room.map}-${era}`),scale=roomWidth/crop.w;
      if(image){
        const y=480-(crop.floor-crop.y)*scale;
        ctx.drawImage(image,x,y,roomWidth,crop.h*scale);
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
