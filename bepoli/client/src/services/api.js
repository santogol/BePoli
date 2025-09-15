// bepoli/client/src/services/api.js

// Base URL dell'API (vuoto = stessa origin in produzione)
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

// Cache del token CSRF in memoria
let csrf = null;

// Ottiene e memorizza il token CSRF
export async function ensureCsrf() {
  if (csrf) return csrf;
  const r = await fetch(BASE + '/csrf-token', { credentials: 'include' });
  const j = await r.json();
  csrf = j.csrfToken;
  return csrf;
}

// Wrapper fetch con gestione opzionale CSRF
async function jfetch(path, options) {
  const opts = options || {};
  const method = opts.method || 'GET';
  const headers = opts.headers ? { ...opts.headers } : {};

  if (opts.requireCsrf) {
    const token = await ensureCsrf();
    headers['csrf-token'] = token; // il backend legge questo header
  }

  const res = await fetch(BASE + path, {
    method: method,
    headers: headers,
    body: opts.body,
    credentials: 'include',
  });

  if (!res.ok) {
    let txt = '';
    try { txt = await res.text(); } catch (_) {}
    throw new Error(txt || res.statusText);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.indexOf('application/json') !== -1) {
    return res.json();
  }
  return res.text();
}

// Endpoints minimi per login/registrazione/me/logout
export const api = {
  login: (username, password) =>
    jfetch('/login', {
      method: 'POST',
      requireCsrf: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),

  register: (nome, username, password) =>
    jfetch('/register', {
      method: 'POST',
      requireCsrf: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, username, password }),
    }),

  me: () => jfetch('/api/user'),

  logout: () =>
    jfetch('/logout', {
      method: 'POST',
      requireCsrf: true,
    }),
};
