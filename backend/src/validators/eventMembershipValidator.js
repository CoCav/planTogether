const { body } = require("express-validator");

const { VALID_EVENT_ROLES } = require("../constants/eventRoles");

const { eventIdParamValidator, userIdParamValidator } = require("./shared/paramValidators");

/* ==========================================================================
   Event Membership Validators

   Validates event membership requests.

   Responsibilities
   - Validate member role updates
   - Validate member removal
   - Validate event ownership transfer

   Notes
   - handleValidationErrors must run after these validators.
   - Authorization is handled by dedicated middlewares.
=========================================================================== */

/* Role management */

const updateEventMemberRoleValidator = [
    ...eventIdParamValidator,

    ...userIdParamValidator,

    body("newRole")
        .trim()
        .notEmpty()
        .withMessage("newRole is required")
        .bail()
        .isIn(VALID_EVENT_ROLES)
        .withMessage("newRole must be one of: organizer, co_organizer, participant")
];

const removeEventMemberValidator = [
    ...eventIdParamValidator,

    ...userIdParamValidator
];

const transferEventOwnershipValidator = [
    ...eventIdParamValidator,

    body("targetUserId")
        .notEmpty()
        .withMessage("targetUserId is required")
        .bail()
        .isInt({ min: 1 })
        .withMessage("targetUserId must be a positive integer")
        .toInt()
];

module.exports = {
    eventIdParamValidator,
    updateEventMemberRoleValidator,
    removeEventMemberValidator,
    transferEventOwnershipValidator
};
