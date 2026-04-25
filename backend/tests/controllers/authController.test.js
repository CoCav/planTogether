const authController = require("../../src/controllers/authController");
const authService = require("../../src/services/authService");

jest.mock("../../src/services/authService");

const createMocks = ({ body = {}, user = { userId: 1 }} = {}) => {
    const req = { body, user };

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
    email: "john@test.com"
};

describe("authController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

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
                password: "Password1"
            });

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "User registered successfully",
                user: {
                    userId: 1,
                    name: "John Doe",
                    email: "john@test.com"
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
                    email: "john@test.com"
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

    describe("getUserByID", () => {
        it("should return authenticated user profile", async () => {
            const { req, res, next } = createMocks({
                user: { userId: 1 }
            });

            authService.getUserProfileByID.mockResolvedValue(mockUser);

            await authController.getUserByID(req, res, next);

            expect(authService.getUserProfileByID).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User profile retrieved successfully",
                user: {
                    userId: 1,
                    name: "John Doe",
                    email: "john@test.com"
                }
            });
        });

        it("should forward get profile errors to next", async () => {
            const { req, res, next } = createMocks();

            const error = new Error("Profile failed");
            authService.getUserProfileByID.mockRejectedValue(error);

            await authController.getUserByID(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("updateUserByID", () => {
        it("should update authenticated user profile", async () => {
            const { req, res, next } = createMocks({
                user: { userId: 1 },
                body: {
                    name: "Updated",
                    email: "updated@test.com"
                }
            });

            const updatedUser = {
                id: 1,
                name: "Updated",
                email: "updated@test.com"
            };

            authService.updateUserProfileByID.mockResolvedValue(updatedUser);

            await authController.updateUserByID(req, res, next);

            expect(authService.updateUserProfileByID).toHaveBeenCalledWith(1, {
                name: "Updated",
                email: "updated@test.com"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User profile updated successfully",
                user: {
                    userId: 1,
                    name: "Updated",
                    email: "updated@test.com"
                }
            });
        });

        it("should forward update profile errors to next", async () => {
            const { req, res, next } = createMocks();

            const error = new Error("Update failed");
            authService.updateUserProfileByID.mockRejectedValue(error);

            await authController.updateUserByID(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("changePassword", () => {
        it("should change authenticated user password", async () => {
            const { req, res, next } = createMocks({
                user: { userId: 1 },
                body: {
                    currentPassword: "OldPassword1",
                    newPassword: "NewPassword1"
                }
            });

            authService.changeUserPasswordByID.mockResolvedValue();

            await authController.changePassword(req, res, next);

            expect(authService.changeUserPasswordByID).toHaveBeenCalledWith(
                1,
                "OldPassword1",
                "NewPassword1"
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Password updated successfully"
            });
        });

        it("should forward change password errors to next", async () => {
            const { req, res, next } = createMocks({
                body: {
                    currentPassword: "OldPassword1",
                    newPassword: "NewPassword1"
                }
            });

            const error = new Error("Password failed");
            authService.changeUserPasswordByID.mockRejectedValue(error);

            await authController.changePassword(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("logout", () => {
        it("should return logout success message", async () => {
            const { req, res } = createMocks();

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Logout successful"
            });
        });
    });
});