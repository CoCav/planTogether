const createRateLimiter = require("./createRateLimiter");

/* ==================================================
   LOCATION RATE LIMITER

   Handles:
   - location search abuse protection
   - autocomplete + map endpoints safety
================================================== */

const locationRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: "Too many location requests. Please try again later."
});

module.exports = locationRateLimiter;
