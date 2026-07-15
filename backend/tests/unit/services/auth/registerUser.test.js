const mockNormalizeEmail = jest.fn();
const mockHashPassword = jest.fn();
const mockComparePassword = jest.fn();
const mockGenerateAuthToken = jest.fn();

jest.mock("../../../../src/models/userModel", () => ({
    findOne: jest.fn(),
    create: jest.fn()
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

const { registerUser } = require("../../../../src/services/authService");

const { createMockUser } = require("../../../factories/userFactory");

/* ==========================================================================
   Register User Service Unit Tests

   Tests user registration business logic.

   Responsibilities
   - Test email normalization
   - Test duplicate email protection
   - Test password hashing
   - Test optional avatar persistence
   - Test user creation
   - Test authentication token generation
   - Test unexpected error propagation

   Notes
   - User model and authentication utilities are mocked.
   - Password hashing behavior is tested separately in passwordHasher tests.
=========================================================================== */

describe("register user service", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockNormalizeEmail.mockReturnValue("john@test.com");

        mockHashPassword.mockResolvedValue("hashed-password");

        mockGenerateAuthToken.mockReturnValue("fake-token");
    });

    /* =============================
       USER REGISTRATION
    ============================= */

    describe("registerUser", () => {
        it.each([[
            "without an avatar",
            undefined,
            null
        ], [
            "with an avatar",
            "/uploads/avatars/avatar-test.png",
            "/uploads/avatars/avatar-test.png"
        ]])("registers a user %s",
            async (_, avatar, expectedAvatar) => {
                const createdUser = createMockUser({
                    id: 1,
                    email: "john@test.com",
                    avatar: expectedAvatar
                });

                User.findOne.mockResolvedValue(null);
                User.create.mockResolvedValue(createdUser);

                const result = await registerUser({
                    name: "John Doe",
                    email: " JOHN@TEST.COM ",
                    password: "Password123",
                    avatar
                });

                expect(mockNormalizeEmail).toHaveBeenCalledTimes(1);

                expect(mockNormalizeEmail).toHaveBeenCalledWith(
                    " JOHN@TEST.COM "
                );

                expect(User.findOne).toHaveBeenCalledTimes(1);

                expect(User.findOne).toHaveBeenCalledWith({
                    where: {
                        email: "john@test.com"
                    }
                });

                expect(mockHashPassword).toHaveBeenCalledTimes(1);

                expect(mockHashPassword).toHaveBeenCalledWith(
                    "Password123"
                );

                expect(User.create).toHaveBeenCalledTimes(1);

                expect(User.create).toHaveBeenCalledWith({
                    name: "John Doe",
                    email: "john@test.com",
                    password: "hashed-password",
                    avatar: expectedAvatar
                });

                expect(mockGenerateAuthToken).toHaveBeenCalledTimes(1);

                expect(mockGenerateAuthToken).toHaveBeenCalledWith(
                    createdUser.id
                );

                expect(result).toEqual({
                    user: createdUser,
                    token: "fake-token"
                });
            }
        );
    });

    /* =============================
       DUPLICATE EMAIL PROTECTION
    ============================= */

    describe("Duplicate email protection", () => {
        it("throws a 409 error when the email is already in use", async () => {
            User.findOne.mockResolvedValue(createMockUser());

            await expect(
                registerUser({
                    name: "John Doe",
                    email: "john@test.com",
                    password: "Password123"
                })
            ).rejects.toMatchObject({
                message: "Email already in use",
                statusCode: 409
            });

            expect(mockHashPassword).not.toHaveBeenCalled();

            expect(User.create).not.toHaveBeenCalled();

            expect(mockGenerateAuthToken).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates password hashing errors", async () => {
            const error = new Error("Password hashing failed");

            User.findOne.mockResolvedValue(null);

            mockHashPassword.mockRejectedValue(error);

            await expect(
                registerUser({
                    name: "John Doe",
                    email: "john@test.com",
                    password: "Password123"
                })
            ).rejects.toBe(error);

            expect(User.create).not.toHaveBeenCalled();

            expect(mockGenerateAuthToken).not.toHaveBeenCalled();
        });
    });
});
