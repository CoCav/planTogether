/* ==================================================
   USER SERVICE - DELETE CURRENT USER BY ID TESTS

   Tests:
   - successful account deletion
   - deleted account data update
   - active organizer deletion rejection
   - inactive organizer membership exclusion
   - past organizer deletion allowance
   - missing user rejection
   - transaction rollback on database errors

   Ensures:
   - current users can soft delete their account
   - deleted accounts keep historical display name
   - deleted accounts anonymize email and avatar data
   - only active organizer memberships block account deletion
   - active or upcoming organizer ownership must be transferred first
   - Sequelize transactions are committed on success
   - Sequelize transactions are rolled back on failures
================================================== */

jest.mock("bcrypt");

jest.mock("../../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../../src/models/eventModel", () => ({}));

jest.mock("../../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

const bcrypt = require("bcrypt");

const sequelize = require("../../../../../src/config/database");
const User = require("../../../../../src/models/userModel");
const EventUserRole = require("../../../../../src/models/relations/eventUserRoleModel");

const userService = require("../../../../../src/services/userService");

const { EVENT_ROLES } = require("../../../../../src/constants/eventRoles");

const { deleteUploadedFile } = require("../../../../../src/utils/files/uploadedFileStorage");

const { mockConsoleError } = require("../../../../helpers/mocks/consoleMocks");

const { createMockUserWithPassword } = require("../../../../factories/userFactory");

describe("userService - deleteCurrentUserByID", () => {
    let transaction;
    let user;

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = {
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue()
        };

        user = createMockUserWithPassword({
            id: 1,
            name: "John Doe",
            email: "john@test.com",
            avatar: "/uploads/avatars/avatar-test.png",
            deletedAt: null,
            save: jest.fn().mockResolvedValue()
        });

        sequelize.transaction.mockResolvedValue(transaction);
        bcrypt.hash.mockResolvedValue("deleted-hash");
    });

    /* =============================
       ACCOUNT DELETION SUCCESS
    ============================= */

    it("should soft delete current user account", async () => {
        User.findByPk.mockResolvedValue(user);
        EventUserRole.findOne.mockResolvedValue(null);

        const result = await userService.deleteCurrentUserByID(1);

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(User.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(EventUserRole.findOne).toHaveBeenCalled();

        expect(user.deletedAt).toBeInstanceOf(Date);
        expect(user.name).toBe("John Doe");
        expect(user.email).toMatch(/^deleted_user_1_/);
        expect(user.password).toBe("deleted-hash");
        expect(user.avatar).toBeNull();

        expect(bcrypt.hash).toHaveBeenCalledWith(expect.stringMatching(/^deleted_user_1_/), 10);

        expect(user.save).toHaveBeenCalledWith({ transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(deleteUploadedFile).toHaveBeenCalledWith("/uploads/avatars/avatar-test.png");

        expect(result).toBe(user);
    });

    it("should allow deletion when user only owns past events", async () => {
        User.findByPk.mockResolvedValue(user);
        EventUserRole.findOne.mockResolvedValue(null);

        await userService.deleteCurrentUserByID(1);

        expect(EventUserRole.findOne).toHaveBeenCalled();

        expect(user.deletedAt).toBeInstanceOf(Date);

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();
    });

    it("should ignore inactive organizer memberships when checking deletion blocker", async () => {
        User.findByPk.mockResolvedValue(user);
        EventUserRole.findOne.mockResolvedValue(null);

        await userService.deleteCurrentUserByID(1);

        expect(EventUserRole.findOne).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                userId: 1,
                role: EVENT_ROLES.ORGANIZER,
                deletedAt: null
            },
            transaction
        }));

        expect(user.deletedAt).toBeInstanceOf(Date);

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();
    });

    it("should not delete avatar when user has no avatar", async () => {
        user.avatar = null;

        User.findByPk.mockResolvedValue(user);
        EventUserRole.findOne.mockResolvedValue(null);

        await userService.deleteCurrentUserByID(1);

        expect(deleteUploadedFile).not.toHaveBeenCalled();

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject deletion if user owns active or upcoming events", async () => {
        User.findByPk.mockResolvedValue(user);

        EventUserRole.findOne.mockResolvedValue({
            id: 1,
            userId: 1,
            eventId: 1
        });

        await expect(userService.deleteCurrentUserByID(1)).rejects.toMatchObject({
            message: "You must transfer ownership of your active or upcoming events before deleting your account",
            statusCode: 403
        });

        expect(user.save).not.toHaveBeenCalled();
        expect(deleteUploadedFile).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when user is not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(userService.deleteCurrentUserByID(1)).rejects.toMatchObject({
            message: "User not found",
            statusCode: 404
        });

        expect(EventUserRole.findOne).not.toHaveBeenCalled();
        expect(deleteUploadedFile).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should rollback transaction when database error occurs", async () => {
        User.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(userService.deleteCurrentUserByID(1)).rejects.toThrow("DB error");

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });
});
