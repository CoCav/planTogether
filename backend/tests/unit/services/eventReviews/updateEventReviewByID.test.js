/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindReviewByIdOrFail = jest.fn();
const mockNormalizeString = jest.fn();
const mockBuildPublicUserInclude = jest.fn();

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
    findByPk: jest.fn()
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
    normalizeString: mockNormalizeString
}));

jest.mock("../../../../src/utils/users/userInclude", () => ({
    buildPublicUserInclude: mockBuildPublicUserInclude
}));

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const User = require("../../../../src/models/userModel");
const EventReview = require("../../../../src/models/associations/eventReviewModel");

const { updateEventReviewById } = require("../../../../src/services/eventReviewService");

/* ==========================================================================
   Update Event Review Service Unit Tests

   Tests event review update business logic.

   Responsibilities
   - Test review existence validation
   - Test review ownership validation
   - Test rating and comment updates
   - Test review comment normalization
   - Test updated review reload
   - Test public user inclusion
   - Test unexpected error propagation

   Notes
   - Review query, string normalization and user include utilities are mocked.
   - Users can only update their own reviews.
=========================================================================== */

describe("update event review service", () => {
    let review;
    let updatedReview;
    let publicUserInclude;

    beforeEach(() => {
        jest.clearAllMocks();

        review = {
            id: 1,
            userId: 10,
            update: jest.fn().mockResolvedValue()
        };

        updatedReview = {
            id: 1,
            userId: 10,
            rating: 4,
            comment: "Updated review comment",
            user: {
                id: 10,
                name: "John Doe",
                avatar: null
            }
        };

        publicUserInclude = {
            model: User,
            as: "user",
            attributes: [
                "id",
                "name",
                "avatar"
            ]
        };

        mockFindReviewByIdOrFail.mockResolvedValue(review);

        mockNormalizeString.mockReturnValue("Updated review comment");

        mockBuildPublicUserInclude.mockReturnValue(publicUserInclude);

        EventReview.findByPk.mockResolvedValue(updatedReview);
    });

    /* =============================
       REVIEW UPDATE
    ============================= */

    describe("updateEventReviewById", () => {
        it("updates and reloads the current user's review", async () => {
            const result = await updateEventReviewById({
                reviewId: 1,
                userId: 10,
                rating: 4,
                comment: "  Updated review comment  "
            });

            expect(mockFindReviewByIdOrFail).toHaveBeenCalledTimes(1);
            expect(mockFindReviewByIdOrFail).toHaveBeenCalledWith(EventReview, 1);

            expect(mockNormalizeString).toHaveBeenCalledTimes(1);
            expect(mockNormalizeString).toHaveBeenCalledWith("  Updated review comment  ");

            expect(review.update).toHaveBeenCalledTimes(1);
            expect(review.update).toHaveBeenCalledWith({
                rating: 4,
                comment: "Updated review comment"
            });

            expect(mockBuildPublicUserInclude).toHaveBeenCalledTimes(1);
            expect(mockBuildPublicUserInclude).toHaveBeenCalledWith(User);

            expect(EventReview.findByPk).toHaveBeenCalledTimes(1);
            expect(EventReview.findByPk).toHaveBeenCalledWith(1, {
                include: [
                    publicUserInclude
                ]
            });

            expect(review.update.mock.invocationCallOrder[0]).toBeLessThan(EventReview.findByPk.mock.invocationCallOrder[0]);

            expect(result).toBe(updatedReview);
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
                updateEventReviewById({
                    reviewId: 999,
                    userId: 10,
                    rating: 4,
                    comment: "Updated review"
                })
            ).rejects.toBe(error);

            expect(mockNormalizeString).not.toHaveBeenCalled();

            expect(review.update).not.toHaveBeenCalled();

            expect(EventReview.findByPk).not.toHaveBeenCalled();
        });
    });

    /* =============================
       REVIEW OWNERSHIP
    ============================= */

    describe("Review ownership", () => {
        it("throws a 403 error when the review belongs to another user", async () => {
            review.userId = 20;

            await expect(
                updateEventReviewById({
                    reviewId: 1,
                    userId: 10,
                    rating: 4,
                    comment: "Updated review"
                })
            ).rejects.toMatchObject({
                message: "You can only manage your own review",
                statusCode: 403
            });

            expect(mockNormalizeString).not.toHaveBeenCalled();

            expect(review.update).not.toHaveBeenCalled();

            expect(EventReview.findByPk).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates review update errors", async () => {
            const error = new Error("Review update failed");

            review.update.mockRejectedValue(error);

            await expect(
                updateEventReviewById({
                    reviewId: 1,
                    userId: 10,
                    rating: 4,
                    comment: "Updated review"
                })
            ).rejects.toBe(error);

            expect(EventReview.findByPk).not.toHaveBeenCalled();
        });

        it("propagates updated review reload errors", async () => {
            const error = new Error("Review reload failed");

            EventReview.findByPk.mockRejectedValue(error);

            await expect(
                updateEventReviewById({
                    reviewId: 1,
                    userId: 10,
                    rating: 4,
                    comment: "Updated review"
                })
            ).rejects.toBe(error);

            expect(review.update).toHaveBeenCalledTimes(1);
        });
    });
});
