/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/services/eventReviewService");

/* =============================
   TEST IMPORTS
============================= */

const eventReviewService = require("../../../src/services/eventReviewService");

const eventReviewController = require("../../../src/controllers/eventReviewController");

const {
    createEventControllerMocks,
    expectNoResponseSent,
    expectJsonResponse
} = require("../../helpers/express/expressTestHelper");

/* ==========================================================================
   Event Review Controller Unit Tests

   Tests event review request handling and responses.

   Responsibilities
   - Test review creation
   - Test review retrieval
   - Test review updates
   - Test review deletion
   - Test authenticated user forwarding
   - Test service error forwarding

   Notes
   - Event review services are mocked.
   - Business logic is tested separately in eventReviewService tests.
=========================================================================== */

describe("event review controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       CREATE REVIEW
    ============================= */

    describe("createEventReview", () => {
        it("creates an event review", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "1"
                },
                body: {
                    rating: 5,
                    comment: "Great event!"
                }
            });

            const review = {
                id: 1,
                eventId: 1,
                userId: 10,
                rating: 5,
                comment: "Great event!"
            };

            eventReviewService.createEventReview.mockResolvedValue(review);

            await eventReviewController.createEventReview(req, res, next);

            expect(eventReviewService.createEventReview).toHaveBeenCalledWith({
                eventId: "1",
                userId: 10,
                rating: 5,
                comment: "Great event!"
            });

            expectJsonResponse(res, 201, {
                success: true,
                message: "Event review created successfully",
                review
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Create review failed");

            eventReviewService.createEventReview.mockRejectedValue(error);

            await eventReviewController.createEventReview(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expectNoResponseSent(res);
        });
    });

    /* =============================
       GET REVIEWS
    ============================= */

    describe("getEventReviews", () => {
        it("retrieves paginated event reviews", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "1"
                },
                query: {
                    page: "1",
                    pageSize: "10",
                    sortBy: "createdAt",
                    order: "desc"
                }
            });

            const payload = {
                page: 1,
                pageSize: 10,
                totalReviews: 1,
                totalPages: 1,
                reviews: [
                    {
                        id: 1,
                        comment: "Great event!"
                    }
                ]
            };

            eventReviewService.getEventReviews.mockResolvedValue(payload);

            await eventReviewController.getEventReviews(req, res, next);

            expect(eventReviewService.getEventReviews).toHaveBeenCalledWith("1", req.query);

            expectJsonResponse(res, 200, {
                success: true,
                message: "Event reviews retrieved successfully",
                ...payload
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Get reviews failed");

            eventReviewService.getEventReviews.mockRejectedValue(error);

            await eventReviewController.getEventReviews(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expectNoResponseSent(res);
        });
    });

    /* =============================
       UPDATE REVIEW
    ============================= */

    describe("updateEventReview", () => {
        it("updates an event review", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    reviewId: "1"
                },
                body: {
                    rating: 4,
                    comment: "Updated review"
                }
            });

            const review = {
                id: 1,
                rating: 4,
                comment: "Updated review"
            };

            eventReviewService.updateEventReviewById.mockResolvedValue(review);

            await eventReviewController.updateEventReview(req, res, next);

            expect(eventReviewService.updateEventReviewById).toHaveBeenCalledWith({
                reviewId: "1",
                userId: 10,
                rating: 4,
                comment: "Updated review"
            });

            expectJsonResponse(res, 200, {
                success: true,
                message: "Event review updated successfully",
                review
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Update review failed");

            eventReviewService.updateEventReviewById.mockRejectedValue(error);

            await eventReviewController.updateEventReview(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expectNoResponseSent(res);
        });
    });

    /* =============================
       DELETE REVIEW
    ============================= */

    describe("deleteEventReview", () => {
        it("deletes an event review", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    reviewId: "1"
                }
            });

            eventReviewService.deleteEventReviewById.mockResolvedValue();

            await eventReviewController.deleteEventReview(req, res, next);

            expect(eventReviewService.deleteEventReviewById).toHaveBeenCalledWith({
                reviewId: "1",
                userId: 10
            });

            expectJsonResponse(res, 200, {
                success: true,
                message: "Event review deleted successfully"
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Delete review failed");

            eventReviewService.deleteEventReviewById.mockRejectedValue(error);

            await eventReviewController.deleteEventReview(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expectNoResponseSent(res);
        });
    });
});
