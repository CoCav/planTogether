const express = require("express");
const router = express.Router();

const eventMembershipController = require("../controllers/eventMembershipController");

const { authenticateToken } = require("../middlewares/authenticateToken");
const handleValidationErrors = require("../middlewares/handleValidationErrors");
const authorizeEventRole = require("../middlewares/authorizeEventRole");
const { authorizeEventMemberRoleUpdate, authorizeEventMemberRemoval } = require("../middlewares/eventMemberAuthorization");

const { eventIdParamValidator, updateEventMemberRoleValidator, removeEventMemberValidator } = require("../validators/eventMembershipValidator");

/* ==================================================
   EVENT MEMBERSHIP ROUTES

   Handles:
   - joining and leaving events
   - event members and event staff retrieval
   - event member role management
   - event member removal

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
router.put("/:eventId/members/:userId/role", authenticateToken, updateEventMemberRoleValidator, handleValidationErrors, authorizeEventRole(["organizer"]), authorizeEventMemberRoleUpdate, eventMembershipController.updateEventMemberRole);

// Remove a member from an event
router.delete("/:eventId/members/:userId", authenticateToken, removeEventMemberValidator, handleValidationErrors, authorizeEventRole(["organizer", "co_organizer"]), authorizeEventMemberRemoval, eventMembershipController.removeEventMember);

module.exports = router;
