/** Gait follows ground distance, so braking and walls cannot cause foot sliding. */
export const WALK_STRIDE = 96;
export const RUN_STRIDE = 112;
export function advanceGait(phase:number,distance:number,grounded:boolean,chase=false):{phase:number;step:boolean}{
 if(!grounded||Math.abs(distance)<.001)return {phase,step:false};
 const next=phase+Math.abs(distance)/(chase?RUN_STRIDE:WALK_STRIDE);
 return {phase:next%1,step:Math.floor(next*2)>Math.floor(phase*2)};
}
