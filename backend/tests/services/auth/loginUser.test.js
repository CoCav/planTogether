const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../../src/models/userModel");

const authService = require("../../../src/services/authService");

/**
 * Auth Service - Login User
 *
 * Tests authentication logic.
 *
 * Ensures credentials are validated and tokens are generated correctly.
*/

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

jest.mock("../../../src/models/userModel", () => ({
    scope: jest.fn()
}));

describe("authService - loginUser", () => {
    const mockUser = {
        id: 1,
        email: "john@test.com",
        password: "hashed"
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "test-secret";

        jwt.sign.mockReturnValue("token");
    });

    it("should login user", async () => {
        const scoped = { findOne: jest.fn().mockResolvedValue(mockUser) };
        User.scope.mockReturnValue(scoped);

        bcrypt.compare.mockResolvedValue(true);

        const result = await authService.loginUser({
            email: " JOHN@TEST.COM ",
            password: "Password123"
        });

        expect(result.token).toBe("token");
    });

    it("should throw if user not found", async () => {
        User.scope.mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null)
        });

        await expect(authService.loginUser({ email: "x", password: "x" })).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw if password invalid", async () => {
        User.scope.mockReturnValue({
            findOne: jest.fn().mockResolvedValue(mockUser)
        });

        bcrypt.compare.mockResolvedValue(false);

        await expect(authService.loginUser({ email: "x", password: "x" })).rejects.toMatchObject({ statusCode: 401 });
    });
});