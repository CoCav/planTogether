const eventMembershipService = require('../services/eventMembershipService');

/* ==================================================
   EVENT MEMBERSHIP CONTROLLER

   Handles:
   - joining and leaving events
   - retrieving current user's events
   - retrieving event members and organizer / co_organizer(s)
   - updating member roles
   - removing members from events

   Notes:
   - authorization is handled by route middlewares
   - business logic is delegated to eventMembershipService
================================================== */

/* =============================
   JOIN / LEAVE EVENTS
============================= */

// Join an event
const joinEvent = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const eventId = req.params.eventId;

        const membership = await eventMembershipService.joinEvent({ eventId, userId });

        return res.status(200).json({
            message: 'User successfully joined the event',
            membership
        });

    } catch (error) {
        return next(error);
    }
};


// Leave an event
const leaveEvent = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const eventId = req.params.eventId;

        await eventMembershipService.leaveEvent({ eventId, userId });

        return res.status(200).json({
            message: 'User successfully left the event'
        });

    } catch (error) {
        return next(error);
    }
};


/* =============================
   CURRENT USER EVENTS
============================= */

// Get authenticated user's events
const getMyEvents = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const result = await eventMembershipService.listMyEvents(userId, req.query);

        return res.status(200).json({
            message: 'Events retrieved successfully',
            ...result
        });

    } catch (error) {
        return next(error);
    }
};


/* ==================================================
   MEMBERS / ORGANIZER / CO-ORGANIZERS
================================================== */

// Get all members of an event
const getMembers = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;

        const members = await eventMembershipService.listMembers(eventId);

        return res.status(200).json({
            message: 'Members retrieved successfully',
            members
        });

    } catch (error) {
        return next(error);
    }
};


// Get organizer / co-organizer(s) of an event
const getOrganizers = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;

        const organizers = await eventMembershipService.listOrganizers(eventId);

        return res.status(200).json({
            message: 'Organizers retrieved successfully',
            organizers
        });

    } catch (error) {
        return next(error);
    }
};


/* =============================
   ROLE MANAGEMENT
============================= */

// Update member role
const updateMemberRole = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.params.userId;
        const { newRole } = req.body;

        const membership = await eventMembershipService.updateMemberRole({
            eventId,
            userId,
            newRole
        });

        return res.status(200).json({
            message: 'User role updated successfully',
            membership
        });

    } catch (error) {
        return next(error);
    }
};


// Remove member from an event
const removeMember = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.params.userId;

        await eventMembershipService.removeMember({
            eventId,
            userId
        });

        return res.status(200).json({
            message: 'Member removed successfully'
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = { joinEvent, leaveEvent, getMyEvents, getMembers, getOrganizers, updateMemberRole, removeMember };
