const eventMembershipService = require('../services/eventMembershipService');

/* ==================================================
   EVENT MEMBERSHIP CONTROLLER
================================================== */

// User joins an event
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

// User leaves an event
const leaveEvent = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const eventId = req.params.eventId;

        await eventMembershipService.leaveEvent({ eventId, userId });

        return res.status(200).json({
            message: 'User successfully left the event',
        });
    } catch (error) {
        return next(error);
    }
};

// Get events of the current user
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

// Get all members of an event (with roles)
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

// Get organizers & co_organizers of an event
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

// Update a user's role in an event
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

// Remove a member from an event
const removeMember = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.params.userId;
        const requestingUserId = req.user.userId;

        await eventMembershipService.removeMember({ eventId, userId, requestingUserId });

        return res.status(200).json({
            message: 'Member removed successfully',
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = { joinEvent, leaveEvent, getMembers, getOrganizers, updateMemberRole, removeMember, getMyEvents };
