import apiClient from "../client";
import { unwrapApiResponse } from "../apiResponse";

/* ==================================================
   AUTH API
   Handles authentication requests

   Routes:
   - POST /auth/register
   - POST /auth/login
   - POST /auth/logout

   Returns unwrapped backend payloads instead of raw Axios responses
================================================== */

// Registers a new user
export const registerUser = async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return unwrapApiResponse(response);
};

// Logs in a user
export const loginUser = async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return unwrapApiResponse(response);
};

// Logs out the currently authenticated user
export const logOutUser = async () => {
    const response = await apiClient.post("/auth/logout");
    return unwrapApiResponse(response);
};
