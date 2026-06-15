const express = require("express");
const router = express.Router();

const locationController = require("../controllers/locationController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");
const locationRateLimiter = require("../middlewares/rateLimiters/locationRateLimiter");

const { searchLocationValidator } = require("../validators/locationValidator");

const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

/* ==================================================
   LOCATION ROUTES

   Handles:
   - authenticated location search (internal app usage)
   - public location search (autocomplete / maps)
   - geocoding via provider with caching layer

   Notes:
   - /search is protected for internal usage (dashboard / trusted usage)
   - /public-search is rate limited but accessible for public pages
   - both routes share same validation + controller logic
================================================== */

/* =============================
   AUTHENTICATED LOCATION SEARCH
============================= */

// Internal location search (dashboard / app usage)
router.get(
    "/search",
    authenticateToken,
    locationRateLimiter,
    searchLocationValidator,
    handleValidationErrors,
    locationController.searchLocations
);

/* =============================
   PUBLIC LOCATION SEARCH
============================= */

// Public location search (maps / autocomplete / public events)
router.get(
    "/public-search",
    locationRateLimiter,
    searchLocationValidator,
    handleValidationErrors,
    locationController.searchLocations
);

module.exports = router;
