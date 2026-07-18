/* =============================
   MOCK FUNCTIONS
============================= */

const mockRateLimit = jest.fn(() => jest.fn());

/* =============================
   TEST MOCKS
============================= */

jest.mock("express-rate-limit", () => mockRateLimit);

/* =============================
   TEST IMPORTS
============================= */

const createRateLimiter = require("../../../../src/middlewares/rateLimiters/createRateLimiter");

/* ==========================================================================
   Create Rate Limiter Middleware Unit Tests

   Tests reusable rate limiter configuration.

   Responsibilities
   - Test default rate limiter options
   - Test custom rate limiter options
   - Test standard and legacy header configuration
   - Test rate limit error response formatting
   - Test automatic test environment skipping
   - Test explicit test skipping overrides

   Notes
   - express-rate-limit is mocked.
   - The returned skip function is tested independently.
=========================================================================== */

describe("create rate limiter middleware", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = "development";

        mockRateLimit.mockReturnValue(jest.fn());
    });

    afterAll(() => {
        process.env.NODE_ENV = originalNodeEnv;
    });

    /* =============================
       DEFAULT CONFIGURATION
    ============================= */

    describe("Default configuration", () => {
        it("creates a limiter with shared default options", () => {
            const limiter = createRateLimiter({});

            expect(mockRateLimit).toHaveBeenCalledTimes(1);
            expect(mockRateLimit).toHaveBeenCalledWith({
                windowMs: 60 * 1000,
                max: 30,
                standardHeaders: true,
                legacyHeaders: false,
                skip: expect.any(Function),
                message: {
                    success: false,
                    message: "Too many requests. Please try again later."
                }
            });

            expect(typeof limiter).toBe("function");
        });

        it("enables standard headers and disables legacy headers", () => {
            createRateLimiter({});

            const options = mockRateLimit.mock.calls[0][0];

            expect(options.standardHeaders).toBe(true);
            expect(options.legacyHeaders).toBe(false);
        });
    });

    /* =============================
       CUSTOM CONFIGURATION
    ============================= */

    describe("Custom configuration", () => {
        it("forwards custom rate limit options", () => {
            const limiter = createRateLimiter({
                windowMs: 5 * 60 * 1000,
                max: 5,
                message: "Custom rate limit message",
                skipTest: false
            });

            expect(mockRateLimit).toHaveBeenCalledWith({
                windowMs: 5 * 60 * 1000,
                max: 5,
                standardHeaders: true,
                legacyHeaders: false,
                skip: expect.any(Function),
                message: {
                    success: false,
                    message: "Custom rate limit message"
                }
            });

            expect(typeof limiter).toBe("function");
        });

        it("returns the middleware created by express-rate-limit", () => {
            const rateLimitMiddleware = jest.fn();

            mockRateLimit.mockReturnValue(rateLimitMiddleware);

            const result = createRateLimiter({
                max: 5
            });

            expect(result).toBe(rateLimitMiddleware);
        });
    });

    /* =============================
       TEST ENVIRONMENT SKIPPING
    ============================= */

    describe("Test environment skipping", () => {
        it("skips rate limiting in the test environment by default", () => {
            process.env.NODE_ENV = "test";

            createRateLimiter({});

            const { skip } = mockRateLimit.mock.calls[0][0];

            expect(skip()).toBe(true);
        });

        it("does not skip rate limiting outside the test environment", () => {
            process.env.NODE_ENV = "development";

            createRateLimiter({});

            const { skip } = mockRateLimit.mock.calls[0][0];

            expect(skip()).toBe(false);
        });

        it("does not skip in test when skipTest is disabled", () => {
            process.env.NODE_ENV = "test";

            createRateLimiter({
                skipTest: false
            });

            const { skip } = mockRateLimit.mock.calls[0][0];

            expect(skip()).toBe(false);
        });

        it("continues skipping when skipTest is explicitly enabled", () => {
            process.env.NODE_ENV = "test";

            createRateLimiter({
                skipTest: true
            });

            const { skip } = mockRateLimit.mock.calls[0][0];

            expect(skip()).toBe(true);
        });
    });
});
