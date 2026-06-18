import apiClient from "../apiClient";
import { unwrapApiResponse } from "../apiResponse";

/* ==================================================
   EVENT REVIEW API
   Handles event review requests

   Routes:
   - GET /events/:eventId/reviews
   - POST /events/:eventId/reviews
   - DELETE /events/reviews/:reviewId

   Notes:
   - review retrieval is public
   - review creation requires authentication
   - review creation sends rating and comment
   - review deletion requires authentication
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
    const response = await apiClient.post(
        `/events/${eventId}/reviews`,
        reviewData
    );

    return unwrapApiResponse(response);
};

// Deletes a review by ID
export const deleteEventReview = async (reviewId) => {
    const response = await apiClient.delete(`/events/reviews/${reviewId}`);
    return unwrapApiResponse(response);
};
