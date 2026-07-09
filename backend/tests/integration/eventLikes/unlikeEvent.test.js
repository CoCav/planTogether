/* ==================================================
   EVENTS INTEGRATION - UNLIKE EVENT TESTS

   Tests:
   - authenticated event unlike
   - updated likes count response
   - idempotent unlike
   - authentication errors
   - invalid event ID validation
   - nonexistent event handling

   Ensures:
   - authenticated users can remove their likes
   - unliking an already unliked event succeeds
   - responses include liked state and likes count
   - unlike routes require authentication
   - invalid event requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventLike } = require("../../../src/models");

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");

describe("Unlike Event API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       UNLIKE EVENT SUCCESS
    ============================= */

    it("should allow authenticated user to unlike an event", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Unlike Creator",
                email: `unlikecreator${Date.now()}@test.com`
            },
            event: {
                title: "Unlike Event"
            }
        });

        const likerAuth = await registerAndAuthenticateUser({
            name: "Unlike User",
            email: `unlikeuser${Date.now()}@test.com`
        });

        await request(app)
            .post(`/api/events/${event.id}/likes`)
            .set(likerAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/likes`)
            .set(likerAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body).toMatchObject({
            success: true,
            message: "Event unliked successfully",
            eventId: event.id,
            userId: likerAuth.user.userId,
            liked: false
        });

        expect(Number(res.body.likesCount)).toBe(0);

        const likeCount = await EventLike.count({
            where: {
                eventId: event.id,
                userId: likerAuth.user.userId
            }
        });

        expect(likeCount).toBe(0);
    });

    it("should return updated likes count after unlike", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Unlike Count Creator",
                email: `unlikecountcreator${Date.now()}@test.com`
            },
            event: {
                title: "Unlike Count Event"
            }
        });

        const likerAuthA = await registerAndAuthenticateUser({
            name: "Unlike A",
            email: `unlikea${Date.now()}@test.com`
        });

        const likerAuthB = await registerAndAuthenticateUser({
            name: "Unlike B",
            email: `unlikeb${Date.now()}@test.com`
        });

        await request(app)
            .post(`/api/events/${event.id}/likes`)
            .set(likerAuthA.headers);

        await request(app)
            .post(`/api/events/${event.id}/likes`)
            .set(likerAuthB.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/likes`)
            .set(likerAuthA.headers);

        expect(res.statusCode).toBe(200);
        expect(Number(res.body.likesCount)).toBe(1);
    });

    it("should allow unliking an event that was never liked", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Idempotent Creator",
                email: `idempotentcreator${Date.now()}@test.com`
            },
            event: {
                title: "Idempotent Unlike Event"
            }
        });

        const likerAuth = await registerAndAuthenticateUser({
            name: "Idempotent User",
            email: `idempotentuser${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete(`/api/events/${event.id}/likes`)
            .set(likerAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body).toMatchObject({
            liked: false
        });

        expect(Number(res.body.likesCount)).toBe(0);
    });

    /* =============================
       UNLIKE EVENT ERRORS
    ============================= */

    it("should reject unauthenticated request", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Unauth Unlike Creator",
                email: `unauthunlikecreator${Date.now()}@test.com`
            },
            event: {
                title: "Unauth Unlike Event"
            }
        });

        const res = await request(app)
            .delete(`/api/events/${event.id}/likes`);

        expect(res.statusCode).toBe(401);
    });

    it("should reject invalid eventId", async () => {
        const likerAuth = await registerAndAuthenticateUser({
            name: "Invalid Unlike User",
            email: `invalidunlike${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/abc/likes")
            .set(likerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should return 404 for nonexistent event", async () => {
        const likerAuth = await registerAndAuthenticateUser({
            name: "Missing Unlike User",
            email: `missingunlike${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/999999/likes")
            .set(likerAuth.headers);

        expect(res.statusCode).toBe(404);
    });
});
