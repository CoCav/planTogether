/* ==================================================
   EVENT MEMBERSHIP TEST HELPERS

   Handles:
   - joining events
   - updating member roles
   - transferring event ownership

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

// Transfer event ownership to another member
const transferEventOwnership = async (eventId, targetUserId, headers) => {
    return request(app)
        .put(`/api/events/${eventId}/ownership`)
        .set(headers)
        .send({ targetUserId });
};

module.exports = { joinEvent, updateMemberRole, transferEventOwnership };
