/* ==================================================
   EVENT TEST HELPERS

   Handles:
   - authenticated event creation
   - event creation with organizer setup

   Notes:
   - shared across integration tests
   - createAuthenticatedEvent expects auth headers from authHelper
   - createAuthenticatedEvent returns the full Supertest response
   - createEventWithOrganizer returns organizer auth data and created event
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { createEventPayload } = require("../../factories/eventFactory");
const { registerAndGetToken } = require("./authHelper");

// Create an authenticated event request
const createAuthenticatedEvent = async (headers, overrides = {}) => {
    return request(app)
        .post("/api/events")
        .set(headers)
        .send(createEventPayload(overrides));
};

// Create an organizer user, create an event, and return both
const createEventWithOrganizer = async ({
    organizer = {},
    event = {}
} = {}) => {

    const organizerAuth = await registerAndGetToken({
        name: "Event Organizer",
        email: `organizer${Date.now()}@test.com`,
        ...organizer
    });

    const eventRes = await createAuthenticatedEvent(
        organizerAuth.headers,
        event
    );

    return {
        organizerAuth,
        event: eventRes.body.event,
        response: eventRes
    };
};

module.exports = { createAuthenticatedEvent, createEventWithOrganizer };
