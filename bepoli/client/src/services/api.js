const BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || ''

async function request(path, { method='GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  })
  if (!res.ok) throw new Error(await res.text() || res.statusText)
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text()
}

export const api = {
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
  me: (token) => request('/api/auth/me', { token }),
  feed: (token) => request('/api/posts', { token }),
  createPost: (token, data) => request('/api/posts', { method: 'POST', token, body: data }),
  likePost: (token, postId) => request(`/api/posts/${postId}/like`, { method: 'POST', token }),
  commentPost: (token, postId, text) => request(`/api/posts/${postId}/comments`, { method: 'POST', token, body: { text } }),
  getUser: (id, token) => request(`/api/users/${id}`, { token }),
  updateMe: (token, data) => request('/api/users/me', { method: 'PUT', token, body: data }),
  userPosts: (id, token) => request(`/api/users/${id}/posts`, { token })
}
