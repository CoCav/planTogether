const rateLimit = require("express-rate-limit");

/* ==================================================
   CREATE RATE LIMITER

   Factory that builds reusable rate limit middleware
================================================== */

const createRateLimiter = ({
    windowMs = 60 * 1000,
    max = 30,
    message = "Too many requests. Please try again later.",
    skipTest = true
}) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,

        skip: () => skipTest && process.env.NODE_ENV === "test",

        message: {
            success: false,
            message
        }
    });
};

module.exports = createRateLimiter;
