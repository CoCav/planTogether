const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { requireEventRole } = require('../middlewares/requireEventRole');
const { createEventValidator, updateEventValidator, eventIdParamValidator } = require('../validators/eventValidator');


// ROUTE GET - Get all filtered events
router.get('/filtered', authenticateToken, eventController.getFilteredEvents);

// ROUTE POST - Create a new event
router.post('/', authenticateToken, createEventValidator, validateRequest, eventController.createEvent);

// ROUTE GET - Get all events
router.get('/', authenticateToken, eventController.getAllEvents);

// ROUTE GET - Get an event by ID 
router.get('/:eventId', authenticateToken, eventIdParamValidator, validateRequest, eventController.getEvent);

// ROUTE PUT - Update an event by ID (organizer OR co_organizer)
router.put('/:eventId', authenticateToken, eventIdParamValidator, updateEventValidator, validateRequest, requireEventRole(['organizer', 'co_organizer']), eventController.updateEvent);

// ROUTE DELETE - Delete an event by ID (organizer only)
router.delete('/:eventId', authenticateToken, eventIdParamValidator, validateRequest, requireEventRole(['organizer']), eventController.deleteEvent);

module.exports = router;