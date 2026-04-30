import { useState, useEffect, useRef } from 'react';

const CLIENT_ID = 'Ov23liLeGCfRZqC2sUqN';
const DEVICE_URL = 'https://github.com/login/device';

export function GitHubConnect({ onToken }) {
  const [step, setStep] = useState('idle'); // idle | waiting
  const [userCode, setUserCode] = useState('');
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  async function startAuth() {
    try {
      const res = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, scope: 'repo' }),
      });
      const data = await res.json();
      setUserCode(data.user_code);
      setStep('waiting');
      window.open(DEVICE_URL, '_blank');
      pollRef.current = setInterval(async () => {
        const r = await fetch('https://github.com/login/device/token', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            device_code: data.device_code,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        });
        const d = await r.json();
        if (d.access_token) {
          clearInterval(pollRef.current);
          onToken(d.access_token);
        }
      }, 5000);
    } catch (e) {
      console.error('GitHub auth failed', e);
    }
  }

  const containerStyle = {
    textAlign: 'center', padding: '40px 20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, margin: '20px 0',
  };

  if (step === 'idle') {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>☁️</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Back up your progress</div>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
          Connect GitHub to save your data safely — survives browser clears.
        </div>
        <button onClick={startAuth} style={{
          padding: '10px 24px', borderRadius: 10,
          background: '#238636', border: 'none',
          color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>
          Connect GitHub
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
        Visit <strong style={{ color: '#f0f0f0' }}>github.com/login/device</strong> and enter:
      </div>
      <div style={{
        fontSize: 28, fontWeight: 800, letterSpacing: 6,
        color: '#e94560', fontFamily: 'monospace', marginBottom: 16,
      }}>
        {userCode}
      </div>
      <div style={{ fontSize: 12, color: '#555' }}>Waiting for authorization...</div>
    </div>
  );
}
