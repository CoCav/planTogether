const rateLimit = require("express-rate-limit");

/* ==================================================
   AUTH RATE LIMITER

   Handles:
   - limiting repeated authentication attempts
   - protecting login and registration endpoints

   Notes:
   - applies only to sensitive auth routes
   - skipped during automated test suites
   - returns API-consistent JSON errors
================================================== */

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
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
