const { body, param } = require('express-validator');

// Validator for creating a new event
const createEventValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),

    body("startDateTime")
        .notEmpty().withMessage("Start date and time is required")
        .isISO8601().withMessage("Start date and time must be a valid ISO 8601 date")
        .toDate(),

    body("endDateTime")
        .notEmpty().withMessage("End date and time is required")
        .isISO8601().withMessage("End date and time must be a valid ISO 8601 date")
        .toDate()
        .custom((value, { req }) => {
            const start = new Date(req.body.startDateTime);
            const end = new Date(value);

            if (end < start) {
                throw new Error("End date and time must be after start date and time");
            }

            return true;
        }),

    body('description')
        .trim()
        .notEmpty().withMessage("Description is required")
        .isString().withMessage('Description must be a string'),

    body("mode")
        .notEmpty().withMessage("Mode is required")
        .isIn(["online", "in_person"]).withMessage("Mode must be either online or in_person"),

    body("location")
        .optional({ nullable: true })
        .trim()
        .isString().withMessage("Location must be a string")
        .custom((value, { req }) => {
            if (req.body.mode === "in_person" && !value?.trim()) {
                throw new Error("Location is required for in-person events");
            }
            return true;
        }),

    body('type')
        .trim()
        .notEmpty().withMessage("Type is required")
        .isString().withMessage('Type must be a string'),

    body('theme')
        .trim()
        .notEmpty().withMessage("Theme is required")
        .isString().withMessage('Theme must be a string'),
];

// Validator for updating an existing event
const updateEventValidator = [
    param('eventId')
        .isInt()
        .withMessage('ID of the event must be an integer')
        .toInt(),

    body('title')
        .optional()
        .trim()
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),

    body("startDateTime")
        .notEmpty().withMessage("Start date and time is required")
        .isISO8601().withMessage("Start date and time must be a valid ISO 8601 date")
        .toDate(),

    body("endDateTime")
        .notEmpty().withMessage("End date and time is required")
        .isISO8601().withMessage("End date and time must be a valid ISO 8601 date")
        .toDate()
        .custom((value, { req }) => {
            const start = new Date(req.body.startDateTime);
            const end = new Date(value);

            if (end < start) {
                throw new Error("End date and time must be after start date and time");
            }

            return true;
        }),

    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .trim(),

    body("mode")
        .notEmpty().withMessage("Mode is required")
        .isIn(["online", "in_person"]).withMessage("Mode must be either online or in_person"),

    body("location")
        .optional({ nullable: true })
        .trim()
        .isString().withMessage("Location must be a string")
        .custom((value, { req }) => {
            if (req.body.mode === "in_person" && !value?.trim()) {
                throw new Error("Location is required for in-person events");
            }
            return true;
        }),

    body('type')
        .optional()
        .trim()
        .isString().withMessage('Type must be a string'),

    body('theme')
        .optional()
        .trim()
        .isString().withMessage('Theme must be a string')
];

// Validator for eventId parameter
const eventIdParamValidator = [
    param('eventId')
       .isInt().withMessage('Event ID must be an integer')
        .toInt()
];

module.exports = { createEventValidator, updateEventValidator, eventIdParamValidator };