/* ==================================================
   UPDATE EVENT REVIEW SERVICE BY ID TESTS

   Tests:
   - event review update
   - rating and comment persistence
   - review existence validation
   - review ownership validation
   - updated review user data inclusion

   Ensures:
   - users can update only their own reviews
   - missing reviews are rejected before update
   - reviews owned by another user cannot be updated
   - updated comments are trimmed before persistence
   - updated reviews are returned with public user data
================================================== */

jest.mock("../../../../src/models/userModel");
jest.mock("../../../../src/models/relations/eventReviewModel");

const User = require("../../../../src/models/userModel");
const EventReview = require("../../../../src/models/relations/eventReviewModel");

const eventReviewService = require("../../../../src/services/eventReviewService");

describe("eventReviewService - updateEventReviewById", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       SUCCESS CASES
    ============================= */

    it("should update current user's review", async () => {
        const review = {
            id: 1,
            userId: 10,
            update: jest.fn()
        };

        const updatedReview = {
            id: 1,
            userId: 10,
            rating: 4,
            comment: "Updated review comment",
            user: {
                id: 10,
                name: "John",
                avatar: null
            }
        };

        EventReview.findByPk
            .mockResolvedValueOnce(review)
            .mockResolvedValueOnce(updatedReview);

        const result = await eventReviewService.updateEventReviewById({
            reviewId: 1,
            userId: 10,
            rating: 4,
            comment: "  Updated review comment  "
        });

        expect(EventReview.findByPk).toHaveBeenNthCalledWith(1, 1, {});

        expect(review.update).toHaveBeenCalledWith({
            rating: 4,
            comment: "Updated review comment"
        });

        expect(review.update).toHaveBeenCalledTimes(1);

        expect(EventReview.findByPk).toHaveBeenNthCalledWith(2, 1, {
            include: [{
                model: User,
                as: "user",
                attributes: ["id", "name", "avatar"]
            }]
        });

        expect(result).toBe(updatedReview);
    });

    /* =============================
       REVIEW VALIDATION
    ============================= */

    it("should throw 404 when review does not exist", async () => {
        EventReview.findByPk.mockResolvedValue(null);

        await expect(eventReviewService.updateEventReviewById({
            reviewId: 999,
            userId: 10,
            rating: 4,
            comment: "Updated review comment"
        })).rejects.toMatchObject({
            statusCode: 404,
            message: "Review not found"
        });

        expect(EventReview.findByPk).toHaveBeenCalledWith(999, {});
    });

    /* =============================
       REVIEW OWNERSHIP
    ============================= */

    it("should throw 403 when review belongs to another user", async () => {
        const review = {
            id: 1,
            userId: 20,
            update: jest.fn()
        };

        EventReview.findByPk.mockResolvedValue(review);

        await expect(eventReviewService.updateEventReviewById({
            reviewId: 1,
            userId: 10,
            rating: 4,
            comment: "Updated review comment"
        })).rejects.toMatchObject({
            statusCode: 403,
            message: "You can only manage your own review"
        });

        expect(review.update).not.toHaveBeenCalled();
        expect(EventReview.findByPk).toHaveBeenCalledTimes(1);
    });
});
