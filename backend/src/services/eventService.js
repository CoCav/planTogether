const { Op, fn, col } = require('sequelize');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const EventUserRole = require('../models/relations/eventUserRoleModel');
const { getPaginationOptions } = require('../utils/pagination');
const { assertEventNotPast, getEventStatus } = require('../utils/eventTime');
const { applyStatusFilter, applyEventQueryFilters } = require('../utils/eventQueryFilters');

// Create a new event and assign the creator as the organizer
const createEvent = async (data, userId) => {
    try {
        // Get all datas from an user while creating an event
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

        // Minimal safety validation
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

        // Automatically assign the creator as the organizer
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

// Get all events with pagination
const getAllEvents = async (query) => {
    try {

        const { status } = query;
        const whereConditions = {};

        // Apply backend status filter before pagination
        applyStatusFilter(whereConditions, status);

        const {
            page,
            pageSize,
            limit,
            offset,
            orderField,
            orderDirection
        } = getPaginationOptions(query, ["startDateTime", "title", "creatorId", "createdAt"], "createdAt", "DESC");

        const { count, rows } = await Event.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            order: [[orderField, orderDirection]],
            attributes: {
                include: [[fn("COUNT", col("participants.id")), "participantCount"]]
            },
            include: [{
                model: User,
                as: "creator",
                attributes: ["id", "name"]
            }, {
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
        console.error("Error in getting all events:", error);
        throw error;
    }
};

// Get an event by its ID
const getEventById = async (id) => {
    try {
        const event = await Event.findOne({
            where: { id },
            attributes: {
                include: [[fn("COUNT", col("participants.id")), "participantCount"]]
            },
            include: [{
                model: User,
                as: "creator",
                attributes: ["id", "name"]
            }, {
                model: User,
                as: "participants",
                attributes: [],
                through: {
                    attributes: [],
                    where: { role: "participant" }
                },
                required: false
            }],
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

// Filters events based on various criteria and supports pagination + sorting
const getFilteredEvents = async (query) => {
    try {

        const whereConditions = {};
        applyEventQueryFilters(whereConditions, query);

        const {
            page,
            pageSize,
            limit,
            offset,
            orderField,
            orderDirection
        } = getPaginationOptions(query, ["startDateTime", "title", "creatorId", "createdAt"], "createdAt", "DESC");

        const { count, rows } = await Event.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            order: [[orderField, orderDirection]],
            attributes: {
                include: [[fn("COUNT", col("participants.id")), "participantCount"]]
            },
            include: [{
                model: User,
                as: "creator",
                attributes: ["id", "name"]
            }, {
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
        console.error("Error in filtering events:", error);
        throw error;
    }
};

// ORGANIZER AND CO_ORGANIZER

// Update an event
const updateEventById = async (id, data) => {
    try {
        // Check if event exists
        const event = await Event.findByPk(id);

        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if event is in the past
        assertEventNotPast(event);

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

        // Minimal safety validation
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
        return event;

    } catch (error) {
        console.error('Error in updating the event:', error);
        throw error;
    }
};

// Delete an event
const deleteEventById = async (id) => {
    try {
        // Check if event exists
        const event = await Event.findByPk(id);

        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if event is in the past
        assertEventNotPast(event);

        await event.destroy();
        return;

    } catch (error) {
        console.error('Error in deleting the event:', error);
        throw error;
    }
};

module.exports = { createEvent, getAllEvents, getEventById, getFilteredEvents, updateEventById, deleteEventById };
