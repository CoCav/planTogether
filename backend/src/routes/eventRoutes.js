const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');

const { authenticateToken } = require('../middlewares/authenticateToken');
const { uploadEventImage } = require('../middlewares/uploadFiles');
const handleValidationErrors = require("../middlewares/handleValidationErrors");
const authorizeEventRole = require('../middlewares/authorizeEventRole');

const { eventIdParamValidator, createEventValidator, updateEventValidator, getAllEventsValidator } = require('../validators/eventValidator');

/* ==================================================
   EVENT ROUTES

   Handles:
   - event creation
   - event listing with optional query filters
   - single event retrieval
   - event update
   - event deletion

   Notes:
   - /api/events is the main listing endpoint
   - update/delete routes require event role authorization
   - static routes must be declared before /:eventId if added later
================================================== */

/* =============================
   READ EVENTS
============================= */

// Get all events with optional filters and pagination
router.get("/", getAllEventsValidator, handleValidationErrors, eventController.getAllEvents);
// Get one event by ID
router.get('/:eventId', eventIdParamValidator, handleValidationErrors, eventController.getEvent);


/* =============================
   WRITE EVENTS
============================= */

// Create a new event
router.post('/', authenticateToken, uploadEventImage.single("image"), createEventValidator, handleValidationErrors, eventController.createEvent);

// Update an event
router.put("/:eventId", uploadEventImage.single("image"), authenticateToken, eventIdParamValidator, updateEventValidator, handleValidationErrors, authorizeEventRole(["organizer", "co_organizer"]), eventController.updateEvent);

// Delete an event
router.delete('/:eventId', authenticateToken, eventIdParamValidator, handleValidationErrors, authorizeEventRole(['organizer']), eventController.deleteEvent);

module.exports = router;
