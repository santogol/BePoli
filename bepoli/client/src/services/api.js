// bepoli/client/src/services/api.js
const BASE = (import.meta.env && import.meta.env.VITE_API_BASE ? import.meta.env.VITE_API_BASE : '').replace(/\/$/, '')

let csrfToken
async function getCsrf() {
  if (csrfToken) return csrfToken
  const r = await fetch(${BASE}/csrf-token, { credentials: 'include' })
  const j = await r.json()
  csrfToken = j.csrfToken
  return csrfToken
}

async function jfetch(path, opt) {
  opt = opt || {}
  const method = opt.method || 'GET'
  const headers = opt.headers ? { ...opt.headers } : {}
  const body = opt.body

  if (opt.requireCsrf) {
    headers['csrf-token'] = await getCsrf()
  }

  const res = await fetch(${BASE}${path}, {
    method,
    headers,
    body,
    credentials: 'include'
  })

  if (!res.ok) {
    let txt = ''
    try { txt = await res.text() } catch {}
    throw new Error(txt || res.statusText)
  }

  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export const api = {
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

  me() { return jfetch('/api/user') },

  logout() { return jfetch('/logout', { method: 'POST', requireCsrf: true }) }
}

export { getCsrf as ensureCsrf, BASE }
