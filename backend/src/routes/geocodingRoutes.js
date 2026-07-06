const express = require("express");
const router = express.Router();

const geocodingController = require("../controllers/locationController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");
const locationRateLimiter = require("../middlewares/rateLimiters/locationRateLimiter");
const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

const { searchLocationValidator } = require("../validators/locationValidator");

/* ==========================================================================
   Geocoding Routes

   Defines geocoding endpoints.

   Responsibilities
   - Search locations for authenticated users
   - Search locations for public endpoints
   - Protect the geocoding provider with rate limiting

   Notes
   - Authenticated search is intended for application usage.
   - Public search is intended for autocomplete and public pages.
   - Both routes share the same validation and controller logic.
=========================================================================== */

/* Authenticated search */

router.get(
    "/search",
    authenticateToken,
    locationRateLimiter,
    searchLocationValidator,
    handleValidationErrors,
    geocodingController.searchLocations
);

/* Public search */

router.get(
    "/public-search",
    locationRateLimiter,
    searchLocationValidator,
    handleValidationErrors,
    geocodingController.searchLocations
);

module.exports = router;
