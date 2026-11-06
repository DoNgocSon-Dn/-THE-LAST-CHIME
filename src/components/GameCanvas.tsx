import React, { useEffect, useRef } from 'react';
import { GameEngine, EngineCallbacks } from '../game/engine';

interface GameCanvasProps {
  callbacksRef: React.MutableRefObject<EngineCallbacks>;
  engineRef: React.MutableRefObject<GameEngine | null>;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ callbacksRef, engineRef, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set internal render resolution
    canvas.width = 1000;
    canvas.height = 600;

    // Create engine instance
    const engine = new GameEngine(canvas, {
      onTimelineChange: (t) => callbacksRef.current.onTimelineChange(t),
      onCooldownChange: (r, s) => callbacksRef.current.onCooldownChange(r, s),
      onNearbyPrompt: (o) => callbacksRef.current.onNearbyPrompt(o),
      onStartDialogue: (l) => callbacksRef.current.onStartDialogue(l),
      onStageTransition: (c) => callbacksRef.current.onStageTransition(c),
      onTriggerFinalChoice: () => callbacksRef.current.onTriggerFinalChoice(),
      onTriggerEnding: (s, e) => callbacksRef.current.onTriggerEnding(s, e),
      onPuzzleUpdate: (p) => callbacksRef.current.onPuzzleUpdate(p),
      onRoomChange: (r) => callbacksRef.current.onRoomChange(r),
      onNotification: (m) => callbacksRef.current.onNotification(m)
    });

    engineRef.current = engine;
    (window as unknown as { __gameEngine: GameEngine }).__gameEngine = engine;
    engine.start();

    return () => {
      engine.stop();
      engine.unbindEvents();
      engineRef.current = null;
    };
  }, [callbacksRef, engineRef]);

  // Handle paused state updates without tearing down the canvas
  useEffect(() => {
    if (engineRef.current) {
      if (isPaused && engineRef.current.gameState === 'playing') {
        engineRef.current.gameState = 'paused';
      } else if (!isPaused && engineRef.current.gameState === 'paused') {
        engineRef.current.gameState = 'playing';
      }
    }
  }, [isPaused, engineRef]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="max-w-full max-h-full object-contain aspect-[5/3] shadow-2xl block"
      />
    </div>
  );
};
