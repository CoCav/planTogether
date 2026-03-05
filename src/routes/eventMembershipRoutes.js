const express = require('express');
const router = express.Router();

const eventMembershipController = require('../controllers/eventMembershipController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { requireEventRole, authorizeRoleChange } = require('../middlewares/requireEventRole');
const { updateMemberRoleValidator, removeMemberValidator } = require('../validators/eventRoleValidator');

// ROUTE POST - User joins an event
router.post('/events/:eventId/members/join', authenticateToken, eventMembershipController.joinEvent);

// ROUTE DELETE - User leaves an event
router.delete('/events/:eventId/members/leave', authenticateToken, eventMembershipController.leaveEvent);

// ROUTE GET - Get all events the current user is participating in
router.get('/users/me/events', authenticateToken, eventMembershipController.getMyEvents);

// ROUTE GET - Get all members of an event
router.get('/events/:eventId/members', authenticateToken, eventMembershipController.getMembers);

// ROUTE GET - Get all organizers and co_organizers of an event
router.get('/events/:eventId/organizers', authenticateToken, eventMembershipController.getOrganizers);

// ROUTE PUT - Organizer or co_organizer can change the role of a member
router.put(
  '/events/:eventId/members/:userId/role', authenticateToken, updateMemberRoleValidator, validateRequest, requireEventRole(['organizer', 'co_organizer']), authorizeRoleChange, eventMembershipController.updateMemberRole);

// ROUTE DELETE - Organizer or co_organizer can remove a member from the event
router.delete('/events/:eventId/members/:userId', authenticateToken, removeMemberValidator, validateRequest, requireEventRole(['organizer', 'co_organizer']), eventMembershipController.removeMember);

module.exports = router;