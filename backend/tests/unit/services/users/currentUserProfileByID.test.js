/* ==================================================
   USER SERVICE - GET CURRENT USER PROFILE BY ID TESTS

   Tests:
   - authenticated profile retrieval
   - profile updates
   - avatar updates
   - avatar cleanup
   - missing user handling

   Ensures:
   - profile data is retrieved correctly
   - profile fields are updated safely
   - avatar files are cleaned up when replaced
================================================== */

const User = require("../../../../src/models/userModel");
const { deleteUploadedFile } = require("../../../../src/utils/uploadedFileStorage");

const userService = require("../../../../src/services/userService");

jest.mock("../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/utils/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

describe("userService - getCurrentUserProfileByID", () => {
    let user;

    beforeEach(() => {
        jest.clearAllMocks();

        user = {
            id: 1,
            name: "John",
            email: "john@test.com",
            avatar: null,
            save: jest.fn()
        };

        deleteUploadedFile.mockResolvedValue();
    });

    /* ==========================
       getCurrentUserProfileByID
    ============================= */

    describe("getCurrentUserProfileByID", () => {
        it("should return user profile", async () => {
            User.findByPk.mockResolvedValue(user);

            const result = await userService.getCurrentUserProfileByID(1);

            expect(result).toBe(user);
        });

        it("should throw if user is not found", async () => {
            User.findByPk.mockResolvedValue(null);

            await expect(userService.getCurrentUserProfileByID(1)).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    /* ============================
       updateCurrentUserProfileByID
    =============================== */

    describe("updateCurrentUserProfileByID", () => {
        it("should update user profile fields", async () => {
            User.findByPk.mockResolvedValue(user);

            const result = await userService.updateCurrentUserProfileByID(1, {
                name: "Updated",
                email: " UPDATED@TEST.COM "
            });

            expect(user.name).toBe("Updated");
            expect(user.email).toBe("updated@test.com");
            expect(user.save).toHaveBeenCalled();
            expect(result).toBe(user);
        });

        it("should update user avatar when provided", async () => {
            User.findByPk.mockResolvedValue(user);

            const result = await userService.updateCurrentUserProfileByID(1, {
                avatar: "/uploads/avatars/avatar-test.png"
            });

            expect(user.avatar).toBe("/uploads/avatars/avatar-test.png");
            expect(user.save).toHaveBeenCalled();
            expect(result).toBe(user);
        });

        it("should clear user avatar when empty string is provided", async () => {
            user.avatar = "/uploads/avatars/old-avatar.png";

            User.findByPk.mockResolvedValue(user);

            const result = await userService.updateCurrentUserProfileByID(1, {
                avatar: ""
            });

            expect(user.avatar).toBeNull();
            expect(user.save).toHaveBeenCalled();
            expect(result).toBe(user);
        });

        it("should delete old avatar when new avatar is provided", async () => {
            user.avatar = "/uploads/avatars/old-avatar.png";

            User.findByPk.mockResolvedValue(user);

            await userService.updateCurrentUserProfileByID(1, {
                avatar: "/uploads/avatars/new-avatar.png"
            });

            expect(user.avatar).toBe("/uploads/avatars/new-avatar.png");

            expect(deleteUploadedFile).toHaveBeenCalledWith("/uploads/avatars/old-avatar.png");
        });

        it("should not delete avatar when avatar is unchanged", async () => {
            user.avatar = "/uploads/avatars/avatar-test.png";

            User.findByPk.mockResolvedValue(user);

            await userService.updateCurrentUserProfileByID(1, {
                avatar: "/uploads/avatars/avatar-test.png"
            });

            expect(deleteUploadedFile).not.toHaveBeenCalled();
        });

        it("should not delete avatar when avatar is cleared", async () => {
            user.avatar = "/uploads/avatars/old-avatar.png";

            User.findByPk.mockResolvedValue(user);

            await userService.updateCurrentUserProfileByID(1, {
                avatar: ""
            });

            expect(user.avatar).toBeNull();

            expect(deleteUploadedFile).not.toHaveBeenCalled();
        });

        it("should throw if user is not found", async () => {
            User.findByPk.mockResolvedValue(null);

            await expect(userService.updateCurrentUserProfileByID(1, {})).rejects.toMatchObject({ statusCode: 404 });
        });
    });
});
