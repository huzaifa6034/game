
import React from 'react';

const DeploymentGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Production Deployment Guide</h1>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 rounded">Close</button>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-blue-400">1. Cloudflare Pages Setup</h2>
          <p className="mb-2 text-slate-400">Host your frontend and API on the edge:</p>
          <ul className="list-disc ml-6 space-y-1 text-slate-300">
            <li>Create a new project in Cloudflare Pages.</li>
            <li>Connect your GitHub repository.</li>
            <li>Build Command: <code>npm run build</code></li>
            <li>Build Output: <code>dist/</code></li>
            <li>Add environment variable <code>API_KEY</code> if using specific services.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-blue-400">2. Persistence (KV & D1)</h2>
          <p className="mb-2 text-slate-400">Enable real-time leaderboard and profile sync:</p>
          <div className="bg-black p-4 rounded font-mono text-sm text-green-400">
            {`// Create D1 Database
npx wrangler d1 create rewind-runner-db

// Define Leaderboard Table
CREATE TABLE leaderboard (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  score INTEGER,
  level INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-blue-400">3. Play Store Ready</h2>
          <p className="mb-2 text-slate-400">Convert this PWA to a Native Android App:</p>
          <ul className="list-decimal ml-6 space-y-1 text-slate-300">
            <li>Download <strong>TWA (Trusted Web Activity)</strong> or use Bubblewrap.</li>
            <li>Configure <code>twa-manifest.json</code> with your URL.</li>
            <li>Run <code>bubblewrap build</code> to generate the AAB/APK.</li>
            <li>Upload the AAB to Google Play Console.</li>
            <li>Add <code>assetlinks.json</code> to your <code>public/.well-known/</code> folder.</li>
          </ul>
        </section>

        <div className="p-4 bg-yellow-900/30 border border-yellow-800 rounded text-yellow-200">
          <strong>Note:</strong> This app includes a functional PWA manifest and service worker. It can be installed directly from a browser to act like a native app.
        </div>
      </div>
    </div>
  );
};

export default DeploymentGuide;
