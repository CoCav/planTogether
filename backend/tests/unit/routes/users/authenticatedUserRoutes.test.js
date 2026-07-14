const mockGetCurrentUserEvents = jest.fn();
const mockGetCurrentUserProfile = jest.fn();
const mockUpdateCurrentUserProfile = jest.fn();
const mockChangeCurrentUserPassword = jest.fn();
const mockDeleteCurrentUser = jest.fn();

const mockAuthenticateToken = jest.fn();
const mockHandleValidationErrors = jest.fn();

const mockAvatarUploadMiddleware = jest.fn();
const mockUploadAvatarSingle = jest.fn(() => mockAvatarUploadMiddleware);

const mockGetCurrentUserEventsValidator = jest.fn();
const mockUpdateCurrentUserNameValidator = jest.fn();
const mockUpdateCurrentUserEmailValidator = jest.fn();
const mockChangeCurrentPasswordValidator = jest.fn();
const mockNewPasswordValidator = jest.fn();

const updateCurrentUserProfileValidator = [
    mockUpdateCurrentUserNameValidator,
    mockUpdateCurrentUserEmailValidator
];

const changeCurrentUserPasswordValidator = [
    mockChangeCurrentPasswordValidator,
    mockNewPasswordValidator
];

const authenticatedUserRoutes = require("../../../../src/routes/users/authenticatedUserRoutes");

const { expectRoute } = require("../../../helpers/express/routeTestHelper");

/* ==========================================================================
   Authenticated User Routes Unit Tests

   Tests current user route configuration.

   Responsibilities
   - Test current user event route composition
   - Test current user profile retrieval route composition
   - Test current user profile update route composition
   - Test current user password route composition
   - Test current user deletion route composition
   - Test avatar upload field configuration
   - Test authentication and validation ordering

   Notes
   - Controllers, validators and middlewares are mocked.
   - Validator arrays are flattened by the shared route test helper.
   - HTTP behavior remains covered by user integration tests.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/controllers/userController", () => ({
    getCurrentUserEvents: mockGetCurrentUserEvents,
    getCurrentUserProfile: mockGetCurrentUserProfile,
    updateCurrentUserProfile: mockUpdateCurrentUserProfile,
    changeCurrentUserPassword: mockChangeCurrentUserPassword,
    deleteCurrentUser: mockDeleteCurrentUser
}));

jest.mock("../../../../src/middlewares/auth/authenticateToken", () => ({
    authenticateToken: mockAuthenticateToken
}));

jest.mock("../../../../src/middlewares/files/uploadFiles", () => ({
    uploadAvatar: {
        single: mockUploadAvatarSingle
    }
}));

jest.mock("../../../../src/middlewares/errors/handleValidationErrors", () => mockHandleValidationErrors);

jest.mock("../../../../src/validators/userValidator", () => ({
    getCurrentUserEventsValidator: mockGetCurrentUserEventsValidator,
    updateCurrentUserProfileValidator,
    changeCurrentUserPasswordValidator
}));

describe("authenticated user routes", () => {

    /* =============================
       CURRENT USER EVENTS ROUTE
    ============================= */

    describe("GET /me/events", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(authenticatedUserRoutes, {
                method: "get",
                path: "/me/events",
                handlers: [
                    mockAuthenticateToken,
                    mockGetCurrentUserEventsValidator,
                    mockHandleValidationErrors,
                    mockGetCurrentUserEvents
                ]
            });
        });
    });

    /* =============================
       CURRENT USER PROFILE ROUTE
    ============================= */

    describe("GET /me", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(authenticatedUserRoutes, {
                method: "get",
                path: "/me",
                handlers: [
                    mockAuthenticateToken,
                    mockGetCurrentUserProfile
                ]
            });
        });
    });

    /* =============================
       CURRENT USER PROFILE UPDATE ROUTE
    ============================= */

    describe("PUT /me", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(authenticatedUserRoutes, {
                method: "put",
                path: "/me",
                handlers: [
                    mockAuthenticateToken,
                    mockAvatarUploadMiddleware,
                    updateCurrentUserProfileValidator,
                    mockHandleValidationErrors,
                    mockUpdateCurrentUserProfile
                ]
            });
        });

        it("configures avatar single-file uploads", () => {
            expect(mockUploadAvatarSingle).toHaveBeenCalledTimes(1);

            expect(mockUploadAvatarSingle).toHaveBeenCalledWith("avatar");
        });
    });

    /* =============================
       CURRENT USER PASSWORD ROUTE
    ============================= */

    describe("PUT /me/password", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(authenticatedUserRoutes, {
                method: "put",
                path: "/me/password",
                handlers: [
                    mockAuthenticateToken,
                    changeCurrentUserPasswordValidator,
                    mockHandleValidationErrors,
                    mockChangeCurrentUserPassword
                ]
            });
        });
    });

    /* =============================
       CURRENT USER DELETION ROUTE
    ============================= */

    describe("DELETE /me", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(authenticatedUserRoutes, {
                method: "delete",
                path: "/me",
                handlers: [
                    mockAuthenticateToken,
                    mockDeleteCurrentUser
                ]
            });
        });
    });
});
