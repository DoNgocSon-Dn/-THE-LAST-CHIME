import { PLAYER_HEIGHT } from './entityScale';
import { Player } from '../types/game';
import { pixelAssets } from './pixelAssets';

/** Use the full-stride An poses for walking; revised sheet supplies idle and running. */
export function anFrame(state:Player['state'],tick:number,vy=0,chase=false,pose:Player['interactionPose']='think',gaitPhase=0):string {
  if(state==='walk')return chase?`anV2Run${Math.floor(gaitPhase*5)%5}`:`an${[5,4,3,8,7,6][Math.floor(gaitPhase*6)%6]}`;
  if(state==='jump'||state==='fall')return vy<0?'anV2Walk2':'anV2Walk4';
  if(state==='interact')return pose==='crouch'?'anV2Crouch3':'anV2Think0';
  return 'anV2Idle0';
}
export class CharacterAtlas {
  private assets=pixelAssets();
  draw(ctx:CanvasRenderingContext2D,player:Player,tick:number,chase=false):boolean {
    const key=anFrame(player.state,tick,player.vy,chase,player.interactionPose,player.animTimer),sprite=this.assets.get(key),base=this.assets.get('anV2Idle0');
    if(!sprite||!base)return false;
    // One source-pixel scale for every pose, with the same foot baseline.
    const walking=player.state==='walk'&&!chase;
    const scale=PLAYER_HEIGHT/(walking?sprite.height:base.height),w=sprite.width*scale,h=sprite.height*scale;
    ctx.save();ctx.fillStyle='#00000045';ctx.beginPath();ctx.ellipse(player.x+player.width/2,player.y+player.height+1,12,3,0,0,Math.PI*2);ctx.fill();
    const lift=walking?Math.sin(player.animTimer*Math.PI*4)**2*.9:0;
    ctx.translate(player.x+player.width/2,player.y+player.height-lift);
    if(player.facing==='left')ctx.scale(-1,1);
    // Register the head/body rather than the trimmed rectangle: arm and foot
    // extensions must not shift the whole character sideways between frames.
    const pivot=this.assets.getCharacterPivot(key);
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(sprite,-pivot*scale,-h,w,h);ctx.restore();return true;
  }
}
