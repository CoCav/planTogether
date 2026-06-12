const express = require("express");
const router = express.Router();

const locationController = require("../controllers/locationController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");

const { searchLocationValidator } = require("../validators/locationValidator");

const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

/* ==================================================
   LOCATION ROUTES

   Handles:
   - authenticated location search from text query
   - map preview and future autocomplete support

   Notes:
   - search delegates cache/provider logic to locationService
   - location search requires authentication to limit provider abuse
================================================== */

/* =============================
   LOCATION SEARCH
============================= */

// Search locations by query text
router.get("/search",
    authenticateToken,
    searchLocationValidator,
    handleValidationErrors,
    locationController.searchLocations
);

module.exports = router;
