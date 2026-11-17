import React from 'react';
import {createRoot} from 'react-dom/client';
import '../../src/index.css';
import {OpeningStory} from '../../src/components/OpeningStory';
import {EndingModal,FinalChoiceModal} from '../../src/components/EndingModal';
import {MechanismPanel} from '../../src/components/MechanismPanel';
import {mechanismMatches,type MechanismId} from '../../src/game/mechanisms';

const params=new URLSearchParams(location.search),view=params.get('view')??'story';
const noop=()=>{};
const signal=(value:unknown)=>{(window as any).__fixtureResult=value;};
const content=view==='story'?<OpeningStory onContinue={()=>signal('continued')}/>:
 view==='choice'?<FinalChoiceModal onSelectEnding={signal}/>:
 view.startsWith('ending')?<EndingModal ending={view==='ending-eternal'?'ETERNAL_MEMORY':'ACCEPT_TRUTH'} stats={{timeElapsed:1835,timelineSwitches:24,puzzlesSolvedCount:12,notesRead:9,chaseRetries:2}} onRestart={noop} onSwitchEnding={noop}/>:
 <MechanismPanel id={view as MechanismId} clues={['Dấu khắc ở hiện tại vẫn còn đọc được.']} onClose={noop} onSubmit={values=>{const valid=mechanismMatches(view as MechanismId,values);signal({valid,values});return valid;}}/>;
createRoot(document.getElementById('root')!).render(content);
