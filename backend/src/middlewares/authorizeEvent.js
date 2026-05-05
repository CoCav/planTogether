const EventUserRole = require('../models/relations/eventUserRoleModel');
const Event = require('../models/eventModel');

/* ==================================================
   EVENT AUTHORIZATION MIDDLEWARE

   Handles:
   - role change authorization
   - member removal authorization
   - event creator protection
   - organizer protection

   Notes:
   - route validators should validate params before this middleware
   - role hierarchy is: organizer > co_organizer > participant
================================================== */

/* =============================
   ROLE CHANGE AUTHORIZATION
============================= */

// Authorize member role update
const authorizeRoleChange = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const targetUserId = Number(req.params.userId);
        const { newRole } = req.body;

        if (eventId == null || Number.isNaN(targetUserId)) {
            return res.status(400).json({
                message: 'Valid eventId and userId are required'
            });
        }

        // Fetch target membership and event in parallel
        // targetUserLink = membership row of the user whose role may change
        // currentEvent = event being managed
        const [targetUserLink, currentEvent] = await Promise.all([
            EventUserRole.findOne({ where: { eventId, userId: targetUserId } }),
            Event.findByPk(eventId)
        ]);

        if (!currentEvent) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        if (!targetUserLink) {
            return res.status(404).json({
                message: 'User link not found in event'
            });
        }

        // Event creator must keep organizer ownership
        if (targetUserId === currentEvent.creatorId) {
            return res.status(403).json({
                message: 'You cannot change the role of the event creator'
            });
        }

        // Organizer role cannot be changed
        if (targetUserLink.role === 'organizer') {
            return res.status(403).json({
                message: 'Organizer role cannot be changed'
            });
        }

        // Only one organizer is allowed per event
        if (newRole === 'organizer') {
            return res.status(403).json({
                message: 'Only one organizer is allowed per event'
            });
        }

        next();

    } catch (error) {
        console.error('Error authorizing role change:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};


/* =============================
   MEMBER REMOVAL AUTHORIZATION
============================= */

// Authorize member removal
const authorizeMemberRemoval = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const targetUserId = Number(req.params.userId);
        const requestingUserId = req.user.userId;

        if (eventId == null || Number.isNaN(targetUserId)) {
            return res.status(400).json({
                message: 'Valid eventId and userId are required'
            });
        }

        // Fetch all required data in parallel
        // requestingUserLink = membership of the user performing the action
        // targetUserLink = membership of the user being removed
        // currentEvent = event being managed
        const [requestingUserLink, targetUserLink, currentEvent] = await Promise.all([
            EventUserRole.findOne({ where: { eventId, userId: requestingUserId } }),
            EventUserRole.findOne({ where: { eventId, userId: targetUserId } }),
            Event.findByPk(eventId)
        ]);

        if (!currentEvent) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        if (!requestingUserLink || !targetUserLink) {
            return res.status(404).json({
                message: 'User link not found in event'
            });
        }

        // Event creator cannot be removed
        if (targetUserId === currentEvent.creatorId) {
            return res.status(403).json({
                message: 'You cannot remove the event creator'
            });
        }

        // Organizer cannot be removed through member management
        if (targetUserLink.role === 'organizer') {
            return res.status(403).json({
                message: 'Organizer cannot be removed from the event'
            });
        }

        // Self-removal must go through the leave route
        if (targetUserId === requestingUserId) {
            return res.status(403).json({
                message: 'You cannot remove yourself from the event'
            });
        }

        // Co-organizers can only remove participants
        if (requestingUserLink.role === 'co_organizer' && targetUserLink.role !== 'participant') {
            return res.status(403).json({
                message: 'Co-organizers can only remove participants'
            });
        }

        next();

    } catch (error) {
        console.error('Error authorizing member removal:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

module.exports = { authorizeRoleChange, authorizeMemberRemoval };
