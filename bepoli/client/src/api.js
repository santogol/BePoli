import axios from 'axios';

const isProd = import.meta.env.PROD;
const baseURL = isProd ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

export const api = axios.create({
  baseURL,
  withCredentials: true, // necessario per i cookie di sessione
});

// ---- CSRF helper ----
let csrfLoading = null;
async function fetchCsrf() {
  const { data } = await api.get('/csrf-token');
  api.defaults.headers.common['CSRF-Token'] = data.csrfToken;
}

// Interceptor: prima di POST/PUT/PATCH/DELETE assicura il token CSRF
api.interceptors.request.use(async (config) => {
  const m = (config.method || 'get').toLowerCase();
  const needsCsrf = ['post', 'put', 'patch', 'delete'].includes(m);
  if (needsCsrf && !api.defaults.headers.common['CSRF-Token']) {
    csrfLoading = csrfLoading || fetchCsrf();
    await csrfLoading;
    csrfLoading = null;
  }
  return config;
});
