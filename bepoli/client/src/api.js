// bepoli/client/src/api.js
import axios from 'axios';

const isProd = import.meta.env.PROD;
// In produzione usa la stessa origin (stringa vuota)
// In sviluppo usa VITE_API_URL o il fallback localhost:3000
const baseURL = isProd ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

export const api = axios.create({
  baseURL,
  withCredentials: true
});

let csrfLoading = null;

async function ensureCsrf() {
  const { data } = await api.get('/csrf-token');
  api.defaults.headers.common['CSRF-Token'] = data.csrfToken;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const needsCsrf = ['post','put','patch','delete'].includes(method);
  if (needsCsrf && !api.defaults.headers.common['CSRF-Token']) {
    csrfLoading = csrfLoading || ensureCsrf();
    await csrfLoading;
    csrfLoading = null;
  }
  return config;
});
