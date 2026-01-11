
import React from 'react';
import { PlayerProfile } from '../types';
import { LEVELS } from '../constants';

interface MainMenuProps {
  profile: PlayerProfile;
  onStart: (level: number) => void;
  onLeaderboard: () => void;
  onShowGuide: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ profile, onStart, onLeaderboard, onShowGuide }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
      <h1 className="text-5xl font-black mb-2 tracking-tighter italic text-blue-500 drop-shadow-xl">
        TIME REWIND
        <span className="text-purple-500"> RUNNER</span>
      </h1>
      <p className="mb-8 text-slate-400">Welcome, {profile.username} | Coins: {profile.totalCoins}</p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8 max-w-2xl">
        {LEVELS.map((lvl) => {
          const isLocked = lvl.id > profile.highestLevel;
          return (
            <button
              key={lvl.id}
              disabled={isLocked}
              onClick={() => onStart(lvl.id)}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${
                isLocked 
                  ? 'bg-slate-800 border-slate-700 opacity-50 grayscale' 
                  : 'bg-slate-800 border-blue-500 hover:scale-105 hover:bg-slate-700'
              }`}
            >
              <span className="text-xs uppercase text-slate-400">Level</span>
              <span className="text-2xl font-bold">{lvl.id}</span>
              {profile.bestScores[lvl.id] && (
                <span className="text-[10px] text-yellow-500 mt-1">Best: {profile.bestScores[lvl.id]}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
        <button 
          onClick={() => onStart(profile.highestLevel)}
          className="flex-1 bg-blue-600 hover:bg-blue-500 py-4 px-8 rounded-full font-bold text-lg shadow-lg"
        >
          PLAY CONTINUED
        </button>
        <button 
          onClick={onLeaderboard}
          className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 px-8 rounded-full font-bold text-lg border border-slate-600 shadow-lg"
        >
          LEADERBOARD
        </button>
      </div>

      <button 
        onClick={onShowGuide}
        className="mt-8 text-slate-500 hover:text-white underline text-sm"
      >
        Developer: Deployment Guide
      </button>

      {/* Placeholder Banner Ad */}
      <div className="mt-auto w-full max-w-md h-12 bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-500 rounded">
        SPONSORED CONTENT AREA
      </div>
    </div>
  );
};

export default MainMenu;
