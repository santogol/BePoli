import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || ''; // '' = stessa origin in prod
export const api = axios.create({
  baseURL,
  withCredentials: true, // importante per la sessione Cookie
});

// 1) prendi CSRF prima di ogni POST/PUT/DELETE
export async function ensureCsrf() {
  const { data } = await api.get('/csrf-token'); // server manda req.csrfToken()
  api.defaults.headers.common['CSRF-Token'] = data.csrfToken;
}
