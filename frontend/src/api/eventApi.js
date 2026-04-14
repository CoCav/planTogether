import api from "./axios";

export const getAllEvents = () => api.get("/events");

export const createEvent = (data) => api.post("/events", data);
export const getEventById = (eventId) => api.get(`/events/${eventId}`);
export const getMyEvents = () => api.get("/events/my-events");

export const joinEvent = (eventId) => api.post(`/events/${eventId}/members/join`);
export const leaveEvent = (eventId) => api.delete(`/events/${eventId}/members/leave`);

export const getEventMembers = (eventId) => api.get(`/events/${eventId}/members`);
export const getEventOrganizers = (eventId) => api.get(`/events/${eventId}/organizers`);
export const updateMemberRole = (eventId, userId, newRole) => api.put(`/events/${eventId}/members/${userId}/role`, { newRole });

export const deleteEvent = (eventId) => api.delete(`/events/${eventId}`);