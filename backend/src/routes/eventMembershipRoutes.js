const express = require('express');
const router = express.Router();

const eventMembershipController = require('../controllers/eventMembershipController');

const { authenticateToken } = require('../middlewares/authenticateToken');
const validateRequest = require('../middlewares/validateRequest');
const { requireEventRole } = require('../middlewares/requireEventRole');
const { authorizeRoleChange, authorizeMemberRemoval } = require('../middlewares/authorizeEvent');

const { updateMemberRoleValidator, removeMemberValidator } = require('../validators/eventRoleValidator');

/* ==================================================
   EVENT MEMBERSHIP ROUTES

   Handles:
   - current user's event list
   - joining and leaving events
   - event members and organizers retrieval
   - member role updates
   - member removals

   Notes:
   - role management routes require authentication + authorization
   - validators run before authorization checks
================================================== */

/* =============================
   CURRENT USER EVENTS
============================= */

// Get authenticated user's events
router.get('/my-events', authenticateToken, eventMembershipController.getMyEvents);


/* =============================
   JOIN / LEAVE EVENTS
============================= */

// Join an event
router.post('/:eventId/members/join', authenticateToken, eventMembershipController.joinEvent);

// Leave an event
router.delete('/:eventId/members/leave', authenticateToken, eventMembershipController.leaveEvent);


/* ==================================================
   MEMBERS / ORGANIZER / CO-ORGANIZERS
================================================== */

// Get all members of an event
router.get('/:eventId/members', eventMembershipController.getMembers);

// Get all organizers and co-organizers of an event
router.get('/:eventId/organizers', eventMembershipController.getOrganizers);


/* =============================
   ROLE MANAGEMENT
============================= */

// Update a member role
router.put('/:eventId/members/:userId/role', authenticateToken, updateMemberRoleValidator, validateRequest, requireEventRole(['organizer']), authorizeRoleChange, eventMembershipController.updateMemberRole);

// Remove a member from an event
router.delete('/:eventId/members/:userId', authenticateToken, removeMemberValidator, validateRequest, requireEventRole(['organizer', 'co_organizer']), authorizeMemberRemoval, eventMembershipController.removeMember);

module.exports = router;
