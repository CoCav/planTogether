/* ==================================================
   EVENT REVIEW CONTROLLER TESTS

   Tests:
   - creating event reviews
   - retrieving paginated event reviews
   - updating reviews
   - deleting reviews

   Ensures:
   - controller calls service correctly
   - authenticated user payload is passed correctly
   - review query params are forwarded for pagination
   - review rating and comment payloads are forwarded
   - paginated review responses are properly formatted
   - errors are forwarded to next()
================================================== */

jest.mock("../../../src/services/eventReviewService");

const eventReviewController = require("../../../src/controllers/eventReviewController");
const eventReviewService = require("../../../src/services/eventReviewService");

const { createEventControllerMocks } = require("../../helpers/express/expressTestHelper");

describe("eventReviewController", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       CREATE REVIEW
    ============================= */

    describe("createEventReview", () => {
        it("should create an event review", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "1"
                },
                user: {
                    userId: 10
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

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event review created successfully",
                review
            });
        });

        it("should forward create review errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Create review failed");

            eventReviewService.createEventReview.mockRejectedValue(error);

            await eventReviewController.createEventReview(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       GET REVIEWS
    ============================= */

    describe("getEventReviews", () => {
        it("should get paginated event reviews", async () => {
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

            expect(eventReviewService.getEventReviews).toHaveBeenCalledWith(
                "1",
                {
                    page: "1",
                    pageSize: "10",
                    sortBy: "createdAt",
                    order: "desc"
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event reviews retrieved successfully",
                ...payload
            });
        });

        it("should forward get reviews errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Get reviews failed");

            eventReviewService.getEventReviews.mockRejectedValue(error);

            await eventReviewController.getEventReviews(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       UPDATE REVIEW
    ============================= */

    describe("updateEventReview", () => {
        it("should update a review", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    reviewId: "1"
                },
                user: {
                    userId: 10
                },
                body: {
                    rating: 4,
                    comment: "Updated review comment"
                }
            });

            const review = {
                id: 1,
                userId: 10,
                rating: 4,
                comment: "Updated review comment"
            };

            eventReviewService.updateEventReviewByID.mockResolvedValue(review);

            await eventReviewController.updateEventReview(req, res, next);

            expect(eventReviewService.updateEventReviewByID).toHaveBeenCalledWith({
                reviewId: "1",
                userId: 10,
                rating: 4,
                comment: "Updated review comment"
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event review updated successfully",
                review
            });
        });

        it("should forward update review errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Update review failed");

            eventReviewService.updateEventReviewByID.mockRejectedValue(error);

            await eventReviewController.updateEventReview(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       DELETE REVIEW
    ============================= */

    describe("deleteEventReview", () => {
        it("should delete a review", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    reviewId: "1"
                },
                user: {
                    userId: 10
                }
            });

            eventReviewService.deleteEventReviewByID.mockResolvedValue();

            await eventReviewController.deleteEventReview(req, res, next);

            expect(eventReviewService.deleteEventReviewByID).toHaveBeenCalledWith({
                reviewId: "1",
                userId: 10
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event review deleted successfully"
            });
        });

        it("should forward delete review errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Delete review failed");

            eventReviewService.deleteEventReviewByID.mockRejectedValue(error);

            await eventReviewController.deleteEventReview(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
