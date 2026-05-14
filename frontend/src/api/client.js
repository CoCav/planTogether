import axios from "axios";
import { getToken } from "../features/auth/authToken";

/* ==================================================
   API CLIENT
   Centralized Axios instance used by all API modules.

   Responsibilities:
   - define the backend base URL
   - attach the JWT token when available
   - keep request configuration in one place
================================================== */

// Creates a reusable Axios instance for all API requests
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Automatically attaches the JWT token to authenticated requests
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
