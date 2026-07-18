/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindUserByIdOrFail = jest.fn();
const mockNormalizeEmail = jest.fn();
const mockDeleteUploadedFile = jest.fn();

/* =============================
   TEST MOCKS
============================= */

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
    name: "EventUserRole"
}));

jest.mock("../../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../../src/utils/users/userQueries", () => ({
    findUserByIdOrFail: mockFindUserByIdOrFail
}));

jest.mock("../../../../../src/utils/stringNormalizer", () => ({
    normalizeEmail: mockNormalizeEmail
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

jest.mock("../../../../../src/utils/auth/passwordHasher", () => ({
    hashPassword: jest.fn(),
    comparePassword: jest.fn()
}));

jest.mock("../../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const sequelize = require("../../../../../src/config/database");

const User = require("../../../../../src/models/userModel");

const { updateCurrentUserProfileById } = require("../../../../../src/services/users/authenticatedUserService");

const { createTransactionMock } = require("../../../../helpers/database/modelTestHelper");

const { createMockUser } = require("../../../../factories/userFactory");

/* ==========================================================================
   Update Current User Profile Service Unit Tests

   Tests current user profile updates.

   Responsibilities
   - Test current user lookup
   - Test name and email updates
   - Test email normalization
   - Test avatar replacement and removal
   - Test post-commit avatar cleanup
   - Test duplicate email error conversion
   - Test transaction commit and rollback
   - Test unexpected error propagation

   Notes
   - User lookup and file storage utilities are mocked.
   - Old avatars are removed only after the database transaction commits.
=========================================================================== */

describe("update current user profile service", () => {
    let transaction;
    let user;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = createTransactionMock();

        user = createMockUser({
            id: 10,
            name: "John Doe",
            email: "john@test.com",
            avatar: null,
            save: jest.fn().mockResolvedValue()
        });

        sequelize.transaction.mockResolvedValue(transaction);

        mockFindUserByIdOrFail.mockResolvedValue(user);

        mockNormalizeEmail.mockImplementation(
            (email) => String(email).trim().toLowerCase()
        );

        mockDeleteUploadedFile.mockResolvedValue();
    });

    /* =============================
       PROFILE UPDATE
    ============================= */

    describe("updateCurrentUserProfileById", () => {
        it("updates and returns the current user profile", async () => {
            const result = await updateCurrentUserProfileById(10, {
                name: "Updated User",
                email: " UPDATED@TEST.COM "
            });

            expect(sequelize.transaction).toHaveBeenCalledTimes(1);

            expect(mockFindUserByIdOrFail).toHaveBeenCalledTimes(1);

            expect(mockFindUserByIdOrFail).toHaveBeenCalledWith(User, 10, {
                transaction
            });

            expect(mockNormalizeEmail).toHaveBeenCalledWith(" UPDATED@TEST.COM ");

            expect(user.name).toBe("Updated User");
            expect(user.email).toBe("updated@test.com");

            expect(user.save).toHaveBeenCalledTimes(1);
            expect(user.save).toHaveBeenCalledWith({
                transaction
            });

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();

            expect(result).toBe(user);
        });

        it("preserves fields that are omitted from the update", async () => {
            await updateCurrentUserProfileById(10, {});

            expect(user.name).toBe("John Doe");
            expect(user.email).toBe("john@test.com");

            expect(user.avatar).toBeNull();

            expect(mockNormalizeEmail).not.toHaveBeenCalled();

            expect(user.save).toHaveBeenCalledTimes(1);
        });

        it("does not update the name when an empty value is provided", async () => {
            await updateCurrentUserProfileById(10, {
                name: ""
            });

            expect(user.name).toBe("John Doe");
        });

        it("does not update the email when an empty value is provided", async () => {
            await updateCurrentUserProfileById(10, {
                email: ""
            });

            expect(user.email).toBe("john@test.com");

            expect(mockNormalizeEmail).not.toHaveBeenCalled();
        });
    });

    /* =============================
       AVATAR UPDATE
    ============================= */

    describe("Avatar update", () => {
        it("sets a new avatar", async () => {
            const newAvatar = "/uploads/avatars/new-avatar.png";

            const result = await updateCurrentUserProfileById(10, {
                avatar: newAvatar
            });

            expect(user.avatar).toBe(newAvatar);

            expect(user.save).toHaveBeenCalledWith({
                transaction
            });

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();

            expect(result).toBe(user);
        });

        it.each([
            ["an empty string", ""],
            ["null", null]
        ])(
            "clears the current avatar when %s is provided", async (_, avatar) => {
                user.avatar = "/uploads/avatars/old-avatar.png";

                await updateCurrentUserProfileById(10, {
                    avatar
                });

                expect(user.avatar).toBeNull();

                expect(transaction.commit).toHaveBeenCalledTimes(1);

                expect(mockDeleteUploadedFile).toHaveBeenCalledTimes(1);
                expect(mockDeleteUploadedFile).toHaveBeenCalledWith("/uploads/avatars/old-avatar.png");
            }
        );

        it("preserves the current avatar when the avatar field is omitted", async () => {
            user.avatar = "/uploads/avatars/current-avatar.png";

            await updateCurrentUserProfileById(10, {
                name: "Updated User"
            });

            expect(user.avatar).toBe("/uploads/avatars/current-avatar.png");

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });
    });

    /* =============================
       AVATAR CLEANUP
    ============================= */

    describe("Avatar cleanup", () => {
        beforeEach(() => {
            user.avatar = "/uploads/avatars/old-avatar.png";
        });

        it("deletes the previous avatar after a successful replacement", async () => {
            await updateCurrentUserProfileById(10, {
                avatar: "/uploads/avatars/new-avatar.png"
            });

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).toHaveBeenCalledTimes(1);
            expect(mockDeleteUploadedFile).toHaveBeenCalledWith("/uploads/avatars/old-avatar.png");

            expect(transaction.commit.mock.invocationCallOrder[0]).toBeLessThan(mockDeleteUploadedFile.mock.invocationCallOrder[0]);
        });

        it("does not delete the avatar when the path is unchanged", async () => {
            await updateCurrentUserProfileById(10, {
                avatar: "/uploads/avatars/old-avatar.png"
            });

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("propagates cleanup errors without rolling back committed changes", async () => {
            const error = new Error("Avatar cleanup failed");

            mockDeleteUploadedFile.mockRejectedValue(error);

            await expect(
                updateCurrentUserProfileById(10, {
                    avatar: "/uploads/avatars/new-avatar.png"
                })
            ).rejects.toBe(error);

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            // The profile update is already committed.
            expect(transaction.rollback).not.toHaveBeenCalled();
        });
    });

    /* =============================
       USER VALIDATION
    ============================= */

    describe("User validation", () => {
        it("rolls back when the current user does not exist", async () => {
            const error = Object.assign(new Error("User not found"), {
                statusCode: 404
            });

            mockFindUserByIdOrFail.mockRejectedValue(error);

            await expect(
                updateCurrentUserProfileById(
                    999,
                    {}
                )
            ).rejects.toBe(error);

            expect(user.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });
    });

    /* =============================
       DUPLICATE EMAIL
    ============================= */

    describe("Duplicate email", () => {
        it("converts Sequelize unique constraint errors to a 409 error", async () => {
            const error = Object.assign(new Error("Duplicate email"), {
                name: "SequelizeUniqueConstraintError"
            });

            user.save.mockRejectedValue(error);

            await expect(
                updateCurrentUserProfileById(10, {
                    email: "taken@test.com"
                })
            ).rejects.toMatchObject({
                message: "Email already in use",
                statusCode: 409
            });

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

            await expect(
                updateCurrentUserProfileById(10, {
                    name: "Updated User"
                })
            ).rejects.toBe(error);

            expect(mockFindUserByIdOrFail).not.toHaveBeenCalled();

            expect(transaction.rollback).not.toHaveBeenCalled();
        });

        it("rolls back when profile persistence fails", async () => {
            const error = new Error("Profile persistence failed");

            user.save.mockRejectedValue(error);

            await expect(
                updateCurrentUserProfileById(10, {
                    name: "Updated User"
                })
            ).rejects.toBe(error);

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("rolls back when transaction commit fails", async () => {
            const error = new Error("Transaction commit failed");

            transaction.commit.mockRejectedValue(error);

            await expect(
                updateCurrentUserProfileById(10, {
                    avatar: "/uploads/avatars/new-avatar.png"
                })
            ).rejects.toBe(error);

            expect(user.save).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });
    });
});
