const sequelize = require("../config/database");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");

const { EVENT_ROLES } = require("../constants/eventRoles");
const { EVENT_STATUS } = require("../constants/eventStatus");

const { throwHttpError } = require("../utils/errors/httpError");

const {
    buildEventWhereConditions,
    buildEventCreatorInclude,
    buildParticipantCountAttribute,
    buildActiveParticipantInclude
} = require("../utils/events/eventQueryBuilder");

const { buildEventCreateData, buildEventUpdateData } = require("../utils/events/eventDataBuilder");

const { assertEventNotPast, getEventStatus } = require("../utils/events/eventStatus");

const { deleteUploadedFile } = require("../utils/files/uploadedFileStorage");
const { getPaginationOptions } = require("../utils/pagination");

/* ==================================================
   EVENT SERVICE

   Handles:
   - event creation
   - optimized event listing with optional filters and pagination
   - single event retrieval and access resolution
   - current authenticated user event access
   - event update and deletion
   - participant count and status enrichment

   Notes:
   - critical write operations use Sequelize transactions
   - creator is automatically added as organizer
   - event listings count active participants with COUNT DISTINCT
   - participant count queries ignore soft-deleted memberships
   - getAllEvents supports filters through query params
   - past events cannot be updated or deleted
   - event images are cleaned only after successful DB commits
   - event roles are centralized through shared constants
   - uses shared HTTP error utilities
================================================== */

/* =============================
   CREATE EVENT
============================= */

// Create a new event
const createEvent = async (data, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const { startDateTime, endDateTime } = data;

        // Ensure event dates are coherent before persistence
        if (new Date(endDateTime) < new Date(startDateTime)) {
            throwHttpError(400, "End date must be after start date");
        }

        const eventData = buildEventCreateData(data, userId);

        const event = await Event.create(eventData, { transaction });

        // Creator automatically becomes organizer
        await EventUserRole.create({
            eventId: event.id,
            userId,
            role: EVENT_ROLES.ORGANIZER
        }, {
            transaction
        });

        await transaction.commit();

        return event;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/* =============================
   GET EVENTS
============================= */

// Get all events with optional filters and pagination
const getAllEvents = async (query = {}) => {
    const whereConditions = {};

    // Apply filters to Sequelize where conditions
    buildEventWhereConditions(whereConditions, query);

    const {
        page,
        pageSize,
        limit,
        offset,
        orderField,
        orderDirection
    } = getPaginationOptions(
        query,
        ["startDateTime", "title", "creatorId", "createdAt"],
        "createdAt",
        "DESC"
    );

    const { count, rows } = await Event.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [[orderField, orderDirection]],
        attributes: {
            include: [
                buildParticipantCountAttribute(sequelize, "participants.id")
            ]
        },
        include: [
            buildEventCreatorInclude(User, query.creator),
            buildActiveParticipantInclude(User)
        ],
        group: ["Event.id", "creator.id"],
        subQuery: false
    });

    const totalEvents = Array.isArray(count) ? count.length : count;

    return {
        page,
        pageSize,
        totalEvents,
        totalPages: Math.ceil(totalEvents / pageSize),

        events: rows.map((event) => ({
            ...event.toJSON(),
            status: getEventStatus(event)
        }))
    };
};

// Get current authenticated user's access permissions for one event
const getCurrentUserEventAccess = async (eventId, userId) => {
    const event = await Event.findByPk(eventId);

    if (!event) {
        throwHttpError(404, "Event not found");
    }

    // Look for the user's active membership on this event
    const membership = await EventUserRole.findOne({
        where: {
            eventId,
            userId,
            deletedAt: null
        }
    });

    const role = membership?.role || null;
    const status = getEventStatus(event);
    const isPast = status === EVENT_STATUS.PAST;

    // Organizers and co-organizers can edit upcoming events
    const canEdit = !isPast && (
        role === EVENT_ROLES.ORGANIZER ||
        role === EVENT_ROLES.CO_ORGANIZER
    );

    // Only organizers can delete upcoming events
    const canDelete = !isPast && role === EVENT_ROLES.ORGANIZER;

    return {
        role,
        status,
        canEdit,
        canDelete
    };
};

// Get a single event by ID
const getEventByID = async (id) => {
    const event = await Event.findOne({
        where: { id },
        attributes: {
            include: [
                buildParticipantCountAttribute(sequelize, "participants.id")
            ]
        },
        include: [
            buildEventCreatorInclude(User),
            buildActiveParticipantInclude(User)
        ],
        group: ["Event.id", "creator.id"]
    });

    if (!event) {
        throwHttpError(404, "Event not found");
    }

    return {
        ...event.toJSON(),
        status: getEventStatus(event)
    };
};


/* =============================
   UPDATE / DELETE EVENT
============================= */

// Update an existing event
const updateEventByID = async (id, data) => {
    const transaction = await sequelize.transaction();

    try {
        const event = await Event.findByPk(id, { transaction });

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        assertEventNotPast(event);

        const oldImage = event.image;
        const { startDateTime, endDateTime, image } = data;

        const hasBothDates = startDateTime && endDateTime;

        if (hasBothDates && new Date(endDateTime) < new Date(startDateTime)) {
            throwHttpError(400, "End date must be after start date");
        }

        const updatedData = buildEventUpdateData(event, data);

        await event.update(updatedData, { transaction });

        await transaction.commit();

        // Delete old image only after successful DB commit
        if (image !== undefined && image && oldImage && oldImage !== image) {
            await deleteUploadedFile(oldImage);
        }

        return event;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


// Delete an event
const deleteEventByID = async (id) => {
    const transaction = await sequelize.transaction();

    try {
        const event = await Event.findByPk(id, { transaction });

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        // Past events cannot be deleted
        assertEventNotPast(event);

        const oldImage = event.image;

        await EventUserRole.destroy({
            where: { eventId: id },
            transaction
        });

        await event.destroy({ transaction });

        await transaction.commit();

        // Delete event image only after successful DB commit
        if (oldImage) {
            await deleteUploadedFile(oldImage);
        }

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getCurrentUserEventAccess,
    getEventByID,
    updateEventByID,
    deleteEventByID
};
