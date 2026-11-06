import { PLAYER_HEIGHT } from './entityScale';
import { Player } from '../types/game';
import { pixelAssets } from './pixelAssets';

/** Use one character sheet throughout. Tutorial interactions never introduce a held prop. */
export function anFrame(state:Player['state'],tick:number,vy=0):string {
  if(state==='walk')return `an${[3,4,5,6,7,8][Math.floor(tick*8)%6]}`;
  if(state==='jump')return 'an2';
  if(state==='fall')return 'an5';
  return 'an0';
}
export class CharacterAtlas {
  private assets=pixelAssets();
  draw(ctx:CanvasRenderingContext2D,player:Player,tick:number):boolean {
    const key=anFrame(player.state,tick,player.vy),sprite=this.assets.get(key),base=this.assets.get('an0');
    if(!sprite||!base)return false;
    // One source-pixel scale for every pose, with the same foot baseline.
    const scale=PLAYER_HEIGHT/base.height,w=sprite.width*scale,h=sprite.height*scale;
    ctx.save();ctx.fillStyle='#00000045';ctx.beginPath();ctx.ellipse(player.x+player.width/2,player.y+player.height+1,12,3,0,0,Math.PI*2);ctx.fill();
    ctx.translate(Math.round(player.x+player.width/2),Math.round(player.y+player.height));
    if(player.facing==='left')ctx.scale(-1,1);
    this.assets.draw(ctx,key,-w/2,-h,w,h);ctx.restore();return true;
  }
}
