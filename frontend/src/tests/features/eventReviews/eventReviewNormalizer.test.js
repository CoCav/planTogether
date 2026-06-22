import { describe, expect, it } from "vitest";

import {
    getNormalizedEventReview,
    getNormalizedEventReviewPage,
    getNormalizedEventReviews,
    normalizeEventReview,
    normalizeEventReviews
} from "../../../features/eventReviews/eventReviewNormalizer";

/* ==================================================
   EVENT REVIEW NORMALIZER TESTS
   Tests event review normalization

   Handles:
   - single review normalization
   - review list normalization
   - paginated review payload normalization
   - review statistics metadata normalization
   - review rating normalization
   - reviewer data normalization
   - API payload extraction
   - fallback values

   Notes:
   - supports reviewer data aliases
   - normalized reviews include rating, comment and public reviewer data
   - paginated payloads include normalized reviews and pagination metadata
================================================== */

describe("eventReviewNormalizer", () => {

    /* =============================
       SINGLE REVIEW
    ============================= */

    it("should normalize a single review with default values", () => {
        const review = normalizeEventReview({
            id: 1,
            comment: "Great event!"
        });

        expect(review).toEqual({
            id: 1,
            eventId: null,
            userId: null,

            rating: null,
            comment: "Great event!",

            createdAt: null,
            updatedAt: null,

            user: {
                id: null,
                name: "",
                avatar: null
            }
        });
    });

    it("should normalize reviewer data from user", () => {
        const review = normalizeEventReview({
            id: 1,
            userId: 2,
            user: {
                id: 2,
                name: "Alice",
                avatar: "/uploads/avatars/alice.png"
            }
        });

        expect(review.user).toEqual({
            id: 2,
            name: "Alice",
            avatar: "/uploads/avatars/alice.png"
        });
    });

    it("should normalize review rating", () => {
        const review = normalizeEventReview({
            id: 1,
            rating: 4,
            comment: "Great event!"
        });

        expect(review.rating).toBe(4);
    });

    it("should normalize reviewer data from User alias", () => {
        const review = normalizeEventReview({
            id: 1,
            userId: 2,
            User: {
                id: 2,
                name: "Alice",
                avatar: "/uploads/avatars/alice.png"
            }
        });

        expect(review.user).toEqual({
            id: 2,
            name: "Alice",
            avatar: "/uploads/avatars/alice.png"
        });
    });

    it("should fallback user id to review userId when nested user id is missing", () => {
        const review = normalizeEventReview({
            userId: 2,
            user: {
                name: "Alice"
            }
        });

        expect(review.user.id).toBe(2);
        expect(review.userId).toBe(2);
    });

    it("should preserve review metadata", () => {
        const review = normalizeEventReview({
            id: 1,
            eventId: 10,
            userId: 2,
            rating: 5,
            comment: "Great event!",
            createdAt: "2026-06-15T10:00:00.000Z",
            updatedAt: "2026-06-15T11:00:00.000Z"
        });

        expect(review).toMatchObject({
            id: 1,
            eventId: 10,
            userId: 2,
            rating: 5,
            comment: "Great event!",
            createdAt: "2026-06-15T10:00:00.000Z",
            updatedAt: "2026-06-15T11:00:00.000Z"
        });
    });

    /* =============================
       REVIEW LISTS
    ============================= */

    it("should normalize an array of reviews", () => {
        const reviews = normalizeEventReviews([
            {
                id: 1,
                comment: "Great event!"
            },
            {
                id: 2,
                comment: "Amazing meetup!"
            }
        ]);

        expect(reviews).toHaveLength(2);

        expect(reviews[0].comment).toBe("Great event!");
        expect(reviews[1].comment).toBe("Amazing meetup!");
    });

    it("should return empty array when normalizeEventReviews receives invalid data", () => {
        expect(normalizeEventReviews(null)).toEqual([]);
        expect(normalizeEventReviews({})).toEqual([]);
    });

    /* =============================
       API PAYLOAD EXTRACTION
    ============================= */

    it("should extract and normalize reviews from API payload", () => {
        const payload = {
            data: {
                reviews: [
                    {
                        id: 1,
                        eventId: 10,
                        userId: 2,
                        rating: 5,
                        comment: "Great event!",
                        user: {
                            id: 2,
                            name: "Alice",
                            avatar: "/uploads/avatars/alice.png"
                        }
                    }
                ]
            }
        };

        const reviews = getNormalizedEventReviews(payload);

        expect(reviews).toHaveLength(1);

        expect(reviews[0]).toMatchObject({
            id: 1,
            eventId: 10,
            userId: 2,
            rating: 5,
            comment: "Great event!",
            user: {
                id: 2,
                name: "Alice",
                avatar: "/uploads/avatars/alice.png"
            }
        });
    });

    it("should extract and normalize one review from API payload", () => {
        const payload = {
            data: {
                review: {
                    id: 1,
                    eventId: 10,
                    userId: 2,
                    rating: 5,
                    comment: "Great event!"
                }
            }
        };

        const review = getNormalizedEventReview(payload);

        expect(review).toMatchObject({
            id: 1,
            eventId: 10,
            userId: 2,
            rating: 5,
            comment: "Great event!"
        });
    });

    it("should extract normalized reviews and pagination metadata from paginated API payload", () => {
        const payload = {
            data: {
                success: true,
                page: 2,
                pageSize: 4,
                totalReviews: 9,
                totalPages: 3,
                averageRating: 4.5,
                reviews: [
                    {
                        id: 1,
                        eventId: 10,
                        userId: 2,
                        rating: 5,
                        comment: "Great event!",
                        user: {
                            id: 2,
                            name: "Alice",
                            avatar: "/uploads/avatars/alice.png"
                        }
                    }
                ]
            }
        };

        const result = getNormalizedEventReviewPage(payload);

        expect(result.reviews).toHaveLength(1);

        expect(result.reviews[0]).toMatchObject({
            id: 1,
            eventId: 10,
            userId: 2,
            rating: 5,
            comment: "Great event!"
        });

        expect(result.pagination).toEqual({
            page: 2,
            pageSize: 4,
            totalItems: 9,
            totalPages: 3,
            averageRating: 4.5
        });
    });
});
