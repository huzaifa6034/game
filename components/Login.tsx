
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [user, setUser] = useState('');

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="w-full max-w-sm bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-4xl mb-6 text-center">🏃💨</div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">RUNNER PROFILE</h1>
        <p className="text-slate-400 text-center text-sm mb-8">Enter your runner tag to start your timeline.</p>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          if (user.trim()) onLogin(user.trim());
        }}>
          <input 
            autoFocus
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Runner Name..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors"
          >
            ENTER THE LOOP
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
