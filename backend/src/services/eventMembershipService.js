const { Op } = require("sequelize");

const sequelize = require("../config/database");

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
   - retrieving event members
   - retrieving organizer and co_organizer members
   - managing event member roles
   - transferring event ownership
   - enforcing business rules (capacity, roles, time)

   Notes:
   - critical membership creation flow uses Sequelize transactions
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
    const transaction = await sequelize.transaction();

    try {
        const event = await Event.findByPk(eventId, { transaction });

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        // Prevent joining past events
        assertEventNotPast(event);

        // Prevent joining when registration period is over
        const hasRegistrationDeadline = event.registrationDeadline;
        const isRegistrationClosed =
            hasRegistrationDeadline &&
            new Date() > new Date(event.registrationDeadline);

        if (isRegistrationClosed) {
            throwHttpError(409, "Registration period is over for this event");
        }

        // Prevent joining when participant capacity is reached
        if (event.maxParticipants !== null) {
            const participantCount = await EventUserRole.count({
                where: {
                    eventId,
                    role: EVENT_ROLES.PARTICIPANT
                },
                transaction
            });

            const hasReachedParticipantLimit =
                participantCount >= event.maxParticipants;

            if (hasReachedParticipantLimit) {
                throwHttpError(409, "Event has reached maximum number of participants");
            }
        }

        // Prevent duplicate join
        const existingMembership = await EventUserRole.findOne({
            where: { eventId, userId },
            transaction
        });

        if (existingMembership) {
            throwHttpError(409, "User already joined this event");
        }

        // Create membership
        const membership = await EventUserRole.create(
            {
                eventId,
                userId,
                role: EVENT_ROLES.PARTICIPANT
            },
            { transaction }
        );

        await transaction.commit();

        return membership;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


// User leaves an event
const leaveEvent = async ({ eventId, userId }) => {
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
};


/* ==================================================
   MEMBERS / ORGANIZER / CO-ORGANIZERS
================================================== */

// Get all members of an event
const getEventMembers = async (eventId) => {
    const event = await Event.findByPk(eventId);

    if (!event) {
        throwHttpError(404, "Event not found");
    }

    return EventUserRole.findAll({
        where: { eventId },
        include: [{
            model: User,
            attributes: ["id", "name", "email"]
        }],
        order: [["createdAt", "ASC"]]
    });
};


// Get organizer / co_organizer(s) of an event
const getEventStaff = async (eventId) => {
    const event = await Event.findByPk(eventId);

    if (!event) {
        throwHttpError(404, "Event not found");
    }

    return EventUserRole.findAll({
        where: {
            eventId,
            role: {
                [Op.in]: [
                    EVENT_ROLES.ORGANIZER,
                    EVENT_ROLES.CO_ORGANIZER
                ]
            }
        },
        include: [{
            model: User,
            attributes: ["id", "name", "email"]
        }],
        order: [["role", "ASC"], ["createdAt", "ASC"]]
    });
};


/* ==================================================
   ROLE MANAGEMENT
================================================== */

// Update a member's role of an event
const updateEventMemberRole = async ({ eventId, userId, newRole }) => {
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
};


// Remove a member from an event
const removeEventMember = async ({ eventId, userId }) => {
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
};


// Transfer event ownership to another existing member
const transferEventOwnership = async ({ eventId, currentUserId, targetUserId }) => {
    const transaction = await sequelize.transaction();

    try {
        const event = await Event.findByPk(eventId, { transaction });

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        assertEventNotPast(event);

        // Prevent organizer from transferring ownership to themselves
        if (currentUserId === targetUserId) {
            throwHttpError(400, "You cannot transfer ownership to yourself");
        }

        // Retrieve current organizer membership
        const currentOrganizerMembership = await EventUserRole.findOne({
            where: {
                eventId,
                userId: currentUserId
            },
            transaction
        });

        if (!currentOrganizerMembership) {
            throwHttpError(404, "Current organizer membership not found");
        }

        // Ensure current user is the organizer of the event0
        if (currentOrganizerMembership.role !== EVENT_ROLES.ORGANIZER) {
            throwHttpError(403, "Only the organizer can transfer event ownership");
        }

        // Retrieve target member membership
        const targetMembership = await EventUserRole.findOne({
            where: {
                eventId,
                userId: targetUserId
            },
            transaction
        });

        if (!targetMembership) {
            throwHttpError(404, "Target member is not part of this event");
        }

        // Transfer organizer role
        currentOrganizerMembership.role = EVENT_ROLES.CO_ORGANIZER;
        targetMembership.role = EVENT_ROLES.ORGANIZER;

        // Persist both role updates atomically
        await currentOrganizerMembership.save({ transaction });
        await targetMembership.save({ transaction });

        await transaction.commit();

        return {
            previousOrganizer: currentOrganizerMembership,
            newOrganizer: targetMembership
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    joinEvent,
    leaveEvent,
    getEventMembers,
    getEventStaff,
    updateEventMemberRole,
    removeEventMember,
    transferEventOwnership
};
