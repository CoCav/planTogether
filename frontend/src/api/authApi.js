import api from "./axios";

export const loginUser = (data) => api.post("/auth/login", data);
export const registerUser = (data) => api.post("/auth/register", data);

export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (data) => api.put("auth/profile", data);

export const logOutUser = () => api.post("/auth/logout");