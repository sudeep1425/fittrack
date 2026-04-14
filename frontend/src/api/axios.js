import axios from "axios";

// Fallback if env is missing
const baseURL =
  import.meta.env.VITE_API_URL || "https://fittrack-a0zu.onrender.com";

const api = axios.create({
  baseURL: `${baseURL}/api`,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;