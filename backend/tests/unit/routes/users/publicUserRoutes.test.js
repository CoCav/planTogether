const mockGetPublicUserProfile = jest.fn();
const mockGetPublicUserEvents = jest.fn();

const mockResolveCurrentUser = jest.fn();
const mockHandleValidationErrors = jest.fn();

const mockPublicUserIdParamValidator = jest.fn();

const mockPublicEventsPageValidator = jest.fn();
const mockPublicEventsStatusValidator = jest.fn();

const getPublicUserEventsValidator = [
    mockPublicEventsPageValidator,
    mockPublicEventsStatusValidator
];

const publicUserRoutes = require("../../../../src/routes/users/publicUserRoutes");

const { expectRoute } = require("../../../helpers/express/routeTestHelper");

/* ==========================================================================
   Public User Routes Unit Tests

   Tests public user route configuration.

   Responsibilities
   - Test public profile route composition
   - Test public user event route composition
   - Test optional current user resolution
   - Test public user ID validation
   - Test event query validation ordering
   - Test route handler ordering

   Notes
   - Controllers, validators and middlewares are mocked.
   - Validator arrays are flattened by the shared route test helper.
   - HTTP behavior remains covered by user integration tests.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/controllers/userController", () => ({
    getPublicUserProfile: mockGetPublicUserProfile,
    getPublicUserEvents: mockGetPublicUserEvents
}));

jest.mock("../../../../src/middlewares/auth/resolveCurrentUser", () => ({
    resolveCurrentUser: mockResolveCurrentUser
}));

jest.mock("../../../../src/middlewares/errors/handleValidationErrors", () => mockHandleValidationErrors);

jest.mock("../../../../src/validators/userValidator", () => ({
    publicUserIdParamValidator: mockPublicUserIdParamValidator,
    getPublicUserEventsValidator
}));

describe("public user routes", () => {

    /* =============================
       PUBLIC USER PROFILE ROUTE
    ============================= */

    describe("GET /:id", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(publicUserRoutes, {
                method: "get",
                path: "/:id",
                handlers: [
                    mockPublicUserIdParamValidator,
                    mockHandleValidationErrors,
                    mockGetPublicUserProfile
                ]
            });
        });
    });

    /* =============================
       PUBLIC USER EVENTS ROUTE
    ============================= */

    describe("GET /:id/events", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(publicUserRoutes, {
                method: "get",
                path: "/:id/events",
                handlers: [
                    mockResolveCurrentUser,
                    mockPublicUserIdParamValidator,
                    getPublicUserEventsValidator,
                    mockHandleValidationErrors,
                    mockGetPublicUserEvents
                ]
            });
        });
    });
});
