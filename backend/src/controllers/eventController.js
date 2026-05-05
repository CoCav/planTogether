const eventService = require('../services/eventService');

/* ==================================================
   EVENT CONTROLLER

   Handles:
   - event creation
   - event retrieval
   - event filtering
   - event update
   - event deletion

   Notes:
   - business logic is delegated to eventService
   - uploaded event image paths are formatted here
================================================== */

/* =============================
   CREATE EVENT
============================= */

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
            event
        });

    } catch (error) {
        return next(error);
    }
};


/* =============================
   GET EVENTS
============================= */

// Get all events
const getAllEvents = async (req, res, next) => {
    try {
        const events = await eventService.getAllEvents(req.query);

        return res.status(200).json({
            message: "All events retrieved successfully",
            ...events
        });

    } catch (error) {
        return next(error);
    }
};


// Get one event by ID
const getEvent = async (req, res, next) => {
    try {
        const event = await eventService.getEventById(req.params.eventId);

        return res.status(200).json({
            message: "Event retrieved successfully",
            event
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

    } catch (error) {
        return next(error);
    }
};


/* =============================
   UPDATE / DELETE EVENT
============================= */

// Update an event
const updateEvent = async (req, res, next) => {
    try {
        // Undefined keeps existing image unchanged in service
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
        await eventService.deleteEventById(req.params.eventId);

        return res.status(200).json({
            message: 'Event deleted successfully'
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = { createEvent, getAllEvents, getEvent, getFilteredEvents, updateEvent, deleteEvent };
