/* ==================================================
   USER CONTROLLER TESTS

   Tests:
   - authenticated current user profile retrieval
   - authenticated current user profile update
   - authenticated current user password update
   - public user profile retrieval
   - public user events retrieval

   Ensures:
   - user controller calls userService correctly
   - HTTP responses are properly formatted
   - uploaded avatars are handled during profile update
   - errors are forwarded to next()
================================================== */

const userController = require("../../../src/controllers/userController");
const userService = require("../../../src/services/userService");

const { createUserControllerMocks } = require("../../helpers/express/mockExpress");

const { createMockUser } = require("../../factories/userFactory");

jest.mock("../../../src/services/userService");

describe("userController", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* ====================================
        AUTHENTICATED CURRENT USER EVENTS
    ===================================== */

    describe("getCurrentUserEvents", () => {
        it("should get current user events", async () => {
            const { req, res, next } = createUserControllerMocks({
                query: { view: "joined", page: "1" },
                user: { userId: 10 }
            });

            const result = {
                page: 1,
                pageSize: 4,
                totalEvents: 1,
                totalPages: 1,
                events: [{ id: 1, title: "Event" }]
            };

            userService.getCurrentUserEventsByID.mockResolvedValue(result);

            await userController.getCurrentUserEvents(req, res, next);

            expect(userService.getCurrentUserEventsByID).toHaveBeenCalledWith(10, {
                view: "joined",
                page: "1"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Events retrieved successfully",
                ...result
            });
        });

        it("should forward get my events errors to next", async () => {
            const { req, res, next } = createUserControllerMocks();
            const error = new Error("My events failed");

            userService.getCurrentUserEventsByID.mockRejectedValue(error);

            await userController.getCurrentUserEvents(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =====================================
        AUTHENTICATED CURRENT USER PROFILE
    ===================================== */

    describe("getCurrentUserProfile", () => {
        it("should return authenticated user profile", async () => {
            const { req, res, next } = createUserControllerMocks({
                user: { userId: 1 }
            });

            const user = createMockUser();

            userService.getCurrentUserProfileByID.mockResolvedValue(user);

            await userController.getCurrentUserProfile(req, res, next);

            expect(userService.getCurrentUserProfileByID).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "User profile retrieved successfully",
                user: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                }
            });
        });

        it("should forward current profile errors to next", async () => {
            const { req, res, next } = createUserControllerMocks();

            const error = new Error("Profile failed");
            userService.getCurrentUserProfileByID.mockRejectedValue(error);

            await userController.getCurrentUserProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("updateCurrentUserProfile", () => {
        it("should update authenticated user profile", async () => {
            const { req, res, next } = createUserControllerMocks({
                user: { userId: 1 },
                body: {
                    name: "Updated",
                    email: "updated@test.com"
                }
            });

            const updatedUser = createMockUser({
                name: "Updated",
                email: "updated@test.com"
            });

            userService.updateCurrentUserProfileByID.mockResolvedValue(updatedUser);

            await userController.updateCurrentUserProfile(req, res, next);

            expect(userService.updateCurrentUserProfileByID).toHaveBeenCalledWith(1, {
                name: "Updated",
                email: "updated@test.com"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "User profile updated successfully",
                user: {
                    userId: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar
                }
            });
        });

        it("should update authenticated user profile with uploaded avatar", async () => {
            const { req, res, next } = createUserControllerMocks({
                user: { userId: 1 },
                body: {
                    name: "Updated",
                    email: "updated@test.com"
                },
                file: {
                    filename: "avatar-updated.png"
                }
            });

            const updatedUser = createMockUser({
                name: "Updated",
                email: "updated@test.com",
                avatar: "/uploads/avatars/avatar-updated.png"
            });

            userService.updateCurrentUserProfileByID.mockResolvedValue(updatedUser);

            await userController.updateCurrentUserProfile(req, res, next);

            expect(userService.updateCurrentUserProfileByID).toHaveBeenCalledWith(1, {
                name: "Updated",
                email: "updated@test.com",
                avatar: "/uploads/avatars/avatar-updated.png"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "User profile updated successfully",
                user: {
                    userId: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar
                }
            });
        });

        it("should forward update profile errors to next", async () => {
            const { req, res, next } = createUserControllerMocks();

            const error = new Error("Update failed");
            userService.updateCurrentUserProfileByID.mockRejectedValue(error);

            await userController.updateCurrentUserProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* ======================================
        AUTHENTICATED CURRENT USER PASSWORD
    ====================================== */

    describe("changeCurrentUserPassword", () => {
        it("should change authenticated user password", async () => {
            const { req, res, next } = createUserControllerMocks({
                user: { userId: 1 },
                body: {
                    currentPassword: "OldPassword1",
                    newPassword: "NewPassword1"
                }
            });

            userService.changeCurrentUserPasswordByID.mockResolvedValue();

            await userController.changeCurrentUserPassword(req, res, next);

            expect(userService.changeCurrentUserPasswordByID).toHaveBeenCalledWith(
                1,
                "OldPassword1",
                "NewPassword1"
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Password updated successfully"
            });
        });

        it("should forward change password errors to next", async () => {
            const { req, res, next } = createUserControllerMocks({
                body: {
                    currentPassword: "OldPassword1",
                    newPassword: "NewPassword1"
                }
            });

            const error = new Error("Password failed");
            userService.changeCurrentUserPasswordByID.mockRejectedValue(error);

            await userController.changeCurrentUserPassword(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       PUBLIC PROFILE
    ============================= */

    describe("getPublicUserProfile", () => {
        it("should return public user profile", async () => {
            const { req, res, next } = createUserControllerMocks();

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

            userService.getPublicUserProfileByID.mockResolvedValue(mockProfile);

            await userController.getPublicUserProfile(req, res, next);

            expect(userService.getPublicUserProfileByID).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Public user profile retrieved successfully",
                ...mockProfile
            });
        });

        it("should forward public profile errors to next", async () => {
            const { req, res, next } = createUserControllerMocks();

            const error = new Error("Public profile failed");
            userService.getPublicUserProfileByID.mockRejectedValue(error);

            await userController.getPublicUserProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       PUBLIC USER EVENTS
    ============================= */

    describe("getPublicUserEvents", () => {
        it("should return public user events", async () => {
            const { req, res, next } = createUserControllerMocks();

            const mockEvents = {
                createdEvents: [],
                joinedEvents: []
            };

            userService.getPublicUserEventsByID.mockResolvedValue(mockEvents);

            await userController.getPublicUserEvents(req, res, next);

            expect(userService.getPublicUserEventsByID).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Public user events retrieved successfully",
                ...mockEvents
            });
        });

        it("should forward public events errors to next", async () => {
            const { req, res, next } = createUserControllerMocks();

            const error = new Error("Public events failed");
            userService.getPublicUserEventsByID.mockRejectedValue(error);

            await userController.getPublicUserEvents(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
