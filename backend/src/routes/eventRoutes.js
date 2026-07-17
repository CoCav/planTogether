const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");

const { EVENT_ROLES } = require("../constants/eventRoles");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");
const { resolveCurrentUser } = require("../middlewares/auth/resolveCurrentUser");
const { uploadEventImage } = require("../middlewares/files/uploadFiles");
const authorizeEventRole = require("../middlewares/authorization/authorizeEventRole");
const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

const {
    eventIdParamValidator,
    createEventValidator,
    updateEventValidator,
    getAllEventsValidator
} = require("../validators/eventValidator");

/* ==========================================================================
   Event Routes

   Defines event endpoints.

   Responsibilities
   - Create events
   - List events with optional filters
   - Retrieve event details
   - Retrieve current user event access
   - Update events
   - Delete events

   Notes
   - /:eventId/me must be declared before /:eventId.
   - Public event reads can use optional current user context.
   - Write routes require authentication.
   - Update and delete routes require event role authorization.
=========================================================================== */

/* =============================
   EVENT RETRIEVAL
============================= */

router.get(
    "/",
    resolveCurrentUser,
    getAllEventsValidator,
    handleValidationErrors,
    eventController.getAllEvents
);

router.get(
    "/:eventId/me",
    authenticateToken,
    eventIdParamValidator,
    handleValidationErrors,
    eventController.getCurrentUserEventAccess
);

router.get(
    "/:eventId",
    resolveCurrentUser,
    eventIdParamValidator,
    handleValidationErrors,
    eventController.getEvent
);

/* =============================
   EVENT CREATION
============================= */

router.post(
    "/",
    authenticateToken,
    uploadEventImage.single("image"),
    createEventValidator,
    handleValidationErrors,
    eventController.createEvent
);

/* =============================
   EVENT UPDATE
============================= */

router.put(
    "/:eventId",
    authenticateToken,
    uploadEventImage.single("image"),
    eventIdParamValidator,
    updateEventValidator,
    handleValidationErrors,
    authorizeEventRole([EVENT_ROLES.ORGANIZER, EVENT_ROLES.CO_ORGANIZER]),
    eventController.updateEvent
);

/* =============================
   EVENT DELETION
============================= */

router.delete(
    "/:eventId",
    authenticateToken,
    eventIdParamValidator,
    handleValidationErrors,
    authorizeEventRole([EVENT_ROLES.ORGANIZER]),
    eventController.deleteEvent
);

module.exports = router;
