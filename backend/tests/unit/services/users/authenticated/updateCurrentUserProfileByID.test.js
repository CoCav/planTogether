/* ==================================================
   USER SERVICE - UPDATE CURRENT USER PROFILE BY ID TESTS

   Tests:
   - profile field updates
   - avatar updates
   - avatar cleanup
   - duplicate email rejection
   - missing user rejection
   - transaction rollback on database errors

   Ensures:
   - current user profile fields are updated safely
   - emails are normalized before persistence
   - avatar files are cleaned up only after successful DB commit
   - duplicate emails are converted to API-friendly errors
   - Sequelize transactions are committed on successful updates
   - Sequelize transactions are rolled back on failed updates
   - missing users and database errors are handled safely
================================================== */

jest.mock("../../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../../src/models/eventModel", () => ({}));

jest.mock("../../../../../src/models/relations/eventUserRoleModel", () => ({}));

jest.mock("../../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../../src/utils/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

const sequelize = require("../../../../../src/config/database");
const User = require("../../../../../src/models/userModel");

const userService = require("../../../../../src/services/userService");

const { deleteUploadedFile } = require("../../../../../src/utils/uploadedFileStorage");

const { mockConsoleError } = require("../../../../helpers/mocks/consoleMocks");

const { createMockUser } = require("../../../../factories/userFactory");

describe("userService - updateCurrentUserProfileByID", () => {

    let user;
    let transaction;

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = {
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue()
        };

        sequelize.transaction.mockResolvedValue(transaction);

        user = createMockUser({
            save: jest.fn().mockResolvedValue()
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

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(User.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(user.name).toBe("Updated");
        expect(user.email).toBe("updated@test.com");

        expect(user.save).toHaveBeenCalledWith({ transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(result).toBe(user);
    });

    it("should update user avatar when provided", async () => {

        User.findByPk.mockResolvedValue(user);

        const result = await userService.updateCurrentUserProfileByID(1, {
            avatar: "/uploads/avatars/avatar-test.png"
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(User.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(user.avatar).toBe("/uploads/avatars/avatar-test.png");

        expect(user.save).toHaveBeenCalledWith({ transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(result).toBe(user);
    });

    it("should clear user avatar when empty string is provided", async () => {

        user.avatar = "/uploads/avatars/old-avatar.png";

        User.findByPk.mockResolvedValue(user);

        const result = await userService.updateCurrentUserProfileByID(1, {
            avatar: ""
        });

        expect(user.avatar).toBeNull();

        expect(user.save).toHaveBeenCalledWith({ transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

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

        expect(transaction.commit).toHaveBeenCalled();

        expect(deleteUploadedFile).toHaveBeenCalledWith(
            "/uploads/avatars/old-avatar.png"
        );
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

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when updated user is not found", async () => {

        User.findByPk.mockResolvedValue(null);

        await expect(
            userService.updateCurrentUserProfileByID(1, {})
        ).rejects.toMatchObject({
            message: "User not found",
            statusCode: 404
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(User.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should rollback transaction on profile update database errors", async () => {

        User.findByPk.mockResolvedValue(user);

        user.save.mockRejectedValue(new Error("DB error"));

        await expect(userService.updateCurrentUserProfileByID(1, {
            name: "Updated"
        })).rejects.toThrow("DB error");

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });
});
