const createRateLimiter = require("./createRateLimiter");

/* ==========================================================================
   Auth Rate Limiter

   Protects authentication routes from brute-force attempts.

   Responsibilities
   - Limit login and registration attempts
   - Use authentication-specific rate limit settings

   Notes
   - AUTH_RATE_LIMIT_WINDOW_MS and AUTH_RATE_LIMIT_MAX can be configured in .env.
=========================================================================== */

/* =============================
   RATE LIMIT DEFAULTS
============================= */

// Default authentication rate limit window
const DEFAULT_AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

// Default number of authentication attempts per window
const DEFAULT_AUTH_RATE_LIMIT_MAX = 10;

/* =============================
   RATE LIMIT MESSAGE
============================= */

const AUTH_RATE_LIMIT_MESSAGE = "Too many authentication attempts. Please try again later.";

/* =============================
   AUTH RATE LIMITER
============================= */

// Configure rate limiting for authentication routes
const authRateLimiter = createRateLimiter({
    windowMs: Number(
        process.env.AUTH_RATE_LIMIT_WINDOW_MS ||
        DEFAULT_AUTH_RATE_LIMIT_WINDOW_MS
    ),
    max: Number(
        process.env.AUTH_RATE_LIMIT_MAX ||
        DEFAULT_AUTH_RATE_LIMIT_MAX
    ),
    message: AUTH_RATE_LIMIT_MESSAGE
});

module.exports = authRateLimiter;
