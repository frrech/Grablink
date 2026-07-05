import { useState } from 'react';
import { ShareDevice } from './components/ShareDevice';
import { AccessDevice } from './components/AccessDevice';
import './App.css';

type Mode = 'share' | 'access';

function App() {
  const [mode, setMode] = useState<Mode>('share');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🔗 Grablink</h1>
          <p className="app-subtitle">Share links instantly with 6-digit codes</p>
        </div>
      </header>

      <main className="app-main">
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'share' ? 'active' : ''}`}
            onClick={() => setMode('share')}
          >
            📤 Share Link
          </button>
          <button
            className={`mode-btn ${mode === 'access' ? 'active' : ''}`}
            onClick={() => setMode('access')}
          >
            📥 Access Link
          </button>
        </div>

        <div className="mode-content">
          {mode === 'share' && <ShareDevice />}
          {mode === 'access' && <AccessDevice />}
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React • Share links in seconds • No authentication needed</p>
      </footer>
    </div>
  );
}

export default App;
