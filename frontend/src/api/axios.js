import axios from "axios";
import { getToken } from "../features/auth/token";

/* ==================================================
   AXIOS INSTANCE
   Shared Axios client used by all frontend API calls

   Handles:
   - base API URL
   - JWT authorization header
================================================== */

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
