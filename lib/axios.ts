import axios from "axios";

const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ?? "https://qual-go-server.onrender.com/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add interceptors for error handling or auth tokens here
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
