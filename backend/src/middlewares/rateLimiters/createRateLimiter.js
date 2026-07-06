const rateLimit = require("express-rate-limit");

/* ==========================================================================
   Create Rate Limiter

   Builds reusable rate limit middlewares.

   Responsibilities
   - Configure shared rate limit defaults
   - Return express-rate-limit middlewares
   - Skip rate limiting in test environment by default
   - Return consistent JSON error responses

   Notes
   - Domain-specific rate limiters can override defaults.
   - Test skipping avoids unstable or slow automated tests.
=========================================================================== */

const TEST_ENV = "test";

const DEFAULT_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX = 30;
const DEFAULT_RATE_LIMIT_MESSAGE = "Too many requests. Please try again later.";

const createRateLimiter = ({
    windowMs = DEFAULT_RATE_LIMIT_WINDOW_MS,
    max = DEFAULT_RATE_LIMIT_MAX,
    message = DEFAULT_RATE_LIMIT_MESSAGE,
    skipTest = true
}) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,

        skip: () => skipTest && process.env.NODE_ENV === TEST_ENV,

        message: {
            success: false,
            message
        }
    });
};

module.exports = createRateLimiter;
