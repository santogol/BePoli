// bepoli/client/src/api.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || ''; // stessa origin in prod
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
  const needsCsrf = ['post', 'put', 'patch', 'delete'].includes(method);
  if (needsCsrf && !api.defaults.headers.common['CSRF-Token']) {
    csrfLoading = csrfLoading || ensureCsrf();
    await csrfLoading;
    csrfLoading = null;
  }
  return config;
});
