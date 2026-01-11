
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameFrame, GameObject, GameState, LevelConfig } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_WIDTH, 
  PLAYER_HEIGHT, 
  GRAVITY, 
  JUMP_FORCE, 
  BUFFER_MAX_SIZE, 
  LEVELS,
  COLORS 
} from '../constants';
import HUD from './HUD';

interface GameViewProps {
  levelId: number;
  gameState: GameState;
  setGameState: (s: GameState) => void;
  onComplete: (id: number, score: number, coins: number) => void;
  onRetry: () => void;
  onExit: () => void;
}

const GameView: React.FC<GameViewProps> = ({ levelId, gameState, setGameState, onComplete, onRetry, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Added initial value for requestRef to satisfy TypeScript requirements
  const requestRef = useRef<number | null>(null);
  const historyRef = useRef<GameFrame[]>([]);
  const levelRef = useRef<LevelConfig>(LEVELS.find(l => l.id === levelId) || LEVELS[0]);
  
  // Game State Refs (avoid stale closures in loop)
  const stateRef = useRef({
    playerY: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
    playerX: 100,
    playerVY: 0,
    isJumping: false,
    score: 0,
    coins: 0,
    distance: 0,
    // Fix: Added progress to the state object
    progress: 0,
    rewindsLeft: levelRef.current.rewindLimit,
    activeShield: 0,
    obstacles: [] as GameObject[],
    nextObstacleDist: 600,
    lastTime: performance.now(),
    isGrounded: true
  });

  const [uiState, setUiState] = useState({
    score: 0,
    coins: 0,
    rewinds: levelRef.current.rewindLimit,
    progress: 0
  });

  const initGame = useCallback(() => {
    stateRef.current = {
      playerY: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
      playerX: 100,
      playerVY: 0,
      isJumping: false,
      score: 0,
      coins: 0,
      distance: 0,
      // Fix: Reset progress in initGame
      progress: 0,
      rewindsLeft: levelRef.current.rewindLimit,
      activeShield: 0,
      obstacles: [],
      nextObstacleDist: 600,
      lastTime: performance.now(),
      isGrounded: true
    };
    historyRef.current = [];
    setUiState({
      score: 0,
      coins: 0,
      rewinds: levelRef.current.rewindLimit,
      progress: 0
    });
  }, [levelId]);

  useEffect(() => {
    initGame();
  }, [initGame, levelId]);

  const handleInput = useCallback(() => {
    if (gameState === 'PLAYING' && stateRef.current.isGrounded) {
      stateRef.current.playerVY = JUMP_FORCE;
      stateRef.current.isJumping = true;
      stateRef.current.isGrounded = false;
    } else if (gameState === 'GAMEOVER') {
      onRetry();
    }
  }, [gameState, onRetry]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') handleInput();
      if (e.code === 'KeyR') startRewind();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, gameState]);

  const startRewind = () => {
    if (gameState === 'PLAYING' && stateRef.current.rewindsLeft > 0 && historyRef.current.length > 0) {
      setGameState('REWINDING');
      stateRef.current.rewindsLeft--;
      setUiState(prev => ({ ...prev, rewinds: stateRef.current.rewindsLeft }));
    }
  };

  const update = (dt: number) => {
    if (gameState !== 'PLAYING') return;

    const s = stateRef.current;
    const level = levelRef.current;

    // Movement
    s.distance += level.speed;
    s.score = Math.floor(s.distance / 10);
    // Fix: s.progress is now defined on stateRef object
    s.progress = Math.min(100, (s.distance / level.targetDistance) * 100);

    // Physics
    s.playerVY += GRAVITY;
    s.playerY += s.playerVY;

    const groundY = CANVAS_HEIGHT - PLAYER_HEIGHT - 20;
    if (s.playerY >= groundY) {
      s.playerY = groundY;
      s.playerVY = 0;
      s.isJumping = false;
      s.isGrounded = true;
    }

    // Powerup cleanup
    if (s.activeShield > 0) s.activeShield -= dt;

    // Obstacle Spawning
    if (s.distance > s.nextObstacleDist) {
      const typeNum = Math.random();
      let newObj: GameObject;
      
      if (typeNum < 0.8) {
        newObj = {
          id: Math.random().toString(),
          type: 'OBSTACLE',
          pos: { x: CANVAS_WIDTH, y: CANVAS_HEIGHT - 70 },
          width: 30 + Math.random() * 40,
          height: 50
        };
      } else if (typeNum < 0.95) {
         newObj = {
          id: Math.random().toString(),
          type: 'COIN',
          pos: { x: CANVAS_WIDTH, y: CANVAS_HEIGHT - 120 - Math.random() * 100 },
          width: 25,
          height: 25
        };
      } else {
        const sub = Math.random() > 0.5 ? 'SHIELD' : 'EXTRA_REWIND';
        newObj = {
          id: Math.random().toString(),
          type: 'POWERUP',
          subType: sub,
          pos: { x: CANVAS_WIDTH, y: CANVAS_HEIGHT - 120 - Math.random() * 100 },
          width: 30,
          height: 30
        };
      }
      
      s.obstacles.push(newObj);
      s.nextObstacleDist += (300 + Math.random() * 600) - (level.speed * 10);
    }

    // Obstacle movement & Collision
    s.obstacles = s.obstacles.filter(obj => {
      obj.pos.x -= level.speed;

      // Collision Rect
      const pRect = { x: s.playerX, y: s.playerY, w: PLAYER_WIDTH, h: PLAYER_HEIGHT };
      const oRect = { x: obj.pos.x, y: obj.pos.y, w: obj.width, h: obj.height };

      if (
        pRect.x < oRect.x + oRect.w &&
        pRect.x + pRect.w > oRect.x &&
        pRect.y < oRect.y + oRect.h &&
        pRect.y + pRect.h > oRect.y
      ) {
        if (obj.type === 'OBSTACLE') {
          if (s.activeShield > 0) {
            s.activeShield = 0;
            return false;
          } else {
            setGameState('GAMEOVER');
          }
        } else if (obj.type === 'COIN') {
          s.coins += 10;
          return false;
        } else if (obj.type === 'POWERUP') {
          if (obj.subType === 'SHIELD') s.activeShield = 5000;
          if (obj.subType === 'EXTRA_REWIND') s.rewindsLeft++;
          return false;
        }
      }

      return obj.pos.x > -100;
    });

    // Check Level Complete
    if (s.distance >= level.targetDistance) {
      onComplete(levelId, s.score, s.coins);
    }

    // Save history for rewind
    historyRef.current.push({
      timestamp: s.lastTime,
      playerPos: { x: s.playerX, y: s.playerY },
      playerVel: { x: 0, y: s.playerVY },
      isJumping: s.isJumping,
      score: s.score,
      coins: s.coins,
      rewindsLeft: s.rewindsLeft,
      distance: s.distance,
      obstacles: s.obstacles.map(o => ({ ...o, pos: { ...o.pos } })),
      activeShield: s.activeShield
    });

    if (historyRef.current.length > BUFFER_MAX_SIZE) {
      historyRef.current.shift();
    }

    setUiState({
      score: s.score,
      coins: s.coins,
      rewinds: s.rewindsLeft,
      // Fix: s.progress is now defined on stateRef object
      progress: Math.floor(s.progress)
    });
  };

  // Fix: Correct parameter type for draw function
  const draw = (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    
    // Clear
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Ground
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Player
    ctx.fillStyle = s.activeShield > 0 ? COLORS.shield : COLORS.player;
    ctx.fillRect(s.playerX, s.playerY, PLAYER_WIDTH, PLAYER_HEIGHT);
    if (s.activeShield > 0) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(s.playerX - 5, s.playerY - 5, PLAYER_WIDTH + 10, PLAYER_HEIGHT + 10);
    }

    // Objects
    s.obstacles.forEach(obj => {
      if (obj.type === 'OBSTACLE') {
        ctx.fillStyle = COLORS.obstacle;
        ctx.fillRect(obj.pos.x, obj.pos.y, obj.width, obj.height);
      } else if (obj.type === 'COIN') {
        ctx.fillStyle = COLORS.coin;
        ctx.beginPath();
        ctx.arc(obj.pos.x + 12, obj.pos.y + 12, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.type === 'POWERUP') {
        ctx.fillStyle = obj.subType === 'SHIELD' ? COLORS.shield : COLORS.rewind;
        ctx.fillRect(obj.pos.x, obj.pos.y, obj.width, obj.height);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(obj.pos.x, obj.pos.y, obj.width, obj.height);
      }
    });

    if (gameState === 'REWINDING') {
      ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.fillText('REWINDING...', 300, 220);
    }
  };

  const loop = (time: number) => {
    const dt = time - stateRef.current.lastTime;
    stateRef.current.lastTime = time;

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      if (gameState === 'REWINDING') {
        // Pop 5 frames per actual frame for high speed rewind
        for (let i = 0; i < 5; i++) {
          const lastFrame = historyRef.current.pop();
          if (lastFrame) {
            stateRef.current.playerY = lastFrame.playerPos.y;
            stateRef.current.playerVY = lastFrame.playerVel.y;
            stateRef.current.isJumping = lastFrame.isJumping;
            stateRef.current.score = lastFrame.score;
            stateRef.current.coins = lastFrame.coins;
            stateRef.current.distance = lastFrame.distance;
            stateRef.current.obstacles = lastFrame.obstacles;
            stateRef.current.activeShield = lastFrame.activeShield;
          } else {
            setGameState('PLAYING');
            break;
          }
        }
        // Small randomization of obstacle positions on rewind
        stateRef.current.obstacles.forEach(o => {
          if (o.type === 'OBSTACLE') o.pos.x += (Math.random() - 0.5) * 5;
        });
      } else {
        update(dt);
      }
      draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div 
        className={`relative bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-slate-800 cursor-pointer ${gameState === 'REWINDING' ? 'glitch-effect' : ''}`}
        onClick={handleInput}
        style={{ width: 'min(95vw, 800px)', aspectRatio: '16/9' }}
      >
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain"
        />
        
        <HUD 
          score={uiState.score}
          coins={uiState.coins}
          rewinds={uiState.rewinds}
          progress={uiState.progress}
          level={levelId}
        />

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <h2 className="text-5xl font-black text-red-500 mb-4 tracking-tighter">CRASHED!</h2>
            <p className="text-xl text-white mb-8">Score: {uiState.score}</p>
            <div className="flex gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); startRewind(); }}
                disabled={uiState.rewinds <= 0}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-8 py-3 rounded-full font-bold flex flex-col items-center"
              >
                REWIND TIME
                <span className="text-xs">({uiState.rewinds} LEFT)</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onRetry(); }}
                className="bg-white hover:bg-slate-200 text-black px-8 py-3 rounded-full font-bold"
              >
                RETRY LEVEL
              </button>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onExit(); }}
              className="mt-8 text-slate-400 hover:text-white"
            >
              Back to Menu
            </button>
          </div>
        )}

        {gameState === 'LEVEL_COMPLETE' && (
          <div className="absolute inset-0 bg-blue-900/90 flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <h2 className="text-6xl font-black text-white mb-4 tracking-tighter">LEVEL {levelId} CLEAR</h2>
            <p className="text-2xl text-blue-200 mb-8">Total Coins: {uiState.coins}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onExit(); }}
              className="bg-green-500 hover:bg-green-400 text-white px-12 py-4 rounded-full font-bold text-xl shadow-xl"
            >
              CONTINUE
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-4 w-full max-w-2xl px-4">
        <button 
          onMouseDown={startRewind}
          onTouchStart={startRewind}
          className="flex-1 bg-purple-600 active:bg-purple-800 p-6 rounded-2xl shadow-lg border-b-4 border-purple-900 flex flex-col items-center justify-center transition-all active:translate-y-1"
        >
          <span className="text-2xl">⏳</span>
          <span className="font-bold text-white uppercase tracking-wider">Rewind</span>
        </button>
        <button 
          onMouseDown={handleInput}
          onTouchStart={handleInput}
          className="flex-1 bg-blue-600 active:bg-blue-800 p-6 rounded-2xl shadow-lg border-b-4 border-blue-900 flex flex-col items-center justify-center transition-all active:translate-y-1"
        >
          <span className="text-2xl">🚀</span>
          <span className="font-bold text-white uppercase tracking-wider">Jump</span>
        </button>
      </div>

      <p className="text-slate-500 text-xs mt-4 uppercase font-bold tracking-widest">Controls: Tap/Space to Jump | Press R/Button to Rewind</p>
    </div>
  );
};

export default GameView;
