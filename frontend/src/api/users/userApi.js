import apiClient from "../apiClient";
import { unwrapApiResponse } from "../apiResponse";

/* ==================================================
   USER API
   Handles authenticated and public user requests

   Routes:
   - GET /users/me
   - PUT /users/me
   - PUT /users/me/password
   - DELETE /users/me
   - GET /users/me/events
   - GET /users/:id
   - GET /users/:id/events

   Returns unwrapped backend payloads instead of raw Axios responses
================================================== */

/* =============================
   AUTHENTICATED USER
============================= */

// Fetches the profile of the currently authenticated user
export const getCurrentUserProfile = async () => {
    const response = await apiClient.get("/users/me");
    return unwrapApiResponse(response);
};

// Updates the profile of the currently authenticated user
export const updateCurrentUserProfile = async (profileData) => {
    const response = await apiClient.put("/users/me", profileData);
    return unwrapApiResponse(response);
};

// Updates the password of the currently authenticated user
export const changeCurrentUserPassword = async (passwordData) => {
    const response = await apiClient.put("/users/me/password", passwordData);
    return unwrapApiResponse(response);
};

// Deletes the current authenticated user's account
export const deleteCurrentUserAccount = async () => {
    const response = await apiClient.delete("/users/me");
    return unwrapApiResponse(response);
};

// Fetches all paginated events of the current user
export const getCurrentUserEvents = async (params = {}) => {
    const response = await apiClient.get("/users/me/events", { params });
    return unwrapApiResponse(response);
};

/* =============================
   PUBLIC USER
============================= */

// Fetches a public user profile by user ID
export const getPublicUserProfile = async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return unwrapApiResponse(response);
};

// Fetches public events of a user by user ID
export const getPublicUserEvents = async (userId, params = {}) => {
    const response = await apiClient.get(`/users/${userId}/events`, { params });
    return unwrapApiResponse(response);
};
