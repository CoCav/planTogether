const rateLimit = require("express-rate-limit");

/* ==================================================
   AUTH RATE LIMITER

   Handles:
   - limiting repeated authentication attempts
   - protecting login and registration endpoints
   - environment-based rate limit configuration

   Notes:
   - applies only to sensitive auth routes
   - skipped during automated test suites
   - rate limit values are configurable through environment variables
   - returns API-consistent JSON errors
================================================== */

const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const max = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10;

const authRateLimiter = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    // Avoid rate limit interference during automated test suites
    skip: () => process.env.NODE_ENV === "test",

    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later."
    }
});

module.exports = authRateLimiter;
