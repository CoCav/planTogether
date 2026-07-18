/* =============================
   MOCK FUNCTIONS
============================= */

const mockCreateRateLimiter = jest.fn(() => jest.fn());

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/middlewares/rateLimiters/createRateLimiter", () => mockCreateRateLimiter);

/* =============================
   TEST HELPERS
============================= */

const loadAuthRateLimiter = () => {
    jest.resetModules();

    return require("../../../../src/middlewares/rateLimiters/authRateLimiter");
};

/* ==========================================================================
   Auth Rate Limiter Middleware Unit Tests

   Tests authentication-specific rate limiter configuration.

   Responsibilities
   - Test default authentication rate limit settings
   - Test configured authentication rate limit settings
   - Test authentication rate limit response message
   - Test limiter middleware export

   Notes
   - createRateLimiter is mocked.
   - Environment-dependent configuration is tested through module reloads.
=========================================================================== */

describe("auth rate limiter middleware", () => {
    const originalWindowMs = process.env.AUTH_RATE_LIMIT_WINDOW_MS;
    const originalMax = process.env.AUTH_RATE_LIMIT_MAX;

    beforeEach(() => {
        jest.clearAllMocks();

        delete process.env.AUTH_RATE_LIMIT_WINDOW_MS;
        delete process.env.AUTH_RATE_LIMIT_MAX;

        mockCreateRateLimiter.mockReturnValue(jest.fn());
    });

    afterEach(() => {
        process.env.AUTH_RATE_LIMIT_WINDOW_MS = originalWindowMs;
        process.env.AUTH_RATE_LIMIT_MAX = originalMax;

        jest.resetModules();
    });

    /* =============================
       DEFAULT CONFIGURATION
    ============================= */

    describe("Default configuration", () => {
        it("creates the authentication limiter with default settings", () => {
            const limiter = loadAuthRateLimiter();

            expect(mockCreateRateLimiter).toHaveBeenCalledTimes(1);

            expect(mockCreateRateLimiter).toHaveBeenCalledWith({
                windowMs: 15 * 60 * 1000,
                max: 10,
                message: "Too many authentication attempts. Please try again later."
            });

            expect(typeof limiter).toBe("function");
        });

        it("exports the middleware returned by createRateLimiter", () => {
            const rateLimiterMiddleware = jest.fn();

            mockCreateRateLimiter.mockReturnValue(rateLimiterMiddleware);

            const limiter = loadAuthRateLimiter();

            expect(limiter).toBe(rateLimiterMiddleware);
        });
    });

    /* =============================
       ENVIRONMENT CONFIGURATION
    ============================= */

    describe("Environment configuration", () => {
        it("uses configured authentication rate limit settings", () => {
            process.env.AUTH_RATE_LIMIT_WINDOW_MS = "300000";
            process.env.AUTH_RATE_LIMIT_MAX = "25";

            loadAuthRateLimiter();

            expect(mockCreateRateLimiter).toHaveBeenCalledWith({
                windowMs: 300000,
                max: 25,
                message: "Too many authentication attempts. Please try again later."
            });
        });

        it("converts configured values to numbers", () => {
            process.env.AUTH_RATE_LIMIT_WINDOW_MS = "60000";
            process.env.AUTH_RATE_LIMIT_MAX = "5";

            loadAuthRateLimiter();

            const options = mockCreateRateLimiter.mock.calls[0][0];

            expect(options.windowMs).toBe(60000);
            expect(options.max).toBe(5);

            expect(typeof options.windowMs).toBe("number");
            expect(typeof options.max).toBe("number");
        });
    });
});
