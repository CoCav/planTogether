const { body, param } = require('express-validator');

/* ==================================================
   EVENT ROLE VALIDATORS

   Handles:
   - member role update validation
   - member removal param validation

   Notes:
   - validateRequest must run after these validators
   - role authorization is handled separately by middlewares
================================================== */

// Validate member role update data
const updateMemberRoleValidator = [
    param('eventId')
        .isInt({ min: 1 }).withMessage('Event ID must be a positive integer')
        .toInt(),

    param('userId')
        .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
        .toInt(),

    body('newRole')
        .trim()
        .notEmpty().withMessage('newRole is required')
        .bail()
        .isIn(['organizer', 'co_organizer', 'participant'])
        .withMessage('newRole must be one of: organizer, co_organizer, participant')
];

// Validate member removal params
const removeMemberValidator = [
    param('eventId')
        .isInt({ min: 1 }).withMessage('Event ID must be a positive integer')
        .toInt(),

    param('userId')
        .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
        .toInt()
];

module.exports = { updateMemberRoleValidator, removeMemberValidator };
