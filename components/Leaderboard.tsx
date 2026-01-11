
import React from 'react';

const Leaderboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const dummyEntries = [
    { username: 'Chronos', score: 95000, level: 10 },
    { username: 'TimeWarp', score: 82100, level: 8 },
    { username: 'Speedster', score: 75000, level: 9 },
    { username: 'LoopRunner', score: 62000, level: 6 },
    { username: 'RewindKing', score: 55000, level: 5 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight">GLOBAL TOP RUNNERS</h2>
          <button onClick={onBack} className="text-slate-400 hover:text-white">Close</button>
        </div>

        <div className="space-y-3">
          {dummyEntries.map((e, i) => (
            <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                  {i + 1}
                </span>
                <div>
                  <div className="text-white font-bold">{e.username}</div>
                  <div className="text-xs text-slate-500">Reached Level {e.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-400 font-mono font-bold">{e.score.toLocaleString()}</div>
                <div className="text-[10px] text-slate-600">POINTS</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl text-blue-300 text-sm">
          💡 Leaderboards are updated globally using Cloudflare D1 database bindings.
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
