const { body } = require("express-validator");

const { VALID_EVENT_ROLES } = require("../constants/eventRoles");

const {
    eventIdParamValidator,
    userIdParamValidator
} = require("./shared/paramsValidators");

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

/* =============================
   ROLE UPDATE VALIDATION
============================= */

// Validate event and member IDs with the requested role
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

/* =============================
   MEMBER REMOVAL VALIDATION
============================= */

// Validate identifiers required to remove an event member
const removeEventMemberValidator = [
    ...eventIdParamValidator,
    ...userIdParamValidator
];

/* =============================
   OWNERSHIP TRANSFER VALIDATION
============================= */

// Validate the target member for event ownership transfer
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
