import { describe, expect, it } from "vitest";

import { getEventReviewDisplayData } from "../../../features/eventReviews/eventReviewDisplayData";

/* ==================================================
   EVENT REVIEW DISPLAY DATA TESTS
   Tests event review display data generation

   Handles:
   - review rating display
   - review comment display
   - reviewer identity display
   - reviewer avatar display
   - reviewer identity fallback
   - reviewer avatar fallback
   - formatted review dates
   - review ownership detection

   Notes:
   - focuses on display-ready transformation logic
================================================== */

describe("getEventReviewDisplayData", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const getDisplayData = (overrides = {}, currentUserId = null) => {
        return getEventReviewDisplayData({
            review: {
                id: 1,
                userId: 2,
                rating: 4,
                comment: "Great event!",
                createdAt: "2026-06-15T10:00:00.000Z",
                user: {
                    name: "Alice",
                    avatar: "/uploads/avatar.png"
                },
                ...overrides
            },
            currentUserId
        });
    };

    /* =============================
       REVIEW DISPLAY
    ============================= */

    it("should return review comment", () => {
        const data = getDisplayData();

        expect(data.comment).toBe("Great event!");
    });

    it("should return reviewer information", () => {
        const data = getDisplayData();

        expect(data.reviewerName).toBe("Alice");
        expect(data.reviewerAvatar).toBe("/uploads/avatar.png");
    });

    it("should use fallback reviewer name when missing", () => {
        const data = getDisplayData({
            user: {}
        });

        expect(data.reviewerName).toBe("Unknown user");
    });

    it("should use null avatar when missing", () => {
        const data = getDisplayData({
            user: {}
        });

        expect(data.reviewerAvatar).toBeNull();
    });

    it("should use empty comment when missing", () => {
        const data = getDisplayData({
            comment: ""
        });

        expect(data.comment).toBe("");
    });

    it("should return a formatted review date", () => {
        const data = getDisplayData();

        expect(typeof data.date).toBe("string");
        expect(data.date.length).toBeGreaterThan(0);
    });

    /* =============================
       OWNERSHIP
    ============================= */

    it("should identify review owner", () => {
        const data = getDisplayData({}, 2);

        expect(data.isOwner).toBe(true);
    });

    it("should return false when current user is not the owner", () => {
        const data = getDisplayData({}, 99);

        expect(data.isOwner).toBe(false);
    });

    it("should return false when current user is missing", () => {
        const data = getDisplayData();

        expect(data.isOwner).toBe(false);
    });

    /* =============================
       RATING
    ============================= */

    it("should return review rating", () => {
        const data = getDisplayData();

        expect(data.rating).toBe(4);
    });

    it("should return null rating when missing", () => {
        const data = getDisplayData({
            rating: null
        });

        expect(data.rating).toBeNull();
    });
});
