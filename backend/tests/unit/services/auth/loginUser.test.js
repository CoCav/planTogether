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

jest.mock("bcrypt");

jest.mock("../../../../src/utils/auth/authToken", () => ({
    generateAuthToken: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({
    scope: jest.fn()
}));

const bcrypt = require("bcrypt");
const { generateAuthToken } = require("../../../../src/utils/auth/authToken");

const User = require("../../../../src/models/userModel");
const authService = require("../../../../src/services/authService");

const { createMockUser } = require("../../../factories/userFactory");

describe("authService - loginUser", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        generateAuthToken.mockReturnValue("token");
    });

    /* =============================
       LOGIN SUCCESS
    ============================= */

    it("should login user and return token", async () => {
        const scoped = {
            findOne: jest.fn().mockResolvedValue(createMockUser())
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
            findOne: jest.fn().mockResolvedValue(createMockUser())
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
            findOne: jest.fn().mockResolvedValue(createMockUser())
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
        const mockUser = createMockUser({
            id: 1
        });

        const scoped = {
            findOne: jest.fn().mockResolvedValue(mockUser)
        };

        User.scope.mockReturnValue(scoped);

        bcrypt.compare.mockResolvedValue(true);

        await authService.loginUser({
            email: "john@test.com",
            password: "Password123"
        });

        expect(generateAuthToken).toHaveBeenCalledWith(mockUser.id);
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
