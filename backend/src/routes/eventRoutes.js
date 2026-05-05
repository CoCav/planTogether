const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');

const { authenticateToken } = require('../middlewares/authenticateToken');
const { uploadEventImage } = require('../middlewares/uploadFile');
const validateRequest = require('../middlewares/validateRequest');
const { requireEventRole } = require('../middlewares/requireEventRole');

const { createEventValidator, updateEventValidator, eventIdParamValidator } = require('../validators/eventValidator');

/* ==================================================
   EVENT ROUTES

   Handles:
   - event creation
   - event listing
   - filtered event listing
   - single event retrieval
   - event update
   - event deletion

   Notes:
   - static routes must be declared before /:eventId
   - update/delete routes require event role authorization
================================================== */

/* =============================
   READ EVENTS
============================= */

// Get filtered events
router.get('/filtered', eventController.getFilteredEvents);

// Get all events
router.get('/', eventController.getAllEvents);

// Get one event by ID
router.get('/:eventId', eventIdParamValidator, validateRequest, eventController.getEvent);


/* =============================
   WRITE EVENTS
============================= */

// Create a new event
router.post('/', authenticateToken, uploadEventImage.single("image"), createEventValidator, validateRequest, eventController.createEvent);

// Update an event
router.put('/:eventId', authenticateToken, uploadEventImage.single("image"), eventIdParamValidator, updateEventValidator, validateRequest, requireEventRole(['organizer', 'co_organizer']), eventController.updateEvent);

// Delete an event
router.delete('/:eventId', authenticateToken, eventIdParamValidator, validateRequest, requireEventRole(['organizer']), eventController.deleteEvent);

module.exports = router;
