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

const DEFAULT_GEOCODING_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const DEFAULT_GEOCODING_RATE_LIMIT_MAX = 30;

const GEOCODING_RATE_LIMIT_MESSAGE = "Too many location requests. Please try again later.";

const geocodingRateLimiter = createRateLimiter({
    windowMs: Number(
        process.env.GEOCODING_RATE_LIMIT_WINDOW_MS ||
        DEFAULT_GEOCODING_RATE_LIMIT_WINDOW_MS
    ),
    max: Number(
        process.env.GEOCODING_RATE_LIMIT_MAX ||
        DEFAULT_GEOCODING_RATE_LIMIT_MAX
    ),
    message: GEOCODING_RATE_LIMIT_MESSAGE
});

module.exports = geocodingRateLimiter;
