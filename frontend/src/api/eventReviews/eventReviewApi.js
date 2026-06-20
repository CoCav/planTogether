import apiClient from "../apiClient";
import { unwrapApiResponse } from "../apiResponse";

/* ==================================================
   EVENT REVIEW API
   Handles event review requests

   Routes:
   - GET /events/:eventId/reviews
   - POST /events/:eventId/reviews
   - PUT /events/reviews/:reviewId
   - DELETE /events/reviews/:reviewId

   Notes:
   - review retrieval is public
   - review creation requires authentication
   - review update requires authentication
   - review deletion requires authentication
   - review creation and update send rating and comment
   - backend enforces review permissions and ownership
================================================== */

/* =============================
   READ REVIEWS
============================= */

// Fetches all reviews for one event
export const getEventReviews = async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}/reviews`);
    return unwrapApiResponse(response);
};

/* =============================
   WRITE REVIEWS
============================= */

// Creates a review for one event
export const createEventReview = async (eventId, reviewData) => {
    const response = await apiClient.post(`/events/${eventId}/reviews`, reviewData);

    return unwrapApiResponse(response);
};

// Updates a review by ID
export const updateEventReview = async (reviewId, reviewData) => {
    const response = await apiClient.put(`/events/reviews/${reviewId}`, reviewData);

    return unwrapApiResponse(response);
};

// Deletes a review by ID
export const deleteEventReview = async (reviewId) => {
    const response = await apiClient.delete(`/events/reviews/${reviewId}`);
    return unwrapApiResponse(response);
};
