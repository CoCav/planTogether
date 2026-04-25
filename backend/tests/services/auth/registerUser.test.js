const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../../src/models/userModel");

const authService = require("../../../src/services/authService");

/**
 * Auth Service - Register User
 *
 * Tests user registration logic.
 *
 * Ensures users are correctly created and validation rules
 * are enforced at the service level.
*/

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

jest.mock("../../../src/models/userModel", () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));

describe("authService - registerUser", () => {
    const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@test.com"
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "test-secret";

        bcrypt.hash.mockResolvedValue("hashed-password");
        jwt.sign.mockReturnValue("fake-token");
    });

    it("should register a user and return token", async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(mockUser);

        const result = await authService.registerUser({
            name: "John",
            email: " JOHN@TEST.COM ",
            password: "Password123"
        });

        expect(User.findOne).toHaveBeenCalledWith({
            where: { email: "john@test.com" }
        });

        expect(result.token).toBe("fake-token");
        expect(result.user).toBe(mockUser);
    });

    it("should throw if email already exists", async () => {
        User.findOne.mockResolvedValue(mockUser);

        await expect(
            authService.registerUser({
                name: "John",
                email: "john@test.com",
                password: "Password123"
            })
        ).rejects.toMatchObject({ statusCode: 409 });
    });
});