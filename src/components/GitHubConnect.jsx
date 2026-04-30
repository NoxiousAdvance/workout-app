import { useState, useEffect, useRef } from 'react';

const CLIENT_ID = 'Ov23liLeGCfRZqC2sUqN';
const DEVICE_URL = 'https://github.com/login/device';

export function GitHubConnect({ onToken }) {
  const [step, setStep] = useState('idle'); // idle | waiting | error
  const [userCode, setUserCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef(null);
  const startingRef = useRef(false);
  const intervalRef = useRef(5000);

  useEffect(() => () => clearInterval(pollRef.current), []);

  function cancel() {
    clearInterval(pollRef.current);
    startingRef.current = false;
    intervalRef.current = 5000;
    setStep('idle');
    setErrorMsg('');
  }

  async function startAuth() {
    if (startingRef.current) return;
    startingRef.current = true;
    setErrorMsg('');
    try {
      const res = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, scope: 'repo' }),
      });
      if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUserCode(data.user_code);
      setStep('waiting');
      window.open(DEVICE_URL, '_blank');

      async function tick() {
        try {
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
            startingRef.current = false;
            onToken(d.access_token);
            return;
          }
          if (d.error === 'slow_down') {
            clearInterval(pollRef.current);
            intervalRef.current += 5000;
            pollRef.current = setInterval(tick, intervalRef.current);
            return;
          }
          if (d.error === 'expired_token' || d.error === 'access_denied') {
            clearInterval(pollRef.current);
            startingRef.current = false;
            setStep('error');
            setErrorMsg(d.error === 'access_denied' ? 'Access denied on GitHub.' : 'Code expired. Please try again.');
          }
          // authorization_pending: keep polling
        } catch {
          clearInterval(pollRef.current);
          startingRef.current = false;
          setStep('error');
          setErrorMsg('Connection error. Check network and try again.');
        }
      }

      pollRef.current = setInterval(tick, intervalRef.current);
    } catch (e) {
      startingRef.current = false;
      setStep('error');
      setErrorMsg(e.message || 'Failed to start auth. Try again.');
    }
  }

  const containerStyle = {
    textAlign: 'center', padding: '40px 20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, margin: '20px 0',
  };

  const btnStyle = {
    padding: '10px 24px', borderRadius: 10,
    background: '#238636', border: 'none',
    color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  };

  const cancelBtnStyle = {
    ...btnStyle, background: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#888', marginLeft: 10,
  };

  if (step === 'error') {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ color: '#e94560', fontSize: 13, marginBottom: 20 }}>{errorMsg}</div>
        <button onClick={cancel} style={btnStyle}>Try again</button>
      </div>
    );
  }

  if (step === 'waiting') {
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
        <div style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>Waiting for authorization...</div>
        <button onClick={cancel} style={cancelBtnStyle}>Cancel</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>☁️</div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Back up your progress</div>
      <div style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
        Connect GitHub to save your data safely — survives browser clears.
      </div>
      <button onClick={startAuth} style={btnStyle}>Connect GitHub</button>
    </div>
  );
}
