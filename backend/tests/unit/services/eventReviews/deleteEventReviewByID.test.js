/* ==================================================
   DELETE EVENT REVIEW SERVICE BY ID TESTS

   Tests:
   - event review deletion
   - review existence validation
   - review ownership validation

   Ensures:
   - users can delete only their own reviews
   - missing reviews are rejected before deletion
   - reviews owned by another user cannot be deleted
   - valid reviews are destroyed
================================================== */

jest.mock("../../../../src/models/relations/eventReviewModel");

const EventReview = require("../../../../src/models/relations/eventReviewModel");

const eventReviewService = require("../../../../src/services/eventReviewService");

describe("eventReviewService - deleteEventReviewById", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       SUCCESS CASES
    ============================= */

    it("should delete current user's review", async () => {
        const review = {
            id: 1,
            userId: 10,
            destroy: jest.fn()
        };

        EventReview.findByPk.mockResolvedValue(review);

        await eventReviewService.deleteEventReviewById({
            reviewId: 1,
            userId: 10
        });

        expect(EventReview.findByPk).toHaveBeenCalledWith(1, {});
        expect(review.destroy).toHaveBeenCalledTimes(1);
    });

    /* =============================
       REVIEW VALIDATION
    ============================= */

    it("should throw 404 when review does not exist", async () => {
        EventReview.findByPk.mockResolvedValue(null);

        await expect(eventReviewService.deleteEventReviewById({
            reviewId: 999,
            userId: 10
        })).rejects.toMatchObject({
            statusCode: 404,
            message: "Review not found"
        });
    });

    /* =============================
       REVIEW OWNERSHIP
    ============================= */

    it("should throw 403 when review belongs to another user", async () => {
        const review = {
            id: 1,
            userId: 20,
            destroy: jest.fn()
        };

        EventReview.findByPk.mockResolvedValue(review);

        await expect(eventReviewService.deleteEventReviewById({
            reviewId: 1,
            userId: 10
        })).rejects.toMatchObject({
            statusCode: 403,
            message: "You can only manage your own review"
        });

        expect(review.destroy).not.toHaveBeenCalled();
    });
});
