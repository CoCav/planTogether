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
   ROLE UPDATE AUTHORIZATION
============================= */

// Authorize event member role updates
const authorizeEventMemberRoleUpdate = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const requestingUserId = req.user.userId;
        const targetUserId = parseInt(req.params.userId, 10);
        const { newRole } = req.body;

        const requesterMembership = await EventUserRole.findOne({
            where: {
                eventId,
                userId: requestingUserId
            }
        });

        // Only organizer can update member roles
        if (!requesterMembership || requesterMembership.role !== EVENT_ROLES.ORGANIZER) {
            return res.status(403).json({
                success: false,
                message: "Only the organizer can update member roles"
            });
        }

        const targetMembership = await EventUserRole.findOne({
            where: {
                eventId,
                userId: targetUserId
            }
        });

        if (!targetMembership) {
            return res.status(404).json({
                success: false,
                message: "Target membership not found"
            });
        }

        const event = await Event.findByPk(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Event creator keeps the organizer ownership role
        if (event.creatorId === targetMembership.userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot change the role of the event creator"
            });
        }

        // Only one organizer is allowed per event
        if (newRole === EVENT_ROLES.ORGANIZER) {
            return res.status(403).json({
                success: false,
                message: "Only one organizer is allowed per event"
            });
        }

        req.targetMembership = targetMembership;

        return next();

    } catch (error) {
        console.error("Error authorizing member role update:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
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

        const requesterMembership = await EventUserRole.findOne({
            where: {
                eventId,
                userId: requestingUserId
            }
        });

        // Only organizer or co-organizer can remove members
        if (!requesterMembership ||
            ![EVENT_ROLES.ORGANIZER, EVENT_ROLES.CO_ORGANIZER].includes(requesterMembership.role)
        ) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions to remove member"
            });
        }

        const targetMembership = await EventUserRole.findOne({
            where: {
                eventId,
                userId: targetUserId
            }
        });

        if (!targetMembership) {
            return res.status(404).json({
                success: false,
                message: "Target membership not found"
            });
        }

        const event = await Event.findByPk(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Event creator cannot be removed from their own event
        if (event.creatorId === targetMembership.userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot remove the event creator"
            });
        }

        // Admin removal route cannot be used for self-removal
        if (requesterMembership.userId === targetMembership.userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot remove yourself from the event"
            });
        }

        // Organizer role cannot be removed through member removal
        if (targetMembership.role === EVENT_ROLES.ORGANIZER) {
            return res.status(403).json({
                success: false,
                message: "Organizer cannot be removed"
            });
        }

        // Co-organizers cannot remove other co-organizers
        if (targetMembership.role === EVENT_ROLES.CO_ORGANIZER &&
            requesterMembership.role === EVENT_ROLES.CO_ORGANIZER
        ) {
            return res.status(403).json({
                success: false,
                message: "Co-organizers cannot remove other co-organizers"
            });
        }

        req.targetMembership = targetMembership;

        return next();

    } catch (error) {
        console.error("Error authorizing member removal:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { authorizeEventMemberRoleUpdate, authorizeEventMemberRemoval };
