export type MechanismId = 'clock' | 'music_box' | 'temporal_anchor';
export const NOTE_NAMES = ['Đô', 'Rê', 'Mi', 'Fa', 'Sol', 'Đô cao'];
export const MECHANISMS:Record<MechanismId,{title:string;description:string}> = {
  clock:{title:'Bộ máy đồng hồ',description:'Bánh răng đã vào đúng trục. Chỉnh hai kim, rồi lên dây cót. Dấu vết trên mặt đồng hồ ở thời điểm còn lại có thể giúp ích.'},
  music_box:{title:'Hộp nhạc của Linh',description:'Sáu phím đồng, ba chốt khóa. Gảy một đoạn ba nốt rồi kéo cần phát nhạc. Những nét vẽ trong phòng có liên quan đến chiếc hộp này.'},
  temporal_anchor:{title:'Trụ cộng hưởng',description:'Ba vòng khắc số, xếp từ ngoài vào trong. Xoay từng vòng rồi ghép nhịp. Dòng ghi cuối cùng trong nhật ký nhắc đến cách đặt chúng.'}
};
export function mechanismMatches(id:MechanismId,values:readonly number[]):boolean{
 const target=id==='clock'?[3,15]:id==='music_box'?[2,4,5]:[3,1,5];
 return values.length===target.length&&values.every((value,i)=>Number.isInteger(value)&&value===target[i]);
}
