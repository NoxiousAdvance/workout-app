import { useState, useRef, useCallback } from 'react';

const REPO = 'NoxiousAdvance/workout-app';
const FILE_PATH = 'data/progress.json';
const TOKEN_KEY = 'gh_token';
const API = 'https://api.github.com';

function encodeContent(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj, null, 2))));
}

function decodeContent(b64) {
  return JSON.parse(decodeURIComponent(escape(atob(b64.replace(/\n/g, '')))));
}

export function useGitHubSync() {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [syncState, setSyncState] = useState('idle'); // idle | syncing | saved | error
  const shaRef = useRef(null);
  const dataRef = useRef(null);
  const debounceRef = useRef(null);
  const pendingSyncRef = useRef(null);

  function setToken(tok) {
    localStorage.setItem(TOKEN_KEY, tok);
    setTokenState(tok);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  }

  async function loadFromGitHub(tok) {
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
  }

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
      setTimeout(() => setSyncState('idle'), 2000);
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
