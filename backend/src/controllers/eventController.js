const eventService = require("../services/eventService");

/* ==================================================
   EVENT CONTROLLER

   Handles:
   - event creation
   - event listing with optional filters and pagination
   - single event retrieval
   - current authenticated user event access
   - event update
   - event deletion
   - API response formatting

   Notes:
   - business logic is delegated to eventService
   - uploaded event image paths are formatted here
   - event access responses support frontend UI guards
   - successful responses include success, message and top-level payload fields when needed
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
            success: true,
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

// Get all events with optional filters and pagination
const getAllEvents = async (req, res, next) => {
    try {
        const events = await eventService.getAllEvents(req.query);

        return res.status(200).json({
            success: true,
            message: "Events retrieved successfully",
            ...events
        });

    } catch (error) {
        return next(error);
    }
};

// Get current authenticated user's access for one event
const getCurrentUserEventAccess = async (req, res, next) => {
    try {
        const access = await eventService.getCurrentUserEventAccess(
            req.params.eventId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Current user event access retrieved successfully",
            ...access
        });

    } catch (error) {
        return next(error);
    }
};

// Get one event by ID
const getEvent = async (req, res, next) => {
    try {
        const event = await eventService.getEventByID(req.params.eventId);

        return res.status(200).json({
            success: true,
            message: "Event retrieved successfully",
            event
        });

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

        const event = await eventService.updateEventByID(
            req.params.eventId,
            {
                ...req.body,
                image
            }
        );

        return res.status(200).json({
            success: true,
            message: "Event updated successfully",
            event
        });

    } catch (error) {
        return next(error);
    }
};

// Delete an event
const deleteEvent = async (req, res, next) => {
    try {
        await eventService.deleteEventByID(req.params.eventId);

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getCurrentUserEventAccess,
    getEvent,
    updateEvent,
    deleteEvent
};
