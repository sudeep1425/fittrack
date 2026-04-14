import axios from "axios";

const rawBaseURL =
  import.meta.env.VITE_API_URL || "https://fittrack-a0zu.onrender.com";

const trimmedBaseURL = String(rawBaseURL).replace(/\/+$/, "");
const baseURL = trimmedBaseURL.endsWith("/api")
  ? trimmedBaseURL
  : `${trimmedBaseURL}/api`;

const api = axios.create({
  baseURL,
});

// attach token automatically
api.interceptors.request.use((config) => {
  const localToken = localStorage.getItem("token");
  const localUser = JSON.parse(localStorage.getItem("user") || "null");
  const sessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
  const token = localToken || localUser?.token || sessionUser?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;