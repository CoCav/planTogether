const mockNormalizeEmail = jest.fn();
const mockHashPassword = jest.fn();
const mockComparePassword = jest.fn();
const mockGenerateAuthToken = jest.fn();

jest.mock("../../../../src/models/userModel", () => ({
    scope: jest.fn()
}));

jest.mock("../../../../src/utils/stringNormalizer", () => ({
    normalizeEmail: mockNormalizeEmail
}));

jest.mock("../../../../src/utils/auth/passwordHasher", () => ({
    hashPassword: mockHashPassword,
    comparePassword: mockComparePassword
}));

jest.mock("../../../../src/utils/auth/authToken", () => ({
    generateAuthToken: mockGenerateAuthToken
}));

const User = require("../../../../src/models/userModel");

const { loginUser } = require("../../../../src/services/authService");

const { createMockUserWithPassword } = require("../../../factories/userFactory");

const { createScopedModelMock } = require("../../../helpers/database/modelTestHelper");

/* ==========================================================================
   Login User Service Unit Tests

   Tests user login business logic.

   Responsibilities
   - Test email normalization
   - Test password-enabled user scope usage
   - Test credential verification
   - Test deleted account protection
   - Test authentication token generation
   - Test unexpected error propagation

   Notes
   - User model and authentication utilities are mocked.
   - Password comparison behavior is tested separately in passwordHasher tests.
=========================================================================== */

describe("login user service", () => {
    let scopedUserModel;

    beforeEach(() => {
        jest.clearAllMocks();

        scopedUserModel = createScopedModelMock();

        User.scope.mockReturnValue(scopedUserModel);

        mockNormalizeEmail.mockReturnValue("john@test.com");

        mockComparePassword.mockResolvedValue(true);

        mockGenerateAuthToken.mockReturnValue("fake-token");
    });

    /* =============================
       USER LOGIN
    ============================= */

    describe("loginUser", () => {
        it("authenticates a user and returns a token", async () => {
            const user = createMockUserWithPassword({
                id: 1,
                email: "john@test.com",
                password: "hashed-password"
            });

            scopedUserModel.findOne.mockResolvedValue(user);

            const result = await loginUser({
                email: " JOHN@TEST.COM ",
                password: "Password123"
            });

            expect(mockNormalizeEmail).toHaveBeenCalledTimes(1);

            expect(mockNormalizeEmail).toHaveBeenCalledWith(
                " JOHN@TEST.COM "
            );

            expect(User.scope).toHaveBeenCalledTimes(1);

            expect(User.scope).toHaveBeenCalledWith(
                "withPassword"
            );

            expect(scopedUserModel.findOne).toHaveBeenCalledTimes(1);

            expect(scopedUserModel.findOne).toHaveBeenCalledWith({
                where: {
                    email: "john@test.com"
                }
            });

            expect(mockComparePassword).toHaveBeenCalledTimes(1);

            expect(mockComparePassword).toHaveBeenCalledWith(
                "Password123",
                user.password
            );

            expect(mockGenerateAuthToken).toHaveBeenCalledTimes(1);

            expect(mockGenerateAuthToken).toHaveBeenCalledWith(user.id);

            expect(result).toEqual({
                user,
                token: "fake-token"
            });
        });
    });

    /* =============================
       INVALID CREDENTIALS
    ============================= */

    describe("Invalid credentials", () => {
        it("throws a 401 error when the user is not found", async () => {
            scopedUserModel.findOne.mockResolvedValue(null);

            await expect(
                loginUser({
                    email: "missing@test.com",
                    password: "Password123"
                })
            ).rejects.toMatchObject({
                message: "Invalid email or invalid password",
                statusCode: 401
            });

            expect(mockComparePassword).not.toHaveBeenCalled();

            expect(mockGenerateAuthToken).not.toHaveBeenCalled();
        });

        it("throws a 401 error when the password is invalid", async () => {
            const user = createMockUserWithPassword();

            scopedUserModel.findOne.mockResolvedValue(user);

            mockComparePassword.mockResolvedValue(false);

            await expect(
                loginUser({
                    email: "john@test.com",
                    password: "WrongPassword"
                })
            ).rejects.toMatchObject({
                message: "Invalid email or invalid password",
                statusCode: 401
            });

            expect(mockComparePassword).toHaveBeenCalledWith(
                "WrongPassword",
                user.password
            );

            expect(mockGenerateAuthToken).not.toHaveBeenCalled();
        });
    });

    /* =============================
       DELETED ACCOUNT PROTECTION
    ============================= */

    describe("Deleted account protection", () => {
        it("throws a 403 error when the account is deleted", async () => {
            const user = createMockUserWithPassword({
                deletedAt: new Date("2026-01-01T00:00:00.000Z")
            });

            scopedUserModel.findOne.mockResolvedValue(user);

            await expect(
                loginUser({
                    email: "john@test.com",
                    password: "Password123"
                })
            ).rejects.toMatchObject({
                message: "Account has been deleted",
                statusCode: 403
            });

            expect(mockComparePassword).not.toHaveBeenCalled();

            expect(mockGenerateAuthToken).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates password comparison errors", async () => {
            const user = createMockUserWithPassword();

            const error = new Error("Password comparison failed");

            scopedUserModel.findOne.mockResolvedValue(user);

            mockComparePassword.mockRejectedValue(error);

            await expect(
                loginUser({
                    email: "john@test.com",
                    password: "Password123"
                })
            ).rejects.toBe(error);

            expect(mockGenerateAuthToken).not.toHaveBeenCalled();
        });
    });
});
