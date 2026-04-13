import axios from 'axios';

// Extract and safely parse the base URL
const rawUrl = import.meta.env.VITE_API_URL;
let formattedUrl = rawUrl;

// Remove trailing slash if present
if (formattedUrl.endsWith('/')) formattedUrl = formattedUrl.slice(0, -1);
// Remove /api so we can standardize it cleanly below
if (formattedUrl.endsWith('/api')) formattedUrl = formattedUrl.slice(0, -4);

const api = axios.create({
  baseURL: `${formattedUrl}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
