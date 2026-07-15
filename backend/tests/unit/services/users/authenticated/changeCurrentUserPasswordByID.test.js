const mockFindUserByIdOrFail = jest.fn();
const mockComparePassword = jest.fn();
const mockHashPassword = jest.fn();

jest.mock("../../../../../src/models/userModel", () => ({
    scope: jest.fn()
}));

jest.mock("../../../../../src/utils/users/userQueries", () => ({
    findUserByIdOrFail: mockFindUserByIdOrFail
}));

jest.mock("../../../../../src/utils/auth/passwordHasher", () => ({
    comparePassword: mockComparePassword,
    hashPassword: mockHashPassword
}));

jest.mock("../../../../../src/config/database", () => ({
    transaction: jest.fn()
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

jest.mock("../../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

jest.mock("../../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

const User = require("../../../../../src/models/userModel");

const { changeCurrentUserPasswordById } = require("../../../../../src/services/users/authenticatedUserService");

const { createMockUserWithPassword } = require("../../../../factories/userFactory");

/* ==========================================================================
   Change Current User Password Service Unit Tests

   Tests current user password changes.

   Responsibilities
   - Test scoped user lookup
   - Test current password validation
   - Test password reuse protection
   - Test new password hashing
   - Test password persistence
   - Test missing user error propagation
   - Test unexpected error propagation

   Notes
   - User lookup and password utilities are mocked.
   - The password-enabled user scope is required for comparison.
=========================================================================== */

describe("change current user password service", () => {
    let scopedUserModel;
    let user;

    beforeEach(() => {
        jest.clearAllMocks();

        scopedUserModel = {
            name: "UserWithPassword"
        };

        user = createMockUserWithPassword({
            id: 10,
            password: "current-hash",
            save: jest.fn().mockResolvedValue()
        });

        User.scope.mockReturnValue(scopedUserModel);

        mockFindUserByIdOrFail.mockResolvedValue(user);

        mockComparePassword
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false);

        mockHashPassword.mockResolvedValue("new-password-hash");
    });

    /* =============================
       PASSWORD CHANGE
    ============================= */

    describe("changeCurrentUserPasswordById", () => {
        it("hashes and saves the new password", async () => {
            const result = await changeCurrentUserPasswordById(
                10,
                "CurrentPassword123",
                "NewPassword123"
            );

            expect(User.scope).toHaveBeenCalledTimes(1);

            expect(User.scope).toHaveBeenCalledWith("withPassword");

            expect(mockFindUserByIdOrFail).toHaveBeenCalledTimes(1);

            expect(mockFindUserByIdOrFail).toHaveBeenCalledWith(
                scopedUserModel,
                10
            );

            expect(mockComparePassword).toHaveBeenNthCalledWith(
                1,
                "CurrentPassword123",
                "current-hash"
            );

            expect(mockComparePassword).toHaveBeenNthCalledWith(
                2,
                "NewPassword123",
                "current-hash"
            );

            expect(mockHashPassword).toHaveBeenCalledTimes(1);

            expect(mockHashPassword).toHaveBeenCalledWith("NewPassword123");

            expect(user.password).toBe("new-password-hash");

            expect(user.save).toHaveBeenCalledTimes(1);
            expect(user.save).toHaveBeenCalledWith();

            expect(result).toBeUndefined();
        });
    });

    /* =============================
       CURRENT PASSWORD VALIDATION
    ============================= */

    describe("Current password validation", () => {
        it("throws a 401 error when the current password is incorrect", async () => {
            mockComparePassword.mockReset();
            mockComparePassword.mockResolvedValue(false);

            await expect(
                changeCurrentUserPasswordById(
                    10,
                    "WrongPassword",
                    "NewPassword123"
                )
            ).rejects.toMatchObject({
                message: "Current password is incorrect",
                statusCode: 401
            });

            expect(mockComparePassword).toHaveBeenCalledTimes(1);

            expect(mockComparePassword).toHaveBeenCalledWith(
                "WrongPassword",
                "current-hash"
            );

            expect(mockHashPassword).not.toHaveBeenCalled();

            expect(user.save).not.toHaveBeenCalled();
        });
    });

    /* =============================
       PASSWORD REUSE
    ============================= */

    describe("Password reuse protection", () => {
        it("throws a 400 error when the new password matches the current password", async () => {
            mockComparePassword.mockReset();

            mockComparePassword
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true);

            await expect(
                changeCurrentUserPasswordById(
                    10,
                    "CurrentPassword123",
                    "CurrentPassword123"
                )
            ).rejects.toMatchObject({
                message: "New password must be different from the current password",
                statusCode: 400
            });

            expect(mockComparePassword).toHaveBeenCalledTimes(2);

            expect(mockHashPassword).not.toHaveBeenCalled();

            expect(user.save).not.toHaveBeenCalled();
        });
    });

    /* =============================
       USER VALIDATION
    ============================= */

    describe("User validation", () => {
        it("propagates the missing user error", async () => {
            const error = Object.assign(
                new Error("User not found"),
                {
                    statusCode: 404
                }
            );

            mockFindUserByIdOrFail.mockRejectedValue(error);

            await expect(
                changeCurrentUserPasswordById(
                    999,
                    "CurrentPassword123",
                    "NewPassword123"
                )
            ).rejects.toBe(error);

            expect(mockComparePassword).not.toHaveBeenCalled();

            expect(mockHashPassword).not.toHaveBeenCalled();

            expect(user.save).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it.each([
            [
                "current password comparison", () => {
                    mockComparePassword.mockReset();

                    mockComparePassword.mockRejectedValue(
                        new Error("Password comparison failed")
                    );
                }
            ],
            [
                "new password comparison", () => {
                    mockComparePassword.mockReset();

                    mockComparePassword
                        .mockResolvedValueOnce(true)
                        .mockRejectedValueOnce(
                            new Error("Password comparison failed")
                        );
                }
            ],
            [
                "password hashing", () => {
                    mockHashPassword.mockRejectedValue(
                        new Error("Password hashing failed")
                    );
                }
            ], [
                "password persistence", () => {
                    user.save.mockRejectedValue(
                        new Error("Password persistence failed")
                    );
                }
            ]])("propagates %s errors",
                async (_, configureError) => {
                    configureError();

                    await expect(
                        changeCurrentUserPasswordById(
                            10,
                            "CurrentPassword123",
                            "NewPassword123"
                        )
                    ).rejects.toBeInstanceOf(Error);
                }
            );
    });
});
