/* ==================================================
   AUTH TOKEN UTILITY TESTS

   Tests:
   - JWT token generation
   - userId payload forwarding
   - token expiration option

   Ensures:
   - auth tokens are generated consistently
   - JWT payload and options remain centralized
================================================== */
jest.mock("jsonwebtoken");

const jwt = require("jsonwebtoken");

const { generateAuthToken } = require("../../../../src/utils/auth/authToken");

describe("authToken utils", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        process.env.JWT_SECRET = "test-secret";

        jwt.sign.mockReturnValue("fake-token");
    });

    it("should generate auth token with userId payload", () => {
        const token = generateAuthToken(1);

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: 1 },
            "test-secret",
            { expiresIn: "24h" }
        );

        expect(token).toBe("fake-token");
    });
});
