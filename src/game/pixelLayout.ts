export const ROOM_WIDTH=1200;
export const GAME_ZOOM=1.65;
export const CAMERA_TOP=195;
export interface PixelRoom {map:number;name:string;}
export const CHAPTER_ROOMS:Record<number,PixelRoom[]>={
  1:[{map:1,name:'Cổng nhà & hiên trước'}],
  2:[{map:2,name:'Phòng khách'},{map:6,name:'Phòng ăn & nhà bếp'},{map:5,name:'Xưởng đồng hồ của Mẹ'}],
  3:[{map:3,name:'Hành lang ký ức'},{map:7,name:'Sân sau & giếng cũ'}],
  4:[{map:4,name:'Phòng ngủ của Linh'},{map:8,name:'Khu vườn gia đình'},{map:9,name:'Nhà kính bỏ quên'}],
  5:[{map:10,name:'Lối vào rừng ký ức'},{map:11,name:'Hang đồng hồ'},{map:12,name:'Ký ức đứt gãy'}],
  6:[{map:13,name:'Tâm điểm thời gian'}],
};
export type MapCrop={x:number;y:number;w:number;h:number;floor:number};
const rect=(x:number,y:number,w:number,h:number,floor:number):MapCrop=>({x,y,w,h,floor});
export const MAP_CROPS:Record<number,{past:MapCrop;present:MapCrop}>={
  1:{past:rect(0,15,1600,310,310),present:rect(0,346,1600,302,628)},
  2:{past:rect(0,28,1600,296,303),present:rect(0,347,1600,301,632)},
  3:{past:rect(0,66,1600,247,303),present:rect(0,358,1600,264,611)},
  4:{past:rect(31,78,1537,250,316),present:rect(31,391,1537,253,632)},
  5:{past:rect(25,66,1550,251,303),present:rect(25,378,1550,261,622)},
  6:{past:rect(25,25,1550,300,311),present:rect(25,348,1550,299,632)},
  7:{past:rect(0,0,1600,328,310),present:rect(0,346,1600,287,615)},
  8:{past:rect(0,65,1600,272,308),present:rect(0,402,1600,247,630)},
  9:{past:rect(0,0,1600,329,310),present:rect(0,344,1600,316,638)},
  10:{past:rect(0,42,1600,586,520),present:rect(0,42,1600,586,520)},
  11:{past:rect(0,45,1600,583,520),present:rect(0,45,1600,583,520)},
  12:{past:rect(0,44,1600,596,550),present:rect(0,44,1600,596,550)},
  13:{past:rect(0,42,1600,565,520),present:rect(0,42,1600,565,520)},
};
export function currentPixelRoom(stage:number,x:number){
  const rooms=CHAPTER_ROOMS[stage]||CHAPTER_ROOMS[1];
  const index=Math.max(0,Math.min(rooms.length-1,Math.floor(x/ROOM_WIDTH)));
  return {...rooms[index],index,start:index*ROOM_WIDTH};
}
