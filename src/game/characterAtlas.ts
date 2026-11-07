import { PLAYER_HEIGHT } from './entityScale';
import { Player } from '../types/game';
import { pixelAssets } from './pixelAssets';

/** Every action uses the revised An sheet, with no unrelated prop frames. */
export function anFrame(state:Player['state'],tick:number,vy=0,chase=false,pose:Player['interactionPose']='think'):string {
  if(state==='walk')return chase?`anV2Run${Math.floor(tick*10)%5}`:`anV2Walk${Math.floor(tick*8)%6}`;
  if(state==='jump'||state==='fall')return vy<0?'anV2Walk2':'anV2Walk4';
  if(state==='interact')return pose==='crouch'?'anV2Crouch3':'anV2Think0';
  return `anV2Idle${Math.floor(tick*2)%3}`;
}
export class CharacterAtlas {
  private assets=pixelAssets();
  draw(ctx:CanvasRenderingContext2D,player:Player,tick:number,chase=false):boolean {
    const key=anFrame(player.state,tick,player.vy,chase,player.interactionPose),sprite=this.assets.get(key),base=this.assets.get('anV2Idle0');
    if(!sprite||!base)return false;
    // One source-pixel scale for every pose, with the same foot baseline.
    const scale=PLAYER_HEIGHT/base.height,w=sprite.width*scale,h=sprite.height*scale;
    ctx.save();ctx.fillStyle='#00000045';ctx.beginPath();ctx.ellipse(player.x+player.width/2,player.y+player.height+1,12,3,0,0,Math.PI*2);ctx.fill();
    ctx.translate(Math.round(player.x+player.width/2),Math.round(player.y+player.height));
    if(player.facing==='left')ctx.scale(-1,1);
    this.assets.draw(ctx,key,-w/2,-h,w,h);ctx.restore();return true;
  }
}
