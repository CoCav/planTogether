const { Op } = require("sequelize");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");

const { EVENT_ROLES, VALID_EVENT_ROLES } = require("../constants/eventRoles");

const { throwHttpError } = require("../utils/errors/httpError");

const { assertEventNotPast, getEventStatus } = require("../utils/events/eventStatus");
const { getPaginationOptions } = require("../utils/pagination");

/* ==================================================
   EVENT MEMBERSHIP SERVICE

   Handles:
   - event participation (join / leave)
   - retrieving event members and staff
   - managing event member roles
   - enforcing business rules (capacity, roles, time)

   Notes:
   - uses EventUserRole as join table
   - all event references use alias "event"
   - event roles are centralized through shared constants
   - uses shared HTTP error utilities
================================================== */

/* ==================================================
   JOIN / LEAVE EVENTS
================================================== */

// User joins an event
const joinEvent = async ({ eventId, userId }) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        // Prevent joining past events
        assertEventNotPast(event);

        // Prevent joining when registration period is over
        const hasRegistrationDeadline = event.registrationDeadline;
        const isRegistrationClosed = hasRegistrationDeadline && new Date() > new Date(event.registrationDeadline);

        if (isRegistrationClosed) {
            throwHttpError(409, "Registration period is over for this event");
        }

        // Prevent joining when participant capacity is reached
        if (event.maxParticipants !== null) {
            const participantCount = await EventUserRole.count({
                where: {
                    eventId,
                    role: EVENT_ROLES.PARTICIPANT
                }
            });

            const hasReachedParticipantLimit = participantCount >= event.maxParticipants;

            if (hasReachedParticipantLimit) {
                throwHttpError(409, "Event has reached maximum number of participants");
            }
        }

        // Prevent duplicate join
        const existingMembership = await EventUserRole.findOne({
            where: { eventId, userId }
        });

        if (existingMembership) {
            throwHttpError(409, "User already joined this event");
        }

        // Create membership
        return await EventUserRole.create({
            eventId,
            userId,
            role: EVENT_ROLES.PARTICIPANT
        });

    } catch (error) {
        console.error("Error in joinEvent service:", error);
        throw error;
    }
};


// User leaves an event
const leaveEvent = async ({ eventId, userId }) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        assertEventNotPast(event);

        const membership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (!membership) {
            throwHttpError(404, "Participation not found");
        }

        // Prevent organizer from leaving
        if (membership.role === EVENT_ROLES.ORGANIZER) {
            throwHttpError(403, "Organizers cannot leave their own event");
        }

        await membership.destroy();

    } catch (error) {
        console.error("Error in leaveEvent service:", error);
        throw error;
    }
};


/* ==================================================
   MEMBERS / ORGANIZER / CO-ORGANIZERS
================================================== */

// Get all members of an event
const getEventMembers = async (eventId) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        return await EventUserRole.findAll({
            where: { eventId },
            include: [{
                model: User,
                attributes: ["id", "name", "email"]
            }],
            order: [["createdAt", "ASC"]]
        });

    } catch (error) {
        console.error("Error in listEventMembers service:", error);
        throw error;
    }
};


// Get organizer / co_organizer(s) of an event
const getEventStaff = async (eventId) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        return await EventUserRole.findAll({
            where: {
                eventId,
                role: { [Op.in]: [EVENT_ROLES.ORGANIZER, EVENT_ROLES.CO_ORGANIZER] }
            },
            include: [{
                model: User,
                attributes: ["id", "name", "email"]
            }],
            order: [["role", "ASC"], ["createdAt", "ASC"]]
        });

    } catch (error) {
        console.error("Error in listEventStaff service:", error);
        throw error;
    }
};


/* ==================================================
   ROLE MANAGEMENT
================================================== */

// Update a member's role of an event
const updateEventMemberRole = async ({ eventId, userId, newRole }) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        assertEventNotPast(event);

        if (!VALID_EVENT_ROLES.includes(newRole)) {
            throwHttpError(400, "Invalid role provided");
        }

        const membership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (!membership) {
            throwHttpError(404, "User is not a member of this event");
        }

        if (membership.role === newRole) {
            throwHttpError(400, "User already has this role");
        }

        membership.role = newRole;
        await membership.save();

        return membership;

    } catch (error) {
        console.error("Error in updateMemberRole service:", error);
        throw error;
    }
};


// Remove a member from an event
const removeEventMember = async ({ eventId, userId }) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        assertEventNotPast(event);

        const membership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (!membership) {
            throwHttpError(404, "User is not a member of this event");
        }

        await membership.destroy();

    } catch (error) {
        console.error("Error in removeMember service:", error);
        throw error;
    }
};

module.exports = { joinEvent, leaveEvent, getEventMembers, getEventStaff, updateEventMemberRole, removeEventMember };
