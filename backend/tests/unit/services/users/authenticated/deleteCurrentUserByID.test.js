const mockFindUserByIdOrFail = jest.fn();
const mockHashPassword = jest.fn();
const mockDeleteUploadedFile = jest.fn();

const mockOpGte = Symbol("gte");

jest.mock("sequelize", () => ({
    Op: {
        gte: mockOpGte
    }
}));

jest.mock("../../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../../src/models/userModel", () => ({
    name: "User"
}));

jest.mock("../../../../../src/models/eventModel", () => ({
    name: "Event"
}));

jest.mock("../../../../../src/models/associations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../../src/utils/users/userQueries", () => ({
    findUserByIdOrFail: mockFindUserByIdOrFail
}));

jest.mock("../../../../../src/utils/auth/passwordHasher", () => ({
    hashPassword: mockHashPassword,
    comparePassword: jest.fn()
}));

jest.mock("../../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: mockDeleteUploadedFile
}));

jest.mock("../../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventFilters", () => ({
    buildEventWhereConditions: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventCreatorInclude", () => ({
    buildEventCreatorInclude: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventListStats", () => ({
    getEventListStats: jest.fn()
}));

jest.mock("../../../../../src/utils/stringNormalizer", () => ({
    normalizeEmail: jest.fn()
}));

jest.mock("../../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

const sequelize = require("../../../../../src/config/database");

const User = require("../../../../../src/models/userModel");
const Event = require("../../../../../src/models/eventModel");
const EventUserRole = require("../../../../../src/models/associations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../../../../src/constants/eventRoles");

const { deleteCurrentUserById } = require("../../../../../src/services/users/authenticatedUserService");

const { createTransactionMock } = require("../../../../helpers/database/modelTestHelper");

const { mockSystemTime } = require("../../../../helpers/mocks/systemTimeTestHelper");

const { createMockUserWithPassword } = require("../../../../factories/userFactory");

/* ==========================================================================
   Delete Current User Service Unit Tests

   Tests current user account deletion.

   Responsibilities
   - Test current user lookup
   - Test active organizer ownership protection
   - Test account anonymization
   - Test password replacement
   - Test avatar removal
   - Test post-commit file cleanup
   - Test transaction commit and rollback
   - Test unexpected error propagation

   Notes
   - Account deletion soft-deletes and anonymizes the user.
   - Active or upcoming event ownership must be transferred first.
   - Avatar files are removed only after the transaction commits.
=========================================================================== */

describe("delete current user service", () => {
    mockSystemTime("2026-04-25T12:00:00.000Z");

    let transaction;
    let user;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = createTransactionMock();

        user = createMockUserWithPassword({
            id: 10,
            name: "John Doe",
            email: "john@test.com",
            password: "current-hash",
            avatar:
                "/uploads/avatars/current-avatar.png",
            deletedAt: null,
            save: jest.fn().mockResolvedValue()
        });

        sequelize.transaction.mockResolvedValue(transaction);

        mockFindUserByIdOrFail.mockResolvedValue(user);

        EventUserRole.findOne.mockResolvedValue(null);

        mockHashPassword.mockResolvedValue("deleted-password-hash");

        mockDeleteUploadedFile.mockResolvedValue();
    });

    /* =============================
       ACCOUNT DELETION
    ============================= */

    describe("deleteCurrentUserById", () => {
        it("soft-deletes and anonymizes the current user", async () => {
            const result = await deleteCurrentUserById(10);

            const deletionToken = new Date("2026-04-25T12:00:00.000Z").getTime();

            const deletedCredential = `deleted_user_10_${deletionToken}`;

            expect(sequelize.transaction).toHaveBeenCalledTimes(1);

            expect(mockFindUserByIdOrFail).toHaveBeenCalledTimes(1);

            expect(mockFindUserByIdOrFail).toHaveBeenCalledWith(User, 10, {
                transaction
            });

            expect(EventUserRole.findOne).toHaveBeenCalledTimes(1);

            expect(EventUserRole.findOne).toHaveBeenCalledWith({
                where: {
                    userId: 10,
                    role:
                        EVENT_ROLES.ORGANIZER,
                    deletedAt: null
                },
                include: [{
                    model: Event,
                    as: "event",
                    where: {
                        endDateTime: {
                            [mockOpGte]: new Date("2026-04-25T12:00:00.000Z")
                        }
                    }
                }],
                transaction
            });

            expect(user.deletedAt).toEqual(
                new Date("2026-04-25T12:00:00.000Z")
            );

            // Historical content keeps the original display name.
            expect(user.name).toBe("John Doe");

            expect(user.email).toBe(`${deletedCredential}@deleted.local`);

            expect(mockHashPassword).toHaveBeenCalledTimes(1);
            expect(mockHashPassword).toHaveBeenCalledWith(deletedCredential);

            expect(user.password).toBe("deleted-password-hash");

            expect(user.avatar).toBeNull();

            expect(user.save).toHaveBeenCalledTimes(1);
            expect(user.save).toHaveBeenCalledWith({
                transaction
            });

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(mockDeleteUploadedFile).toHaveBeenCalledWith("/uploads/avatars/current-avatar.png");

            expect(result).toBe(user);
        });

        it("does not delete a file when the user has no avatar", async () => {
            user.avatar = null;

            await deleteCurrentUserById(10);

            expect(user.avatar).toBeNull();

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });
    });

    /* =============================
       OWNERSHIP PROTECTION
    ============================= */

    describe("Event ownership protection", () => {
        it("throws a 403 error when the user owns an active or upcoming event", async () => {
            EventUserRole.findOne.mockResolvedValue({
                id: 1,
                eventId: 100,
                userId: 10,
                role: EVENT_ROLES.ORGANIZER
            });

            await expect(
                deleteCurrentUserById(10)
            ).rejects.toMatchObject({
                message: "You must transfer ownership of your active or upcoming events before deleting your account",
                statusCode: 403
            });

            expect(mockHashPassword).not.toHaveBeenCalled();

            expect(user.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("allows deletion when no active organizer membership is found", async () => {
            EventUserRole.findOne.mockResolvedValue(null);

            await deleteCurrentUserById(10);

            expect(user.save).toHaveBeenCalledTimes(1);

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();
        });
    });

    /* =============================
       FILE CLEANUP
    ============================= */

    describe("Avatar cleanup", () => {
        it("deletes the avatar only after the transaction commits", async () => {
            await deleteCurrentUserById(10);

            expect(transaction.commit.mock.invocationCallOrder[0]).toBeLessThan(
                mockDeleteUploadedFile.mock.invocationCallOrder[0]
            );
        });

        it("propagates cleanup errors without rolling back committed changes", async () => {
            const error = new Error("Avatar cleanup failed");

            mockDeleteUploadedFile.mockRejectedValue(error);

            await expect(deleteCurrentUserById(10)).rejects.toBe(error);

            expect(user.save).toHaveBeenCalledTimes(1);

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            // Account deletion is already committed.
            expect(transaction.rollback).not.toHaveBeenCalled();
        });
    });

    /* =============================
       USER VALIDATION
    ============================= */

    describe("User validation", () => {
        it("rolls back when the current user does not exist", async () => {
            const error = Object.assign(
                new Error("User not found"),
                {
                    statusCode: 404
                }
            );

            mockFindUserByIdOrFail.mockRejectedValue(error);

            await expect(deleteCurrentUserById(999)).rejects.toBe(error);

            expect(EventUserRole.findOne).not.toHaveBeenCalled();

            expect(mockHashPassword).not.toHaveBeenCalled();

            expect(user.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });
    });

    /* =============================
       TRANSACTION ERRORS
    ============================= */

    describe("Transaction errors", () => {
        it("propagates transaction creation errors", async () => {
            const error = new Error("Transaction creation failed");

            sequelize.transaction.mockRejectedValue(error);

            await expect(deleteCurrentUserById(10)).rejects.toBe(error);

            expect(mockFindUserByIdOrFail).not.toHaveBeenCalled();

            expect(transaction.rollback).not.toHaveBeenCalled();
        });

        it("rolls back when the ownership lookup fails", async () => {
            const error = new Error("Ownership lookup failed");

            EventUserRole.findOne.mockRejectedValue(error);

            await expect(deleteCurrentUserById(10)).rejects.toBe(error);

            expect(mockHashPassword).not.toHaveBeenCalled();

            expect(user.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when password anonymization fails", async () => {
            const error = new Error("Password hashing failed");

            mockHashPassword.mockRejectedValue(error);

            await expect(deleteCurrentUserById(10)).rejects.toBe(error);

            expect(user.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("rolls back when user persistence fails", async () => {
            const error = new Error("User persistence failed");

            user.save.mockRejectedValue(error);

            await expect(deleteCurrentUserById(10)).rejects.toBe(error);

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("rolls back when transaction commit fails", async () => {
            const error = new Error("Transaction commit failed");

            transaction.commit.mockRejectedValue(error);

            await expect(deleteCurrentUserById(10)).rejects.toBe(error);

            expect(user.save).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });
    });
});
