const eventService = require('../services/eventService');

// Create a new event
const createEvent = async (req, res, next) => {
    try {
        const image = req.file ? `/uploads/events/${req.file.filename}` : null;

        const event = await eventService.createEvent(
            {
                ...req.body,
                image
            },
            req.user.userId
        );

        return res.status(201).json({
            message: "Event created successfully",
            event: event
        });

    } catch (error) {
        return next(error);
    }
};

// Get all events
const getAllEvents = async (req, res, next) => {
    try {
        const events = await eventService.getAllEvents(req.query);

        return res.status(200).json({
            message: "All events retrieved successfully",
            ...events
        });

    } catch (error) {
        return next(error)
    }
};

// Get an event by its ID
const getEvent = async (req, res, next) => {
    try {
        // Check if event exists
        const event = await eventService.getEventById(req.params.eventId);

        return res.status(200).json({
            message: "Event retrieved successfully",
            event: event
        });

    } catch (error) {
        return next(error);
    }
};


// Get filtered events
const getFilteredEvents = async (req, res, next) => {
    try {
        const result = await eventService.getFilteredEvents(req.query);
        return res.status(200).json(result);

    } catch (err) {
        return next(err);
    }
};

// ORGANIZER OR CO_ORGANIZER

// Update an event
const updateEvent = async (req, res, next) => {
    try {
        const image = req.file ? `/uploads/events/${req.file.filename}` : undefined;

        const updatedEvent = await eventService.updateEventById(
            req.params.eventId,
            {
                ...req.body,
                image
            }
        );

        return res.status(200).json({
            message: 'Event updated successfully',
            event: updatedEvent
        });

    } catch (error) {
        return next(error);
    }
};

// Delete an event
const deleteEvent = async (req, res, next) => {
    try {
        const deletedEvent = await eventService.deleteEventById(req.params.eventId);

        return res.status(200).json({
            message: 'Event deleted successfully'
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = { createEvent, getAllEvents, getEvent, getFilteredEvents, updateEvent, deleteEvent };
