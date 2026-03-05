const { Op } = require('sequelize');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const EventUserRole = require('../models/Link/eventUserRoleModel');

// Create a new event and assign the creator as the organizer
const createEvent = async (data, userId) => {
    try {
        // Get all datas from an user while creating an event
        const { title, description, date, type, theme, location } = data;

        const event = await Event.create({
            title,
            description,
            date,
            location,
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
        return await Event.findAll();
    } catch (error) {
        console.error('Error in getting all events:', error);
        throw error;
    }
};

// Get an event by its ID
const getEventById = async (id) => {
    try {
        //Check if event exists
        const event = await Event.findByPk(id);

        if (!event) {
            const error = new Error('Event not found');
            error.statusCode = 404;
            throw error;
        }

        return event

    } catch (error) {
        console.error('Error in getting the event:', error);
        throw error;
    }
};

// Filters events based on various criteria : date, creator, type, theme, location and keyword search
// Sorted by ascending date
const getFilteredEvents = async (query) => {
    try {

         const {
            startDate,
            endDate,
            creatorId,
            type,
            theme,
            location,
            search,
            sortBy = 'date',
            order = 'asc',
            page = 1,
            pageSize = 10
        } = query;
        
        const whereConditions = {};

        //  Filter by date ranges
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && Number.isNaN(start.getTime())) {
                const error = new Error('Invalid startDate');
                error.statusCode = 400;
                throw error;
            }
            if (end && Number.isNaN(end.getTime())) {
                const error = new Error('Invalid endDate');
                error.statusCode = 400;
                throw error;
            }

            if (start && end) whereConditions.date = { [Op.between]: [start, end] };
            else if (start) whereConditions.date = { [Op.gte]: start };
            else if (end) whereConditions.date = { [Op.lte]: end };
        }

        // Filter by creator
        if (creatorId) {
            const creatorIdInt = parseInt(creatorId, 10);

            if (Number.isNaN(creatorIdInt)) {
                const error = new Error('Invalid creatorId');
                error.statusCode = 400;
                throw error;
            }

            whereConditions.creatorId = { [Op.eq]: creatorIdInt };
        }

        // Filter by type/theme/location
        if (type) whereConditions.type = { [Op.iLike]: `%${String(type).trim()}%` };
        if (theme) whereConditions.theme = { [Op.iLike]: `%${String(theme).trim()}%` };
        if (location) whereConditions.location = { [Op.iLike]: `%${String(location).trim()}%` };

        // Search in title or description
        if (search) {
            const s = String(search).trim();
            if (s) {
                 whereConditions[Op.or] = [
                    { title: { [Op.iLike]: `%${s}%` } },
                    { description: { [Op.iLike]: `%${s}%` } },
                ];
            }
        }    
     
        // Sorting allowlist (prevents SQL injection)
        const allowedSortFields = ['date', 'title', 'creatorId'];
        const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
        const orderDirection = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        // Pagination (simple + capped)
        const limitInt = Math.min(parseInt(pageSize, 10) || 10, 100);
        const pageInt = Math.max(parseInt(page, 10) || 1, 1);
        const offsetInt = (pageInt - 1) * limitInt;

        // Fetch the filtered events
        const { count, rows } = await Event.findAndCountAll({
            where: whereConditions,
            limit: limitInt,
            offset: offsetInt,
            order: [[orderField, orderDirection]],
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name'],
            }],
        });
  
        return {
            page: pageInt,
            pageSize: limitInt,
            totalEvents: count,
            totalPages: Math.ceil(count / limitInt),
            events: rows,
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

        await event.update(data);
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