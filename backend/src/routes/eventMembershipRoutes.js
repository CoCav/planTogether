const express = require('express');
const router = express.Router();

const eventMembershipController = require('../controllers/eventMembershipController');
const { authenticateToken } = require('../middlewares/authenticateToken');
const validateRequest = require('../middlewares/validateRequest');
const { requireEventRole } = require('../middlewares/requireEventRole');
const { authorizeRoleChange, authorizeMemberRemoval } = require('../middlewares/authorizeEvent')
const { updateMemberRoleValidator, removeMemberValidator } = require('../validators/eventRoleValidator');


// ROUTE GET - Get all events related to the current user
router.get('/my-events', authenticateToken, eventMembershipController.getMyEvents);

// ROUTE POST - User joins an event
router.post('/:eventId/members/join', authenticateToken, eventMembershipController.joinEvent);

// ROUTE DELETE - User leaves an event
router.delete('/:eventId/members/leave', authenticateToken, eventMembershipController.leaveEvent);

// ROUTE GET - Get all members of an event
router.get('/:eventId/members', eventMembershipController.getMembers);

// ROUTE GET - Get all organizers and co_organizers of an event
router.get('/:eventId/organizers', eventMembershipController.getOrganizers);

// ROUTE PUT - Only organizer can change the role of a member
router.put('/:eventId/members/:userId/role', authenticateToken, updateMemberRoleValidator, validateRequest, requireEventRole(['organizer']), authorizeRoleChange, eventMembershipController.updateMemberRole);

// ROUTE DELETE - Organizer or co_organizer can remove a member from the event
router.delete('/:eventId/members/:userId', authenticateToken, removeMemberValidator, validateRequest, requireEventRole(['organizer', 'co_organizer']), authorizeMemberRemoval, eventMembershipController.removeMember);

module.exports = router;