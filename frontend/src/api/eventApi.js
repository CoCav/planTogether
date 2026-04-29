import api from "./axios";

/* ==================================================
   EVENT API
   Handles event CRUD and event listing requests
================================================== */

// Fetches all public events
export const getAllEvents = (params = {}) => api.get("/events", { params });

// Fetches one event by its ID
export const getEventById = (eventId) => api.get(`/events/${eventId}`);

// Creates a new event
export const createEvent = (eventData) => api.post("/events", eventData);

// Updates an event by its ID
export const updateEvent = (eventId, eventData) => api.put(`/events/${eventId}`, eventData);

// Deletes an event by its ID
export const deleteEvent = (eventId) => api.delete(`/events/${eventId}`);

// Filters events
export const getFilteredEvents = (params = {}) => api.get("/events/filtered", { params });
