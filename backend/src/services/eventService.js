const { fn, col } = require("sequelize");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");

const { EVENT_ROLES } = require("../constants/eventRoles");

const { throwHttpError } = require("../utils/errors/httpError");

const { buildEventCreateData, buildEventUpdateData } = require("../utils/events/eventDataBuilder");
const { buildEventWhereConditions, buildEventCreatorInclude } = require("../utils/events/eventQueryBuilder");
const { assertEventNotPast, getEventStatus } = require("../utils/events/eventStatus");

const { deleteUploadedFile } = require("../utils/uploadedFileStorage");
const { getPaginationOptions } = require("../utils/pagination");

/* ==================================================
   EVENT SERVICE

   Handles:
   - event creation
   - event listing with optional filters and pagination
   - single event retrieval
   - event update and deletion
   - participant count and status enrichment

   Notes:
   - creator is automatically added as organizer
   - getAllEvents supports filters through query params
   - past events cannot be updated or deleted
   - event images are cleaned after successful update
   - event roles are centralized through shared constants
   - uses shared HTTP error utilities
================================================== */


/* =============================
   CREATE EVENT
============================= */

// Create a new event
const createEvent = async (data, userId) => {
    const { startDateTime, endDateTime } = data;

    // Ensure event dates are coherent before persistence
    if (new Date(endDateTime) < new Date(startDateTime)) {
        throwHttpError(400, "End date must be after start date");
    }

    const eventData = buildEventCreateData(data, userId);

    const event = await Event.create(eventData);

    // Creator automatically becomes organizer
    await EventUserRole.create({
        eventId: event.id,
        userId,
        role: EVENT_ROLES.ORGANIZER
    });

    return event;
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
            include: [[fn("COUNT", col("participants.id")), "participantCount"]]
        },
        include: [
            buildEventCreatorInclude(User, query.creator),
            {
                model: User,
                as: "participants",
                attributes: [],
                through: {
                    attributes: [],
                    where: { role: EVENT_ROLES.PARTICIPANT }
                },
                required: false
            }
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


// Get a single event by ID
const getEventByID = async (id) => {

    const event = await Event.findOne({
        where: { id },
        attributes: {
            include: [[fn("COUNT", col("participants.id")), "participantCount"]]
        },
        include: [
            {
                model: User,
                as: "creator",
                attributes: ["id", "name"]
            },
            {
                model: User,
                as: "participants",
                attributes: [],
                through: {
                    attributes: [],
                    where: { role: EVENT_ROLES.PARTICIPANT }
                },
                required: false
            }
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
    try {
        const event = await Event.findByPk(id);

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        // Past events are locked
        assertEventNotPast(event);

        const oldImage = event.image;
        const { startDateTime, endDateTime, image } = data;

        // Validate date order only when both dates are provided
        const hasBothDates = startDateTime && endDateTime;

        if (hasBothDates && new Date(endDateTime) < new Date(startDateTime)) {
            throwHttpError(400, "End date must be after start date");
        }

        const updatedData = buildEventUpdateData(event, data);

        await event.update(updatedData);

        // Delete old image only after successful DB update
        if (image !== undefined && image && oldImage && oldImage !== image) {
            await deleteUploadedFile(oldImage);
        }

        return event;

    } catch (error) {
        console.error("Error in updating the event:", error);
        throw error;
    }
};


// Delete an event
const deleteEventByID = async (id) => {
    const event = await Event.findByPk(id);

    if (!event) {
        throwHttpError(404, "Event not found");
    }

    // Past events cannot be deleted
    assertEventNotPast(event);

    await event.destroy();
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventByID,
    updateEventByID,
    deleteEventByID
};
