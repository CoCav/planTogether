const { body, param, query } = require("express-validator");

/* ==================================================
   EVENT VALIDATORS

   Handles:
   - event ID param validation
   - event creation validation
   - event update validation
   - event filtering and pagination query validation

   Notes:
   - handleValidationErrors must run after these validators
   - update validators use optional fields
   - query validators support filtering + pagination
================================================== */


/* =============================
   EVENT PARAMS
============================= */

// Validate event ID route param
const eventIdParamValidator = [
    param("eventId")
        .isInt({ min: 1 }).withMessage("Event ID must be a positive integer")
        .toInt()
];

/* =============================
   EVENT PAYLOAD
============================= */

// Validate event creation payload
const createEventValidator = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required"),

    body("description")
        .trim()
        .notEmpty().withMessage("Description is required"),

    body("type")
        .trim()
        .notEmpty().withMessage("Type is required"),

    body("theme")
        .trim()
        .notEmpty().withMessage("Theme is required"),

    body("mode")
        .trim()
        .notEmpty().withMessage("Mode is required")
        .isIn(["online", "in_person"]).withMessage("Mode must be online or in_person"),

    body("location")
        .optional({ nullable: true })
        .trim()
        .custom((value, { req }) => {
            if (req.body.mode === "in_person" && !value?.trim()) {
                throw new Error("Location is required for in-person events");
            }

            return true;
        }),

    body("startDateTime")
        .notEmpty().withMessage("Start date and time is required")
        .isISO8601().withMessage("Start date and time must be a valid ISO8601 date"),

    body("endDateTime")
        .notEmpty().withMessage("End date and time is required")
        .isISO8601().withMessage("End date and time must be a valid ISO8601 date")
        .custom((value, { req }) => {
            const start = new Date(req.body.startDateTime);
            const end = new Date(value);

            if (end <= start) {
                throw new Error("End date and time must be after start date and time");
            }

            return true;
        }),

    body("maxParticipants")
        .optional()
        .isInt({ min: 1 }).withMessage("Max participants must be a positive integer"),

    body("registrationDeadline")
        .optional()
        .isISO8601().withMessage("Registration deadline must be a valid ISO8601 date")
        .custom((value, { req }) => {
            if (!value || !req.body.startDateTime) return true;

            const deadline = new Date(value);
            const start = new Date(req.body.startDateTime);

            if (deadline >= start) {
                throw new Error("Registration deadline must be before event start date");
            }

            return true;
        })
];

// Validate event update payload
const updateEventValidator = [
    body("title")
        .optional()
        .trim()
        .notEmpty().withMessage("Title cannot be empty"),

    body("description")
        .optional()
        .trim()
        .notEmpty().withMessage("Description cannot be empty"),

    body("type")
        .optional()
        .trim()
        .notEmpty().withMessage("Type is required"),

    body("theme")
        .optional()
        .trim()
        .notEmpty().withMessage("Theme is required"),

    body("mode")
        .optional()
        .trim()
        .isIn(["online", "in_person"]).withMessage("Mode must be online or in_person"),

    body("location")
        .optional({ nullable: true })
        .trim()
        .custom((value, { req }) => {
            if (req.body.mode === "in_person" && !value?.trim()) {
                throw new Error("Location is required for in-person events");
            }

            return true;
        }),

    body("startDateTime")
        .notEmpty().withMessage("Start date and time is required")
        .isISO8601().withMessage("Start date and time must be a valid ISO8601 date"),

    body("endDateTime")
        .notEmpty().withMessage("End date and time is required")
        .isISO8601().withMessage("End date and time must be a valid ISO8601 date")
        .custom((value, { req }) => {
            const start = new Date(req.body.startDateTime);
            const end = new Date(value);

            if (end <= start) {
                throw new Error("End date and time must be after start date and time");
            }

            return true;
        }),

    body("maxParticipants")
        .optional()
        .isInt({ min: 1 }).withMessage("Max participants must be a positive integer"),

    body("registrationDeadline")
        .optional()
        .isISO8601().withMessage("Registration deadline must be a valid ISO8601 date")
        .custom((value, { req }) => {
            if (!value || !req.body.startDateTime) return true;

            const deadline = new Date(value);
            const start = new Date(req.body.startDateTime);

            if (deadline >= start) {
                throw new Error("Registration deadline must be before event start date");
            }

            return true;
        })
];


/* =============================
   EVENT QUERY FILTERS
============================= */

// Validate event listing query params
const getAllEventsValidator = [
    query("creatorId")
        .optional()
        .isInt({ min: 1 }).withMessage("Creator ID must be a positive integer"),

    query("search")
        .optional()
        .trim(),

    query("type")
        .optional()
        .trim(),

    query("theme")
        .optional()
        .trim(),

    query("mode")
        .optional()
        .isIn(["online", "in_person"]).withMessage("Mode must be online or in_person"),

    query("location")
        .optional()
        .trim(),

    query("date")
        .optional()
        .isISO8601().withMessage("Date must be a valid ISO8601 date"),

    query("startDate")
        .optional()
        .isISO8601().withMessage("Start date must be a valid ISO8601 date"),

    query("endDate")
        .optional()
        .isISO8601().withMessage("End date must be a valid ISO8601 date"),

    query("sortBy")
        .optional()
        .isIn(["startDateTime", "title", "creatorId", "createdAt"])
        .withMessage("Invalid sort field"),

    query("status")
        .optional()
        .isIn(["upcoming", "past"]).withMessage("Status must be upcoming or past"),

    query("page")
        .optional()
        .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

    query("pageSize")
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage("Page size must be between 1 and 100"),

    query("order")
        .optional()
        .isIn(["asc", "desc"]).withMessage("Order must be asc or desc")
];

module.exports = { eventIdParamValidator, createEventValidator, updateEventValidator, getAllEventsValidator };
