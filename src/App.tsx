import {areaForChapter,chapterForArea} from './game/campaign';
import {ChapterSelect} from './components/ChapterSelect';
import { MechanismPanel } from './components/MechanismPanel';
import type { MechanismId } from './game/mechanisms';
import { OpeningStory } from './components/OpeningStory';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timeline,
  GameState,
  InteractableObject,
  PuzzleState,
  GameStats,
  EndingType,
  DialogueLine
} from './types/game';
import { RoomZone, ROOM_ZONES, StageConfig } from './game/levelData';
import { INITIAL_PUZZLE_STATE } from './game/puzzles';
import { GameEngine, EngineCallbacks } from './game/engine';
import { soundManager } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { PauseModal } from './components/PauseModal';
import { DialogueBox, StageTransitionBanner } from './components/DialogueBox';
import { EndingModal, FinalChoiceModal } from './components/EndingModal';
import { ClockLoader } from './components/ClockLoader';
import { preloadGameAssets } from './game/preload';

export default function App() {
  const pendingTitleChapter=useRef<number|null>(null);
  const [chapterPicker,setChapterPicker]=useState(false);
  const [activeMechanism,setActiveMechanism]=useState<MechanismId|null>(null);
  const [gameState, setGameState] = useState<GameState>('title');
  const [timeline, setTimeline] = useState<Timeline>('PRESENT');
  const [cooldownRatio, setCooldownRatio] = useState<number>(0);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [nearbyObject, setNearbyObject] = useState<InteractableObject | null>(null);
  const [puzzles, setPuzzles] = useState<PuzzleState>({ ...INITIAL_PUZZLE_STATE });
  const [currentRoom, setCurrentRoom] = useState<RoomZone>(ROOM_ZONES[0]);
  const [activeDialogue, setActiveDialogue] = useState<DialogueLine[] | null>(null);
  const [transitionStage, setTransitionStage] = useState<StageConfig | null>(null);
  const [endingStats, setEndingStats] = useState<GameStats | null>(null);
  const [selectedEnding, setSelectedEnding] = useState<EndingType>('ACCEPT_TRUTH');
  const [notification, setNotification] = useState<string | null>(null);
  const [hasSave, setHasSave] = useState<boolean>(false);
  const [assetsReady,setAssetsReady]=useState(false);
  const [loadProgress,setLoadProgress]=useState(0);
  const [loadError,setLoadError]=useState<string>();
  const [enteringGame,setEnteringGame]=useState(false);
  const [loadingDestination,setLoadingDestination]=useState<'prologue'|'playing'>('prologue');
  useEffect(()=>{
    if(gameState!=='loading'||!assetsReady)return;
    const timer=setTimeout(()=>{setEnteringGame(loadingDestination==='playing');setGameState(loadingDestination);},450);
    return()=>clearTimeout(timer);
  },[gameState,assetsReady,loadingDestination]);
  const handleGameReady=useCallback(()=>{const stage=pendingTitleChapter.current;if(stage&&engineRef.current){engineRef.current.loadStage(stage,true);pendingTitleChapter.current=null;}setEnteringGame(false);},[]);
  useEffect(()=>{
    let disposed=false;
    preloadGameAssets(value=>{if(!disposed)setLoadProgress(value);}).then(()=>{
      if(!disposed)setAssetsReady(true);
    }).catch(error=>{if(!disposed)setLoadError(error.message);});
    return()=>{disposed=true;};
  },[]);

  const engineRef = useRef<GameEngine | null>(null);
  useEffect(()=>{
    const engine=engineRef.current;
    if(gameState!=='playing'||enteringGame||!engine||engine.puzzles.currentStage!==1||engine.puzzles.arrivalMonologueSeen||engine.puzzles.tutorialMoved)return;
    engine.puzzles.arrivalMonologueSeen=true;
    engine.gameState='paused';
    setActiveDialogue([
      {speaker:'AN',speakerName:'An · nghĩ thầm',emotion:'sad',text:'Mùi đất sau mưa… vẫn giống ngày ấy. Chỉ có căn nhà là khác quá.'},
    ]);
    engine.saveGame();
  },[gameState,enteringGame]);

  const toastTimeoutRef = useRef<number | null>(null);
  const bannerTimeoutRef = useRef<number | null>(null);

  // Sync document.body.dataset.state
  useEffect(() => {
    let mappedState: string = gameState;
    if (gameState === 'ending') mappedState = 'gameover';
    document.body.dataset.state = mappedState;
  }, [gameState]);

  // Check save data and autostart on mount
  useEffect(() => {
    const hasData = localStorage.getItem('THE_LAST_CHIME_PIXEL_SAVE_V1') !== null;
    setHasSave(hasData);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      enterGameplayDirectly();
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  const handleTimelineChange = useCallback((t: Timeline) => {
    setTimeline(t);
  }, []);

  const handleCooldownChange = useCallback((ratio: number, seconds: number) => {
    setCooldownRatio(ratio);
    setCooldownSeconds(seconds);
  }, []);

  const handleNearbyPrompt = useCallback((obj: InteractableObject | null) => {
    setNearbyObject(obj);
  }, []);

  const handleStartDialogue = useCallback((lines: DialogueLine[]) => {
    setActiveDialogue(lines);
  }, []);

  const handleStageTransition = useCallback((cfg: StageConfig) => {
    setNotification(null);
    if(toastTimeoutRef.current)clearTimeout(toastTimeoutRef.current);
    setTransitionStage(cfg);
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    bannerTimeoutRef.current = window.setTimeout(() => {
      setTransitionStage(null);
    }, 2200);
  }, []);

  const handleTriggerFinalChoice = useCallback(() => {
    setGameState('choice');
  }, []);

  const handleTriggerEnding = useCallback((stats: GameStats, ending: EndingType) => {
    setEndingStats({ ...stats });
    setSelectedEnding(ending);
    setGameState('ending');
  }, []);

  const handlePuzzleUpdate = useCallback((newPuzzles: PuzzleState) => {
    setPuzzles({ ...newPuzzles });
    setHasSave(true);
  }, []);

  const handleRoomChange = useCallback((room: RoomZone) => {
    setCurrentRoom(room);
  }, []);

  // Stable engine callbacks ref
  const callbacksRef = useRef<EngineCallbacks>({
    onOpenMechanism: setActiveMechanism,
    onTimelineChange: handleTimelineChange,
    onCooldownChange: handleCooldownChange,
    onNearbyPrompt: handleNearbyPrompt,
    onStartDialogue: handleStartDialogue,
    onStageTransition: handleStageTransition,
    onTriggerFinalChoice: handleTriggerFinalChoice,
    onTriggerEnding: handleTriggerEnding,
    onPuzzleUpdate: handlePuzzleUpdate,
    onRoomChange: handleRoomChange,
    onNotification: showToast
  });

  useEffect(() => {
    callbacksRef.current = {
      onOpenMechanism: setActiveMechanism,
    onTimelineChange: handleTimelineChange,
      onCooldownChange: handleCooldownChange,
      onNearbyPrompt: handleNearbyPrompt,
      onStartDialogue: handleStartDialogue,
      onStageTransition: handleStageTransition,
      onTriggerFinalChoice: handleTriggerFinalChoice,
      onTriggerEnding: handleTriggerEnding,
      onPuzzleUpdate: handlePuzzleUpdate,
      onRoomChange: handleRoomChange,
      onNotification: showToast
    };
  }, [
    handleTimelineChange,
    handleCooldownChange,
    handleNearbyPrompt,
    handleStartDialogue,
    handleStageTransition,
    handleTriggerFinalChoice,
    handleTriggerEnding,
    handlePuzzleUpdate,
    handleRoomChange,
    showToast
  ]);

  const startNewGame = () => {
    pendingTitleChapter.current=null;
    localStorage.removeItem('THE_LAST_CHIME_PIXEL_SAVE_V1');
    setHasSave(false);
    setPuzzles({...INITIAL_PUZZLE_STATE});
    setTimeline('PRESENT');
    setActiveDialogue(null);
    soundManager.init();
    if (engineRef.current) {
      engineRef.current.resetGame();
    }
    setEnteringGame(false);
    setLoadingDestination('prologue');
    setGameState('loading');
  };

  const enterGameplayDirectly=()=>{soundManager.init();setLoadingDestination('playing');setGameState('loading');};
  const chooseTitleChapter=(stage:number)=>{soundManager.init();pendingTitleChapter.current=areaForChapter(stage);setLoadingDestination('playing');setGameState('loading');};
  const continueGame=()=>{soundManager.init();setLoadingDestination('playing');setGameState('loading');};
  const restartGame=()=>{setEndingStats(null);startNewGame();};
  const returnToTitle=()=>{
    engineRef.current?.saveGame();setHasSave(true);setActiveDialogue(null);setEnteringGame(false);setGameState('title');
  };

  const handleSelectStage = (stageNum: number) => {
    setChapterPicker(false);
    if(stageNum>(engineRef.current?.puzzles.furthestChapter??chapterForArea(engineRef.current?.puzzles.furthestStage??puzzles.currentStage)))return;
    if (engineRef.current) {
      setActiveDialogue(null);
      engineRef.current.loadStage(areaForChapter(stageNum), true);
    }
  };

  const handleSelectEnding = (ending: EndingType) => {
    if (engineRef.current) {
      engineRef.current.completeWithEnding(ending);
    } else {
      setSelectedEnding(ending);
      setGameState('ending');
    }
  };

  // Keyboard controls for global actions
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Title screen quick-start
      if (assetsReady && gameState === 'title' && (key === 'enter' || key === ' ') && !(e.target instanceof HTMLElement && e.target.closest('button,input,[role=dialog]'))) {
        e.preventDefault();
        startNewGame();
        return;
      }

      // If dialogue is active, DialogueBox handles its own keys
      if (activeDialogue || activeMechanism || chapterPicker) {
        return;
      }

      // Pause toggle
      if (key === 'escape' || key === 'p') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      }

      // Mute toggle
      if (key === 'm') {
        soundManager.setMuted(!soundManager.getMuted());
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [gameState, activeDialogue, activeMechanism,chapterPicker,assetsReady]);

  return (
    <div className="relative w-screen h-[100dvh] bg-[#060e0b] overflow-hidden flex flex-col items-center justify-center font-sans">
      {(!assetsReady||gameState==='loading'||(enteringGame&&gameState==='playing'))&&<ClockLoader progress={!assetsReady||gameState==='loading'?loadProgress:undefined} error={loadError} shattering={gameState==='loading'}/>}
      {gameState==='prologue'&&<OpeningStory onContinue={()=>setGameState('playing')}/>}
      {/* Title Screen */}
      {assetsReady && gameState === 'title' && (
        <TitleScreen
          onStart={startNewGame}
          onContinue={continueGame}
          onSelectChapter={chooseTitleChapter}
          hasSave={hasSave}
        />
      )}

      {/* Live Gameplay Canvas */}
      {assetsReady && gameState !== 'title' && gameState !== 'loading' && (
        <>
          <GameCanvas
            onReady={handleGameReady}
            canDash={gameState === 'playing' && puzzles.clockRepaired}
            canPulse={gameState === 'playing' && puzzles.musicBoxPlayed}
            callbacksRef={callbacksRef}
            engineRef={engineRef}
            isPaused={
              gameState === 'prologue' ||
              gameState === 'paused' ||
              gameState === 'choice' ||
              gameState === 'ending' ||
              transitionStage !== null ||
              activeDialogue !== null || activeMechanism !== null || chapterPicker
            }
          />

          {/* Playing HUD */}
          {gameState === 'playing' && (
            <HUD
              timeline={timeline}
              cooldownRatio={cooldownRatio}
              cooldownSeconds={cooldownSeconds}
              nearbyObject={nearbyObject}
              puzzles={puzzles}
              currentRoom={currentRoom}
              notification={notification}
              isDialogueActive={activeDialogue !== null || activeMechanism !== null || chapterPicker || transitionStage !== null}
              onPause={() => setGameState('paused')}
              onTimelineSwitch={() => engineRef.current?.switchTimeline()}
              onInteract={() => engineRef.current?.triggerInteract()}
              onOpenChapters={()=>setChapterPicker(true)}
            />
          )}

          {/* Stage Transition Banner */}
          <StageTransitionBanner stageConfig={transitionStage} />

          {/* Expressive Character Dialogue Box (replaces generic modal popups) */}
          {activeDialogue && (
            <DialogueBox
              lines={activeDialogue}
              onClose={() => setActiveDialogue(null)}
            />
          )}

          {activeMechanism && <MechanismPanel id={activeMechanism} clues={puzzles.collectedClues??[]}
            onClose={()=>{engineRef.current?.closeMechanism();setActiveMechanism(null);}}
            onSubmit={values=>{const solved=engineRef.current?.submitMechanism(activeMechanism,values)===true;if(solved)setActiveMechanism(null);return solved;}}/>}

          {chapterPicker&&<ChapterSelect unlocked={puzzles.furthestChapter??chapterForArea(puzzles.furthestStage??puzzles.currentStage)} current={puzzles.storyChapter??puzzles.currentStage} onSelect={handleSelectStage} onClose={()=>setChapterPicker(false)}/>}

          {/* Pause Modal */}
          {gameState === 'paused' && (
            <PauseModal
              onResume={() => setGameState('playing')}
              onRestart={restartGame}
              onMainMenu={returnToTitle}
            />
          )}

          {/* Chapter 6 Final Choice Modal */}
          {gameState === 'choice' && (
            <FinalChoiceModal onSelectEnding={handleSelectEnding} />
          )}

          {/* Ending / Victory Modal */}
          {gameState === 'ending' && endingStats && (
            <EndingModal
              stats={endingStats}
              ending={selectedEnding}
              onRestart={restartGame}
              onSwitchEnding={handleSelectEnding}
            />
          )}
        </>
      )}
    </div>
  );
}
