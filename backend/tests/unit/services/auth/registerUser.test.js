/* ==================================================
   AUTH SERVICE - REGISTER USER TESTS

   Tests:
   - successful registration
   - email normalization
   - password hashing
   - JWT token generation
   - avatar registration
   - duplicate email rejection

   Ensures:
   - users are created correctly
   - emails are normalized before persistence
   - passwords are hashed before persistence
   - JWT tokens are generated after registration
   - duplicate emails are rejected
================================================== */

const bcrypt = require("bcrypt");
const { generateAuthToken } = require("../../../../src/utils/auth/authToken");

const User = require("../../../../src/models/userModel");
const authService = require("../../../../src/services/authService");

const { createMockUser } = require("../../../factories/userFactory");

jest.mock("bcrypt");

jest.mock("../../../../src/utils/auth/authToken", () => ({
    generateAuthToken: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));

describe("authService - registerUser", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        bcrypt.hash.mockResolvedValue("hashed-password");
        generateAuthToken.mockReturnValue("token");
    });

    /* =============================
       REGISTER SUCCESS
    ============================= */

    it("should register a user and return token", async () => {

        const createdUser = createMockUser();

        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(createdUser);

        const result = await authService.registerUser({
            name: "John",
            email: " JOHN@TEST.COM ",
            password: "Password123"
        });

        expect(User.findOne).toHaveBeenCalledWith({
            where: {
                email: "john@test.com"
            }
        });

        expect(User.create).toHaveBeenCalledWith({
            name: "John",
            email: "john@test.com",
            password: "hashed-password",
            avatar: null
        });

        expect(result.token).toBe("token");
        expect(result.user).toBe(createdUser);
    });

    /* =============================
       EMAIL NORMALIZATION
    ============================= */

    it("should normalize email before user creation", async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(createMockUser());

        await authService.registerUser({
            name: "John",
            email: " JOHN@TEST.COM ",
            password: "Password123"
        });

        expect(User.create).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "john@test.com"
            })
        );
    });

    /* =============================
       PASSWORD HASHING
    ============================= */

    it("should hash password before creating user", async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(createMockUser());

        await authService.registerUser({
            name: "John",
            email: "john@test.com",
            password: "Password123"
        });

        expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 10);
    });

    /* =============================
       TOKEN GENERATION
    ============================= */

    it("should generate JWT token with userId payload", async () => {
        const mockUser = createMockUser({
            id: 1
        });

        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(mockUser);

        await authService.registerUser({
            name: "John",
            email: "john@test.com",
            password: "Password123"
        });

        expect(generateAuthToken).toHaveBeenCalledWith(mockUser.id);
    });

    /* =============================
       AVATAR
    ============================= */

    it("should register a user with avatar", async () => {
        const userWithAvatar = createMockUser({
            avatar: "/uploads/avatars/avatar-test.png"
        });

        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(userWithAvatar);

        const result = await authService.registerUser({
            name: "John",
            email: " JOHN@TEST.COM ",
            password: "Password123",
            avatar: "/uploads/avatars/avatar-test.png"
        });

        expect(User.create).toHaveBeenCalledWith({
            name: "John",
            email: "john@test.com",
            password: "hashed-password",
            avatar: "/uploads/avatars/avatar-test.png"
        });

        expect(result.user).toBe(userWithAvatar);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should throw if email already exists", async () => {
        User.findOne.mockResolvedValue(createMockUser());

        await expect(authService.registerUser({
            name: "John",
            email: "john@test.com",
            password: "Password123"
        })).rejects.toMatchObject({ statusCode: 409 });
    });
});
