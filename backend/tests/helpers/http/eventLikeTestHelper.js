const request = require("supertest");

const app = require("../../../src/app");

/* ==========================================================================
   Event Like Test Helper

   Builds reusable event like HTTP helpers.

   Responsibilities
   - Like events
   - Unlike events
   - Support authenticated event like integration tests

   Notes
   - Shared across event like integration tests.
   - Auth headers can be passed directly to Supertest `.set()`.
=========================================================================== */

const likeEvent = (eventId, headers = {}) => {
    return request(app)
        .post(`/api/events/${eventId}/likes`)
        .set(headers);
};

const unlikeEvent = (eventId, headers = {}) => {
    return request(app)
        .delete(`/api/events/${eventId}/likes`)
        .set(headers);
};

module.exports = {
    likeEvent,
    unlikeEvent
};
