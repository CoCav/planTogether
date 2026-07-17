const eventService = require("../services/eventService");

const { UPLOAD_PATHS } = require("../constants/uploadPaths");

/* ==========================================================================
   Event Controller

   Handles event responses.

   Responsibilities
   - Create events
   - Retrieve event listings
   - Retrieve event details
   - Retrieve current user event access
   - Update events
   - Delete events
   - Format event API responses

   Notes
   - Business logic is delegated to eventService.
   - Uploaded event image paths are prepared here.
   - Event listing and detail responses may include participant, review and like stats.
=========================================================================== */

/* =============================
   EVENT CREATION
============================= */

// Create an event for the authenticated user
const createEvent = async (req, res, next) => {
    try {
        const image = req.file
            ? `${UPLOAD_PATHS.EVENTS}/${req.file.filename}`
            : null;

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
   EVENT RETRIEVAL
============================= */

// Retrieve a paginated event listing
const getAllEvents = async (req, res, next) => {
    try {
        const events = await eventService.getAllEvents(
            req.query,
            req.user?.userId
        );

        return res.status(200).json({
            success: true,
            message: "Events retrieved successfully",
            ...events
        });

    } catch (error) {
        return next(error);
    }
};

// Retrieve the authenticated user's access to an event
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

// Retrieve one event by ID
const getEvent = async (req, res, next) => {
    try {
        const event = await eventService.getEventById(
            req.params.eventId,
            req.user?.userId
        );

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
   EVENT UPDATE
============================= */

// Update an event and manage optional image replacement or removal
const updateEvent = async (req, res, next) => {
    try {
        // Uploaded file replaces the existing image.
        // Empty image field clears the existing image.
        // Missing image field keeps the existing image unchanged.
        const image = req.file
            ? `${UPLOAD_PATHS.EVENTS}/${req.file.filename}`
            : req.body.image !== undefined
                ? req.body.image || null
                : undefined;

        const event = await eventService.updateEventById(
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

/* =============================
   EVENT DELETION
============================= */

// Delete an event by ID
const deleteEvent = async (req, res, next) => {
    try {
        await eventService.deleteEventById(req.params.eventId);

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
