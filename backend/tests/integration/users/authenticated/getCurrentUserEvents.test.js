/* =================================================
   USER INTEGRATION - CURRENT USER EVENTS TESTS

   Tests:
   - authenticated user's active events retrieval
   - authentication protection
   - event status enrichment
   - event image metadata
   - active participant count enrichment
   - pagination by view
   - created view filtering
   - joined view filtering
   - inactive membership exclusion
   - created history filtering
   - joined history filtering
   - invalid query validation
   - like count enrichment

   Ensures:
   - authenticated users can retrieve their active related events
   - inactive memberships are excluded from current user events
   - response includes event metadata including images
   - participant counts only include active memberships
   - view filters and pagination work correctly
   - like count and current user like state are enriched
   - query validators protect the route
   - shared event role constants are used for valid role scenarios
   - shared event status constants are used for expected statuses
=================================================== */

const request = require("supertest");
const app = require("../../../../src/app");

const { EventUserRole, EventLike } = require("../../../../src/models");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");
const { EVENT_MODES } = require("../../../../src/constants/eventModes");

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../../helpers/http/authTestHelper");
const {
    createEventAsAuthenticatedUser,
    createOrganizerAndEvent
} = require("../../../helpers/http/eventTestHelper");
const { joinEventAsAuthenticatedUser } = require("../../../helpers/http/eventMembershipTestHelper");

describe("Get Current User Events API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* ============================
       CURRENT USER EVENTS SUCCESS
    ============================== */

    it("should get events for the authenticated user", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Creator",
                email: `creator${Date.now()}@test.com`
            },
            event: {
                title: "User Events Test"
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await request(app)
            .get("/api/users/me/events")
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "User events retrieved successfully");

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
        const { organizerAuth, event } = await createOrganizerAndEvent({
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
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Count Creator",
                email: `countcreator${Date.now()}@test.com`
            },
            event: {
                title: "Count Event"
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Count Participant",
            email: `countparticipant${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

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

    it("should include event image in current user events", async () => {
        const { organizerAuth } = await createOrganizerAndEvent({
            organizer: {
                name: "Image Creator",
                email: `imagemetadata${Date.now()}@test.com`
            }
        });

        const createRes = await request(app)
            .post("/api/events")
            .set(organizerAuth.headers)
            .field("title", "Image Metadata Event")
            .field("description", "Image metadata test")
            .field("type", "Meetup")
            .field("theme", "Technology")
            .field("mode", EVENT_MODES.IN_PERSON)
            .field("location", "Montreal")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", Buffer.from("event image"), {
                filename: "metadata.png",
                contentType: "image/png"
            });

        const eventId = createRes.body.event.id;

        const res = await request(app)
            .get("/api/users/me/events")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(200);

        const eventMembership = res.body.events.find((item) => item.event.id === eventId);

        expect(eventMembership).toBeDefined();

        expect(eventMembership.event.image).toMatch(/^\/uploads\/events\/event-/);
    });

    it("should include like count and current user like state in current user events", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Like Stats Creator",
                email: `likestatscreator${Date.now()}@test.com`
            },
            event: {
                title: "Current User Like Stats Event"
            }
        });

        const likerAuth = await registerAndAuthenticateUser({
            name: "Liker",
            email: `liker${Date.now()}@test.com`
        });

        await EventLike.create({
            eventId: event.id,
            userId: organizerAuth.user.userId
        });

        await EventLike.create({
            eventId: event.id,
            userId: likerAuth.user.userId
        });

        const res = await request(app)
            .get("/api/users/me/events")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(200);

        const eventMembership = res.body.events.find((item) => item.event.id === event.id);

        expect(eventMembership).toBeDefined();

        expect(Number(eventMembership.event.likesCount)).toBe(2);
        expect(eventMembership.event.isLikedByCurrentUser).toBe(true);
    });

    /* =============================
       PAGINATION / FILTERS
    ============================= */

    it("should paginate current user events by view", async () => {
        const eventCreatorAuth = await registerAndAuthenticateUser({
            name: "Paginated Creator",
            email: `paginatedcreator${Date.now()}@test.com`
        });

        await createEventAsAuthenticatedUser(eventCreatorAuth.headers, { title: "Created Event A" });
        await createEventAsAuthenticatedUser(eventCreatorAuth.headers, { title: "Created Event B" });
        await createEventAsAuthenticatedUser(eventCreatorAuth.headers, { title: "Created Event C" });

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
        const eventCreatorAuth = await registerAndAuthenticateUser({
            name: "Created View User",
            email: `createdview${Date.now()}@test.com`
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await createEventAsAuthenticatedUser(eventCreatorAuth.headers, { title: "Created Event" });

        const joinedEventRes = await createEventAsAuthenticatedUser(participantAuth.headers, {
            title: "Joined Event"
        });

        await joinEventAsAuthenticatedUser(joinedEventRes.body.event.id, eventCreatorAuth.headers);

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
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Event Creator",
                email: `eventcreator${Date.now()}@test.com`
            },
            event: {
                title: "Joined Event"
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Joined View User",
            email: `joinedview${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

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
        const eventCreatorAuth = await registerAndAuthenticateUser({
            name: "History Creator",
            email: `historycreator${Date.now()}@test.com`
        });

        await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
            title: "Active Created Event",
            startDateTime: "2026-12-31T10:00:00.000Z",
            endDateTime: "2026-12-31T12:00:00.000Z"
        });

        await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
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
        const { event: pastEvent } = await createOrganizerAndEvent({
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

        const participantAuth = await registerAndAuthenticateUser({
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

    it("should exclude inactive memberships from current user events", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Inactive Event Creator",
                email: `inactivecreator${Date.now()}@test.com`
            },
            event: {
                title: "Inactive Membership Event"
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Inactive Membership User",
            email: `inactivemembership${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        const res = await request(app)
            .get("/api/users/me/events")
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(200);

        const eventIds = res.body.events.map((item) => item.event.id);

        expect(eventIds).not.toContain(event.id);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid view", async () => {
        const userAuth = await registerAndAuthenticateUser({
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
        const userAuth = await registerAndAuthenticateUser({
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
        const userAuth = await registerAndAuthenticateUser({
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
        const userAuth = await registerAndAuthenticateUser({
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
