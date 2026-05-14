import apiClient from "../apiClient";
import { unwrapApiResponse } from "../apiResponse";

/* ==================================================
   EVENT API
   Handles event CRUD and event listing requests

   Routes:
   - GET /events
   - GET /events/:eventId
   - POST /events
   - PUT /events/:eventId
   - DELETE /events/:eventId

   Notes:
   - event listing supports filters and pagination through query params
   - create/update support FormData when an image is uploaded
   - protected write routes are handled by the backend
================================================== */

/* =============================
   READ EVENTS
============================= */

// Fetches all events with optional filters and pagination
export const getAllEvents = async (params = {}) => {
    const response = await apiClient.get("/events", { params });
    return unwrapApiResponse(response);
};

// Fetches one event by ID
export const getEventById = async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}`);
    return unwrapApiResponse(response);
};

/* =============================
   WRITE EVENTS
============================= */

// Creates a new event
export const createEvent = async (eventData) => {
    const response = await apiClient.post("/events", eventData);
    return unwrapApiResponse(response);
};

// Updates an event by ID
export const updateEvent = async (eventId, eventData) => {
    const response = await apiClient.put(`/events/${eventId}`, eventData);
    return unwrapApiResponse(response);
};

// Deletes an event by ID
export const deleteEvent = async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}`);
    return unwrapApiResponse(response);
};
