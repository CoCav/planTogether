import axios from "axios";
import { getToken } from "../utils/token";

// Creates a reusable Axios instance for all API requests
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Automatically attaches the JWT token to authenticated requests
api.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
        
    }, (error) => Promise.reject(error)
);

export default api;