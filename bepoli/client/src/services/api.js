// bepoli/client/src/services/api.js

const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

let csrf = null
export async function ensureCsrf() {
  if (csrf) return csrf
  const r = await fetch(${BASE}/csrf-token, { credentials: 'include' })
  const j = await r.json()
  csrf = j.csrfToken
  return csrf
}

async function jfetch(path, opts) {
  opts = opts || {}
  const method = opts.method || 'GET'
  const body = opts.body
  const requireCsrf = !!opts.requireCsrf
  const headers = Object.assign({}, opts.headers || {})

  if (requireCsrf) {
    const token = await ensureCsrf()
    headers['csrf-token'] = token
  }

  const res = await fetch(${BASE}${path}, {
    method,
    headers,
    body,
    credentials: 'include'
  })

  if (!res.ok) {
    // prova a dare indizio utile dal body
    const text = await res.text().catch(() => '')
    throw new Error(text || res.statusText)
  }

  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export const api = {
  // Auth
  login: (username, password) =>
    jfetch('/login', {
      method: 'POST',
      requireCsrf: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }),

  register: (nome, username, password) =>
    jfetch('/register', {
      method: 'POST',
      requireCsrf: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, username, password })
    }),

  authToken: () => jfetch('/api/auth-token'),

  // Me & profili
  me: () => jfetch('/api/user'),
  userPublic: (id) => jfetch(/api/user-public/${id}),
  userPosts: (id) => jfetch(/api/user/${id}/posts),

  updateProfile: ({ bio, file }) => {
    const fd = new FormData()
    if (bio !== undefined) fd.append('bio', bio)
    if (file) fd.append('profilePic', file)
    return jfetch('/api/update-profile', { method: 'POST', requireCsrf: true, body: fd })
  },
  userPhotoUrl: (id) => ${BASE}/api/user-photo/${id},

  // Social
  searchUsers: (q, page = 1, limit = 10) =>
    jfetch(/api/search-users?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}),
  visitUser: (id) => jfetch(/api/visit-user/${id}, { method: 'POST' }),
  recentUsers: () => jfetch(/api/recent-users),
  followToggle: (id) => jfetch(/api/follow/${id}, { method: 'POST' }),
  followInfo: (id) => jfetch(/api/follow-info/${id}),

  // Post
  feed: (location, page = 1) =>
    jfetch(/api/posts?location=${encodeURIComponent(location || 'Fuori dalle aree conosciute')}&page=${page}),

  createPost: ({ desc, imageFile, location }) => {
    const fd = new FormData()
    if (desc) fd.append('desc', desc)
    if (location) fd.append('location', location)
    if (imageFile) fd.append('image', imageFile)
    return jfetch('/api/posts', { method: 'POST', body: fd })
  },

  likePost: (id) => jfetch(/api/posts/${id}/like, { method: 'POST' }),
  commentPost: (id, text) =>
    jfetch(/api/posts/${id}/comment, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    }),
  getComments: (id) => jfetch(/api/posts/${id}/comments),
  postImageUrl: (id) => ${BASE}/api/post-image/${id},

  // Logout
  logout: () => jfetch('/logout', { method: 'POST', requireCsrf: true })
}
