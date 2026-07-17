/* =============================
   MOCK FUNCTIONS
============================= */

const mockLikeEvent = jest.fn();
const mockUnlikeEvent = jest.fn();

const mockAuthenticateToken = jest.fn();
const mockHandleValidationErrors = jest.fn();

const mockEventIdParamValidator = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/controllers/eventLikeController", () => ({
    likeEvent: mockLikeEvent,
    unlikeEvent: mockUnlikeEvent
}));

jest.mock("../../../src/middlewares/auth/authenticateToken", () => ({
    authenticateToken: mockAuthenticateToken
}));

jest.mock("../../../src/middlewares/errors/handleValidationErrors", () => mockHandleValidationErrors);

jest.mock("../../../src/validators/shared/paramsValidators", () => ({
    eventIdParamValidator: mockEventIdParamValidator,
}));

/* =============================
   TEST IMPORTS
============================= */

const eventLikeRoutes = require("../../../src/routes/eventLikeRoutes");

const { expectRoute } = require("../../helpers/express/routeTestHelper");

/* ==========================================================================
   Event Like Routes Unit Tests

   Tests event like route configuration.

   Responsibilities
   - Test like route composition
   - Test unlike route composition
   - Test authentication middleware usage
   - Test event ID validation
   - Test route handler ordering

   Notes
   - Controllers, validators and middlewares are mocked.
   - HTTP behavior remains covered by event like integration tests.
=========================================================================== */

describe("event like routes", () => {

    /* =============================
       LIKE ROUTE
    ============================= */

    describe("POST /:eventId/likes", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventLikeRoutes, {
                method: "post",
                path: "/:eventId/likes",
                handlers: [
                    mockAuthenticateToken,
                    mockEventIdParamValidator,
                    mockHandleValidationErrors,
                    mockLikeEvent
                ]
            });
        });
    });

    /* =============================
       UNLIKE ROUTE
    ============================= */

    describe("DELETE /:eventId/likes", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventLikeRoutes, {
                method: "delete",
                path: "/:eventId/likes",
                handlers: [
                    mockAuthenticateToken,
                    mockEventIdParamValidator,
                    mockHandleValidationErrors,
                    mockUnlikeEvent
                ]
            });
        });
    });
});
