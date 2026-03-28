import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api/backend",
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject auth token into every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("auth_tokens");
      if (raw) {
        const tokens = JSON.parse(raw);
        if (tokens?.idToken) {
          config.headers.Authorization = `Bearer ${tokens.idToken}`;
        }
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect to login on 401 (expired/invalid token)
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_tokens");
      window.location.href = "/login";
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
