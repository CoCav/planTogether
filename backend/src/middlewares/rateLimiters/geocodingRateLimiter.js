const createRateLimiter = require("./createRateLimiter");

/* ==========================================================================
   Geocoding Rate Limiter

   Protects geocoding routes from excessive provider requests.

   Responsibilities
   - Limit geocoding search requests
   - Protect autocomplete and map-related endpoints
   - Use geocoding-specific rate limit settings

   Notes
   - GEOCODING_RATE_LIMIT_WINDOW_MS and GEOCODING_RATE_LIMIT_MAX can be configured in .env.
=========================================================================== */

/* =============================
   RATE LIMIT DEFAULTS
============================= */

// Default geocoding rate limit window
const DEFAULT_GEOCODING_RATE_LIMIT_WINDOW_MS = 60 * 1000;

// Default number of geocoding requests per window
const DEFAULT_GEOCODING_RATE_LIMIT_MAX = 30;

/* =============================
   RATE LIMIT MESSAGE
============================= */
const GEOCODING_RATE_LIMIT_MESSAGE = "Too many location requests. Please try again later.";


/* =============================
   GEOCODING RATE LIMITER
============================= */

// Configure rate limiting for geocoding routes
const geocodingRateLimiter = createRateLimiter({
    windowMs: Number(process.env.GEOCODING_RATE_LIMIT_WINDOW_MS || DEFAULT_GEOCODING_RATE_LIMIT_WINDOW_MS),
    max: Number(process.env.GEOCODING_RATE_LIMIT_MAX || DEFAULT_GEOCODING_RATE_LIMIT_MAX),
    message: GEOCODING_RATE_LIMIT_MESSAGE
});

module.exports = geocodingRateLimiter;
