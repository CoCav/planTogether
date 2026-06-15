/* ==================================================
   AUTH RATE LIMITER TESTS

   Tests:
   - middleware existence
================================================== */

const authRateLimiter = require("../../../../src/middlewares/rateLimiters/authRateLimiter");

describe("authRateLimiter", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should be a middleware function", () => {
        expect(typeof authRateLimiter).toBe("function");
    });
});
