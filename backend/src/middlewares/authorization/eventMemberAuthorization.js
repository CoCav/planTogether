const Event = require("../../models/eventModel");
const EventUserRole = require("../../models/relations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../constants/eventRoles");

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
   - event roles are centralized through shared constants
================================================== */

/* =============================
   HELPERS
============================= */

const sendForbidden = (res, message) => {
    return res.status(403).json({
        success: false,
        message
    });
};

const sendNotFound = (res, message) => {
    return res.status(404).json({
        success: false,
        message
    });
};

const sendServerError = (res) => {
    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

const getMembership = (eventId, userId) => {
    return EventUserRole.findOne({
        where: {
            eventId,
            userId
        }
    });
};

const isOrganizer = (membership) => {
    return membership?.role === EVENT_ROLES.ORGANIZER;
};

const canRemoveMembers = (membership) => {
    return [
        EVENT_ROLES.ORGANIZER,
        EVENT_ROLES.CO_ORGANIZER
    ].includes(membership?.role);
};

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

        const requesterMembership = await getMembership(eventId, requestingUserId);

        // Only organizer can update member roles
        if (!isOrganizer(requesterMembership)) {
            return sendForbidden(res, "Only the organizer can update member roles");
        }

        const targetMembership = await getMembership(eventId, targetUserId);

        if (!targetMembership) {
            return sendNotFound(res, "Target membership not found");
        }

        const event = await Event.findByPk(eventId);

        if (!event) {
            return sendNotFound(res, "Event not found");
        }

        // Event creator keeps the organizer ownership role
        if (isEventCreator(event, targetMembership)) {
            return sendForbidden(res, "You cannot change the role of the event creator");
        }

        // Only one organizer is allowed per event
        if (newRole === EVENT_ROLES.ORGANIZER) {
            return sendForbidden(res, "Only one organizer is allowed per event");
        }

        req.targetMembership = targetMembership;

        return next();

    } catch (error) {
        console.error("Error authorizing member role update:", error);
        return sendServerError(res);
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

        const requesterMembership = await getMembership(eventId, requestingUserId);

        // Only organizer or co-organizer can remove members
        if (!canRemoveMembers(requesterMembership)) {
            return sendForbidden(res, "Insufficient permissions to remove member");
        }

        const targetMembership = await getMembership(eventId, targetUserId);

        if (!targetMembership) {
            return sendNotFound(res, "Target membership not found");
        }

        const event = await Event.findByPk(eventId);

        if (!event) {
            return sendNotFound(res, "Event not found");
        }

        // Event creator cannot be removed from their own event
        if (isEventCreator(event, targetMembership)) {
            return sendForbidden(res, "You cannot remove the event creator");
        }

        // Admin removal route cannot be used for self-removal
        if (requesterMembership.userId === targetMembership.userId) {
            return sendForbidden(res, "You cannot remove yourself from the event");
        }

        // Organizer role cannot be removed through member removal
        if (targetMembership.role === EVENT_ROLES.ORGANIZER) {
            return sendForbidden(res, "Organizer cannot be removed");
        }

        // Co-organizers cannot remove other co-organizers
        if (
            targetMembership.role === EVENT_ROLES.CO_ORGANIZER &&
            requesterMembership.role === EVENT_ROLES.CO_ORGANIZER
        ) {
            return sendForbidden(res, "Co-organizers cannot remove other co-organizers");
        }

        req.targetMembership = targetMembership;

        return next();

    } catch (error) {
        console.error("Error authorizing member removal:", error);
        return sendServerError(res);
    }
};

module.exports = { authorizeEventMemberRoleUpdate, authorizeEventMemberRemoval };
