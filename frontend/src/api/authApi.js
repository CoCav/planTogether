import api from "./axios";

/* ==================================================
   AUTH API
   Handles authentication and profile requests
================================================== */

// Register a new user
export const registerUser = (userData) => api.post("/auth/register", userData);

// Logs in a user and returns a JWT token
export const loginUser = (credentials) => api.post("/auth/login", credentials);

// Fetches the profile of the currently authenticated user
export const getProfile = () => api.get("/auth/profile");

// Updates the profile of the currently authenticated user
export const updateProfile = (profileData) => api.put("auth/profile", profileData);

// Updates the password of the currently authenticated user
export const changePassword = (passwordData) => api.put("/auth/password", passwordData);

// Logs out the currently authenticated user
export const logOutUser = () => api.post("/auth/logout");
