import api from "./axios";

export const loginUser = (data) => api.post("/auth/login", data);
export const getProfile = () => api.get("/auth/profile");