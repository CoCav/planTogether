/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindReviewByIdOrFail = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("sequelize", () => ({
    fn: jest.fn(),
    col: jest.fn()
}));

jest.mock("../../../../src/models/eventModel", () => ({
    name: "Event"
}));

jest.mock("../../../../src/models/userModel", () => ({
    name: "User"
}));

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({
    name: "EventUserRole"
}));

jest.mock("../../../../src/models/associations/eventReviewModel", () => ({
    name: "EventReview"
}));

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    isEventPast: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: jest.fn()
}));

jest.mock("../../../../src/utils/eventReviews/eventReviewsQueries", () => ({
    findReviewByIdOrFail: mockFindReviewByIdOrFail
}));

jest.mock("../../../../src/utils/stringNormalizer", () => ({
    normalizeString: jest.fn()
}));

jest.mock("../../../../src/utils/users/userInclude", () => ({
    buildPublicUserInclude: jest.fn()
}));

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const EventReview = require("../../../../src/models/associations/eventReviewModel");

const { deleteEventReviewById } = require("../../../../src/services/eventReviewService");

/* ==========================================================================
   Delete Event Review Service Unit Tests

   Tests event review deletion business logic.

   Responsibilities
   - Test review existence validation
   - Test review ownership validation
   - Test review deletion
   - Test unexpected error propagation

   Notes
   - Review queries are mocked.
   - Users can only delete their own reviews.
=========================================================================== */

describe("delete event review service", () => {
    let review;

    beforeEach(() => {
        jest.clearAllMocks();

        review = {
            id: 1,
            userId: 10,
            destroy: jest.fn().mockResolvedValue()
        };

        mockFindReviewByIdOrFail.mockResolvedValue(review);
    });

    /* =============================
       REVIEW DELETION
    ============================= */

    describe("deleteEventReviewById", () => {
        it("deletes the current user's review", async () => {
            const result = await deleteEventReviewById({
                reviewId: 1,
                userId: 10
            });

            expect(mockFindReviewByIdOrFail).toHaveBeenCalledTimes(1);
            expect(mockFindReviewByIdOrFail).toHaveBeenCalledWith(EventReview, 1);

            expect(review.destroy).toHaveBeenCalledTimes(1);
            expect(review.destroy).toHaveBeenCalledWith();

            expect(result).toBeUndefined();
        });
    });

    /* =============================
       REVIEW VALIDATION
    ============================= */

    describe("Review validation", () => {
        it("stops when the review does not exist", async () => {
            const error = Object.assign(new Error("Review not found"), {
                statusCode: 404
            });

            mockFindReviewByIdOrFail.mockRejectedValue(error);

            await expect(
                deleteEventReviewById({
                    reviewId: 999,
                    userId: 10
                })
            ).rejects.toBe(error);

            expect(review.destroy).not.toHaveBeenCalled();
        });
    });

    /* =============================
       REVIEW OWNERSHIP
    ============================= */

    describe("Review ownership", () => {
        it("throws a 403 error when the review belongs to another user", async () => {
            review.userId = 20;

            await expect(
                deleteEventReviewById({
                    reviewId: 1,
                    userId: 10
                })
            ).rejects.toMatchObject({
                message: "You can only manage your own review",
                statusCode: 403
            });

            expect(review.destroy).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates review deletion errors", async () => {
            const error = new Error("Review deletion failed");

            review.destroy.mockRejectedValue(error);

            await expect(
                deleteEventReviewById({
                    reviewId: 1,
                    userId: 10
                })
            ).rejects.toBe(error);
        });
    });
});
