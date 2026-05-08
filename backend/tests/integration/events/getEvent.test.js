/* ==============================================
   EVENTS INTEGRATION - GET EVENT TESTS

   Tests:
   - public single event retrieval
   - nonexistent event handling
   - invalid event ID validation
   - participant count enrichment
   - event status enrichment
   - creator data enrichment

   Ensures:
   - a single event can be retrieved publicly by ID
   - invalid event requests are rejected correctly
   - event metadata is enriched in the response
=============================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEvent } = require("../../helpers/api/eventHelper");
const { joinEvent } = require("../../helpers/api/eventMembershipHelper");

describe("Get Event API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       EVENT RETRIEVAL SUCCESS
    ============================= */

    it("should retrieve a single event by ID", async () => {
        const creatorAuth = await registerAndGetToken({
            name: "Single Event User",
            email: `single${Date.now()}@test.com`
        });

        const eventRes = await createEvent(
            creatorAuth.headers,
            {
                title: "Single Event"
            }
        );

        const event = eventRes.body.event;

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty(
            "message",
            "Event retrieved successfully"
        );

        expect(res.body).toHaveProperty("event");

        expect(res.body.event).toMatchObject({
            id: event.id,
            title: "Single Event"
        });
    });

    /* =============================
       EVENT METADATA
    ============================= */

    it("should include participant count", async () => {
        const creatorAuth = await registerAndGetToken({
            name: "Count Creator",
            email: `countcreator${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const eventRes = await createEvent(
            creatorAuth.headers,
            {
                title: "Count Event"
            }
        );

        const event = eventRes.body.event;

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.event).toHaveProperty("participantCount");
        expect(Number(res.body.event.participantCount)).toBeGreaterThanOrEqual(1);
    });

    it("should include creator data", async () => {
        const creatorAuth = await registerAndGetToken({
            name: "Creator Data User",
            email: `creatordata${Date.now()}@test.com`
        });

        const eventRes = await createEvent(
            creatorAuth.headers,
            {
                title: "Creator Data Event"
            }
        );

        const event = eventRes.body.event;

        const res = await request(app)
            .get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.event).toHaveProperty("creator");

        expect(res.body.event.creator).toMatchObject({
            id: creatorAuth.user.userId,
            name: "Creator Data User"
        });
    });

    it("should include upcoming status for future event", async () => {
        const creatorAuth = await registerAndGetToken({
            name: "Upcoming User",
            email: `upcoming${Date.now()}@test.com`
        });

        const eventRes = await createEvent(
            creatorAuth.headers,
            {
                title: "Upcoming Event",
                startDateTime: "2030-01-01T10:00:00.000Z",
                endDateTime: "2030-01-01T12:00:00.000Z"
            }
        );

        const event = eventRes.body.event;

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.event.status).toBe("upcoming");
    });

    it("should include past status for past event", async () => {
        const creatorAuth = await registerAndGetToken({
            name: "Past User",
            email: `past${Date.now()}@test.com`
        });

        const eventRes = await createEvent(
            creatorAuth.headers,
            {
                title: "Past Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        );

        const event = eventRes.body.event;

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.event.status).toBe("past");
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should return 404 for nonexistent event", async () => {
        const res = await request(app).get("/api/events/999999");

        expect(res.statusCode).toBe(404);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const res = await request(app).get("/api/events/abc");

        expect(res.statusCode).toBe(400);
    });
});
