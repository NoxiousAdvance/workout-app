import { useState, useRef, useCallback, useEffect } from 'react';

const REPO = 'NoxiousAdvance/workout-app';
const FILE_PATH = 'data/progress.json';
const TOKEN_KEY = 'gh_token';
const API = 'https://api.github.com';

function encodeContent(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj, null, 2));
  return btoa(bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), ''));
}

function decodeContent(b64) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function useGitHubSync() {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [syncState, setSyncState] = useState('idle'); // idle | syncing | saved | error
  const shaRef = useRef(null);
  const dataRef = useRef(null);
  const debounceRef = useRef(null);
  const pendingSyncRef = useRef(null);
  const savedStateTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      clearTimeout(savedStateTimerRef.current);
    };
  }, []);

  const setToken = useCallback((tok) => {
    localStorage.setItem(TOKEN_KEY, tok);
    setTokenState(tok);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  }, []);

  const loadFromGitHub = useCallback(async (tok) => {
    try {
      const res = await fetch(`${API}/repos/${REPO}/contents/${FILE_PATH}`, {
        headers: {
          Authorization: `Bearer ${tok}`,
          Accept: 'application/vnd.github+json',
        },
      });
      if (res.status === 401) { clearToken(); return null; }
      if (!res.ok) return null;
      const json = await res.json();
      shaRef.current = json.sha;
      const content = decodeContent(json.content);
      dataRef.current = content;
      return content;
    } catch {
      return null;
    }
  }, [clearToken]); // eslint-disable-line

  async function writeToGitHub(fullData, tok) {
    setSyncState('syncing');
    try {
      const body = {
        message: 'sync: update workout progress',
        content: encodeContent(fullData),
        ...(shaRef.current ? { sha: shaRef.current } : {}),
      };
      const res = await fetch(`${API}/repos/${REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tok}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify(body),
      });
      if (res.status === 401) { clearToken(); setSyncState('error'); return; }
      if (!res.ok) throw new Error('write failed');
      const json = await res.json();
      shaRef.current = json.content.sha;
      dataRef.current = fullData;
      setSyncState('saved');
      clearTimeout(savedStateTimerRef.current);
      savedStateTimerRef.current = setTimeout(() => setSyncState('idle'), 2000);
    } catch {
      setSyncState('error');
    }
  }

  const sync = useCallback((weekKey, completed, perfLog) => {
    if (!token) return;
    pendingSyncRef.current = { weekKey, completed, perfLog };
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const { weekKey: wk, completed: c, perfLog: p } = pendingSyncRef.current;
      const fullData = { ...(dataRef.current || {}), [wk]: { completed: c, perfLog: p } };
      writeToGitHub(fullData, token);
    }, 2000);
  }, [token]); // eslint-disable-line

  const retry = useCallback(() => {
    if (!pendingSyncRef.current || !token) return;
    const { weekKey: wk, completed: c, perfLog: p } = pendingSyncRef.current;
    const fullData = { ...(dataRef.current || {}), [wk]: { completed: c, perfLog: p } };
    writeToGitHub(fullData, token);
  }, [token]); // eslint-disable-line

  return { token, setToken, syncState, loadFromGitHub, sync, retry };
}
