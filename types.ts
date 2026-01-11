
export type GameState = 'MENU' | 'PLAYING' | 'REWINDING' | 'GAMEOVER' | 'LEVEL_COMPLETE' | 'LEADERBOARD';

export interface PlayerProfile {
  username: string;
  highestLevel: number;
  totalCoins: number;
  bestScores: Record<number, number>;
}

export interface Vector {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  pos: Vector;
  width: number;
  height: number;
  type: 'OBSTACLE' | 'COIN' | 'POWERUP';
  subType?: 'SHIELD' | 'EXTRA_REWIND' | 'SPEED_BOOST';
}

export interface GameFrame {
  timestamp: number;
  playerPos: Vector;
  playerVel: Vector;
  isJumping: boolean;
  score: number;
  coins: number;
  rewindsLeft: number;
  distance: number;
  obstacles: GameObject[];
  activeShield: number; // time remaining
}

export interface LevelConfig {
  id: number;
  speed: number;
  targetDistance: number;
  obstacleDensity: number;
  rewindLimit: number;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  level: number;
}
