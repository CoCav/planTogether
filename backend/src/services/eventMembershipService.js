const { Op } = require("sequelize");

const sequelize = require("../config/database");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/associations/eventUserRoleModel");

const {
    EVENT_ROLES,
    VALID_EVENT_ROLES,
    STAFF_EVENT_ROLES
} = require("../constants/eventRoles");

const { throwHttpError } = require("../utils/errors/httpError");
const { assertEventNotPast } = require("../utils/events/eventStatus");
const { findEventByIdOrFail } = require("../utils/events/eventQueries");

const {
    findActiveMembership,
    findMembership
} = require("../utils/eventMemberships/eventMembershipQueries");

const { countActiveParticipants } = require("../utils/eventMemberships/eventParticipants");

const { buildAuthenticatedUserInclude } = require("../utils/users/userInclude");

/* ==========================================================================
   Event Membership Service

   Handles event membership business logic.

   Responsibilities
   - Join and leave events
   - Retrieve event members and staff
   - Update member roles
   - Remove members
   - Transfer event ownership
   - Enforce membership business rules

   Notes
   - Critical membership creation and ownership transfer flows use transactions.
   - deletedAt marks inactive memberships.
   - EventUserRole is used as the event membership join table.
=========================================================================== */

const REGISTRATION_CLOSED_ERROR = "Registration period is over for this event";
const EVENT_FULL_ERROR = "Event has reached maximum number of participants";
const USER_ALREADY_JOINED_ERROR = "User already joined this event";
const PARTICIPATION_NOT_FOUND_ERROR = "Participation not found";
const ORGANIZER_CANNOT_LEAVE_ERROR = "Organizers cannot leave their own event";
const INVALID_ROLE_ERROR = "Invalid role provided";
const MEMBER_NOT_FOUND_ERROR = "User is not a member of this event";
const ROLE_ALREADY_ASSIGNED_ERROR = "User already has this role";
const TRANSFER_SELF_ERROR = "You cannot transfer ownership to yourself";
const CURRENT_ORGANIZER_NOT_FOUND_ERROR = "Current organizer membership not found";
const ONLY_ORGANIZER_TRANSFER_ERROR = "Only the organizer can transfer event ownership";
const TARGET_MEMBER_NOT_FOUND_ERROR = "Target member is not part of this event";

/* Helpers */

const assertRegistrationIsOpen = (event) => {
    const isRegistrationClosed =
        event.registrationDeadline &&
        new Date() > new Date(event.registrationDeadline);

    if (isRegistrationClosed) {
        throwHttpError(409, REGISTRATION_CLOSED_ERROR);
    }
};

const assertParticipantLimitIsAvailable = async ({ event, eventId, transaction }) => {
    if (event.maxParticipants === null) {
        return;
    }

    const participantCount = await countActiveParticipants(EventUserRole, {
        eventId,
        transaction
    });

    if (participantCount >= event.maxParticipants) {
        throwHttpError(409, EVENT_FULL_ERROR);
    }
};

/* Join / leave events */

const joinEvent = async ({ eventId, userId }) => {
    const transaction = await sequelize.transaction();

    try {
        const event = await findEventByIdOrFail(Event, eventId, {
            transaction
        });

        assertEventNotPast(event);
        assertRegistrationIsOpen(event);

        await assertParticipantLimitIsAvailable({
            event,
            eventId,
            transaction
        });

        const existingMembership = await findMembership(EventUserRole, {
            eventId,
            userId,
            transaction
        });

        if (existingMembership && existingMembership.deletedAt === null) {
            throwHttpError(409, USER_ALREADY_JOINED_ERROR);
        }

        if (existingMembership && existingMembership.deletedAt !== null) {
            existingMembership.deletedAt = null;
            existingMembership.role = EVENT_ROLES.PARTICIPANT;

            await existingMembership.save({ transaction });
            await transaction.commit();

            return existingMembership;
        }

        const membership = await EventUserRole.create({
            eventId,
            userId,
            role: EVENT_ROLES.PARTICIPANT
        }, {
            transaction
        });

        await transaction.commit();

        return membership;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const leaveEvent = async ({ eventId, userId }) => {
    const event = await findEventByIdOrFail(Event, eventId);

    assertEventNotPast(event);

    const membership = await findActiveMembership(EventUserRole, {
        eventId,
        userId
    });

    if (!membership) {
        throwHttpError(404, PARTICIPATION_NOT_FOUND_ERROR);
    }

    if (membership.role === EVENT_ROLES.ORGANIZER) {
        throwHttpError(403, ORGANIZER_CANNOT_LEAVE_ERROR);
    }

    membership.deletedAt = new Date();

    await membership.save();
};

/* Members and staff */

const getEventMembers = async (eventId) => {
    await findEventByIdOrFail(Event, eventId);

    return EventUserRole.findAll({
        where: {
            eventId,
            deletedAt: null
        },
        include: [buildAuthenticatedUserInclude(User)],
        order: [["createdAt", "ASC"]]
    });
};

const getEventStaff = async (eventId) => {
    await findEventByIdOrFail(Event, eventId);

    return EventUserRole.findAll({
        where: {
            eventId,
            deletedAt: null,
            role: {
                [Op.in]: STAFF_EVENT_ROLES
            }
        },
        include: [buildAuthenticatedUserInclude(User)],
        order: [["role", "ASC"], ["createdAt", "ASC"]]
    });
};

/* Role management */

const updateEventMemberRole = async ({ eventId, userId, newRole }) => {
    const event = await findEventByIdOrFail(Event, eventId);

    assertEventNotPast(event);

    if (!VALID_EVENT_ROLES.includes(newRole)) {
        throwHttpError(400, INVALID_ROLE_ERROR);
    }

    const membership = await findActiveMembership(EventUserRole, {
        eventId,
        userId
    });

    if (!membership) {
        throwHttpError(404, MEMBER_NOT_FOUND_ERROR);
    }

    if (membership.role === newRole) {
        throwHttpError(400, ROLE_ALREADY_ASSIGNED_ERROR);
    }

    membership.role = newRole;

    await membership.save();

    return membership;
};

const removeEventMember = async ({ eventId, userId }) => {
    const event = await findEventByIdOrFail(Event, eventId);

    assertEventNotPast(event);

    const membership = await findActiveMembership(EventUserRole, {
        eventId,
        userId
    });

    if (!membership) {
        throwHttpError(404, MEMBER_NOT_FOUND_ERROR);
    }

    membership.deletedAt = new Date();

    await membership.save();
};

const transferEventOwnership = async ({ eventId, currentUserId, targetUserId }) => {
    const transaction = await sequelize.transaction();

    try {
        const event = await findEventByIdOrFail(Event, eventId, {
            transaction
        });

        assertEventNotPast(event);

        if (currentUserId === targetUserId) {
            throwHttpError(400, TRANSFER_SELF_ERROR);
        }

        const currentOrganizerMembership = await findActiveMembership(
            EventUserRole,
            {
                eventId,
                userId: currentUserId,
                transaction
            }
        );

        if (!currentOrganizerMembership) {
            throwHttpError(404, CURRENT_ORGANIZER_NOT_FOUND_ERROR);
        }

        if (currentOrganizerMembership.role !== EVENT_ROLES.ORGANIZER) {
            throwHttpError(403, ONLY_ORGANIZER_TRANSFER_ERROR);
        }

        const targetMembership = await findActiveMembership(EventUserRole, {
            eventId,
            userId: targetUserId,
            transaction
        });

        if (!targetMembership) {
            throwHttpError(404, TARGET_MEMBER_NOT_FOUND_ERROR);
        }

        currentOrganizerMembership.role = EVENT_ROLES.CO_ORGANIZER;
        targetMembership.role = EVENT_ROLES.ORGANIZER;

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
