const request = require("supertest");

const app = require("../../../src/app");

const { EVENT_MODES } = require("../../../src/constants/eventModes");

const { createEventPayload } = require("../../factories/eventFactory");

const { registerAndAuthenticateUser } = require("./authTestHelper");

/* ==========================================================================
   Event Test Helper

   Builds reusable event HTTP helpers.

   Responsibilities
   - Retrieve events
   - Retrieve a single event
   - Create authenticated events
   - Create multipart event requests
   - Update events
   - Update multipart event requests
   - Delete events
   - Fetch current user event access
   - Build reusable event test scenarios

   Notes
   - Shared across event integration tests.
   - Authentication headers can be passed directly to Supertest `.set()`.
=========================================================================== */

/* =============================
   EVENT ACTIONS
============================= */

const getEvents = ({ headers = {}, query = {} } = {}) => {
    return request(app)
        .get("/api/events")
        .set(headers)
        .query(query);
};

const getEventById = (eventId, headers = {}) => {
    return request(app)
        .get(`/api/events/${eventId}`)
        .set(headers);
};

const createEventAsAuthenticatedUser = (headers = {}, overrides = {}) => {
    return request(app)
        .post("/api/events")
        .set(headers)
        .send(createEventPayload(overrides));
};

const createMultipartEventRequest = (headers = {}, fields = {}) => {
    return request(app)
        .post("/api/events")
        .set(headers)
        .field("title", fields.title ?? "Image Event")
        .field("description", fields.description ?? "Image upload test")
        .field("type", fields.type ?? "Meetup")
        .field("theme", fields.theme ?? "Technology")
        .field("mode", fields.mode ?? EVENT_MODES.IN_PERSON)
        .field("location", fields.location ?? "Montreal")
        .field("startDateTime", fields.startDateTime ?? "2026-12-31T10:00:00.000Z")
        .field("endDateTime", fields.endDateTime ?? "2026-12-31T12:00:00.000Z");
};

const createEventWithImage = (headers = {}, fields = {}, image = {}) => {
    return createMultipartEventRequest(headers, fields)
        .attach(
            "image",
            image.buffer ?? Buffer.from("event image"),
            {
                filename: image.filename ?? "event.png",
                contentType: image.contentType ?? "image/png"
            }
        );
};

const updateEvent = (eventId, headers = {}, payload = {}) => {
    return request(app)
        .put(`/api/events/${eventId}`)
        .set(headers)
        .send(payload);
};

const updateMultipartEventRequest = (eventId, headers = {}, fields = {}) => {
    let eventRequest = request(app)
        .put(`/api/events/${eventId}`)
        .set(headers);

    Object.entries(fields).forEach(([key, value]) => {
        eventRequest = eventRequest.field(key, value);
    });

    return eventRequest;
};

const updateEventWithImage = (eventId, headers = {}, fields = {}, image = {}) => {
    return updateMultipartEventRequest(eventId, headers, fields)
        .attach(
            "image",
            image.buffer ?? Buffer.from("updated image"),
            {
                filename: image.filename ?? "updated.png",
                contentType: image.contentType ?? "image/png"
            }
        );
};

const deleteEvent = (eventId, headers = {}) => {
    return request(app)
        .delete(`/api/events/${eventId}`)
        .set(headers);
};

const getAuthenticatedEventAccess = (eventId, headers = {}) => {
    return request(app)
        .get(`/api/events/${eventId}/me`)
        .set(headers);
};

/* =============================
   EVENT SCENARIOS
============================= */

const createOrganizer = (overrides = {}) => {
    return registerAndAuthenticateUser({
        name: "Event Organizer",
        email: `organizer${Date.now()}@test.com`,
        ...overrides
    });
};

const createOrganizerAndEvent = async ({ organizer = {}, event = {} } = {}) => {
    const organizerAuth = await createOrganizer(organizer);

    const response = await createEventAsAuthenticatedUser(organizerAuth.headers, event);

    if (response.statusCode !== 201 || !response.body.event) {
        throw new Error(
            `Failed to create test event: status=${response.statusCode}, body=${JSON.stringify(response.body)}`
        );
    }

    return {
        organizerAuth,
        event: response.body.event,
        eventId: response.body.event.id,
        response
    };
};

const createPastOrganizerAndEvent = (options = {}) => {
    return createOrganizerAndEvent({
        ...options,
        event: {
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z",
            ...(options.event || {})
        }
    });
};

module.exports = {
    getEvents,
    getEventById,

    createEventAsAuthenticatedUser,
    createMultipartEventRequest,
    createEventWithImage,

    updateEvent,
    updateMultipartEventRequest,
    updateEventWithImage,

    deleteEvent,

    getAuthenticatedEventAccess,

    createOrganizer,
    createOrganizerAndEvent,
    createPastOrganizerAndEvent
};
