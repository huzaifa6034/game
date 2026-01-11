
import { LevelConfig } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 60;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -15;
export const REWIND_MAX_SECONDS = 4;
export const FPS = 60;
export const BUFFER_MAX_SIZE = REWIND_MAX_SECONDS * FPS;

export const LEVELS: LevelConfig[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  speed: 5 + (i * 0.8),
  targetDistance: 2000 + (i * 1000),
  obstacleDensity: 0.015 + (i * 0.005),
  rewindLimit: 3 + Math.floor(i / 2)
}));

export const COLORS = {
  player: '#60a5fa',
  obstacle: '#ef4444',
  coin: '#fbbf24',
  ground: '#1e293b',
  rewind: '#8b5cf6',
  shield: '#34d399',
  sky: '#0f172a'
};
