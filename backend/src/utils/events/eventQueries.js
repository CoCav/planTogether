const { throwHttpError } = require("../errors/httpError");

/* ==========================================================================
   Event Queries

   Provides reusable event database query helpers.

   Responsibilities
   - Find events by ID
   - Throw consistent not found errors

   Notes
   - The Event model is injected to keep helpers reusable.
   - Additional Sequelize options can be passed through the options parameter.
=========================================================================== */

const EVENT_NOT_FOUND_ERROR = "Event not found";

const findEventByIdOrFail = async (Event, eventId, options = {}) => {
    const event = await Event.findByPk(eventId, options);

    if (!event) {
        throwHttpError(404, EVENT_NOT_FOUND_ERROR);
    }

    return event;
};

module.exports = {
    findEventByIdOrFail
};
