import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ✅ Intercepteur qui injecte le token automatiquement
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token"); // ← fix ici
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Intercepteur réponse — gère le 401 proprement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide → logout propre sans boucle
      sessionStorage.clear();
      window.location.href = "/"; // ← redirige vers login
    }
    return Promise.reject(error);
  }
);

export default api;