/* ==================================================
   AUTH CONTROLLER TESTS

   Tests:
   - user registration
   - user login
   - logout responses

   Ensures:
   - auth controller calls authService correctly
   - HTTP responses are properly formatted
   - uploaded avatars are handled during registration
   - errors are forwarded to next()
================================================== */

const authController = require("../../../src/controllers/authController");
const authService = require("../../../src/services/authService");

jest.mock("../../../src/services/authService");

// Create mocked Express request/response objects
const createMocks = ({ body = {}, user = { userId: 1 }, file } = {}) => {
    const req = { body, user, file };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return { req, res, next };
};

const mockUser = {
    id: 1,
    name: "John Doe",
    email: "john@test.com",
    avatar: null
};

describe("authController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       REGISTER
    ============================= */

    describe("register", () => {
        it("should register user and return token", async () => {
            const { req, res, next } = createMocks({
                body: {
                    name: "John Doe",
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            authService.registerUser.mockResolvedValue({
                user: mockUser,
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
            const { req, res, next } = createMocks({
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
                user: {
                    ...mockUser,
                    avatar: "/uploads/avatars/avatar-test.png"
                },
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
            const { req, res, next } = createMocks({
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
            const { req, res, next } = createMocks({
                body: {
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            authService.loginUser.mockResolvedValue({
                user: mockUser,
                token: "fake-token"
            });

            await authController.login(req, res, next);

            expect(authService.loginUser).toHaveBeenCalledWith({
                email: "john@test.com",
                password: "Password1"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
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
            const { req, res, next } = createMocks({
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
            const { req, res } = createMocks();

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
        });
    });
});
