const { query } = require("express-validator");

const { VALID_EVENT_MODES } = require("../../constants/eventModes");
const { VALID_EVENT_STATUS } = require("../../constants/eventStatus");

/* ==========================================================================
   Shared Query Validators

   Provides reusable query parameter validators.

   Responsibilities
   - Validate search filters
   - Validate event filters
   - Validate date filters

   Notes
   - Validators only validate query parameter format.
   - Business rules are handled by services.
=========================================================================== */

/* =============================
   EVENT FILTER VALIDATORS
============================= */

const statusQueryValidator = query("status")
    .optional()
    .isIn(VALID_EVENT_STATUS)
    .withMessage("Status must be upcoming, ongoing or past");

const modeQueryValidator = query("mode")
    .optional()
    .isIn(VALID_EVENT_MODES)
    .withMessage("Mode must be online or in_person");

const creatorIdQueryValidator = query("creatorId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Creator ID must be a positive integer")
    .toInt();

/* =============================
   TEXT QUERY VALIDATORS
============================= */

const creatorQueryValidator = query("creator")
    .optional()
    .trim();

const searchQueryValidator = query("search")
    .optional()
    .trim();

const typeQueryValidator = query("type")
    .optional()
    .trim();

const themeQueryValidator = query("theme")
    .optional()
    .trim();

/* =============================
   LOCATION QUERY VALIDATORS
============================= */

const locationQueryValidator = query("location")
    .optional()
    .trim();

const cityQueryValidator = query("city")
    .optional()
    .trim();

const regionQueryValidator = query("region")
    .optional()
    .trim();

const countryQueryValidator = query("country")
    .optional()
    .trim();

/* =============================
   DATE QUERY VALIDATORS
============================= */

const dateQueryValidator = query("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date");

const startDateQueryValidator = query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO8601 date");

const endDateQueryValidator = query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO8601 date");

module.exports = {
    statusQueryValidator,
    modeQueryValidator,

    creatorIdQueryValidator,
    creatorQueryValidator,

    searchQueryValidator,

    typeQueryValidator,
    themeQueryValidator,

    locationQueryValidator,
    cityQueryValidator,
    regionQueryValidator,
    countryQueryValidator,

    dateQueryValidator,

    startDateQueryValidator,
    endDateQueryValidator
};
