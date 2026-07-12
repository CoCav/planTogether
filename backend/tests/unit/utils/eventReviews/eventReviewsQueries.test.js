const { findReviewByIdOrFail } = require("../../../../src/utils/eventReviews/eventReviewQueries");

/* ==========================================================================
   Event Review Query Utility Unit Tests

   Tests reusable event review database query helpers.

   Responsibilities
   - Test review lookup by ID
   - Test Sequelize option forwarding
   - Test review result passthrough
   - Test review not found errors

   Notes
   - The EventReview model is injected into the utility.
   - Entity existence errors use the shared HTTP error format.
=========================================================================== */

describe("event review query utility", () => {
    const EventReview = {
        findByPk: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       REVIEW LOOKUP SUCCESS
    ============================= */

    describe("findReviewByIdOrFail success", () => {
        it("finds a review by ID", async () => {
            const review = {
                id: 10,
                rating: 5,
                comment: "Great event"
            };

            EventReview.findByPk.mockResolvedValue(review);

            const result = await findReviewByIdOrFail(
                EventReview,
                10
            );

            expect(EventReview.findByPk).toHaveBeenCalledWith(
                10,
                {}
            );

            expect(result).toBe(review);
        });

        it("forwards Sequelize query options", async () => {
            const review = {
                id: 10
            };

            const options = {
                transaction: {
                    id: "transaction"
                },
                include: [
                    {
                        association: "user"
                    }
                ]
            };

            EventReview.findByPk.mockResolvedValue(review);

            const result = await findReviewByIdOrFail(
                EventReview,
                10,
                options
            );

            expect(EventReview.findByPk).toHaveBeenCalledWith(
                10,
                options
            );

            expect(result).toBe(review);
        });
    });

    /* =============================
       REVIEW NOT FOUND
    ============================= */

    describe("findReviewByIdOrFail failure", () => {
        it("throws a 404 error when the review does not exist", async () => {
            EventReview.findByPk.mockResolvedValue(null);

            await expect(findReviewByIdOrFail(EventReview, 999)).rejects.toMatchObject({
                message: "Review not found",
                statusCode: 404
            });
        });

        it("queries the requested review before throwing", async () => {
            const options = {
                transaction: {
                    id: "transaction"
                }
            };

            EventReview.findByPk.mockResolvedValue(null);

            await expect(
                findReviewByIdOrFail(
                    EventReview,
                    999,
                    options
                )
            ).rejects.toThrow("Review not found");

            expect(EventReview.findByPk).toHaveBeenCalledWith(
                999,
                options
            );
        });
    });
});
