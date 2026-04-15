import api from "./axios";

// Fetches all public events
export const getAllEvents = () => api.get("/events");

// Fetches one event by its ID
export const getEventById = (eventId) => api.get(`/events/${eventId}`);

// Creates a new event
export const createEvent = (eventData) => api.post("/events", eventData);

// Updates an event by its ID
export const updateEvent = (eventId, eventData) => api.put(`/events/${eventId}`, eventData);

// Deletes an event by its ID
export const deleteEvent = (eventId) => api.delete(`/events/${eventId}`);