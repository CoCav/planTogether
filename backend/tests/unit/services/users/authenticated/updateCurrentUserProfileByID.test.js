/* ==================================================
   USER SERVICE - UPDATE CURRENT USER PROFILE BY ID TESTS

   Tests:
   - profile field updates
   - avatar updates
   - avatar cleanup
   - duplicate email rejection
   - missing user rejection
   - database error forwarding

   Ensures:
   - current user profile fields are updated safely
   - emails are normalized before persistence
   - avatar files are cleaned up only when replaced
   - duplicate emails are converted to API-friendly errors
   - missing users and database errors are handled safely
================================================== */

const User = require("../../../../../src/models/userModel");

const userService = require("../../../../../src/services/userService");

const { deleteUploadedFile } = require("../../../../../src/utils/uploadedFileStorage");

const { mockConsoleError } = require("../../../../helpers/mocks/consoleMocks");

const { createMockUser } = require("../../../../factories/userFactory");

jest.mock("../../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../../src/utils/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

describe("userService - updateCurrentUserProfileByID", () => {

    let user;

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();

        user = createMockUser({
            save: jest.fn()
        });

        deleteUploadedFile.mockResolvedValue();
    });

    /* =============================
       PROFILE UPDATE SUCCESS
    ============================= */

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

    /* =============================
       AVATAR CLEANUP
    ============================= */

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

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should convert duplicate email database error to 409", async () => {
        const duplicateEmailError = new Error("Duplicate email");
        duplicateEmailError.name = "SequelizeUniqueConstraintError";

        User.findByPk.mockResolvedValue(user);
        user.save.mockRejectedValue(duplicateEmailError);

        await expect(userService.updateCurrentUserProfileByID(1, {
            email: "taken@test.com"
        })).rejects.toMatchObject({
            message: "Email already in use",
            statusCode: 409
        });
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when updated user is not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(userService.updateCurrentUserProfileByID(1, {})).rejects.toMatchObject({
            message: "User not found",
            statusCode: 404
        });
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward profile update database errors", async () => {
        User.findByPk.mockResolvedValue(user);
        user.save.mockRejectedValue(new Error("DB error"));

        await expect(userService.updateCurrentUserProfileByID(1, {
            name: "Updated"
        })).rejects.toThrow("DB error");
    });
});
