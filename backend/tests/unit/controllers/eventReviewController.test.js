/* ==================================================
   EVENT REVIEW CONTROLLER TESTS

   Tests:
   - creating event reviews
   - retrieving event reviews
   - deleting reviews

   Ensures:
   - controller calls service correctly
   - authenticated user payload is passed correctly
   - HTTP responses are properly formatted
   - errors are forwarded to next()
================================================== */

jest.mock("../../../src/services/eventReviewService");

const eventReviewController = require("../../../src/controllers/eventReviewController");
const eventReviewService = require("../../../src/services/eventReviewService");

const { createEventControllerMocks } = require("../../helpers/express/mockExpress");

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
                    comment: "Great event!"
                }
            });

            const review = {
                id: 1,
                eventId: 1,
                userId: 10,
                comment: "Great event!"
            };

            eventReviewService.createEventReview.mockResolvedValue(review);

            await eventReviewController.createEventReview(req, res, next);

            expect(eventReviewService.createEventReview).toHaveBeenCalledWith({
                eventId: "1",
                userId: 10,
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
        it("should get all event reviews", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "1"
                }
            });

            const reviews = [
                {
                    id: 1,
                    comment: "Great event!"
                }
            ];

            eventReviewService.getEventReviews.mockResolvedValue(reviews);

            await eventReviewController.getEventReviews(req, res, next);

            expect(eventReviewService.getEventReviews).toHaveBeenCalledWith("1");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event reviews retrieved successfully",
                reviews
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

            eventReviewService.deleteEventReview.mockResolvedValue();

            await eventReviewController.deleteEventReview(req, res, next);

            expect(eventReviewService.deleteEventReview).toHaveBeenCalledWith({
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

            eventReviewService.deleteEventReview.mockRejectedValue(error);

            await eventReviewController.deleteEventReview(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
