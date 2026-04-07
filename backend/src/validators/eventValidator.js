const { body, param } = require('express-validator');

// Validator for creating a new event
const createEventValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),

    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid date format')
        .toDate(),

    body('description')
        .optional()
        .trim()
        .isString().withMessage('Description must be a string'),

    body('location')
        .optional()
        .trim()
        .isString().withMessage('Location must be a string'),

    body('type')
        .optional()
        .trim()
        .isString().withMessage('Type must be a string'),

    body('theme')
        .optional()
        .trim()
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

    body('date')
        .optional()
        .isISO8601().withMessage('Date must be a valid date format')
        .toDate(),

    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .trim(),

    body('location')
        .optional()
        .trim()
        .isString().withMessage('Location must be a string'),

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