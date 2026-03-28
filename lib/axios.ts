import axios from "axios";

const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://a6e1211d45bda4b32b51f6b2d278bce7-2c5abb46dc88fb21.elb.us-east-2.amazonaws.com/v1",
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
