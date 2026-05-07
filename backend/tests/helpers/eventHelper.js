/* ==================================================
   EVENT TEST HELPERS

   Handles:
   - valid event payload generation
   - authenticated event creation

   Notes:
   - shared across integration tests
   - expects auth headers from authHelper
================================================== */

const request = require("supertest");
const app = require("../../src/app");

// Generate valid event payload
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

// Create authenticated event
const createEvent = async (headers, overrides = {}) => {
    return request(app)
        .post("/api/events")
        .set(headers)
        .send(getValidEventPayload(overrides));
};

module.exports = { getValidEventPayload, createEvent };
