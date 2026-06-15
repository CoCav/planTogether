const createRateLimiter = require("./createRateLimiter");

/* ==================================================
   AUTH RATE LIMITER

   Handles:
   - login / register brute-force protection
================================================== */

const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many authentication attempts. Please try again later."
});

module.exports = authRateLimiter;
