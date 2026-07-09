const request = require("supertest");

const app = require("../../../src/app");

const { createEventPayload } = require("../../factories/eventFactory");

const { registerAndAuthenticateUser } = require("./authTestHelper");

/* ==========================================================================
   Event Test Helper

   Builds reusable event HTTP test helpers.

   Responsibilities
   - Create authenticated events
   - Create organizer users with events
   - Fetch current user event access
   - Return reusable Supertest responses

   Notes
   - Shared across integration tests.
   - Auth headers can be passed directly to Supertest `.set()`.
=========================================================================== */

const createEventAsAuthenticatedUser = async (headers, overrides = {}) => {
    return request(app)
        .post("/api/events")
        .set(headers)
        .send(createEventPayload(overrides));
};

const createOrganizerAndEvent = async ({
    organizer = {},
    event = {}
} = {}) => {
    const organizerAuth = await registerAndAuthenticateUser({
        name: "Event Organizer",
        email: `organizer${Date.now()}@test.com`,
        ...organizer
    });

    const response = await createEventAsAuthenticatedUser(
        organizerAuth.headers,
        event
    );

    return {
        organizerAuth,
        event: response.body.event,
        response
    };
};

const getAuthenticatedEventAccess = async (eventId, headers = {}) => {
    return request(app)
        .get(`/api/events/${eventId}/me`)
        .set(headers);
};

module.exports = {
    createEventAsAuthenticatedUser,
    createOrganizerAndEvent,
    getAuthenticatedEventAccess
};
