const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");
const { uploadEventImage } = require("../middlewares/uploadFiles");

const { EVENT_ROLES } = require("../constants/eventRoles");
const authorizeEventRole = require("../middlewares/authorization/authorizeEventRole");

const {
    eventIdParamValidator,
    createEventValidator,
    updateEventValidator,
    getAllEventsValidator
} = require("../validators/eventValidator");

const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

/* ==================================================
   EVENT ROUTES

   Handles:
   - event creation
   - event listing with optional query filters
   - single event retrieval
   - current user event access retrieval
   - event update
   - event deletion

   Notes:
   - /api/events is the main listing endpoint
   - listing and detail responses may include event review stats
   - /:eventId/me must be declared before /:eventId
   - /:eventId/me supports frontend access checks
   - update/delete routes require event role authorization
   - write routes require authentication
================================================== */

/* =============================
   READ EVENTS
============================= */

// Get all events with optional filters and pagination
router.get("/",
    getAllEventsValidator,
    handleValidationErrors,
    eventController.getAllEvents
);

// Get current user's access for one event
router.get("/:eventId/me",
    authenticateToken,
    eventIdParamValidator,
    handleValidationErrors,
    eventController.getCurrentUserEventAccess
);

// Get one event by ID
router.get("/:eventId",
    eventIdParamValidator,
    handleValidationErrors,
    eventController.getEvent
);

/* =============================
   WRITE EVENTS
============================= */

// Create a new event
router.post("/",
    authenticateToken,
    uploadEventImage.single("image"),
    createEventValidator,
    handleValidationErrors,
    eventController.createEvent
);

// Update an event
router.put("/:eventId",
    authenticateToken,
    uploadEventImage.single("image"),
    eventIdParamValidator,
    updateEventValidator,
    handleValidationErrors,
    authorizeEventRole([EVENT_ROLES.ORGANIZER, EVENT_ROLES.CO_ORGANIZER]),
    eventController.updateEvent
);

// Delete an event
router.delete("/:eventId",
    authenticateToken,
    eventIdParamValidator,
    handleValidationErrors,
    authorizeEventRole([EVENT_ROLES.ORGANIZER]),
    eventController.deleteEvent
);

module.exports = router;
