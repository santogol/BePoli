// bepoli/client/src/services/api.js

const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

let csrfToken = null
async function fetchCsrf() {
  if (csrfToken) return csrfToken
  const res = await fetch(${BASE}/csrf-token, { credentials: 'include' })
  const data = await res.json()
  csrfToken = data.csrfToken
  return csrfToken
}

async function jfetch(path, options) {
  options = options || {}
  const method = options.method || 'GET'
  const body = options.body
  const headers = options.headers ? { ...options.headers } : {}
  const requireCsrf = !!options.requireCsrf

  if (requireCsrf) {
    const token = await fetchCsrf()
    headers['csrf-token'] = token
  }

  const res = await fetch(${BASE}${path}, {
    method,
    headers,
    body,
    credentials: 'include'
  })

  if (!res.ok) {
    let text = ''
    try { text = await res.text() } catch {}
    throw new Error(text || res.statusText)
  }

  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

const api = {
  // Auth
  login(username, password) {
    return jfetch('/login', {
      method: 'POST',
      requireCsrf: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
  },

  register(nome, username, password) {
    return jfetch('/register', {
      method: 'POST',
      requireCsrf: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, username, password })
    })
  },

  authToken() { return jfetch('/api/auth-token') },

  // Me & profili
  me() { return jfetch('/api/user') },
  userPublic(id) { return jfetch(/api/user-public/${id}) },
  userPosts(id) { return jfetch(/api/user/${id}/posts) },

  updateProfile({ bio, file }) {
    const fd = new FormData()
    if (bio !== undefined) fd.append('bio', bio)
    if (file) fd.append('profilePic', file)
    return jfetch('/api/update-profile', { method: 'POST', requireCsrf: true, body: fd })
  },

  userPhotoUrl(id) { return ${BASE}/api/user-photo/${id} },

  // Social
  searchUsers(q, page = 1, limit = 10) {
    return jfetch(/api/search-users?q=${encodeURIComponent(q)}&page=${page}&limit=${limit})
  },
  visitUser(id) { return jfetch(/api/visit-user/${id}, { method: 'POST' }) },
  recentUsers() { return jfetch(/api/recent-users) },
  followToggle(id) { return jfetch(/api/follow/${id}, { method: 'POST' }) },
  followInfo(id) { return jfetch(/api/follow-info/${id}) },

  // Post
  feed(location, page = 1) {
    const loc = encodeURIComponent(location || 'Fuori dalle aree conosciute')
    return jfetch(/api/posts?location=${loc}&page=${page})
  },

  createPost({ desc, imageFile, location }) {
    const fd = new FormData()
    if (desc) fd.append('desc', desc)
    if (location) fd.append('location', location)
    if (imageFile) fd.append('image', imageFile)
    return jfetch('/api/posts', { method: 'POST', body: fd })
  },

  likePost(id) { return jfetch(/api/posts/${id}/like, { method: 'POST' }) },
  commentPost(id, text) {
    return jfetch(/api/posts/${id}/comment, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
  },
  getComments(id) { return jfetch(/api/posts/${id}/comments) },

  // Logout
  logout() { return jfetch('/logout', { method: 'POST', requireCsrf: true }) }
}

export { api, fetchCsrf as ensureCsrf }
