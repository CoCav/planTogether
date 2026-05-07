const eventMembershipService = require("../services/eventMembershipService");

/* ==================================================
   EVENT MEMBERSHIP CONTROLLER

   Handles:
   - joining and leaving events
   - retrieving event members
   - retrieving event staff (organizer and co-organizers)
   - updating member roles
   - removing members from events

   Notes:
   - current user event listing belongs to userController
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

/* ==================================================
   MEMBERS / ORGANIZER / CO-ORGANIZERS
================================================== */

// Get all members of an event
const getEventMembers = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;

        const members = await eventMembershipService.getEventMembers(eventId);

        return res.status(200).json({
            message: 'Event members retrieved successfully',
            members
        });

    } catch (error) {
        return next(error);
    }
};


// Get organizer / co-organizer(s) of an event
const getEventStaff = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;

        const eventStaff = await eventMembershipService.getEventStaff(eventId);

        return res.status(200).json({
            message: 'Event Staff retrieved successfully',
            eventStaff
        });

    } catch (error) {
        return next(error);
    }
};


/* =============================
   ROLE MANAGEMENT
============================= */

// Update a member's in an event
const updateEventMemberRole = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.params.userId;
        const { newRole } = req.body;

        const membership = await eventMembershipService.updateEventMemberRole({
            eventId,
            userId,
            newRole
        });

        return res.status(200).json({
            message: 'Event User role updated successfully',
            membership
        });

    } catch (error) {
        return next(error);
    }
};


// Remove a member from an event
const removeEventMember = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.params.userId;

        await eventMembershipService.removeEventMember({
            eventId,
            userId
        });

        return res.status(200).json({
            message: 'Event member removed successfully'
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = { joinEvent, leaveEvent, getEventMembers, getEventStaff, updateEventMemberRole, removeEventMember };
