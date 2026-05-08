/* ==================================================
   EVENT TEST HELPERS

   Handles:
   - authenticated event creation

   Notes:
   - shared across integration tests
   - createEvent expects auth headers from authHelper
   - createEvent returns the full Supertest response
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { createEventPayload } = require("../../factories/eventFactory");

// Create an authenticated event and return the full response
const createEvent = async (headers, overrides = {}) => {
    return request(app)
        .post("/api/events")
        .set(headers)
        .send(createEventPayload(overrides));
};

module.exports = { createEvent };
