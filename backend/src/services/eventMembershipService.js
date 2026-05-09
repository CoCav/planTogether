const { Op } = require("sequelize");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");

const { assertEventNotPast, getEventStatus } = require("../utils/events/eventStatus");
const { getPaginationOptions } = require("../utils/pagination");

// Valid roles for event members
const VALID_ROLES = ['organizer', 'co_organizer', 'participant'];

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
================================================== */

/* ==================================================
   JOIN / LEAVE EVENTS
================================================== */

// User joins an event
const joinEvent = async ({ eventId, userId }) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Prevent joining past events
        assertEventNotPast(event);

        // Check registration deadline
        if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
            const error = new Error('Registration period is over for this event');
            error.statusCode = 409;
            throw error;
        }

        // Check max participants limit
        if (event.maxParticipants !== null) {
            const participantCount = await EventUserRole.count({
                where: { eventId, role: 'participant' }
            });

            if (participantCount >= event.maxParticipants) {
                const error = new Error('Event has reached maximum number of participants');
                error.statusCode = 409;
                throw error;
            }
        }

        // Prevent duplicate join
        const existingMembership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (existingMembership) {
            const error = new Error('User already joined this event');
            error.statusCode = 409;
            throw error;
        }

        // Create membership
        return await EventUserRole.create({
            eventId,
            userId,
            role: 'participant'
        });

    } catch (error) {
        console.error('Error in joinEvent service:', error);
        throw error;
    }
};


// User leaves an event
const leaveEvent = async ({ eventId, userId }) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        assertEventNotPast(event);

        const membership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (!membership) {
            const error = new Error('Participation not found');
            error.statusCode = 404;
            throw error;
        }

        // Prevent organizer from leaving
        if (membership.role === "organizer") {
            const error = new Error("Organizers cannot leave their own event");
            error.statusCode = 403;
            throw error;
        }

        await membership.destroy();

    } catch (error) {
        console.error('Error in leaveEvent service:', error);
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
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        return await EventUserRole.findAll({
            where: { eventId },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'ASC']]
        });

    } catch (error) {
        console.error('Error in listEventMembers service:', error);
        throw error;
    }
};


// Get organizer / co_organizer(s) of an event
const getEventStaff = async (eventId) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        return await EventUserRole.findAll({
            where: {
                eventId,
                role: { [Op.in]: ['organizer', 'co_organizer'] }
            },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['role', 'ASC'], ['createdAt', 'ASC']]
        });

    } catch (error) {
        console.error('Error in listEventStaff service:', error);
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
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        assertEventNotPast(event);

        if (!VALID_ROLES.includes(newRole)) {
            const error = new Error('Invalid role provided');
            error.statusCode = 400;
            throw error;
        }

        const membership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (!membership) {
            const error = new Error('User is not a member of this event');
            error.statusCode = 404;
            throw error;
        }

        if (membership.role === newRole) {
            const error = new Error('User already has this role');
            error.statusCode = 400;
            throw error;
        }

        membership.role = newRole;
        await membership.save();

        return membership;

    } catch (error) {
        console.error('Error in updateMemberRole service:', error);
        throw error;
    }
};


// Remove a member from an event
const removeEventMember = async ({ eventId, userId }) => {
    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        assertEventNotPast(event);

        const membership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (!membership) {
            const error = new Error('User is not a member of this event');
            error.statusCode = 404;
            throw error;
        }

        await membership.destroy();

    } catch (error) {
        console.error('Error in removeMember service:', error);
        throw error;
    }
};

module.exports = { joinEvent, leaveEvent, getEventMembers, getEventStaff, updateEventMemberRole, removeEventMember };
