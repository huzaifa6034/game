
import React, { useState, useEffect } from 'react';
import { GameState, PlayerProfile } from './types';
import MainMenu from './components/MainMenu';
import GameView from './components/GameView';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import DeploymentGuide from './components/DeploymentGuide';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rewind_runner_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const saveProfile = (updated: PlayerProfile) => {
    setProfile(updated);
    localStorage.setItem('rewind_runner_profile', JSON.stringify(updated));
    // In a real CF Workers app, you would fetch() to update D1/KV here
  };

  const handleLevelComplete = (levelId: number, score: number, coins: number) => {
    if (!profile) return;

    const newBest = { ...profile.bestScores };
    if (!newBest[levelId] || score > newBest[levelId]) {
      newBest[levelId] = score;
    }

    const updatedProfile: PlayerProfile = {
      ...profile,
      highestLevel: Math.max(profile.highestLevel, levelId + 1),
      totalCoins: profile.totalCoins + coins,
      bestScores: newBest
    };
    
    saveProfile(updatedProfile);
    setGameState('LEVEL_COMPLETE');
  };

  if (showGuide) {
    return <DeploymentGuide onClose={() => setShowGuide(false)} />;
  }

  if (!profile) {
    return <Login onLogin={(user) => {
      const newProf = { username: user, highestLevel: 1, totalCoins: 0, bestScores: {} };
      saveProfile(newProf);
    }} />;
  }

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden select-none">
      {gameState === 'MENU' && (
        <MainMenu 
          profile={profile} 
          onStart={(level) => {
            setCurrentLevel(level);
            setGameState('PLAYING');
          }}
          onLeaderboard={() => setGameState('LEADERBOARD')}
          onShowGuide={() => setShowGuide(true)}
        />
      )}

      {(gameState === 'PLAYING' || gameState === 'REWINDING' || gameState === 'GAMEOVER' || gameState === 'LEVEL_COMPLETE') && (
        <GameView 
          levelId={currentLevel}
          gameState={gameState}
          setGameState={setGameState}
          onComplete={handleLevelComplete}
          onRetry={() => setGameState('PLAYING')}
          onExit={() => setGameState('MENU')}
        />
      )}

      {gameState === 'LEADERBOARD' && (
        <Leaderboard onBack={() => setGameState('MENU')} />
      )}
    </div>
  );
};

export default App;
