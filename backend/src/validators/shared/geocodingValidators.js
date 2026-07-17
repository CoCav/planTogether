const { body } = require("express-validator");

/* ==========================================================================
   Shared Geocoding Validators

   Provides reusable geocoding-related validators.

   Responsibilities
   - Validate optional structured location fields
   - Validate latitude and longitude bounds

   Notes
   - These validators validate internal structured location payloads.
   - Provider lookup and location resolution are handled by services.
=========================================================================== */

/* =============================
   COORDINATE BOUNDS
============================= */

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;

const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

/* =============================
   STRUCTURED LOCATION VALIDATION
============================= */

// Validate optional structured address and coordinate fields
const structuredLocationValidators = [
    body("locationLabel")
        .optional({ nullable: true })
        .trim(),

    body("streetAddress")
        .optional({ nullable: true })
        .trim(),

    body("city")
        .optional({ nullable: true })
        .trim(),

    body("region")
        .optional({ nullable: true })
        .trim(),

    body("postalCode")
        .optional({ nullable: true })
        .trim(),

    body("country")
        .optional({ nullable: true })
        .trim(),

    body("latitude")
        .optional({ nullable: true })
        .isFloat({
            min: MIN_LATITUDE,
            max: MAX_LATITUDE
        })
        .withMessage("Latitude must be between -90 and 90")
        .toFloat(),

    body("longitude")
        .optional({ nullable: true })
        .isFloat({
            min: MIN_LONGITUDE,
            max: MAX_LONGITUDE
        })
        .withMessage("Longitude must be between -180 and 180")
        .toFloat()
];

module.exports = {
    structuredLocationValidators
};
