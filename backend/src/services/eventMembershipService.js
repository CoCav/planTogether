const { Op } = require('sequelize');

const Event = require('../models/eventModel');
const User = require('../models/userModel');
const EventUserRole = require('../models/relations/eventUserRoleModel');

const { applyEventQueryFilters, buildCreatorInclude } = require("../utils/eventQueryFilters");
const { assertEventNotPast, getEventStatus } = require('../utils/eventTime');
const { getPaginationOptions } = require('../utils/pagination');

// Valid roles for event members
const VALID_ROLES = ['organizer', 'co_organizer', 'participant'];

/* ==================================================
   EVENT MEMBERSHIP SERVICE

   Handles:
   - joining and leaving events
   - retrieving authenticated user's events
   - managing event members and roles
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
   LIST USER EVENTS (MAIN COMPLEX LOGIC)
================================================== */

// Get all paginated events of the current user
const listMyEvents = async (userId, query = {}) => {
    try {
        const { view } = query;
        const now = new Date();

        const user = await User.findByPk(userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        /* =========================
           View-based filters
        ========================= */

        const isHistoryView = view === "createdHistory" || view === "joinedHistory";

        const roleFilter = !view
            ? undefined
            : view === "created" || view === "createdHistory"
                ? "organizer"
                : { [Op.in]: ["participant", "co_organizer"] };

        const eventDateFilter = !view
            ? {}
            : isHistoryView
                ? { endDateTime: { [Op.lt]: now } }
                : { endDateTime: { [Op.gte]: now } };


        /* =========================
           Event filters
        ========================= */

        const { creator, ...eventQuery } = query;

        const eventFilter = { ...eventDateFilter };
        applyEventQueryFilters(eventFilter, eventQuery, { includeStatus: false });


        /* =========================
           Pagination
        ========================= */

        const paginationQuery = {
            ...query,
            sortBy: query.sortBy || "startDateTime",
            order: query.order || (isHistoryView ? "desc" : "asc")
        };

        const {
            page,
            pageSize,
            limit,
            offset,
            orderField,
            orderDirection
        } = getPaginationOptions(
            paginationQuery,
            ["startDateTime", "title", "createdAt"],
            "startDateTime",
            isHistoryView ? "DESC" : "ASC"
        );


        /* =========================
           Query database
        ========================= */

        const { count, rows } = await EventUserRole.findAndCountAll({
            where: {
                userId,
                ...(roleFilter && { role: roleFilter })
            },
            include: [{
                model: Event,
                as: "event",
                where: eventFilter,
                attributes: [
                    "id",
                    "title",
                    "description",
                    "type",
                    "theme",
                    "mode",
                    "location",
                    "startDateTime",
                    "endDateTime",
                    "maxParticipants",
                    "registrationDeadline",
                    "creatorId"
                ],
                include: [
                    buildCreatorInclude(User, creator)
                ]
            }],
            limit,
            offset,
            order: [[{ model: Event, as: "event" }, orderField, orderDirection]]
        });


        /* =========================
           Data enrichment
        ========================= */

        const events = await Promise.all(
            rows.map(async (membership) => {
                const data = membership.toJSON();

                const participantCount = await EventUserRole.count({
                    where: {
                        eventId: data.event.id,
                        role: "participant"
                    }
                });

                return {
                    ...data,
                    event: {
                        ...data.event,
                        participantCount,
                        status: getEventStatus(data.event)
                    }
                };
            })
        );

        return {
            page,
            pageSize,
            totalEvents: count,
            totalPages: Math.ceil(count / pageSize),
            events
        };

    } catch (error) {
        console.error("Error in listMyEvents service:", error);
        throw error;
    }
};


/* ==================================================
   MEMBERS / ORGANIZER / CO-ORGANIZERS
================================================== */

// Get all members of an event
const listMembers = async (eventId) => {
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
        console.error('Error in listMembers service:', error);
        throw error;
    }
};


// Get organizer / co_organizer(s) of an event
const listOrganizers = async (eventId) => {
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
        console.error('Error in listOrganizers service:', error);
        throw error;
    }
};


/* ==================================================
   ROLE MANAGEMENT
================================================== */

// Update member role
const updateMemberRole = async ({ eventId, userId, newRole }) => {
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


// Remove member
const removeMember = async ({ eventId, userId }) => {
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

module.exports = { joinEvent, leaveEvent, listMyEvents, listMembers, listOrganizers, updateMemberRole, removeMember };
