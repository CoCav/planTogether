const createRateLimiter = require("./createRateLimiter");

/* ==========================================================================
   Location Rate Limiter

   Protects location search routes from excessive provider requests.

   Responsibilities
   - Limit location search requests
   - Protect autocomplete and map-related endpoints
   - Use location-specific rate limit settings

   Notes
   - LOCATION_RATE_LIMIT_WINDOW_MS and LOCATION_RATE_LIMIT_MAX can be configured in .env.
=========================================================================== */

const DEFAULT_LOCATION_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const DEFAULT_LOCATION_RATE_LIMIT_MAX = 30;

const LOCATION_RATE_LIMIT_MESSAGE =
    "Too many location requests. Please try again later.";

const locationRateLimiter = createRateLimiter({
    windowMs: Number(
        process.env.LOCATION_RATE_LIMIT_WINDOW_MS ||
        DEFAULT_LOCATION_RATE_LIMIT_WINDOW_MS
    ),
    max: Number(
        process.env.LOCATION_RATE_LIMIT_MAX ||
        DEFAULT_LOCATION_RATE_LIMIT_MAX
    ),
    message: LOCATION_RATE_LIMIT_MESSAGE
});

module.exports = locationRateLimiter;
