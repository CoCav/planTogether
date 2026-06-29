/* ==================================================
   EVENTS INTEGRATION - LIKE EVENT TESTS

   Tests:
   - authenticated event like creation
   - updated likes count response
   - duplicate like rejection
   - authentication errors
   - invalid event ID validation
   - nonexistent event handling

   Ensures:
   - authenticated users can like events once
   - duplicate likes are rejected
   - responses include liked state and likes count
   - like routes require authentication
   - invalid event requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventLike } = require("../../../src/models");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");

describe("Like Event API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       LIKE EVENT SUCCESS
    ============================= */

    it("should allow authenticated user to like an event", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Like Event Creator",
                email: `likecreator${Date.now()}@test.com`
            },
            event: {
                title: "Like Event"
            }
        });

        const likerAuth = await registerAndGetToken({
            name: "Event Liker",
            email: `eventliker${Date.now()}@test.com`
        });

        const res = await request(app)
            .post(`/api/events/${event.id}/likes`)
            .set(likerAuth.headers);

        expect(res.statusCode).toBe(201);

        expect(res.body).toMatchObject({
            success: true,
            message: "Event liked successfully",
            eventId: event.id,
            userId: likerAuth.user.userId,
            liked: true
        });

        expect(Number(res.body.likesCount)).toBe(1);

        const likeCount = await EventLike.count({
            where: {
                eventId: event.id,
                userId: likerAuth.user.userId
            }
        });

        expect(likeCount).toBe(1);
    });

    it("should return updated likes count", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Like Count Creator",
                email: `likecountcreator${Date.now()}@test.com`
            },
            event: {
                title: "Like Count Event"
            }
        });

        const likerAuthA = await registerAndGetToken({
            name: "Liker A",
            email: `likera${Date.now()}@test.com`
        });

        const likerAuthB = await registerAndGetToken({
            name: "Liker B",
            email: `likerb${Date.now()}@test.com`
        });

        await request(app)
            .post(`/api/events/${event.id}/likes`)
            .set(likerAuthA.headers);

        const res = await request(app)
            .post(`/api/events/${event.id}/likes`)
            .set(likerAuthB.headers);

        expect(res.statusCode).toBe(201);
        expect(Number(res.body.likesCount)).toBe(2);
    });

    /* =============================
       LIKE EVENT ERRORS
    ============================= */

    it("should reject duplicate like", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Duplicate Like Creator",
                email: `duplicatelikecreator${Date.now()}@test.com`
            },
            event: {
                title: "Duplicate Like Event"
            }
        });

        const likerAuth = await registerAndGetToken({
            name: "Duplicate Liker",
            email: `duplicateliker${Date.now()}@test.com`
        });

        await request(app)
            .post(`/api/events/${event.id}/likes`)
            .set(likerAuth.headers);

        const res = await request(app)
            .post(`/api/events/${event.id}/likes`)
            .set(likerAuth.headers);

        expect(res.statusCode).toBe(409);
    });

    it("should reject unauthenticated request", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Unauthenticated Like Creator",
                email: `unauthenticatedlikecreator${Date.now()}@test.com`
            },
            event: {
                title: "Unauthenticated Like Event"
            }
        });

        const res = await request(app)
            .post(`/api/events/${event.id}/likes`);

        expect(res.statusCode).toBe(401);
    });

    it("should reject invalid eventId", async () => {
        const likerAuth = await registerAndGetToken({
            name: "Invalid Like User",
            email: `invalidlike${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events/abc/likes")
            .set(likerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should return 404 for nonexistent event", async () => {
        const likerAuth = await registerAndGetToken({
            name: "Missing Event Liker",
            email: `missingeventliker${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events/999999/likes")
            .set(likerAuth.headers);

        expect(res.statusCode).toBe(404);
    });
});
