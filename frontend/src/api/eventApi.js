import api from "./axios";

export const getAllEvents = () => api.get("/events");