import api from "./axios";

export const getAllEvents = () => api.get("/events");
export const createEvent = (data) => api.post("/events", data);
export const getMyMemberships = () => api.get("/events/memberships/me");
export const joinEvent = (eventId) => api.post(`/events/${eventId}/members/join`);
export const leaveEvent = (eventId) => api.delete(`/events/${eventId}/members/leave`);
export const getEventById = (eventId) => api.get(`/events/${eventId}`);