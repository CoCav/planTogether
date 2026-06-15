/* ==================================================
   LOCATION RATE LIMITER TESTS

   Tests:
   - middleware existence
================================================== */

const locationRateLimiter = require("../../../../src/middlewares/rateLimiters/locationRateLimiter");

describe("locationRateLimiter", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should be a middleware function", () => {
        expect(typeof locationRateLimiter).toBe("function");
    });
});
