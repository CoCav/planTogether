const express = require("express");
const router = express.Router();

const eventMembershipController = require("../controllers/eventMembershipController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");

const { EVENT_ROLES } = require("../constants/eventRoles");
const authorizeEventRole = require("../middlewares/authorization/authorizeEventRole");
const { authorizeEventMemberRoleUpdate, authorizeEventMemberRemoval } = require("../middlewares/authorization/eventMemberAuthorization");

const { eventIdParamValidator, updateEventMemberRoleValidator, removeEventMemberValidator, transferEventOwnershipValidator } = require("../validators/eventMembershipValidator");
const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

/* ==================================================
   EVENT MEMBERSHIP ROUTES

   Handles:
   - joining and leaving events
   - event members and organizer / co_organizer retrieval
   - event member role management
   - event member removal
   - event ownership transfer

   Notes:
   - protected routes require authentication
   - role management routes require additional authorization
   - validators run before authorization middlewares
================================================== */

/* =============================
   JOIN / LEAVE EVENTS
============================= */

// Join an event
router.post("/:eventId/members/join", authenticateToken, eventIdParamValidator, handleValidationErrors, eventMembershipController.joinEvent);

// Leave an event
router.delete("/:eventId/members/leave", authenticateToken, eventIdParamValidator, handleValidationErrors, eventMembershipController.leaveEvent);


/* ==================================================
   MEMBERS / ORGANIZER / CO-ORGANIZERS
================================================== */

// Get all members of an event
router.get("/:eventId/members", eventIdParamValidator, handleValidationErrors, eventMembershipController.getEventMembers);

// Get all organizers and co-organizers of an event
router.get("/:eventId/staff", eventIdParamValidator, handleValidationErrors, eventMembershipController.getEventStaff);


/* =============================
   ROLE MANAGEMENT
============================= */

// Update a member role
router.put("/:eventId/members/:userId/role",
    authenticateToken,
    updateEventMemberRoleValidator,
    handleValidationErrors,
    authorizeEventRole([EVENT_ROLES.ORGANIZER]),
    authorizeEventMemberRoleUpdate,
    eventMembershipController.updateEventMemberRole
);

// Remove a member from an event
router.delete("/:eventId/members/:userId",
    authenticateToken,
    removeEventMemberValidator,
    handleValidationErrors,
    authorizeEventRole([EVENT_ROLES.ORGANIZER, EVENT_ROLES.CO_ORGANIZER]),
    authorizeEventMemberRemoval,
    eventMembershipController.removeEventMember
);

// Transfer event ownership to another member
router.put(
    "/:eventId/ownership",
    authenticateToken,
    transferEventOwnershipValidator,
    handleValidationErrors,
    authorizeEventRole([EVENT_ROLES.ORGANIZER]),
    eventMembershipController.transferEventOwnership
);

module.exports = router;
