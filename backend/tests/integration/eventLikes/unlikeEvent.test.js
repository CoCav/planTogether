const { EventLike } = require("../../../src/models");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const {
    likeEvent,
    unlikeEvent
} = require("../../helpers/http/eventLikeTestHelper");

/* ==========================================================================
   Event Like Integration Tests - Unlike Event

   Tests event unlike behavior.

   Responsibilities
   - Test successful unlikes
   - Test updated likes count after unlike
   - Test unlike business rules
   - Test authentication errors
   - Test validation errors
   - Test missing event handling

   Notes
   - Users can remove their likes.
   - Unliking an already unliked event is idempotent.
   - Responses include the updated likes count.
=========================================================================== */

describe("Unlike Event API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       UNLIKE SUCCESS
    ============================= */

    describe("Unlike success", () => {
        it("allows an authenticated user to unlike an event", async () => {
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

            await likeEvent(event.id, likerAuth.headers);

            const response = await unlikeEvent(event.id, likerAuth.headers);

            expect(response.statusCode).toBe(200);

            expect(response.body).toMatchObject({
                success: true,
                message: "Event unliked successfully",
                eventId: event.id,
                userId: likerAuth.user.userId,
                liked: false
            });

            expect(Number(response.body.likesCount)).toBe(0);

            const likeCount = await EventLike.count({
                where: {
                    eventId: event.id,
                    userId: likerAuth.user.userId
                }
            });

            expect(likeCount).toBe(0);
        });

        it("returns the updated likes count after unlike", async () => {
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

            await likeEvent(event.id, likerAuthA.headers);
            await likeEvent(event.id, likerAuthB.headers);

            const response = await unlikeEvent(event.id, likerAuthA.headers);

            expect(response.statusCode).toBe(200);
            expect(Number(response.body.likesCount)).toBe(1);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("allows unliking an event that was never liked", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Never Liked Creator",
                    email: `neverlikedcreator${Date.now()}@test.com`
                },
                event: {
                    title: "Community Meetup"
                }
            });

            const likerAuth = await registerAndAuthenticateUser({
                name: "Never Liked User",
                email: `neverlikeduser${Date.now()}@test.com`
            });

            const response = await unlikeEvent(event.id, likerAuth.headers);

            expect(response.statusCode).toBe(200);

            expect(response.body).toMatchObject({
                liked: false
            });

            expect(Number(response.body.likesCount)).toBe(0);
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects unauthenticated requests", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Unauth Unlike Creator",
                    email: `unauthunlikecreator${Date.now()}@test.com`
                },
                event: {
                    title: "Unauth Unlike Event"
                }
            });

            const response = await unlikeEvent(event.id);

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const likerAuth = await registerAndAuthenticateUser({
                name: "Invalid Unlike User",
                email: `invalidunlike${Date.now()}@test.com`
            });

            const response = await unlikeEvent("abc", likerAuth.headers);

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the event does not exist", async () => {
            const likerAuth = await registerAndAuthenticateUser({
                name: "Missing Unlike User",
                email: `missingunlike${Date.now()}@test.com`
            });

            const response = await unlikeEvent(999999, likerAuth.headers);

            expect(response.statusCode).toBe(404);
        });
    });
});
