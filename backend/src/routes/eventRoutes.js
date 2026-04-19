const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const { authenticateToken } = require('../middlewares/authenticateToken');
const validateRequest = require('../middlewares/validateRequest');
const { requireEventRole } = require('../middlewares/requireEventRole');
const { createEventValidator, updateEventValidator, eventIdParamValidator } = require('../validators/eventValidator');


// ROUTE GET - Get all filtered events
router.get('/filtered', eventController.getFilteredEvents);

// ROUTE POST - Create a new event
router.post('/', authenticateToken, createEventValidator, validateRequest, eventController.createEvent);

// ROUTE GET - Get all events
router.get('/', eventController.getAllEvents);

// ROUTE GET - Get an event by ID 
router.get('/:eventId', eventIdParamValidator, validateRequest, eventController.getEvent);

// ROUTE PUT - Update an event by ID (organizer OR co_organizer)
router.put('/:eventId', authenticateToken, eventIdParamValidator, updateEventValidator, validateRequest, requireEventRole(['organizer', 'co_organizer']), eventController.updateEvent);

// ROUTE DELETE - Delete an event by ID (organizer only)
router.delete('/:eventId', authenticateToken, eventIdParamValidator, validateRequest, requireEventRole(['organizer']), eventController.deleteEvent);

module.exports = router;