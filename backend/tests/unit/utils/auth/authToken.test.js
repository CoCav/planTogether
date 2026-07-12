const jwt = require("jsonwebtoken");

const { generateAuthToken } = require("../../../../src/utils/auth/authToken");

/* ==========================================================================
   Auth Token Utility Unit Tests

   Tests authentication token generation.

   Responsibilities
   - Test JWT payload generation
   - Test JWT secret forwarding
   - Test token expiration configuration
   - Test generated token return value

   Notes
   - JWT payload contains the authenticated user ID only.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("jsonwebtoken");

describe("auth token utility", () => {
    const originalJwtSecret = process.env.JWT_SECRET;

    beforeEach(() => {
        jest.clearAllMocks();

        process.env.JWT_SECRET = "test-secret";

        jwt.sign.mockReturnValue("fake-token");
    });

    afterEach(() => {
        process.env.JWT_SECRET = originalJwtSecret;
    });

    /* =============================
       TOKEN GENERATION
    ============================= */

    describe("generateAuthToken", () => {
        it("generates a signed token with the authenticated user ID", () => {
            const token = generateAuthToken(1);

            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    userId: 1
                },
                "test-secret",
                {
                    expiresIn: "24h"
                }
            );

            expect(token).toBe("fake-token");
        });

        it("forwards the provided user ID without modification", () => {
            generateAuthToken("42");

            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    userId: "42"
                },
                "test-secret",
                {
                    expiresIn: "24h"
                }
            );
        });
    });
});
