const request = require("supertest");

const app = require("../../../src/app");

/* ==========================================================================
   Event Membership Test Helper

   Builds reusable event membership HTTP helpers.

   Responsibilities
   - Retrieve event members
   - Retrieve event staff
   - Join events
   - Leave events
   - Update member roles
   - Remove event members
   - Transfer event ownership

   Notes
   - Shared across integration tests.
   - Authentication headers can be passed directly to Supertest `.set()`.
=========================================================================== */

/* =============================
   RETRIEVAL
============================= */

const getEventMembers = (eventId) => {
    return request(app).get(`/api/events/${eventId}/members`);
};

const getEventStaff = (eventId) => {
    return request(app).get(`/api/events/${eventId}/staff`);
};

/* =============================
   MEMBERSHIP ACTIONS
============================= */

const joinEventAsAuthenticatedUser = (
    eventId,
    headers = {}
) => {
    return request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set(headers);
};

const leaveEventAsAuthenticatedUser = (
    eventId,
    headers = {}
) => {
    return request(app)
        .delete(`/api/events/${eventId}/members/leave`)
        .set(headers);
};

/* =============================
   MEMBERSHIP MANAGEMENT
============================= */

const updateEventMemberRole = (
    eventId,
    userId,
    headers,
    newRole
) => {
    return request(app)
        .put(`/api/events/${eventId}/members/${userId}/role`)
        .set(headers || {})
        .send({
            newRole
        });
};

const removeEventMember = (
    eventId,
    userId,
    headers = {}
) => {
    return request(app)
        .delete(`/api/events/${eventId}/members/${userId}`)
        .set(headers);
};

const transferEventOwnership = (
    eventId,
    targetUserId,
    headers = {}
) => {
    return request(app)
        .put(`/api/events/${eventId}/ownership`)
        .set(headers)
        .send({
            targetUserId
        });
};

module.exports = {
    getEventMembers,
    getEventStaff,
    joinEventAsAuthenticatedUser,
    leaveEventAsAuthenticatedUser,
    updateEventMemberRole,
    removeEventMember,
    transferEventOwnership
};
