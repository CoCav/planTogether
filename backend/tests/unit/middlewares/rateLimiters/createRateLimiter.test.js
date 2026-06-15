/* ==================================================
   CREATE RATE LIMITER TESTS

   Tests:
   - factory creation
   - config passing
================================================== */

const createRateLimiter = require("../../../../src/middlewares/rateLimiters/createRateLimiter");

describe("createRateLimiter", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return a middleware function", () => {
        const limiter = createRateLimiter({
            windowMs: 1000,
            max: 1,
            message: "test"
        });

        expect(typeof limiter).toBe("function");
    });

    it("should accept custom configuration", () => {
        const limiter = createRateLimiter({
            windowMs: 2000,
            max: 5,
            message: "custom"
        });

        expect(limiter).toBeDefined();
    });
});
