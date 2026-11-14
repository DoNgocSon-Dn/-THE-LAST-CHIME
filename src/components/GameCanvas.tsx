import { ArrowLeft, ArrowRight, ArrowUp, Bell, ChevronsRight } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { GameEngine, EngineCallbacks } from '../game/engine';

interface GameCanvasProps {
  callbacksRef: React.MutableRefObject<EngineCallbacks>;
  engineRef: React.MutableRefObject<GameEngine | null>;
  isPaused: boolean;
  onReady:()=>void;
  canDash: boolean;
  canPulse: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ callbacksRef, engineRef, isPaused, onReady, canDash, canPulse }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set internal render resolution
    const resize=()=>{const box=canvas.parentElement!.getBoundingClientRect();canvas.height=562;canvas.width=Math.max(240,Math.round(562*box.width/box.height));};
    resize();
    const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement!);

    // Create engine instance
    const engine = new GameEngine(canvas, {
      onOpenMechanism: id=>callbacksRef.current.onOpenMechanism?.(id),
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
    let readyFrame=0;
    const begin=()=>{if(engine.isReady()){engine.start();onReady();}else readyFrame=requestAnimationFrame(begin);};
    begin();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(readyFrame);
      engine.stop();
      engine.unbindEvents();
      engineRef.current = null;
    };
  }, [callbacksRef, engineRef, onReady]);

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

  const touchButton=(key:string,label:string,icon:React.ReactNode)=><button aria-label={label} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);engineRef.current?.setTouchControl(key,true);}} onPointerUp={()=>engineRef.current?.setTouchControl(key,false)} onPointerCancel={()=>engineRef.current?.setTouchControl(key,false)}>{icon}</button>;
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none">
      <div className="touch-controls"><div>{touchButton('a','Đi sang trái',<ArrowLeft/>)}{touchButton('d','Đi sang phải',<ArrowRight/>)}</div><div>
        {canDash && touchButton('shift', 'Lướt', <ChevronsRight />)}
        {canPulse && touchButton('r', 'Sóng chuông', <Bell />)}
        {touchButton(' ', 'Nhảy', <ArrowUp />)}
      </div></div>
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="w-full h-full object-contain block"
        style={{imageRendering: 'pixelated'}}
      />
    </div>
  );
};
