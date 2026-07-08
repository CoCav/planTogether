const geocodingService = require("../services/geocodingService");

/* ==========================================================================
   Geocoding Controller

   Handles geocoding responses.

   Responsibilities
   - Search locations
   - Return geocoding API responses

   Notes
   - Business logic is delegated to geocodingService.
   - Search results may come from cache or the geocoding provider.
=========================================================================== */

/* Search locations */

const searchLocations = async (req, res, next) => {
    try {
        const locations = await geocodingService.searchLocations(req.query.q);

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
