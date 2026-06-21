import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "../../../api/apiClient";

import {
    createEventReview,
    updateEventReview,
    deleteEventReview,
    getEventReviews
} from "../../../api/eventReviews/eventReviewApi";

/* ==================================================
   EVENT REVIEW API TESTS
   Tests event review API requests

   Handles:
   - event review retrieval
   - event review creation
   - event review update
   - event review deletion

   Notes:
   - API helpers return unwrapped backend payloads
   - backend enforces review permissions and ownership
================================================== */

vi.mock("../../../api/apiClient", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe("eventReviewApi", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       READ REVIEWS
    ============================= */

    it("should fetch reviews for one event", async () => {
        const mockPayload = {
            success: true,
            reviews: [
                {
                    id: 1,
                    eventId: 10,
                    userId: 2,
                    comment: "Great event!"
                }
            ]
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const result = await getEventReviews(10);

        expect(apiClient.get).toHaveBeenCalledWith("/events/10/reviews");

        expect(result).toEqual(mockPayload);
    });

    /* =============================
       CREATE REVIEW
    ============================= */

    it("should create a review for one event", async () => {
        const mockPayload = {
            success: true,
            review: {
                id: 1,
                eventId: 10,
                userId: 2,
                comment: "Great event!"
            }
        };

        apiClient.post.mockResolvedValue({
            data: mockPayload
        });

        const reviewData = {
            comment: "Great event!"
        };

        const result = await createEventReview(10, reviewData);

        expect(apiClient.post).toHaveBeenCalledWith("/events/10/reviews", reviewData);

        expect(result).toEqual(mockPayload);
    });

    /* =============================
       UPDATE REVIEW
    ============================= */

    it("should update a review by ID", async () => {
        const mockPayload = {
            success: true,
            review: {
                id: 5,
                rating: 4,
                comment: "Updated review"
            }
        };

        apiClient.put.mockResolvedValue({
            data: mockPayload
        });

        const reviewData = {
            rating: 4,
            comment: "Updated review"
        };

        const result = await updateEventReview(5, reviewData);

        expect(apiClient.put).toHaveBeenCalledWith("/events/reviews/5", reviewData);

        expect(result).toEqual(mockPayload);
    });

    /* =============================
       DELETE REVIEW
    ============================= */

    it("should delete a review by ID", async () => {
        const mockPayload = {
            success: true,
            message: "Event review deleted successfully"
        };

        apiClient.delete.mockResolvedValue({
            data: mockPayload
        });

        const result = await deleteEventReview(5);

        expect(apiClient.delete).toHaveBeenCalledWith("/events/reviews/5");

        expect(result).toEqual(mockPayload);
    });

});
