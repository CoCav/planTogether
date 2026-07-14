const mockGetEventReviews = jest.fn();
const mockCreateEventReview = jest.fn();
const mockUpdateEventReview = jest.fn();
const mockDeleteEventReview = jest.fn();

const mockAuthenticateToken = jest.fn();
const mockHandleValidationErrors = jest.fn();

const mockEventIdParamValidator = jest.fn();
const mockReviewIdParamValidator = jest.fn();

const mockGetReviewsPageValidator = jest.fn();
const mockGetReviewsOrderValidator = jest.fn();

const getEventReviewsValidator = [
    mockGetReviewsPageValidator,
    mockGetReviewsOrderValidator
];

const mockCreateReviewRatingValidator = jest.fn();
const mockCreateReviewCommentValidator = jest.fn();

const createReviewValidator = [
    mockCreateReviewRatingValidator,
    mockCreateReviewCommentValidator
];

const mockUpdateReviewRatingValidator = jest.fn();
const mockUpdateReviewCommentValidator = jest.fn();

const updateReviewValidator = [
    mockUpdateReviewRatingValidator,
    mockUpdateReviewCommentValidator
];

const eventReviewRoutes = require("../../../src/routes/eventReviewRoutes");

const { expectRoute } = require("../../helpers/express/routeTestHelper");

/* ==========================================================================
   Event Review Routes Unit Tests

   Tests event review route configuration.

   Responsibilities
   - Test public review retrieval route composition
   - Test authenticated review creation route composition
   - Test authenticated review update route composition
   - Test authenticated review deletion route composition
   - Test review validator ordering
   - Test route handler ordering

   Notes
   - Controllers, validators and middlewares are mocked.
   - Validator arrays are flattened by the shared route test helper.
   - HTTP behavior remains covered by event review integration tests.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/controllers/eventReviewController", () => ({
    getEventReviews: mockGetEventReviews,
    createEventReview: mockCreateEventReview,
    updateEventReview: mockUpdateEventReview,
    deleteEventReview: mockDeleteEventReview
}));

jest.mock("../../../src/middlewares/auth/authenticateToken", () => ({
    authenticateToken: mockAuthenticateToken
}));

jest.mock("../../../src/middlewares/errors/handleValidationErrors", () => mockHandleValidationErrors);

jest.mock("../../../src/validators/eventReviewValidator", () => ({
    eventIdParamValidator: mockEventIdParamValidator,
    reviewIdParamValidator: mockReviewIdParamValidator,
    getEventReviewsValidator,
    createReviewValidator,
    updateReviewValidator
}));

describe("event review routes", () => {

    /* =============================
       REVIEW RETRIEVAL ROUTE
    ============================= */

    describe("GET /:eventId/reviews", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventReviewRoutes, {
                method: "get",
                path: "/:eventId/reviews",
                handlers: [
                    mockEventIdParamValidator,
                    getEventReviewsValidator,
                    mockHandleValidationErrors,
                    mockGetEventReviews
                ]
            });
        });
    });

    /* =============================
       REVIEW CREATION ROUTE
    ============================= */

    describe("POST /:eventId/reviews", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventReviewRoutes, {
                method: "post",
                path: "/:eventId/reviews",
                handlers: [
                    mockAuthenticateToken,
                    mockEventIdParamValidator,
                    createReviewValidator,
                    mockHandleValidationErrors,
                    mockCreateEventReview
                ]
            });
        });
    });

    /* =============================
       REVIEW UPDATE ROUTE
    ============================= */

    describe("PUT /reviews/:reviewId", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventReviewRoutes, {
                method: "put",
                path: "/reviews/:reviewId",
                handlers: [
                    mockAuthenticateToken,
                    mockReviewIdParamValidator,
                    updateReviewValidator,
                    mockHandleValidationErrors,
                    mockUpdateEventReview
                ]
            });
        });
    });

    /* =============================
       REVIEW DELETION ROUTE
    ============================= */

    describe("DELETE /reviews/:reviewId", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventReviewRoutes, {
                method: "delete",
                path: "/reviews/:reviewId",
                handlers: [
                    mockAuthenticateToken,
                    mockReviewIdParamValidator,
                    mockHandleValidationErrors,
                    mockDeleteEventReview
                ]
            });
        });
    });
});
