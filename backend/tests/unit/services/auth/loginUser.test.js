/* ==================================================
   AUTH SERVICE - LOGIN USER TESTS

   Tests:
   - successful login
   - email normalization
   - invalid password rejection
   - JWT token generation
   - unknown email rejection

   Ensures:
   - credentials are validated correctly
   - emails are normalized before querying users
   - JWT tokens are generated after authentication
   - invalid login attempts are rejected
================================================== */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../../../src/models/userModel");

const authService = require("../../../../src/services/authService");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

jest.mock("../../../../src/models/userModel", () => ({
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

        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    /* =============================
       LOGIN SUCCESS
    ============================= */

    it("should login user and return token", async () => {
        const scoped = {
            findOne: jest.fn().mockResolvedValue(mockUser)
        };

        User.scope.mockReturnValue(scoped);

        bcrypt.compare.mockResolvedValue(true);

        const result = await authService.loginUser({
            email: " JOHN@TEST.COM ",
            password: "Password123"
        });

        expect(result.token).toBe("token");
    });

    /* =============================
       EMAIL NORMALIZATION
    ============================= */

    it("should normalize email before querying database", async () => {
        const scoped = {
            findOne: jest.fn().mockResolvedValue(mockUser)
        };

        User.scope.mockReturnValue(scoped);

        bcrypt.compare.mockResolvedValue(true);

        await authService.loginUser({
            email: " JOHN@TEST.COM ",
            password: "Password123"
        });

        expect(scoped.findOne).toHaveBeenCalledWith({
            where: {
                email: "john@test.com"
            }
        });
    });

    /* =============================
       PASSWORD VERIFICATION
    ============================= */

    it("should throw if password is invalid", async () => {
        User.scope.mockReturnValue({
            findOne: jest.fn().mockResolvedValue(mockUser)
        });

        bcrypt.compare.mockResolvedValue(false);

        await expect(authService.loginUser({
            email: "x",
            password: "x"
        })).rejects.toMatchObject({
            statusCode: 401
        });
    });

    /* =============================
       TOKEN GENERATION
    ============================= */

    it("should generate JWT token with userId payload", async () => {
        const scoped = {
            findOne: jest.fn().mockResolvedValue(mockUser)
        };

        User.scope.mockReturnValue(scoped);

        bcrypt.compare.mockResolvedValue(true);

        await authService.loginUser({
            email: "john@test.com",
            password: "Password123"
        });

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: mockUser.id },
            "test-secret",
            { expiresIn: "24h" }
        );
    });


    /* =============================
       BUSINESS RULES
    ============================= */

    it("should throw if user is not found", async () => {
        User.scope.mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null)
        });

        await expect(authService.loginUser({
            email: "x",
            password: "x"
        })).rejects.toMatchObject({
            statusCode: 401
        });
    });
});
