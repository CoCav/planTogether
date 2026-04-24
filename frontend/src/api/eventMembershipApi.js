import api from "./axios";

// Fetches all events related to the current authenticated user (include role information)
export const getMyEvents = (params = {}) => api.get("/events/my-events", { params });

// Joins an event
export const joinEvent = (eventId) => api.post(`/events/${eventId}/members/join`);

// Leaves an event
export const leaveEvent = (eventId) => api.delete(`/events/${eventId}/members/leave`);

// Fetches all members of an event
export const getEventMembers = (eventId) => api.get(`/events/${eventId}/members`);

// Fetches all organizers and co-organizers of an event
export const getEventOrganizers = (eventId) => api.get(`/events/${eventId}/organizers`);

// Updates a member's role in an event
export const updateMemberRole = (eventId, userId, newRole) => api.put(`/events/${eventId}/members/${userId}/role`, { newRole });

// Removes a member from an event
export const removeEventMember = (eventId, userId) => api.delete(`/events/${eventId}/members/${userId}`); 