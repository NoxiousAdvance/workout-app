export function SyncIndicator({ state, onRetry }) {
  const dot = (color, animate = false) => (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: color, verticalAlign: 'middle',
      animation: animate ? 'pulse 1s ease-in-out infinite' : 'none',
    }} />
  );

  if (state === 'idle') return dot('#333');
  if (state === 'syncing') return dot('#f5a623', true);
  if (state === 'saved') return (
    <span style={{ fontSize: 11, color: '#4caf50', verticalAlign: 'middle' }}>✓ saved</span>
  );
  if (state === 'error') return (
    <span>
      {dot('#e94560')}
      <button onClick={onRetry ?? undefined} style={{
        fontSize: 11, color: '#e94560', background: 'none',
        border: 'none', cursor: 'pointer', marginLeft: 4, verticalAlign: 'middle',
      }}>
        retry
      </button>
    </span>
  );
  return null;
}
