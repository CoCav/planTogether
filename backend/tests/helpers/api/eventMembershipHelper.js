/* ==================================================
   EVENT MEMBERSHIP TEST HELPERS

   Handles:
   - joining events
   - updating member roles

   Notes:
   - shared across event membership integration tests
   - expects auth headers from authHelper
   - returns full Supertest responses
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

// Join an event as an authenticated user
const joinEvent = async (eventId, headers) => {
    return request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set(headers);
};

// Update an event member role as an authenticated user
const updateMemberRole = async (eventId, userId, headers, newRole) => {
    return request(app)
        .put(`/api/events/${eventId}/members/${userId}/role`)
        .set(headers)
        .send({ newRole });
};

module.exports = { joinEvent, updateMemberRole };
