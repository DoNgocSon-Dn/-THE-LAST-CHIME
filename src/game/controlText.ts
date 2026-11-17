import {getBinding,keyLabel,type Action} from './controls';

export const actionKeyLabel=(action:Action)=>keyLabel(getBinding(action));

/** Resolve legacy instruction tokens at display time, including clues from old saves.
 * One replacement pass avoids remapping a rebound key a second time.
 * Bare puzzle lever names (A/B/C), words and identifiers are left unchanged.
 */
export function controlText(text:string):string{
 const actions:Record<string,Action>={E:'interact',Q:'time',R:'pulse',Shift:'dash',Space:'jump'};
 return text.replace(/(?<![\p{L}\p{N}_])(?:A\s*\/\s*D|Shift|Space|E|Q|R)(?![\p{L}\p{N}_])|(?<=phím )[AD](?![\p{L}\p{N}_])/gu,token=>{
  if(/^A\s*\/\s*D$/.test(token))return `${actionKeyLabel('left')} / ${actionKeyLabel('right')}`;
  if(token==='A'||token==='D')return actionKeyLabel(token==='A'?'left':'right');
  return actionKeyLabel(actions[token]);
 });
}
