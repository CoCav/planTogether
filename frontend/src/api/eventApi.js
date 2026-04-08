import api from "./axios";

export const getAllEvents = () => api.get("/events");

export const createEvent = (data) => api.post("/events", data);