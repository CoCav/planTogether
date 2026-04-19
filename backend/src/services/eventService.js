const { Op, fn, col, literal } = require('sequelize');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const EventUserRole = require('../models/Link/eventUserRoleModel');

// Create a new event and assign the creator as the organizer
const createEvent = async (data, userId) => {
    try {
        // Get all datas from an user while creating an event
        const { title, description, startDateTime, endDateTime, mode, type, theme, location } = data;

        // Minimal safety validation (defensive layer)
        if (new Date(endDateTime) < new Date(startDateTime)) {
            const error = new Error("End date must be after start date");
            error.statusCode = 400;
            throw error;
        }

        const event = await Event.create({
            title,
            description,
            startDateTime,
            endDateTime,
            mode,
            location: mode === "online" ? null : location,
            type,
            theme,
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

// Get all events
const getAllEvents = async () => {
    try {
        return await Event.findAll({
            attributes: {
            include: [ [fn("COUNT", col("participants.id")), "participantCount"]] },
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
            group: ["Event.id", "creator.id"],
            order: [["createdAt", "DESC"]]
        });
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
            attributes: { include: [[fn("COUNT", col("participants.id")), "participantCount"]] },
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

        return event;
    } catch (error) {
        console.error("Error in getting the event:", error);
        throw error;
    }
};

// Filters events based on various criteria : date, creator, type, theme, location and keyword search
// Sorted by ascending date
const getFilteredEvents = async (query) => {
    try {

         const {
            date,
            startDate,
            endDate,
            creatorId,
            type,
            theme,
            location,
            mode,
            search,
            sortBy = 'startDateTime',
            order = 'asc',
            page = 1,
            pageSize = 10
        } = query;
        
        const whereConditions = {};

        // // Filter by exact date
        if (date) {
            const exactDate = new Date(date);
            const nextDay = new Date(exactDate);

            nextDay.setDate(nextDay.getDate() + 1);

            whereConditions.startDateTime = {
                [Op.gte]: exactDate,
                [Op.lt]: nextDay,
            }};
            
       
        // } 
        // Filter by range date
        if (startDate || endDate) {
            const start = startDate ? new Date(`${startDate}T00:00:00.000`) : null;
            const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
            
            if (start && Number.isNaN(start.getTime())) {
                const error = new Error("Invalid startDate");
                error.statusCode = 400;
                throw error;
            }

            if (end && Number.isNaN(end.getTime())) {
                const error = new Error("Invalid endDate");
                error.statusCode = 400;
                throw error;
            }

            if (start && end) whereConditions[Op.and] = [ 
                    {startDateTime: {[Op.lte]: end}}, 
                    {endDateTime: {[Op.gte]: start}}
                ];
            else if (start) whereConditions.startDateTime = { [Op.gte]: start };
            else if (end) whereConditions.startDateTime = { [Op.lte]: end };
        }

        // Filter by creator/type/theme/mode/location
        if (creatorId) whereConditions.creatorId = parseInt(creatorId, 10);
        if (mode) whereConditions.mode = String(mode).trim();;
        if (type) whereConditions.type = { [Op.iLike]: `%${type}%` };
        if (theme) whereConditions.theme = { [Op.iLike]: `%${theme}%` };
        if (location) whereConditions.location = { [Op.iLike]: `%${location}%` };

        // Search in title or description
        if (search) {
            whereConditions[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ];
        } 
     
        // Sorting allowlist (prevents SQL injection)
        const allowedSortFields = ['startDateTime', 'title', 'creatorId', 'createdAt'];
        const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'startDateTime';
        const orderDirection = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        // Pagination (simple + capped)
        const limitInt = Math.min(parseInt(pageSize, 10) || 10, 100);
        const pageInt = Math.max(parseInt(page, 10) || 1, 1);
        const offsetInt = (pageInt - 1) * limitInt;

        // Query: fetch the filtered events with creator and participant count
        const { count, rows } = await Event.findAndCountAll({
            where: whereConditions,
            limit: limitInt,
            offset: offsetInt,
            order: [[orderField, orderDirection]],
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name']
            }],
            attributes: {
                include: [
                    [ literal(`(
                            SELECT COUNT(*)
                            FROM "event_user_roles" AS eur
                            WHERE eur."eventId" = "Event"."id"
                              AND eur."role" = 'participant'
                        )`),
                        "participantCount"
                    ]
                ]
            }
        });
  
        return {
            page: pageInt,
            pageSize: limitInt,
            totalEvents: count,
            totalPages: Math.ceil(count / limitInt),
            events: rows
        };
        
    } catch (error) {
        console.error('Error in filtering events:', error);
        throw error;
    }
}


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

        const {
            title,
            description,
            startDateTime,
            endDateTime,
            mode,
            type,
            theme,
            location 
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
            startDateTime,
            endDateTime,
            mode,
            location: mode === "online" ? null : location,
            type,
            theme
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

        await event.destroy();
        return;

    } catch (error) {
        console.error('Error in deleting the event:', error);
        throw error;
    }
};

module.exports = { createEvent, getAllEvents, getEventById, getFilteredEvents, updateEventById, deleteEventById };