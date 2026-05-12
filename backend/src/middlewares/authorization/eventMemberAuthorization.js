const Event = require("../../models/eventModel");
const EventUserRole = require("../../models/relations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../constants/eventRoles");

const { createHttpError } = require("../../utils/errors/httpError");

/* ==================================================
   EVENT MEMBER AUTHORIZATION MIDDLEWARE

   Handles:
   - event member role update authorization
   - event member removal authorization
   - organizer / co-organizer permission checks
   - protected event creator rules

   Notes:
   - organizer can update participant/co-organizer roles
   - organizer and co-organizer can remove participants
   - event creator cannot be demoted or removed
   - authorization errors are forwarded to the global errorHandler
   - event roles are centralized through shared constants
================================================== */

/* =============================
   HELPERS
============================= */

// Retrieve active event membership for a specific user
const getMembership = (eventId, userId) => {
    return EventUserRole.findOne({
        where: {
            eventId,
            userId,
            deletedAt: null
        }
    });
};

// Check if membership belongs to organizer
const isOrganizer = (membership) => {
    return membership?.role === EVENT_ROLES.ORGANIZER;
};

// Check if membership can remove members
const canRemoveMembers = (membership) => {
    return [
        EVENT_ROLES.ORGANIZER,
        EVENT_ROLES.CO_ORGANIZER
    ].includes(membership?.role);
};

// Check if membership belongs to event creator
const isEventCreator = (event, membership) => {
    return event.creatorId === membership.userId;
};


/* =============================
   ROLE UPDATE AUTHORIZATION
============================= */

// Authorize event member role updates
const authorizeEventMemberRoleUpdate = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const requestingUserId = req.user.userId;
        const targetUserId = parseInt(req.params.userId, 10);

        const { newRole } = req.body;

        // Retrieve requester membership
        const requesterMembership = await getMembership(
            eventId,
            requestingUserId
        );

        // Only organizer can update member roles
        if (!isOrganizer(requesterMembership)) {
            return next(createHttpError(403, "Only the organizer can update member roles"));
        }

        // Retrieve target membership
        const targetMembership = await getMembership(
            eventId,
            targetUserId
        );

        if (!targetMembership) {
            return next(createHttpError(404, "Target membership not found"));
        }

        // Retrieve event
        const event = await Event.findByPk(eventId);

        if (!event) {
            return next(createHttpError(404, "Event not found"));
        }

        // Event creator keeps organizer ownership role
        if (isEventCreator(event, targetMembership)) {
            return next(createHttpError(403, "You cannot change the role of the event creator"));
        }

        // Prevent assigning a second organizer
        if (newRole === EVENT_ROLES.ORGANIZER) {
            return next(createHttpError(403, "Only one organizer is allowed per event"));
        }

        // Reuse target membership downstream if needed
        req.targetMembership = targetMembership;

        return next();

    } catch (error) {
        return next(error);
    }
};


/* =============================
   MEMBER REMOVAL AUTHORIZATION
============================= */

// Authorize event member removal
const authorizeEventMemberRemoval = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const requestingUserId = req.user.userId;
        const targetUserId = parseInt(req.params.userId, 10);

        // Retrieve requester membership
        const requesterMembership = await getMembership(
            eventId,
            requestingUserId
        );

        // Only organizer or co-organizer can remove members
        if (!canRemoveMembers(requesterMembership)) {
            return next(createHttpError(403, "Only organizers and co-organizers can remove members"));
        }

        // Retrieve target membership
        const targetMembership = await getMembership(
            eventId,
            targetUserId
        );

        if (!targetMembership) {
            return next(createHttpError(404, "Target membership not found"));
        }

        // Retrieve event
        const event = await Event.findByPk(eventId);

        if (!event) {
            return next(createHttpError(404, "Event not found"));
        }

        // Event creator cannot be removed
        if (isEventCreator(event, targetMembership)) {
            return next(createHttpError(403, "You cannot remove the event creator"));
        }

        // Prevent self-removal through admin removal route
        if (requesterMembership.userId === targetMembership.userId) {
            return next(createHttpError(403, "You cannot remove yourself from the event"));
        }

        // Organizer cannot be removed
        if (targetMembership.role === EVENT_ROLES.ORGANIZER) {
            return next(createHttpError(403, "Organizer cannot be removed"));
        }

        // Co-organizers cannot remove other co-organizers
        if (
            targetMembership.role === EVENT_ROLES.CO_ORGANIZER &&
            requesterMembership.role === EVENT_ROLES.CO_ORGANIZER
        ) {
            return next(createHttpError(403, "Co-organizers cannot remove other co-organizers"));
        }

        // Reuse target membership downstream if needed
        req.targetMembership = targetMembership;

        return next();

    } catch (error) {
        return next(error);
    }
};

module.exports = { authorizeEventMemberRoleUpdate, authorizeEventMemberRemoval };
