const { body, param } = require('express-validator');

// Validator to ensure registration deadline is before event start date and time
const registrationDeadlineValidator = (value, { req }) => {
    if (!value) return true;

    const deadline = new Date(value);
    const start = new Date(req.body.startDateTime);

    if (deadline >= start) {
        throw new Error('Registration deadline must be before the event start date and time');
    }

    return true;
};

// Validator for creating a new event
const createEventValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isString().withMessage('Description must be a string'),

    body('type')
        .trim()
        .notEmpty().withMessage('Type is required')
        .isString().withMessage('Type must be a string'),

    body('theme')
        .trim()
        .notEmpty().withMessage('Theme is required')
        .isString().withMessage('Theme must be a string'),

    body('mode')
        .notEmpty().withMessage('Mode is required')
        .isIn(['online', 'in_person']).withMessage('Mode must be either online or in_person'),

    body('location')
        .optional({ nullable: true })
        .trim()
        .isString().withMessage('Location must be a string')
        .custom((value, { req }) => {
            if (req.body.mode === 'in_person' && !value?.trim()) {
                throw new Error('Location is required for in-person events');
            }

            return true;
        }),

    body('startDateTime')
        .notEmpty().withMessage('Start date and time is required')
        .isISO8601().withMessage('Start date and time must be a valid ISO 8601 date')
        .toDate(),

    body('endDateTime')
        .notEmpty().withMessage('End date and time is required')
        .isISO8601().withMessage('End date and time must be a valid ISO 8601 date')
        .toDate()
        .custom((value, { req }) => {
            const start = new Date(req.body.startDateTime);
            const end = new Date(value);

            if (end <= start) {
                throw new Error('End date and time must be after start date and time');
            }

            return true;
        }),

    body('maxParticipants')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('Max participants must be a positive integer')
        .toInt(),

    body('registrationDeadline')
        .optional({ nullable: true })
        .isISO8601().withMessage('Registration deadline must be a valid ISO 8601 date')
        .toDate()
        .custom(registrationDeadlineValidator)
];

// Validator for updating an existing event
const updateEventValidator = [
    param('eventId')
        .isInt({ min: 1 }).withMessage('Event ID must be a positive integer')
        .toInt(),

    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isString().withMessage('Description must be a string'),

    body('type')
        .trim()
        .notEmpty().withMessage('Type is required')
        .isString().withMessage('Type must be a string'),

    body('theme')
        .trim()
        .notEmpty().withMessage('Theme is required')
        .isString().withMessage('Theme must be a string'),

    body('mode')
        .notEmpty().withMessage('Mode is required')
        .isIn(['online', 'in_person']).withMessage('Mode must be either online or in_person'),

    body('location')
        .optional({ nullable: true })
        .trim()
        .isString().withMessage('Location must be a string')
        .custom((value, { req }) => {
            if (req.body.mode === 'in_person' && !value?.trim()) {
                throw new Error('Location is required for in-person events');
            }

            return true;
        }),

    body('startDateTime')
        .notEmpty().withMessage('Start date and time is required')
        .isISO8601().withMessage('Start date and time must be a valid ISO 8601 date')
        .toDate(),

    body('endDateTime')
        .notEmpty().withMessage('End date and time is required')
        .isISO8601().withMessage('End date and time must be a valid ISO 8601 date')
        .toDate()
        .custom((value, { req }) => {
            const start = new Date(req.body.startDateTime);
            const end = new Date(value);

            if (end <= start) {
                throw new Error('End date and time must be after start date and time');
            }

            return true;
        }),

    body('maxParticipants')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('Max participants must be a positive integer')
        .toInt(),

    body('registrationDeadline')
        .optional({ nullable: true })
        .isISO8601().withMessage('Registration deadline must be a valid ISO 8601 date')
        .toDate()
        .custom(registrationDeadlineValidator)
];

// Validator for eventId parameter
const eventIdParamValidator = [
    param('eventId')
        .isInt({ min: 1 }).withMessage('Event ID must be a positive integer')
        .toInt()
];

module.exports = { createEventValidator, updateEventValidator, eventIdParamValidator };