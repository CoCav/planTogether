import { getApiPayload, getPaginatedPayload } from "../../api/apiResponse";

/* ==================================================
   EVENT REVIEW NORMALIZER
   Converts backend review payloads into frontend data

   Handles:
   - single review normalization
   - review list normalization
   - review rating data
   - public reviewer identity data
   - review response extraction
   - paginated review response extraction
   - review statistics extraction

   Notes:
   - reviews are loaded from GET /events/:eventId/reviews
   - reviewer data comes from the backend user include
================================================== */

/* =============================
   REVIEW NORMALIZATION
============================= */

// Normalizes one review item
export const normalizeEventReview = (review = {}) => {
    const user = review.user ?? review.User ?? {};

    return {
        id: review.id ?? null,
        eventId: review.eventId ?? null,
        userId: review.userId ?? user.id ?? null,

        rating: review.rating ?? null,
        comment: review.comment ?? "",

        createdAt: review.createdAt ?? null,
        updatedAt: review.updatedAt ?? null,

        user: {
            id: user.id ?? review.userId ?? null,
            name: user.name ?? "",
            avatar: user.avatar ?? null
        }
    };
};

// Normalizes an array of review items
export const normalizeEventReviews = (reviews = []) => {
    if (!Array.isArray(reviews)) return [];

    return reviews.map(normalizeEventReview);
};

/* =============================
   REVIEW LISTS
============================= */

// Extracts and normalizes reviews from GET /events/:eventId/reviews
export const getNormalizedEventReviews = (payload = {}) => {
    const reviews = getApiPayload(payload, "reviews");

    return normalizeEventReviews(reviews);
};

// Extracts normalized reviews and pagination metadata from GET /events/:eventId/reviews
export const getNormalizedEventReviewPage = (payload = {}) => {
    const { items, pagination } = getPaginatedPayload(payload, "reviews");

    return {
        reviews: normalizeEventReviews(items),
        pagination
    };
};

/* =============================
   SINGLE REVIEW
============================= */

// Extracts and normalizes one review from POST /events/:eventId/reviews
export const getNormalizedEventReview = (payload = {}) => {
    const review = getApiPayload(payload, "review");

    return normalizeEventReview(review);
};
