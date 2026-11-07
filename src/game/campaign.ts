export const STORY_CHAPTERS=[
 {title:'Khởi đầu',place:'Cổng nhà & hành lang',area:1,map:1},
 {title:'Sự thật trong căn nhà',place:'Hành lang, các phòng & khu vườn',area:2,map:3},
 {title:'Cuộc chạy trốn',place:'Rừng ký ức & hang đồng hồ',area:5,map:10},
 {title:'Tiếng chuông cuối',place:'Bẫy thời gian & lõi ký ức',area:6,map:13}
]as const;
export const chapterForArea=(area:number)=>area<=1?1:area<=4?2:area===5?3:4;
export const areaForChapter=(chapter:number)=>STORY_CHAPTERS[Math.max(0,Math.min(3,chapter-1))].area;
export function savedChapterProgress(p:{currentStage?:number;storyChapter?:number;furthestStage?:number;furthestChapter?:number},campaignVersion?:number){
 return {current:campaignVersion===2?p.storyChapter??chapterForArea(p.currentStage??1):chapterForArea(p.storyChapter??p.currentStage??1),unlocked:p.furthestChapter??chapterForArea(p.furthestStage??p.currentStage??1)};
}
