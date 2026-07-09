const { EventLike } = require("../../../src/models");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const { likeEvent } = require("../../helpers/http/eventLikeTestHelper");

/* ==========================================================================
   Event Like Integration Tests

   Tests event like behavior.

   Responsibilities
   - Test successful likes
   - Test duplicate like handling
   - Test authentication errors
   - Test validation errors
   - Test missing event handling

   Notes
   - Users can like an event only once.
   - Responses include the updated likes count.
=========================================================================== */

describe("Like Event API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       LIKE SUCCESS
    ============================= */

    describe("Like success", () => {
        it("allows an authenticated user to like an event", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Like Event Creator",
                    email: `likecreator${Date.now()}@test.com`
                },
                event: {
                    title: "Like Event"
                }
            });

            const likerAuth = await registerAndAuthenticateUser({
                name: "Event Liker",
                email: `eventliker${Date.now()}@test.com`
            });

            const response = await likeEvent(
                event.id,
                likerAuth.headers
            );

            expect(response.statusCode).toBe(201);

            expect(response.body).toMatchObject({
                success: true,
                message: "Event liked successfully",
                eventId: event.id,
                userId: likerAuth.user.userId,
                liked: true
            });

            expect(Number(response.body.likesCount)).toBe(1);

            const likeCount = await EventLike.count({
                where: {
                    eventId: event.id,
                    userId: likerAuth.user.userId
                }
            });

            expect(likeCount).toBe(1);
        });

        it("returns the updated likes count", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Like Count Creator",
                    email: `likecountcreator${Date.now()}@test.com`
                },
                event: {
                    title: "Like Count Event"
                }
            });

            const likerAuthA = await registerAndAuthenticateUser({
                name: "Liker A",
                email: `likera${Date.now()}@test.com`
            });

            const likerAuthB = await registerAndAuthenticateUser({
                name: "Liker B",
                email: `likerb${Date.now()}@test.com`
            });

            await likeEvent(event.id, likerAuthA.headers);

            const response = await likeEvent(
                event.id,
                likerAuthB.headers
            );

            expect(response.statusCode).toBe(201);
            expect(Number(response.body.likesCount)).toBe(2);
        });

    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects duplicate likes", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Duplicate Like Creator",
                    email: `duplicatelikecreator${Date.now()}@test.com`
                },
                event: {
                    title: "Duplicate Like Event"
                }
            });

            const likerAuth = await registerAndAuthenticateUser({
                name: "Duplicate Liker",
                email: `duplicateliker${Date.now()}@test.com`
            });

            await likeEvent(event.id, likerAuth.headers);

            const response = await likeEvent(
                event.id,
                likerAuth.headers
            );

            expect(response.statusCode).toBe(409);
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects unauthenticated requests", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Unauthenticated Like Creator",
                    email: `unauthenticatedlikecreator${Date.now()}@test.com`
                },
                event: {
                    title: "Unauthenticated Like Event"
                }
            });

            const response = await likeEvent(event.id);

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const likerAuth = await registerAndAuthenticateUser({
                name: "Invalid Like User",
                email: `invalidlike${Date.now()}@test.com`
            });

            const response = await likeEvent(
                "abc",
                likerAuth.headers
            );

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the event does not exist", async () => {
            const likerAuth = await registerAndAuthenticateUser({
                name: "Missing Event Liker",
                email: `missingeventliker${Date.now()}@test.com`
            });

            const response = await likeEvent(
                999999,
                likerAuth.headers
            );

            expect(response.statusCode).toBe(404);
        });
    });
});
