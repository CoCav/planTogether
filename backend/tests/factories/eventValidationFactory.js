/* ==================================================
   EVENT VALIDATION FACTORY

   Handles:
   - valid event validator payload generation
   - reusable validator test payloads

   Notes:
   - shared across validator tests
   - focuses on API validation payloads only
================================================== */

// Generate valid event validator payload
const createValidEventBody = (overrides = {}) => ({
    title: "Tech Meetup",
    description: "This is a test event description",
    type: "Meetup",
    theme: "Technology",

    mode: "in_person",
    location: "Montreal",

    startDateTime: "2026-12-31T10:00:00.000Z",
    endDateTime: "2026-12-31T12:00:00.000Z",

    maxParticipants: 10,

    ...overrides
});

module.exports = { createValidEventBody };
