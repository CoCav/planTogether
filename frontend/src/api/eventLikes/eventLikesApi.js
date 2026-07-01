import apiClient from "../apiClient";
import { unwrapApiResponse } from "../apiResponse";

/* ==================================================
   EVENT LIKE API
   Handles event like requests

   Routes:
   - POST /events/:eventId/likes
   - DELETE /events/:eventId/likes

   Notes:
   - like and unlike actions require authentication
   - backend prevents duplicate likes
   - unlike is idempotent
   - responses include liked state and likes count
================================================== */

/* =============================
   WRITE LIKES
============================= */

// Likes one event
export const likeEvent = async (eventId) => {
    const response = await apiClient.post(`/events/${eventId}/likes`);

    return unwrapApiResponse(response);
};

// Unlikes one event
export const unlikeEvent = async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}/likes`);

    return unwrapApiResponse(response);
};
