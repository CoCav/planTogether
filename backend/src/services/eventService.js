const { fn, col } = require("sequelize");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");

const { deleteUploadedFile } = require("../utils/uploadedFileStorage");
const { assertEventNotPast, getEventStatus } = require("../utils/eventStatus");
const { buildEventWhereConditions, buildEventCreatorInclude } = require("../utils/eventQueryBuilder");
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
================================================== */

/* =============================
   CREATE EVENT
============================= */

// Create a new event
const createEvent = async (data, userId) => {
    try {
        const {
            title,
            description,
            type,
            theme,
            mode,
            location,
            startDateTime,
            endDateTime,
            maxParticipants,
            registrationDeadline,
            image
        } = data;

        // Ensure event dates are coherent
        if (new Date(endDateTime) < new Date(startDateTime)) {
            const error = new Error("End date must be after start date");
            error.statusCode = 400;
            throw error;
        }

        const event = await Event.create({
            title,
            description,
            type,
            theme,
            mode,
            location: mode === "online" ? null : location,
            startDateTime,
            endDateTime,
            maxParticipants: maxParticipants ?? null,
            registrationDeadline: registrationDeadline ?? null,
            image: image ?? null,
            creatorId: userId
        });

        // Creator automatically becomes organizer
        await EventUserRole.create({
            eventId: event.id,
            userId,
            role: 'organizer'
        });

        return event;

    } catch (error) {
        console.error('Error in creating the event:', error);
        throw error;
    }
};


/* =============================
   GET EVENTS
============================= */

// Get all events with optional filters and pagination
const getAllEvents = async (query = {}) => {
    try {
        const whereConditions = {};

        // Applies status, date, search, type, theme, mode, location and creatorId filters
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
                        where: { role: "participant" }
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

    } catch (error) {
        console.error("Error in getEvents service:", error);
        throw error;
    }
};


// Get one event by ID
const getEventByID = async (id) => {
    try {
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
                        where: { role: "participant" }
                    },
                    required: false
                }
            ],
            group: ["Event.id", "creator.id"]
        });

        if (!event) {
            const error = new Error("Event not found");
            error.statusCode = 404;
            throw error;
        }

        return {
            ...event.toJSON(),
            status: getEventStatus(event)
        };

    } catch (error) {
        console.error("Error in getting the event:", error);
        throw error;
    }
};

/* =============================
   UPDATE / DELETE EVENT
============================= */

// Update an event
const updateEventByID = async (id, data) => {
    try {
        const event = await Event.findByPk(id);

        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Past events are locked
        assertEventNotPast(event);

        const oldImage = event.image;

        const {
            title,
            description,
            type,
            theme,
            mode,
            location,
            startDateTime,
            endDateTime,
            maxParticipants,
            registrationDeadline,
            image
        } = data;

        // Validate date order only when both dates are provided
        if (startDateTime && endDateTime) {
            if (new Date(endDateTime) < new Date(startDateTime)) {
                const error = new Error("End date must be after start date");
                error.statusCode = 400;
                throw error;
            }
        }

        const updatedData = {
            title,
            description,
            type,
            theme,
            mode,
            location: mode === "online" ? null : location,
            startDateTime,
            endDateTime,
            maxParticipants: maxParticipants ?? null,
            registrationDeadline: registrationDeadline ?? null,
            image: image !== undefined ? image : event.image
        };

        await event.update(updatedData);

        // Delete old image only after successful DB update
        if (image !== undefined && image && oldImage && oldImage !== image) {
            await deleteUploadedFile(oldImage);
        }

        return event;

    } catch (error) {
        console.error('Error in updating the event:', error);
        throw error;
    }
};


// Delete an event
const deleteEventByID = async (id) => {
    try {
        const event = await Event.findByPk(id);

        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Past events cannot be deleted
        assertEventNotPast(event);

        await event.destroy();

    } catch (error) {
        console.error('Error in deleting the event:', error);
        throw error;
    }
};

module.exports = { createEvent, getAllEvents, getEventByID, updateEventByID, deleteEventByID };
