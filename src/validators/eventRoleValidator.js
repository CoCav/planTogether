const { body, param } = require('express-validator');

// Validator for updating a member's role in an event
const updateMemberRoleValidator = [
    param('eventId')
        .isInt().withMessage('Event ID must be an integer')
        .toInt(),

    param('userId')
        .isInt().withMessage('User ID must be an integer')
        .toInt(),

    body('newRole')
        .trim()
        .notEmpty().withMessage('newRole is required')
        .bail()
        .isIn(['organizer', 'co_organizer', 'participant'])
        .withMessage('newRole must be one of: organizer, co_organizer, participant')
];

// Validator for removing a member from an event
const removeMemberValidator = [
    param('eventId')
        .isInt().withMessage('Event ID must be an integer')
        .toInt(),

    param('userId')
        .isInt().withMessage('User ID must be an integer')
        .toInt()
];

module.exports = {
  updateMemberRoleValidator,
  removeMemberValidator
};

module.exports = { updateMemberRoleValidator, removeMemberValidator };