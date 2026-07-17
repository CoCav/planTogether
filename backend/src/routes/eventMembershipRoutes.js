const express = require("express");
const router = express.Router();

const eventMembershipController = require("../controllers/eventMembershipController");

const { EVENT_ROLES } = require("../constants/eventRoles");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");
const authorizeEventRole = require("../middlewares/authorization/authorizeEventRole");

const {
    authorizeEventMemberRoleUpdate,
    authorizeEventMemberRemoval
} = require("../middlewares/authorization/eventMemberAuthorization");

const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

const {
    eventIdParamValidator,
    updateEventMemberRoleValidator,
    removeEventMemberValidator,
    transferEventOwnershipValidator
} = require("../validators/eventMembershipValidator");

/* ==========================================================================
   Event Membership Routes

   Defines event membership endpoints.

   Responsibilities
   - Join and leave events
   - Retrieve event members and staff
   - Update member roles
   - Remove event members
   - Transfer event ownership

   Notes
   - Protected routes require authentication.
   - Role management routes require additional authorization.
   - Validators run before authorization middlewares.
=========================================================================== */

/* =============================
   MEMBERSHIP ACTIONS
============================= */

router.post(
    "/:eventId/members/join",
    authenticateToken,
    eventIdParamValidator,
    handleValidationErrors,
    eventMembershipController.joinEvent
);

router.delete(
    "/:eventId/members/leave",
    authenticateToken,
    eventIdParamValidator,
    handleValidationErrors,
    eventMembershipController.leaveEvent
);

/* =============================
   MEMBER RETRIEVAL
============================= */

router.get(
    "/:eventId/members",
    eventIdParamValidator,
    handleValidationErrors,
    eventMembershipController.getEventMembers
);

router.get(
    "/:eventId/staff",
    eventIdParamValidator,
    handleValidationErrors,
    eventMembershipController.getEventStaff
);

/* =============================
   MEMBER MANAGEMENT
============================= */

router.put(
    "/:eventId/members/:userId/role",
    authenticateToken,
    updateEventMemberRoleValidator,
    handleValidationErrors,
    authorizeEventRole([EVENT_ROLES.ORGANIZER]),
    authorizeEventMemberRoleUpdate,
    eventMembershipController.updateEventMemberRole
);

router.delete(
    "/:eventId/members/:userId",
    authenticateToken,
    removeEventMemberValidator,
    handleValidationErrors,
    authorizeEventRole([EVENT_ROLES.ORGANIZER, EVENT_ROLES.CO_ORGANIZER]),
    authorizeEventMemberRemoval,
    eventMembershipController.removeEventMember
);

/* =============================
   OWNERSHIP TRANSFER
============================= */

router.put(
    "/:eventId/ownership",
    authenticateToken,
    transferEventOwnershipValidator,
    handleValidationErrors,
    authorizeEventRole([EVENT_ROLES.ORGANIZER]),
    eventMembershipController.transferEventOwnership
);

module.exports = router;
