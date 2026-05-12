const { body, param } = require("express-validator");

const { VALID_EVENT_ROLES } = require("../constants/eventRoles");

/* ==================================================
   EVENT MEMBERSHIP VALIDATORS

   Handles:
   - event ID param validation
   - event member role update validation
   - event member removal validation
   - event ownership transfer validation

   Notes:
   - handleValidationErrors must run after these validators
   - role authorization is handled separately by middlewares
   - event roles are centralized through shared constants
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
   ROLE MANAGEMENT
============================= */

// Validate member role update data
const updateEventMemberRoleValidator = [
    param("eventId")
        .isInt({ min: 1 }).withMessage("Event ID must be a positive integer")
        .toInt(),

    param("userId")
        .isInt({ min: 1 }).withMessage("User ID must be a positive integer")
        .toInt(),

    body("newRole")
        .trim()
        .notEmpty().withMessage("newRole is required")
        .bail()
        .isIn(VALID_EVENT_ROLES)
        .withMessage("newRole must be one of: organizer, co_organizer, participant")
];

// Validate member removal params
const removeEventMemberValidator = [
    param("eventId")
        .isInt({ min: 1 }).withMessage("Event ID must be a positive integer")
        .toInt(),

    param("userId")
        .isInt({ min: 1 }).withMessage("User ID must be a positive integer")
        .toInt()
];

// Validate transfer event ownership data
const transferEventOwnershipValidator = [
    param("eventId")
        .isInt({ min: 1 })
        .withMessage("Event ID must be a positive integer")
        .toInt(),

    body("targetUserId")
        .notEmpty()
        .withMessage("targetUserId is required")
        .bail()
        .isInt({ min: 1 })
        .withMessage("targetUserId must be a positive integer")
        .toInt()
];

module.exports = { eventIdParamValidator, updateEventMemberRoleValidator, removeEventMemberValidator, transferEventOwnershipValidator };
