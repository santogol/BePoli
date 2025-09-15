import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || ''; // stessa origin in prod
export const api = axios.create({
  baseURL,
  withCredentials: true, // necessario per cookie di sessione
});

// prendi il token e salvalo sull'istanza
export async function ensureCsrf() {
  const { data } = await api.get('/csrf-token', { withCredentials: true });
  // usa minuscolo:
  api.defaults.headers.common['csrf-token'] = data.csrfToken;
}

// Interceptor: prima di ogni write, assicurati di avere il token e metterlo nell'header
api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const needsToken = ['post', 'put', 'patch', 'delete'].includes(method);

  if (needsToken) {
    if (!api.defaults.headers.common['csrf-token']) {
      const { data } = await api.get('/csrf-token', { withCredentials: true });
      api.defaults.headers.common['csrf-token'] = data.csrfToken;
    }
    config.headers['csrf-token'] = api.defaults.headers.common['csrf-token'];
    config.withCredentials = true;
  }
  return config;
});
