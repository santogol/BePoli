// client/src/services/api.js

// Base URL dell'API (in prod è la stessa origin; in dev puoi mettere VITE_API_BASE)
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

// Manteniamo in cache il token CSRF
let csrfToken = null;

// La esporto così, se per sbaglio era importata altrove, non romperà più il build
export async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  const res = await fetch(${BASE}/csrf-token, { credentials: 'include' });
  const data = await res.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}

// Helper fetch con gestione opzionale del CSRF
async function jfetch(path, { method = 'GET', body, headers = {}, requireCsrf = false } = {}) {
  if (requireCsrf) {
    const token = await ensureCsrf();
    headers['csrf-token'] = token; // header atteso dal backend (csurf)
  }

  const res = await fetch(${BASE}${path}, {
    method,
    headers,
    body,
    credentials: 'include',
  });

  if (!res.ok) {
    // Prova a estrarre JSON d'errore del backend
    let msg = res.statusText;
    try { msg = await res.text(); } catch {}
    throw new Error(msg || HTTP ${res.status});
  }

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export const api = {
  // ---------- Auth ----------
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

  authToken: () => jfetch('/api/auth-token'),

  me: () => jfetch('/api/user'),
  userPublic: (id) => jfetch(/api/user-public/${id}),
  userPosts: (id) => jfetch(/api/user/${id}/posts),

  // ---------- Profilo ----------
  updateProfile: ({ bio, file }) => {
    const fd = new FormData();
    if (bio !== undefined) fd.append('bio', bio);
    if (file) fd.append('profilePic', file);
    return jfetch('/api/update-profile', {
      method: 'POST',
      requireCsrf: true,
      body: fd,
    });
  },

  userPhotoUrl: (id) => ${BASE}/api/user-photo/${id},

  // ---------- Social ----------
  searchUsers: (q, page = 1, limit = 10) =>
    jfetch(/api/search-users?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}),

  visitUser: (id) => jfetch(/api/visit-user/${id}, { method: 'POST', requireCsrf: true }),

  recentUsers: () => jfetch('/api/recent-users'),

  followToggle: (id) => jfetch(/api/follow/${id}, { method: 'POST', requireCsrf: true }),

  followInfo: (id) => jfetch(/api/follow-info/${id}),

  // ---------- Post ----------
  feed: (location, page = 1) =>
    jfetch(
      /api/posts?location=${encodeURIComponent(location || 'Fuori dalle aree conosciute')}&page=${page}
    ),

  createPost: ({ desc, imageFile, location }) => {
    const fd = new FormData();
    if (desc) fd.append('desc', desc);
    if (location) fd.append('location', location);
    if (imageFile) fd.append('image', imageFile);
    return jfetch('/api/posts', { method: 'POST', requireCsrf: true, body: fd });
  },

  likePost: (id) => jfetch(/api/posts/${id}/like, { method: 'POST', requireCsrf: true }),

  commentPost: (id, text) =>
    jfetch(/api/posts/${id}/comment, {
      method: 'POST',
      requireCsrf: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }),

  getComments: (id) => jfetch(/api/posts/${id}/comments),

  postImageUrl: (id) => ${BASE}/api/post-image/${id},

  // ---------- Logout ----------
  logout: () => jfetch('/logout', { method: 'POST', requireCsrf: true }),
};

