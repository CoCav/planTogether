const { body } = require("express-validator");

const { EVENT_MODES, VALID_EVENT_MODES } = require("../constants/eventModes");
const { EVENT_ADMIN_SORT_FIELDS } = require("../constants/eventSortFields");

const { eventIdParamValidator } = require("./shared/paramsValidators");
const { pageQueryValidator, pageSizeQueryValidator } = require("./shared/paginationValidators");
const { orderQueryValidator, createSortByValidator } = require("./shared/sortValidators");
const { structuredLocationValidators } = require("./shared/geocodingValidators");
const {
    statusQueryValidator,
    modeQueryValidator,
    creatorIdQueryValidator,
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
} = require("./shared/queryValidators");

/* ==========================================================================
   Event Validators

   Validates event request params, payloads and query filters.

   Responsibilities
   - Validate event IDs
   - Validate event creation payloads
   - Validate event update payloads
   - Validate structured location payloads
   - Validate event listing filters and pagination

   Notes
   - handleValidationErrors must run after these validators.
   - Update validators allow clearing nullable optional fields.
   - Event-specific business validation stays in this file.
=========================================================================== */

const LOCATION_REQUIRED_MESSAGE = "Location is required for in-person events";
const END_AFTER_START_MESSAGE = "End date and time must be after start date and time";
const DEADLINE_BEFORE_START_MESSAGE = "Registration deadline must be before event start date";

const createLocationValidator = () => {
    return body("location")
        .optional({ nullable: true })
        .trim()
        .custom((value, { req }) => {
            if (req.body.mode === EVENT_MODES.IN_PERSON && !value?.trim()) {
                throw new Error(LOCATION_REQUIRED_MESSAGE);
            }

            return true;
        });
};

const validateEndAfterStart = (value, { req }) => {
    const start = new Date(req.body.startDateTime);
    const end = new Date(value);

    if (end <= start) {
        throw new Error(END_AFTER_START_MESSAGE);
    }

    return true;
};

const validateDeadlineBeforeStart = (value, { req }) => {
    if (!value || !req.body.startDateTime) return true;

    const deadline = new Date(value);
    const start = new Date(req.body.startDateTime);

    if (deadline >= start) {
        throw new Error(DEADLINE_BEFORE_START_MESSAGE);
    }

    return true;
};

/* Event payload */

const createEventValidator = [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("type").trim().notEmpty().withMessage("Type is required"),
    body("theme").trim().notEmpty().withMessage("Theme is required"),

    body("mode")
        .trim()
        .notEmpty()
        .withMessage("Mode is required")
        .isIn(VALID_EVENT_MODES)
        .withMessage("Mode must be online or in_person"),

    createLocationValidator(),
    ...structuredLocationValidators,

    body("startDateTime")
        .notEmpty()
        .withMessage("Start date and time is required")
        .isISO8601()
        .withMessage("Start date and time must be a valid ISO8601 date"),

    body("endDateTime")
        .notEmpty()
        .withMessage("End date and time is required")
        .isISO8601()
        .withMessage("End date and time must be a valid ISO8601 date")
        .custom(validateEndAfterStart),

    body("maxParticipants")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Max participants must be a positive integer"),

    body("registrationDeadline")
        .optional()
        .isISO8601()
        .withMessage("Registration deadline must be a valid ISO8601 date")
        .custom(validateDeadlineBeforeStart)
];

const updateEventValidator = [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
    body("type").optional().trim().notEmpty().withMessage("Type is required"),
    body("theme").optional().trim().notEmpty().withMessage("Theme is required"),

    body("mode")
        .optional()
        .trim()
        .isIn(VALID_EVENT_MODES)
        .withMessage("Mode must be online or in_person"),

    createLocationValidator(),
    ...structuredLocationValidators,

    body("startDateTime")
        .optional()
        .notEmpty()
        .withMessage("Start date and time is required")
        .isISO8601()
        .withMessage("Start date and time must be a valid ISO8601 date"),

    body("endDateTime")
        .optional()
        .notEmpty()
        .withMessage("End date and time is required")
        .isISO8601()
        .withMessage("End date and time must be a valid ISO8601 date")
        .custom(validateEndAfterStart),

    body("maxParticipants")
        .optional({ values: "undefined" })
        .customSanitizer((value) => value === "" ? null : value)
        .custom((value) => {
            if (value === null) return true;

            if (!Number.isInteger(Number(value)) || Number(value) < 1) {
                throw new Error("Max participants must be a positive integer");
            }

            return true;
        }),

    body("registrationDeadline")
        .optional({ values: "undefined" })
        .customSanitizer((value) => value === "" ? null : value)
        .custom((value) => {
            if (value === null) return true;

            if (Number.isNaN(new Date(value).getTime())) {
                throw new Error("Registration deadline must be a valid ISO8601 date");
            }

            return true;
        })
        .custom(validateDeadlineBeforeStart)
];

/* Event query filters */

const getAllEventsValidator = [
    creatorIdQueryValidator,
    searchQueryValidator,
    typeQueryValidator,
    themeQueryValidator,
    modeQueryValidator,
    locationQueryValidator,
    cityQueryValidator,
    regionQueryValidator,
    countryQueryValidator,
    dateQueryValidator,
    startDateQueryValidator,
    endDateQueryValidator,

    createSortByValidator(EVENT_ADMIN_SORT_FIELDS),
    statusQueryValidator,
    pageQueryValidator,
    pageSizeQueryValidator,
    orderQueryValidator
];

module.exports = {
    eventIdParamValidator,
    createEventValidator,
    updateEventValidator,
    getAllEventsValidator
};
