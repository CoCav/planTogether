const mockRegister = jest.fn();
const mockLogin = jest.fn();
const mockLogout = jest.fn();

const mockAuthenticateToken = jest.fn();
const mockAuthRateLimiter = jest.fn();
const mockHandleValidationErrors = jest.fn();

const mockAvatarUploadMiddleware = jest.fn();
const mockUploadAvatarSingle = jest.fn(() => mockAvatarUploadMiddleware);

const mockRegisterNameValidator = jest.fn();
const mockRegisterEmailValidator = jest.fn();
const mockLoginEmailValidator = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/controllers/authController", () => ({
    register: mockRegister,
    login: mockLogin,
    logout: mockLogout
}));

jest.mock("../../../src/middlewares/auth/authenticateToken", () => ({
    authenticateToken: mockAuthenticateToken
}));

jest.mock("../../../src/middlewares/files/uploadFiles", () => ({
    uploadAvatar: {
        single: mockUploadAvatarSingle
    }
}));

jest.mock("../../../src/middlewares/rateLimiters/authRateLimiter", () => mockAuthRateLimiter);

jest.mock("../../../src/middlewares/errors/handleValidationErrors", () => mockHandleValidationErrors);

jest.mock("../../../src/validators/authValidator", () => ({
    registerValidator: [
        mockRegisterNameValidator,
        mockRegisterEmailValidator
    ],
    loginValidator: [
        mockLoginEmailValidator
    ]
}));

/* =============================
   TEST IMPORTS
============================= */

const {
    registerValidator,
    loginValidator
} = require("../../../src/validators/authValidator");

const authRoutes = require("../../../src/routes/authRoutes");

const { expectRoute } = require("../../helpers/express/routeTestHelper");

/* ==========================================================================
   Auth Routes Unit Tests

   Tests authentication route configuration.

   Responsibilities
   - Test registration route composition
   - Test login route composition
   - Test logout route composition
   - Test avatar upload field configuration
   - Test authentication middleware ordering

   Notes
   - Controllers, validators and middlewares are mocked.
   - HTTP behavior remains covered by authentication integration tests.
=========================================================================== */

describe("auth routes", () => {

    /* =============================
       REGISTRATION ROUTE
    ============================= */

    describe("POST /register", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(authRoutes, {
                method: "post",
                path: "/register",
                handlers: [
                    mockAuthRateLimiter,
                    mockAvatarUploadMiddleware,
                    registerValidator,
                    mockHandleValidationErrors,
                    mockRegister
                ]
            });
        });
    });

    /* =============================
       LOGIN ROUTE
    ============================= */

    describe("POST /login", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(authRoutes, {
                method: "post",
                path: "/login",
                handlers: [
                    mockAuthRateLimiter,
                    loginValidator,
                    mockHandleValidationErrors,
                    mockLogin
                ]
            });
        });
    });

    /* =============================
       LOGOUT ROUTE
    ============================= */

    describe("POST /logout", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(authRoutes, {
                method: "post",
                path: "/logout",
                handlers: [
                    mockAuthenticateToken,
                    mockLogout
                ]
            });
        });
    });
});
