/* =================================================
   USER INTEGRATION - CURRENT USER EVENTS TESTS

   Tests:
   - authenticated user's events retrieval
   - authentication protection
   - event status enrichment
   - participant count enrichment
   - pagination by view
   - created view filtering
   - joined view filtering
   - created history filtering
   - joined history filtering
   - invalid query validation

   Ensures:
   - authenticated users can retrieve their related events
   - response includes event metadata
   - view filters and pagination work correctly
   - query validators protect the route
   - shared event role constants are used for valid role scenarios
   - shared event status constants are used for expected statuses
=================================================== */

const request = require("supertest");
const app = require("../../../../src/app");

const { EventUserRole } = require("../../../../src/models");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");

const { initDB, resetDB, closeDB } = require("../../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../../helpers/api/authHelper");
const { createAuthenticatedEvent, createEventWithOrganizer } = require("../../../helpers/api/eventHelper");
const { joinEvent } = require("../../../helpers/api/eventMembershipHelper");

describe("Get Current User Events API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* ============================
       CURRENT USER EVENTS SUCCESS
    ============================== */

    it("should get events for the authenticated user", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Creator",
                email: `creator${Date.now()}@test.com`
            },
            event: {
                title: "User Events Test"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .get("/api/users/me/events")
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject getting current user events without token", async () => {
        const res = await request(app).get("/api/users/me/events");

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       EVENT METADATA
    ============================= */

    it("should include event status in current user events", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer({
            organizer: {
                name: "Status Creator",
                email: `statuscreator${Date.now()}@test.com`
            },
            event: {
                title: "Past Status Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const res = await request(app)
            .get("/api/users/me/events")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(200);

        const eventMembership = res.body.events.find((item) => item.event.id === event.id);

        expect(eventMembership).toBeDefined();

        expect(eventMembership.event).toHaveProperty("status", EVENT_STATUS.PAST);
    });

    it("should include participant count and status in user events", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer({
            organizer: {
                name: "Count Creator",
                email: `countcreator${Date.now()}@test.com`
            },
            event: {
                title: "Count Event"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Count Participant",
            email: `countparticipant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .get("/api/users/me/events")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(200);

        const eventMembership = res.body.events.find((item) => item.event.id === event.id);

        expect(eventMembership).toBeDefined();

        expect(eventMembership.event).toHaveProperty("participantCount");
        expect(Number(eventMembership.event.participantCount)).toBe(1);

        expect(eventMembership.event).toHaveProperty("status");
    });

    /* =============================
       PAGINATION / FILTERS
    ============================= */

    it("should paginate current user events by view", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Paginated Creator",
            email: `paginatedcreator${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(eventCreatorAuth.headers, { title: "Created Event A" });
        await createAuthenticatedEvent(eventCreatorAuth.headers, { title: "Created Event B" });
        await createAuthenticatedEvent(eventCreatorAuth.headers, { title: "Created Event C" });

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                view: "created",
                page: 1,
                pageSize: 2
            })
            .set(eventCreatorAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(2);

        expect(res.body.totalEvents).toBe(3);
        expect(res.body.totalPages).toBe(2);
    });

    it("should filter current user events by created view", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Created View User",
            email: `createdview${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(eventCreatorAuth.headers, { title: "Created Event" });

        const joinedEventRes = await createAuthenticatedEvent(participantAuth.headers, {
            title: "Joined Event"
        });

        await joinEvent(joinedEventRes.body.event.id, eventCreatorAuth.headers);

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                view: "created"
            })
            .set(eventCreatorAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every((item) => item.event.creatorId === eventCreatorAuth.user.userId)).toBe(true);
    });

    it("should filter current user events by joined view", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Event Creator",
                email: `eventcreator${Date.now()}@test.com`
            },
            event: {
                title: "Joined Event"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Joined View User",
            email: `joinedview${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                view: "joined"
            })
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every((item) => item.role !== EVENT_ROLES.ORGANIZER)).toBe(true);
    });

    it("should filter current user events by history view", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "History Creator",
            email: `historycreator${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(eventCreatorAuth.headers, {
            title: "Active Created Event",
            startDateTime: "2026-12-31T10:00:00.000Z",
            endDateTime: "2026-12-31T12:00:00.000Z"
        });

        await createAuthenticatedEvent(eventCreatorAuth.headers, {
            title: "Past Created Event",
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                view: "createdHistory"
            })
            .set(eventCreatorAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body.events.length).toBe(1);

        expect(res.body.events[0].event.title).toBe("Past Created Event");
        expect(res.body.events[0].event.status).toBe(EVENT_STATUS.PAST);
    });

    it("should filter current user events by joined history view", async () => {
        const { event: pastEvent } = await createEventWithOrganizer({
            organizer: {
                name: "History Event Creator",
                email: `historyevent${Date.now()}@test.com`
            },
            event: {
                title: "Past Joined Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "History Participant",
            email: `historyparticipant${Date.now()}@test.com`
        });

        await EventUserRole.create({
            eventId: pastEvent.id,
            userId: participantAuth.user.userId,
            role: EVENT_ROLES.PARTICIPANT
        });

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                view: "joinedHistory"
            })
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body.events.length).toBe(1);

        expect(res.body.events[0].event.title).toBe("Past Joined Event");
        expect(res.body.events[0].event.status).toBe(EVENT_STATUS.PAST);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid view", async () => {
        const userAuth = await registerAndGetToken({
            name: "Validation User",
            email: `validation${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                view: "invalid-view"
            })
            .set(userAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid page", async () => {
        const userAuth = await registerAndGetToken({
            name: "Validation User",
            email: `page${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                page: 0
            })
            .set(userAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid pageSize", async () => {
        const userAuth = await registerAndGetToken({
            name: "Validation User",
            email: `pagesize${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                pageSize: 500
            })
            .set(userAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid sortBy", async () => {
        const userAuth = await registerAndGetToken({
            name: "Validation User",
            email: `sortby${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                sortBy: "invalid"
            })
            .set(userAuth.headers);

        expect(res.statusCode).toBe(400);
    });
});
