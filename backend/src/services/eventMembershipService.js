const { Op, fn, col } = require('sequelize');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const EventUserRole = require('../models/relations/eventUserRoleModel');
const { applyEventQueryFilters, buildCreatorInclude } = require("../utils/eventQueryFilters");
const { assertEventNotPast, getEventStatus } = require('../utils/eventTime');
const { getPaginationOptions } = require('../utils/pagination');


const VALID_ROLES = ['organizer', 'co_organizer', 'participant'];

// User joins an event
const joinEvent = async ({ eventId, userId }) => {
    try {
        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if event is in the past
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
                where: {
                    eventId,
                    role: 'participant'
                }
            });

            if (participantCount >= event.maxParticipants) {
                const error = new Error('Event has reached maximum number of participants');
                error.statusCode = 409;
                throw error;
            }
        }

        // Check if user already joined the event
        const existingMembership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (existingMembership) {
            const error = new Error('User already joined this event');
            error.statusCode = 409;
            throw error;
        }

        // Add user to event as participant
        const membership = await EventUserRole.create({
            eventId,
            userId,
            role: 'participant'
        });

        return membership;

    } catch (error) {
        console.error('Error in joinEvent service:', error);
        throw error;
    }
};

// User leaves an event
const leaveEvent = async ({ eventId, userId }) => {
    try {
        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if event is in the past
        assertEventNotPast(event);

        // Check if membership exists
        const membership = await EventUserRole.findOne({ where: { eventId, userId } });

        if (!membership) {
            const error = new Error('Participation not found');
            error.statusCode = 404;
            throw error;
        }

        // Prevent organizer from leaving their own event
        if (membership.role === "organizer") {
            const error = new Error("Organizers cannot leave their own event");
            error.statusCode = 403;
            throw error;
        }

        // Remove membership
        await membership.destroy();
        return;

    } catch (error) {
        console.error('Error in leaveEvent service:', error);
        throw error;
    }
};

// Get all paginated events of the current user
const listMyEvents = async (userId, query = {}) => {
    try {
        const { view } = query;
        const now = new Date();

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        /* =========================
           View-based filters
           Determines:
           - which roles to include (organizer vs participant)
           - whether to show upcoming or past events
        ========================= */

        const isHistoryView = view === "createdHistory" || view === "joinedHistory";

        // Role filter based on active tab
        const roleFilter = !view
            ? undefined
            : view === "created" || view === "createdHistory"
                ? "organizer"
                : { [Op.in]: ["participant", "co_organizer"] };

        // Date filter based on active tab
        const eventDateFilter = !view
            ? {}
            : isHistoryView
                ? { endDateTime: { [Op.lt]: now } }   // past events
                : { endDateTime: { [Op.gte]: now } }; // upcoming events


        /* =========================
           Event filters
           Applies common filters:
           - search
           - type / theme / location / mode
           - date filters (today / range)

           Note:
           - creator is handled separately in include
        ========================= */

        const { creator, ...eventQuery } = query;

        const eventFilter = { ...eventDateFilter };
        applyEventQueryFilters(eventFilter, eventQuery, { includeStatus: false });


        /* =========================
           Pagination + sorting
           Handles:
           - page / pageSize
           - sorting (asc/desc)
           - default sort depending on view
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
           Retrieves:
           - user memberships
           - related events
           - creator (with optional filtering)
        ========================= */

        const { count, rows } = await EventUserRole.findAndCountAll({
            where: {
                userId,
                ...(roleFilter && { role: roleFilter })
            },
            include: [{
                model: Event,
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
                    // Creator filtering handled here (not in whereConditions)
                    buildCreatorInclude(User, creator)
                ]
            }],
            limit,
            offset,
            order: [[{ model: Event }, orderField, orderDirection]]
        });


        /* =========================
           Data enrichment
           Adds:
           - participant count
           - computed event status (upcoming / past)
        ========================= */

        const events = await Promise.all(
            rows.map(async (membership) => {
                const data = membership.toJSON();

                const participantCount = await EventUserRole.count({
                    where: {
                        eventId: data.Event.id,
                        role: "participant"
                    }
                });

                return {
                    ...data,
                    Event: {
                        ...data.Event,
                        participantCount,
                        status: getEventStatus(data.Event)
                    }
                };
            })
        );

        const totalEvents = count;

        return {
            page,
            pageSize,
            totalEvents,
            totalPages: Math.ceil(totalEvents / pageSize),
            events
        };

    } catch (error) {
        console.error("Error in listMyEvents service:", error);
        throw error;
    }
};

// Get all members of an event
const listMembers = async (eventId) => {
    try {

        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Get all memberships with user info
        const memberships = await EventUserRole.findAll({
            where: { eventId },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'ASC']]
        });

        return memberships;

    } catch (error) {
        console.error('Error in listMembers service:', error);
        throw error;
    }
};

// Get organizers and co_organizers of an event
const listOrganizers = async (eventId) => {
    try {

        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Get organizers & co_organizers
        const organizers = await EventUserRole.findAll({
            where: {
                eventId,
                role: {
                    [Op.in]: ['organizer', 'co_organizer']
                }
            },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['role', 'ASC'], ['createdAt', 'ASC']]
        });

        return organizers;

    } catch (error) {
        console.error('Error in listOrganizers service:', error);
        throw error;
    }
};

// Update a user's role in an event
// Authorization is mainly handled by middleware, but core business rules
// are enforced here as a safety layer.
const updateMemberRole = async ({ eventId, userId, newRole }) => {
    try {

        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if event is in the past
        assertEventNotPast(event);

        // Validate role
        if (!VALID_ROLES.includes(newRole)) {
            const error = new Error('Invalid role provided');
            error.statusCode = 400;
            throw error;
        }

        // Check if membership exists
        const membership = await EventUserRole.findOne({
            where: { eventId, userId }
        });

        if (!membership) {
            const error = new Error('User is not a member of this event');
            error.statusCode = 404;
            throw error;
        }

        // Prevent useless update
        if (membership.role === newRole) {
            const error = new Error('User already has this role');
            error.statusCode = 400;
            throw error;
        }

        // Update role
        membership.role = newRole;
        await membership.save();

        return membership;

    } catch (error) {
        console.error('Error in updateMemberRole service:', error);
        throw error;
    }
};

// Remove a member from an event
// Authorization is partly handled by middleware, but role hierarchy
// and protected member rules are enforced here.
const removeMember = async ({ eventId, userId, requestingUserId }) => {
    try {

        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if event is in the past
        assertEventNotPast(event);

        // Check if membership exists
        const membership = await EventUserRole.findOne({
            where: { eventId, userId }
        });

        if (!membership) {
            const error = new Error('User is not a member of this event');
            error.statusCode = 404;
            throw error;
        }

        // Remove membership
        await membership.destroy();
        return;

    } catch (error) {
        console.error('Error in removeMember service:', error);
        throw error;
    }
};

module.exports = { joinEvent, leaveEvent, listMembers, listOrganizers, updateMemberRole, removeMember, listMyEvents };
