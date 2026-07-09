const request = require("supertest");

const app = require("../../../src/app");

/* ==========================================================================
   Event Membership Test Helper

   Builds reusable event membership HTTP test helpers.

   Responsibilities
   - Join events
   - Leave events
   - Update member roles
   - Remove event members
   - Transfer event ownership

   Notes
   - Shared across integration tests.
   - Auth headers can be passed directly to Supertest `.set()`.
=========================================================================== */

const joinEventAsAuthenticatedUser = async (
    eventId,
    headers
) => {
    return request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set(headers);
};

const leaveEventAsAuthenticatedUser = async (
    eventId,
    headers
) => {
    return request(app)
        .post(`/api/events/${eventId}/members/leave`)
        .set(headers);
};

const updateEventMemberRole = async (
    eventId,
    userId,
    headers,
    newRole
) => {
    return request(app)
        .put(`/api/events/${eventId}/members/${userId}/role`)
        .set(headers)
        .send({
            newRole
        });
};

const removeEventMember = async (
    eventId,
    userId,
    headers
) => {
    return request(app)
        .delete(`/api/events/${eventId}/members/${userId}`)
        .set(headers);
};

const transferEventOwnership = async (
    eventId,
    targetUserId,
    headers
) => {
    return request(app)
        .put(`/api/events/${eventId}/ownership`)
        .set(headers)
        .send({
            targetUserId
        });
};

module.exports = {
    joinEventAsAuthenticatedUser,
    leaveEventAsAuthenticatedUser,
    updateEventMemberRole,
    removeEventMember,
    transferEventOwnership
};
