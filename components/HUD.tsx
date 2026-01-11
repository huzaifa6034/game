
import React from 'react';

interface HUDProps {
  score: number;
  coins: number;
  rewinds: number;
  progress: number;
  level: number;
}

const HUD: React.FC<HUDProps> = ({ score, coins, rewinds, progress, level }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between text-white font-mono">
      <div className="flex justify-between items-start">
        <div className="bg-slate-900/60 p-3 rounded-lg backdrop-blur-sm border border-slate-700/50">
          <div className="text-xs text-slate-400 uppercase">Level</div>
          <div className="text-xl font-bold leading-none">{level}</div>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-slate-900/60 p-3 rounded-lg backdrop-blur-sm border border-slate-700/50 text-right">
            <div className="text-xs text-slate-400 uppercase">Score</div>
            <div className="text-xl font-bold leading-none">{score.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg backdrop-blur-sm border border-slate-700/50 text-right">
            <div className="text-xs text-slate-400 uppercase">Coins</div>
            <div className="text-xl font-bold leading-none text-yellow-400">{coins}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <div className="bg-purple-600/80 px-4 py-2 rounded-full border border-purple-400 shadow-lg flex items-center gap-2">
            <span className="text-sm">REWIND STORAGE:</span>
            <span className="text-xl font-black">{rewinds}</span>
          </div>
          <div className="text-xs font-bold bg-slate-900/60 px-2 py-1 rounded">
            {progress}% COMPLETE
          </div>
        </div>
        
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default HUD;
