import axios from "axios";
import { getToken } from "../features/auth/token";

/**
 * Axios instance used across the frontend application.
 * Handles base API URL and automatically injects the JWT token.
 */

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