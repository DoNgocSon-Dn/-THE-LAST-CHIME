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
import { IntroStoryModal } from './components/IntroStoryModal';

export default function App() {
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

  const engineRef = useRef<GameEngine | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const bannerTimeoutRef = useRef<number | null>(null);

  // Sync document.body.dataset.state
  useEffect(() => {
    let mappedState: string = gameState;
    if (gameState === 'ending') mappedState = 'gameover';
    if (gameState === 'intro') mappedState = 'title';
    document.body.dataset.state = mappedState;
  }, [gameState]);

  // Check save data and autostart on mount
  useEffect(() => {
    const hasData = localStorage.getItem('TWO_SIDES_OF_TIME_SAVE_V3') !== null;
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
    soundManager.init();
    if (engineRef.current) {
      engineRef.current.resetGame();
    }
    setGameState('intro');
  };

  const handleIntroComplete = () => {
    enterGameplayDirectly();
  };

  const enterGameplayDirectly = () => {
    soundManager.init();
    setGameState('playing');
    if (engineRef.current) {
      engineRef.current.gameState = 'playing';
      engineRef.current.start();
    }
  };

  const continueGame = () => {
    soundManager.init();
    setGameState('playing');
    window.setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.loadSave();
        engineRef.current.gameState = 'playing';
        engineRef.current.start();
      }
    }, 50);
  };

  const restartGame = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
    }
    setGameState('intro');
    setActiveDialogue(null);
    setEndingStats(null);
  };

  const handleSelectStage = (stageNum: number) => {
    if (engineRef.current) {
      setActiveDialogue(null);
      engineRef.current.loadStage(stageNum, true);
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
      if (gameState === 'title' && (key === 'enter' || key === ' ')) {
        e.preventDefault();
        startNewGame();
        return;
      }

      // If dialogue is active, DialogueBox handles its own keys
      if (activeDialogue) {
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
  }, [gameState, activeDialogue]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Title Screen */}
      {gameState === 'title' && (
        <TitleScreen
          onStart={startNewGame}
          onContinue={continueGame}
          hasSave={hasSave}
        />
      )}

      {/* Intro Narrative Prologue */}
      {gameState === 'intro' && (
        <IntroStoryModal onComplete={handleIntroComplete} />
      )}

      {/* Live Gameplay Canvas */}
      {gameState !== 'title' && gameState !== 'intro' && (
        <>
          <GameCanvas
            callbacksRef={callbacksRef}
            engineRef={engineRef}
            isPaused={
              gameState === 'paused' ||
              gameState === 'choice' ||
              gameState === 'ending' ||
              activeDialogue !== null
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
              isDialogueActive={activeDialogue !== null}
              onPause={() => setGameState('paused')}
              onTimelineSwitch={() => engineRef.current?.switchTimeline()}
              onInteract={() => engineRef.current?.triggerInteract()}
              onSelectStage={handleSelectStage}
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

          {/* Pause Modal */}
          {gameState === 'paused' && (
            <PauseModal
              onResume={() => setGameState('playing')}
              onRestart={restartGame}
              onMainMenu={() => setGameState('title')}
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
