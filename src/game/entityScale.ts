/** Shared world-space body dimensions; art, collision and spawn use the same scale. */
export const PLAYER_WIDTH=22;
export const PLAYER_HEIGHT=56;
export const CHILD_HEIGHT=40;
export const ADULT_HEIGHT=56;
export const ELDER_HEIGHT=54;
export const PURSUER_BODY_HEIGHT=84;
export const PURSUER_ART_HEIGHT=108;

/** Preserve the foot position when upgrading legacy 44px and 84px characters. */
export function savedCharacterHeight(version?:number){return version===3?PLAYER_HEIGHT:version===2?84:44;}
export function migrateCharacterY(y:number,version?:number){return y+savedCharacterHeight(version)-PLAYER_HEIGHT;}
