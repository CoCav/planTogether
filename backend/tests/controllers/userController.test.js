/* ==================================================
   USER CONTROLLER TESTS

   Tests:
   - authenticated profile retrieval
   - authenticated profile update
   - authenticated password update
   - public user profile retrieval
   - public user events retrieval

   Ensures:
   - user controller calls userService correctly
   - HTTP responses are properly formatted
   - uploaded avatars are handled during profile update
   - errors are forwarded to next()
================================================== */

const userController = require("../../src/controllers/userController");
const userService = require("../../src/services/userService");

jest.mock("../../src/services/userService");

// Create mocked Express request/response objects
const createMocks = ({ params = { id: 1 }, body = {}, user = { userId: 1 }, file } = {}) => {
    const req = { params, body, user, file };

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

describe("userController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       AUTHENTICATED PROFILE
    ============================= */

    describe("getCurrentUserProfile", () => {
        it("should return authenticated user profile", async () => {
            const { req, res, next } = createMocks({
                user: { userId: 1 }
            });

            userService.getCurrentUserProfileById.mockResolvedValue(mockUser);

            await userController.getCurrentUserProfile(req, res, next);

            expect(userService.getCurrentUserProfileById).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User profile retrieved successfully",
                user: {
                    userId: 1,
                    name: "John Doe",
                    email: "john@test.com",
                    avatar: null
                }
            });
        });

        it("should forward current profile errors to next", async () => {
            const { req, res, next } = createMocks();

            const error = new Error("Profile failed");
            userService.getCurrentUserProfileById.mockRejectedValue(error);

            await userController.getCurrentUserProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("updateCurrentUserProfile", () => {
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
                email: "updated@test.com",
                avatar: null
            };

            userService.updateCurrentUserProfileById.mockResolvedValue(updatedUser);

            await userController.updateCurrentUserProfile(req, res, next);

            expect(userService.updateCurrentUserProfileById).toHaveBeenCalledWith(1, {
                name: "Updated",
                email: "updated@test.com"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User profile updated successfully",
                user: {
                    userId: 1,
                    name: "Updated",
                    email: "updated@test.com",
                    avatar: null
                }
            });
        });

        it("should update authenticated user profile with uploaded avatar", async () => {
            const { req, res, next } = createMocks({
                user: { userId: 1 },
                body: {
                    name: "Updated",
                    email: "updated@test.com"
                },
                file: {
                    filename: "avatar-updated.png"
                }
            });

            const updatedUser = {
                id: 1,
                name: "Updated",
                email: "updated@test.com",
                avatar: "/uploads/avatars/avatar-updated.png"
            };

            userService.updateCurrentUserProfileById.mockResolvedValue(updatedUser);

            await userController.updateCurrentUserProfile(req, res, next);

            expect(userService.updateCurrentUserProfileById).toHaveBeenCalledWith(1, {
                name: "Updated",
                email: "updated@test.com",
                avatar: "/uploads/avatars/avatar-updated.png"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User profile updated successfully",
                user: {
                    userId: 1,
                    name: "Updated",
                    email: "updated@test.com",
                    avatar: "/uploads/avatars/avatar-updated.png"
                }
            });
        });

        it("should forward update profile errors to next", async () => {
            const { req, res, next } = createMocks();

            const error = new Error("Update failed");
            userService.updateCurrentUserProfileById.mockRejectedValue(error);

            await userController.updateCurrentUserProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       PASSWORD
    ============================= */

    describe("changeCurrentUserPassword", () => {
        it("should change authenticated user password", async () => {
            const { req, res, next } = createMocks({
                user: { userId: 1 },
                body: {
                    currentPassword: "OldPassword1",
                    newPassword: "NewPassword1"
                }
            });

            userService.changeCurrentUserPasswordById.mockResolvedValue();

            await userController.changeCurrentUserPassword(req, res, next);

            expect(userService.changeCurrentUserPasswordById).toHaveBeenCalledWith(
                1,
                "OldPassword1",
                "NewPassword1"
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Password updated successfully" });
        });

        it("should forward change password errors to next", async () => {
            const { req, res, next } = createMocks({
                body: {
                    currentPassword: "OldPassword1",
                    newPassword: "NewPassword1"
                }
            });

            const error = new Error("Password failed");
            userService.changeCurrentUserPasswordById.mockRejectedValue(error);

            await userController.changeCurrentUserPassword(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       PUBLIC PROFILE
    ============================= */

    describe("getPublicUserProfile", () => {
        it("should return public user profile", async () => {
            const { req, res, next } = createMocks();

            const mockProfile = {
                user: {
                    name: "John Doe",
                    avatar: null
                },
                stats: {
                    createdEventsCount: 2,
                    joinedEventsCount: 3
                }
            };

            userService.getPublicUserProfileById.mockResolvedValue(mockProfile);

            await userController.getPublicUserProfile(req, res, next);

            expect(userService.getPublicUserProfileById).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockProfile);
        });

        it("should forward public profile errors to next", async () => {
            const { req, res, next } = createMocks();

            const error = new Error("Public profile failed");
            userService.getPublicUserProfileById.mockRejectedValue(error);

            await userController.getPublicUserProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       PUBLIC USER EVENTS
    ============================= */

    describe("getPublicUserEvents", () => {
        it("should return public user events", async () => {
            const { req, res, next } = createMocks();

            const mockEvents = {
                createdEvents: [],
                joinedEvents: []
            };

            userService.getPublicUserEventsById.mockResolvedValue(mockEvents);

            await userController.getPublicUserEvents(req, res, next);

            expect(userService.getPublicUserEventsById).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockEvents);
        });

        it("should forward public events errors to next", async () => {
            const { req, res, next } = createMocks();

            const error = new Error("Public events failed");
            userService.getPublicUserEventsById.mockRejectedValue(error);

            await userController.getPublicUserEvents(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
