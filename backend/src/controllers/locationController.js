const locationService = require("../services/locationService");

/* ==================================================
   LOCATION CONTROLLER

   Handles:
   - location search API requests
   - location response formatting

   Notes:
   - business logic is delegated to locationService
   - search returns multiple locations for future autocomplete support
================================================== */

/* =============================
   SEARCH LOCATIONS
============================= */

// Search locations from cache or provider
const searchLocations = async (req, res, next) => {
    try {
        const locations = await locationService.searchLocations(req.query.q);

        return res.status(200).json({
            success: true,
            message: "Locations retrieved successfully",
            locations
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = {
    searchLocations
};
