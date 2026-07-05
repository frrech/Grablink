import { useState } from 'react';
import { grablinkAPI, type ShareResponse } from '../services/api';
import '../styles/ShareDevice.css';

export function ShareDevice() {
  const [url, setUrl] = useState('');
  const [share, setShare] = useState<ShareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await grablinkAPI.createShare(url);
      setShare(result);
      setUrl('');
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (share) {
      navigator.clipboard.writeText(share.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewShare = () => {
    setShare(null);
    setUrl('');
    setError('');
  };

  if (share) {
    const expiresAt = new Date(share.expiresAt);
    const now = new Date();
    const minutesLeft = Math.floor((expiresAt.getTime() - now.getTime()) / 60000);

    return (
      <div className="share-device-container">
        <div className="share-result">
          <div className="success-icon">✓</div>
          <h2>Share Created!</h2>

          <div className="code-display">
            <div className="code-label">Your Share Code</div>
            <div className="code-box">
              <span className="code-text">{share.code}</span>
              <button
                className="copy-btn"
                onClick={handleCopyCode}
                title="Copy code"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="url-display">
            <div className="url-label">Shared URL</div>
            <a href={share.url} target="_blank" rel="noopener noreferrer" className="url-link">
              {share.url}
            </a>
          </div>

          <div className="expiration-info">
            <span className="timer">⏱️ Expires in {minutesLeft} minutes</span>
            <p className="small-text">Share this 6-digit code with another device to access the link.</p>
          </div>

          <button className="new-share-btn" onClick={handleNewShare}>
            ← Create Another Share
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="share-device-container">
      <div className="share-form">
        <h2>📤 Share a Link</h2>
        <p className="subtitle">Enter a URL to generate a 6-digit share code</p>

        <form onSubmit={handleCreateShare}>
          <div className="form-group">
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={loading}
              className="url-input"
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url}
            className="submit-btn"
          >
            {loading ? 'Creating...' : 'Generate Code'}
          </button>
        </form>

        <div className="info-box">
          <p>
            💡 <strong>How it works:</strong> Generate a code, share it with another device, and they can instantly access your link.
          </p>
        </div>
      </div>
    </div>
  );
}
