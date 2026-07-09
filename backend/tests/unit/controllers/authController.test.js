/* ==================================================
   AUTH CONTROLLER TESTS

   Tests:
   - user registration
   - user login
   - logout response

   Ensures:
   - auth controller calls authService correctly
   - uploaded avatars are handled during registration
   - HTTP responses are properly formatted
   - errors are forwarded to next()
================================================== */

jest.mock("../../../src/services/authService");

const authController = require("../../../src/controllers/authController");
const authService = require("../../../src/services/authService");

const { createAuthControllerMocks } = require("../../helpers/express/expressTestHelper");

const { createMockUser } = require("../../factories/userFactory");

describe("authController", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       REGISTER
    ============================= */

    describe("register", () => {
        it("should register user and return token", async () => {
            const { req, res, next } = createAuthControllerMocks({
                body: {
                    name: "John Doe",
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            authService.registerUser.mockResolvedValue({
                user: createMockUser(),
                token: "fake-token"
            });

            await authController.register(req, res, next);

            expect(authService.registerUser).toHaveBeenCalledWith({
                name: "John Doe",
                email: "john@test.com",
                password: "Password1",
                avatar: null
            });

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "User registered successfully",
                user: {
                    userId: 1,
                    name: "John Doe",
                    email: "john@test.com",
                    avatar: null
                },
                token: "fake-token"
            });
        });

        it("should register user with uploaded avatar", async () => {
            const { req, res, next } = createAuthControllerMocks({
                body: {
                    name: "John Doe",
                    email: "john@test.com",
                    password: "Password1"
                },
                file: {
                    filename: "avatar-test.png"
                }
            });

            authService.registerUser.mockResolvedValue({
                user: createMockUser({
                    avatar: "/uploads/avatars/avatar-test.png"
                }),
                token: "fake-token"
            });

            await authController.register(req, res, next);

            expect(authService.registerUser).toHaveBeenCalledWith({
                name: "John Doe",
                email: "john@test.com",
                password: "Password1",
                avatar: "/uploads/avatars/avatar-test.png"
            });

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "User registered successfully",
                user: {
                    userId: 1,
                    name: "John Doe",
                    email: "john@test.com",
                    avatar: "/uploads/avatars/avatar-test.png"
                },
                token: "fake-token"
            });
        });

        it("should forward register errors to next", async () => {
            const { req, res, next } = createAuthControllerMocks({
                body: {
                    name: "John Doe",
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            const error = new Error("Register failed");
            authService.registerUser.mockRejectedValue(error);

            await authController.register(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       LOGIN
    ============================= */

    describe("login", () => {
        it("should login user and return token", async () => {
            const { req, res, next } = createAuthControllerMocks({
                body: {
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            authService.loginUser.mockResolvedValue({
                user: createMockUser(),
                token: "fake-token"
            });

            await authController.login(req, res, next);

            expect(authService.loginUser).toHaveBeenCalledWith({
                email: "john@test.com",
                password: "Password1"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Login successful",
                user: {
                    userId: 1,
                    name: "John Doe",
                    email: "john@test.com",
                    avatar: null
                },
                token: "fake-token"
            });
        });

        it("should forward login errors to next", async () => {
            const { req, res, next } = createAuthControllerMocks({
                body: {
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            const error = new Error("Login failed");
            authService.loginUser.mockRejectedValue(error);

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       LOGOUT
    ============================= */

    describe("logout", () => {
        it("should return logout success message", async () => {
            const { req, res } = createAuthControllerMocks();

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Logout successful"
            });
        });
    });
});
