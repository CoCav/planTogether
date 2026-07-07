const eventService = require("../services/eventService");

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

const EVENT_IMAGE_UPLOAD_PATH = "/uploads/events";

/* Create event */

const createEvent = async (req, res, next) => {
    try {
        const image = req.file
            ? `${EVENT_IMAGE_UPLOAD_PATH}/${req.file.filename}`
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

/* Read events */

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

const getEvent = async (req, res, next) => {
    try {
        const event = await eventService.getEventByID(
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

/* Update event */

const updateEvent = async (req, res, next) => {
    try {
        // Uploaded file replaces the existing image.
        // Empty image field clears the existing image.
        // Missing image field keeps the existing image unchanged.
        const image = req.file
            ? `${EVENT_IMAGE_UPLOAD_PATH}/${req.file.filename}`
            : req.body.image !== undefined
                ? req.body.image || null
                : undefined;

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

/* Delete event */

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
