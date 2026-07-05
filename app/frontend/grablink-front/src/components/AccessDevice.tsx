import { useState } from 'react';
import { grablinkAPI, type AccessResponse } from '../services/api';
import '../styles/AccessDevice.css';

export function AccessDevice() {
  const [code, setCode] = useState('');
  const [share, setShare] = useState<AccessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccessShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await grablinkAPI.accessShare(code);
      setShare(result);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access share');
      setShare(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setShare(null);
    setCode('');
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (share) {
    return (
      <div className="access-device-container">
        <div className="share-result">
          <div className="success-icon">✓</div>
          <h2>Link Retrieved!</h2>

          <div className="link-display">
            <div className="link-title">
              {share.title ? (
                <>
                  <span className="title-text">{share.title}</span>
                </>
              ) : (
                <span className="loading-title">Loading title...</span>
              )}
            </div>
          </div>

          <div className="link-url">
            <a href={share.url} target="_blank" rel="noopener noreferrer" className="url-link">
              🔗 Open Link
            </a>
          </div>

          {share.qrCode && (
            <div className="qr-code-display">
              <img
                src={share.qrCode}
                alt="QR Code"
                className="qr-code-image"
              />
              <p className="qr-label">Scan to open</p>
            </div>
          )}

          <div className="share-metadata">
            <div className="metadata-item">
              <span className="label">Code:</span>
              <span className="value">{share.code}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Created:</span>
              <span className="value">{formatDate(share.createdAt)}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Expires:</span>
              <span className="value">{formatDate(share.expiresAt)}</span>
            </div>
          </div>

          <button className="access-another-btn" onClick={handleReset}>
            ← Access Another Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="access-device-container">
      <div className="access-form">
        <h2>📥 Access a Link</h2>
        <p className="subtitle">Enter a 6-digit code to retrieve the shared link</p>

        <form onSubmit={handleAccessShare}>
          <div className="form-group">
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              disabled={loading}
              className="code-input"
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="submit-btn"
          >
            {loading ? 'Retrieving...' : 'Get Link'}
          </button>
        </form>

        <div className="info-box">
          <p>
            💡 <strong>How it works:</strong> Get a 6-digit code from another device and enter it here to instantly access their link.
          </p>
        </div>
      </div>
    </div>
  );
}
