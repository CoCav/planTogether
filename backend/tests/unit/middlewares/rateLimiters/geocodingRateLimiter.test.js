const mockCreateRateLimiter = jest.fn(() => jest.fn());

const loadGeocodingRateLimiter = () => {
    jest.resetModules();

    return require("../../../../src/middlewares/rateLimiters/geocodingRateLimiter");
};

/* ==========================================================================
   Geocoding Rate Limiter Middleware Unit Tests

   Tests geocoding-specific rate limiter configuration.

   Responsibilities
   - Test default geocoding rate limit settings
   - Test configured geocoding rate limit settings
   - Test geocoding rate limit response message
   - Test limiter middleware export

   Notes
   - createRateLimiter is mocked.
   - Environment-dependent configuration is tested through module reloads.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock(
    "../../../../src/middlewares/rateLimiters/createRateLimiter",
    () => mockCreateRateLimiter
);

describe("geocoding rate limiter middleware", () => {
    const originalWindowMs = process.env.GEOCODING_RATE_LIMIT_WINDOW_MS;
    const originalMax = process.env.GEOCODING_RATE_LIMIT_MAX;

    beforeEach(() => {
        jest.clearAllMocks();

        delete process.env.GEOCODING_RATE_LIMIT_WINDOW_MS;
        delete process.env.GEOCODING_RATE_LIMIT_MAX;

        mockCreateRateLimiter.mockReturnValue(
            jest.fn()
        );
    });

    afterEach(() => {
        process.env.GEOCODING_RATE_LIMIT_WINDOW_MS = originalWindowMs;
        process.env.GEOCODING_RATE_LIMIT_MAX = originalMax;

        jest.resetModules();
    });

    /* =============================
       DEFAULT CONFIGURATION
    ============================= */

    describe("Default configuration", () => {
        it("creates the geocoding limiter with default settings", () => {
            const limiter = loadGeocodingRateLimiter();

            expect(mockCreateRateLimiter).toHaveBeenCalledTimes(1);

            expect(mockCreateRateLimiter).toHaveBeenCalledWith({
                windowMs: 60 * 1000,
                max: 30,
                message: "Too many location requests. Please try again later."
            });

            expect(typeof limiter).toBe("function");
        });

        it("exports the middleware returned by createRateLimiter", () => {
            const rateLimiterMiddleware = jest.fn();

            mockCreateRateLimiter.mockReturnValue(rateLimiterMiddleware);

            const limiter = loadGeocodingRateLimiter();

            expect(limiter).toBe(rateLimiterMiddleware);
        });
    });

    /* =============================
       ENVIRONMENT CONFIGURATION
    ============================= */

    describe("Environment configuration", () => {
        it("uses configured geocoding rate limit settings", () => {
            process.env.GEOCODING_RATE_LIMIT_WINDOW_MS = "120000";

            process.env.GEOCODING_RATE_LIMIT_MAX = "50";

            loadGeocodingRateLimiter();

            expect(mockCreateRateLimiter).toHaveBeenCalledWith({
                windowMs: 120000,
                max: 50,
                message: "Too many location requests. Please try again later."
            });
        });

        it("converts configured values to numbers", () => {
            process.env.GEOCODING_RATE_LIMIT_WINDOW_MS = "30000";

            process.env.GEOCODING_RATE_LIMIT_MAX = "15";

            loadGeocodingRateLimiter();

            const options = mockCreateRateLimiter.mock.calls[0][0];

            expect(options.windowMs).toBe(30000);
            expect(options.max).toBe(15);

            expect(typeof options.windowMs).toBe("number");

            expect(typeof options.max).toBe("number");
        });
    });
});
