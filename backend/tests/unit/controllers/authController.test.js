const authService = require("../../../src/services/authService");

const { formatAuthenticatedUser } = require("../../../src/utils/users/authenticated/authenticatedUserFormatter");

const authController = require("../../../src/controllers/authController");

const {
    createAuthControllerMocks,
    expectNoResponseSent,
    expectJsonResponse
} = require("../../helpers/express/expressTestHelper");

const { createMockUser } = require("../../factories/userFactory");

/* ==========================================================================
   Auth Controller Unit Tests

   Tests authentication request handling and responses.

   Responsibilities
   - Test user registration
   - Test optional registration avatar handling
   - Test user login
   - Test authenticated user formatting
   - Test logout responses
   - Test service error forwarding

   Notes
   - Authentication services and user formatting are mocked.
   - Business logic is tested separately in authService tests.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/services/authService");

jest.mock(
    "../../../src/utils/users/authenticated/authenticatedUserFormatter",
    () => ({
        formatAuthenticatedUser: jest.fn()
    })
);

describe("auth controller", () => {
    const formattedUser = {
        userId: 1,
        name: "John Doe",
        email: "john@test.com",
        avatar: null
    };

    beforeEach(() => {
        jest.clearAllMocks();

        formatAuthenticatedUser.mockReturnValue(formattedUser);
    });

    /* =============================
       USER REGISTRATION
    ============================= */

    describe("register", () => {
        it.each([[
            "without an avatar",
            undefined,
            null
        ], [
            "with an uploaded avatar",
            {
                filename: "avatar-test.png"
            },
            "/uploads/avatars/avatar-test.png"
        ]])("registers a user %s",
            async (_, file, expectedAvatar) => {
                const { req, res, next } = createAuthControllerMocks({
                    body: {
                        name: "John Doe",
                        email: "john@test.com",
                        password: "Password1"
                    },
                    file
                });

                const user = createMockUser({
                    avatar: expectedAvatar
                });

                authService.registerUser.mockResolvedValue({
                    user,
                    token: "fake-token"
                });

                await authController.register(req, res, next);

                expect(authService.registerUser).toHaveBeenCalledTimes(1);

                expect(authService.registerUser).toHaveBeenCalledWith({
                    name: "John Doe",
                    email: "john@test.com",
                    password: "Password1",
                    avatar: expectedAvatar
                });

                expect(formatAuthenticatedUser).toHaveBeenCalledTimes(1);

                expect(formatAuthenticatedUser).toHaveBeenCalledWith(user);

                expectJsonResponse(res, 201, {
                    success: true,
                    message: "User registered successfully",
                    user: formattedUser,
                    token: "fake-token"
                });

                expect(next).not.toHaveBeenCalled();
            }
        );

        it("forwards registration errors to next", async () => {
            const { req, res, next } = createAuthControllerMocks({
                body: {
                    name: "John Doe",
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            const error = new Error("Registration failed");

            authService.registerUser.mockRejectedValue(error);

            await authController.register(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expect(formatAuthenticatedUser).not.toHaveBeenCalled();

            expectNoResponseSent(res);
        });
    });

    /* =============================
       USER LOGIN
    ============================= */

    describe("login", () => {
        it("logs in a user and returns an authentication token", async () => {
            const { req, res, next } = createAuthControllerMocks({
                body: {
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            const user = createMockUser();

            authService.loginUser.mockResolvedValue({
                user,
                token: "fake-token"
            });

            await authController.login(req, res, next);

            expect(authService.loginUser).toHaveBeenCalledTimes(1);

            expect(authService.loginUser).toHaveBeenCalledWith({
                email: "john@test.com",
                password: "Password1"
            });

            expect(formatAuthenticatedUser).toHaveBeenCalledTimes(1);

            expect(formatAuthenticatedUser).toHaveBeenCalledWith(user);

            expectJsonResponse(res, 200, {
                success: true,
                message: "Login successful",
                user: formattedUser,
                token: "fake-token"
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards login errors to next", async () => {
            const { req, res, next } = createAuthControllerMocks({
                body: {
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            const error = new Error("Login failed");

            authService.loginUser.mockRejectedValue(error);

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expect(formatAuthenticatedUser).not.toHaveBeenCalled();

            expectNoResponseSent(res);
        });
    });

    /* =============================
       USER LOGOUT
    ============================= */

    describe("logout", () => {
        it("returns a successful logout response", () => {
            const { req, res } = createAuthControllerMocks();

            authController.logout(req, res);

            expectJsonResponse(res, 200, {
                success: true,
                message: "Logout successful"
            });
        });
    });
});
