/* ==================================================
   EVENT TEST HELPERS

   Handles:
   - valid event payload generation
   - authenticated event creation

   Notes:
   - shared across integration tests
   - createEvent expects auth headers from authHelper
   - createEvent returns the full Supertest response
================================================== */

const request = require("supertest");
const app = require("../../src/app");

// Generate a valid event payload with optional overrides
const getValidEventPayload = (overrides = {}) => ({
    title: "Test Event",
    description: "This is a test event",
    startDateTime: "2026-12-31T10:00:00.000Z",
    endDateTime: "2026-12-31T12:00:00.000Z",
    mode: "in_person",
    location: "Montreal",
    type: "Meetup",
    theme: "Technology",
    ...overrides
});

// Create an authenticated event and return the full response
const createEvent = async (headers, overrides = {}) => {
    return request(app)
        .post("/api/events")
        .set(headers)
        .send(getValidEventPayload(overrides));
};

module.exports = { getValidEventPayload, createEvent };
