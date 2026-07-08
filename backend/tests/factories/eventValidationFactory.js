const { EVENT_MODES } = require("../../src/constants/eventModes");

/* ==========================================================================
   Event Validation Test Factory

   Builds reusable event validation payloads.

   Responsibilities
   - Build valid event request bodies
   - Support validator test scenarios
   - Support flexible test overrides

   Notes
   - Shared across validator unit tests.
   - Generates API-valid request payloads.
=========================================================================== */

const createValidEventBody = (overrides = {}) => ({
    title: "Tech Meetup",
    description: "This is a test event description",
    type: "Meetup",
    theme: "Technology",

    mode: EVENT_MODES.IN_PERSON,
    location: "Montreal",

    startDateTime: "2026-12-31T10:00:00.000Z",
    endDateTime: "2026-12-31T12:00:00.000Z",

    maxParticipants: 10,
    registrationDeadline: "2026-12-30T12:00:00.000Z",

    ...overrides
});

module.exports = {
    createValidEventBody
};
