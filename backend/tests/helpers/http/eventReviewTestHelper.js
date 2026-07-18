const request = require("supertest");

const app = require("../../../src/app");

const { EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { registerAndAuthenticateUser } = require("./authTestHelper");
const { createOrganizerAndEvent } = require("./eventTestHelper");

/* ==========================================================================
   Event Review Test Helper

   Builds reusable event review HTTP helpers.

   Responsibilities
   - Retrieve event reviews
   - Create event reviews
   - Update event reviews
   - Delete event reviews
   - Build reusable completed event review scenarios

   Notes
   - Shared across event review integration tests.
   - Authentication headers can be passed directly to Supertest `.set()`.
   - Completed event scenarios use direct membership creation because
     participants cannot join past events through the API.
=========================================================================== */

/* =============================
   REVIEW ACTIONS
============================= */

const getEventReviews = (eventId, query = "") => {
    return request(app).get(`/api/events/${eventId}/reviews${query}`);
};

const createEventReview = (eventId, headers = {}, payload = {}) => {
    return request(app)
        .post(`/api/events/${eventId}/reviews`)
        .set(headers)
        .send(payload);
};

const updateEventReview = (reviewId, headers = {}, payload = {}) => {
    return request(app)
        .put(`/api/events/reviews/${reviewId}`)
        .set(headers)
        .send(payload);
};

const deleteEventReview = (reviewId, headers = {}) => {
    return request(app)
        .delete(`/api/events/reviews/${reviewId}`)
        .set(headers);
};

/* =============================
   REVIEW SCENARIOS
============================= */

const createCompletedEventWithParticipant = async ({ organizer = {}, participant = {}, event = {} } = {}) => {
    const {
        event: createdEvent,
        organizerAuth
    } = await createOrganizerAndEvent({
        organizer: {
            name: "Review Organizer",
            email: `revieworganizer${Date.now()}@test.com`,
            ...organizer
        },
        event: {
            title: "Community Meetup",
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z",
            ...event
        }
    });

    const participantAuth = await registerAndAuthenticateUser({
        name: "Review Participant",
        email: `reviewparticipant${Date.now()}@test.com`,
        ...participant
    });

    await EventUserRole.create({
        eventId: createdEvent.id,
        userId: participantAuth.user.userId,
        role: EVENT_ROLES.PARTICIPANT
    });

    return {
        event: createdEvent,
        organizerAuth,
        participantAuth
    };
};

module.exports = {
    getEventReviews,

    createEventReview,
    updateEventReview,
    deleteEventReview,

    createCompletedEventWithParticipant
};
