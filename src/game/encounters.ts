import type {PuzzleState,Timeline} from '../types/game';
export const CHASE_SEALS=[{x:900,era:'PAST'},{x:1750,era:'PRESENT'},{x:2630,era:'PAST'}]as const;
export const BOSS_TRAPS=[{x:400,y:348},{x:650,y:312},{x:950,y:315}]as const;
export function completeSeals(p:PuzzleState){return [0,1,2].every(i=>p.chaseSeals?.includes(i));}
export function bossDefeated(p:PuzzleState){return [0,1,2].every(i=>p.bossHits?.includes(i));}
export function canReleaseTrap(p:PuzzleState,index:number,era:Timeline){return era==='PRESENT'&&p.bossArmedTrap===index&&p.bossExposedTrap===index&&!p.bossHits?.includes(index);}
export function trapHint(p:PuzzleState,era:Timeline){
 if(bossDefeated(p))return 'Ba bẫy đã phá lớp vỏ. Đọc nhật ký và đồng bộ lõi.';
 if(p.bossExposedTrap!==undefined)return 'Điểm yếu đã lộ! Tới bẫy đang sáng để xả xung cộng hưởng.';
 if(p.bossArmedTrap!==undefined)return era==='PAST'?'Bẫy đã nạp. Trở về hiện tại và dụ cái bóng vào vùng sáng.':'Dụ cái bóng tới bẫy đã nạp; tránh chạm vào nó.';
 return era==='PAST'?'Lên dây một bẫy chưa dùng. Mỗi bẫy chỉ phá được một lớp vỏ.':'Bẫy ở hiện tại đã hỏng. Tìm bản còn nguyên trong quá khứ.';
}
