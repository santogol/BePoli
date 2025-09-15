// bepoli/client/src/services/api.js

// Base URL dell'API (vuoto = stessa origin in produzione)
const BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

// Cache del token CSRF
let csrf = null;

// Recupera e memorizza il CSRF token
export async function ensureCsrf() {
  if (csrf) return csrf;
  const r = await fetch(${BASE}/csrf-token, { credentials: 'include' });
  const j = await r.json();
  csrf = j.csrfToken;
  return csrf;
}

// Wrapper fetch con gestione opzionale del CSRF
async function jfetch(path, { method = 'GET', body, headers = {}, requireCsrf = false } = {}) {
  if (requireCsrf) {
    const token = await ensureCsrf();
    headers['csrf-token'] = token; // il server legge questo header
  }
  const res = await fetch(${BASE}${path}, {
    method,
    headers,
    body,
    credentials: 'include',
  });
  if (!res.ok) {
    // prova a leggere l'errore del server
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(txt || res.statusText);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// API minime per far funzionare login, register e “me”
export const api = {
  // Auth
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
