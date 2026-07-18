const { EventLike } = require("../../../../src/models");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../../helpers/http/authTestHelper");
const { createEventAsAuthenticatedUser } = require("../../../helpers/http/eventTestHelper");
const {
    joinEventAsAuthenticatedUser,
    leaveEventAsAuthenticatedUser
} = require("../../../helpers/http/eventMembershipTestHelper");

const { getPublicUserEvents } = require("../../../helpers/http/userTestHelper");

/* ==========================================================================
   Users Integration Tests - Get Public User Events

   Tests public user event retrieval.

   Responsibilities
   - Test public user event retrieval
   - Test created and joined view filters
   - Test event metadata enrichment
   - Test pagination and sorting
   - Test validation errors
   - Test missing user handling

   Notes
   - Public user events are retrieved through view-based pagination.
   - Created and joined views must remain distinct.
   - Inactive memberships are excluded from joined public events.
=========================================================================== */

describe("Get Public User Events API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       PUBLIC USER EVENTS SUCCESS
    ============================= */

    describe("Public user events success", () => {
        it("retrieves paginated public user events", async () => {
            const targetUserAuth = await registerAndAuthenticateUser({
                name: "Target User",
                email: `target${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(targetUserAuth.headers, {
                title: "Created Event"
            });

            const response = await getPublicUserEvents({
                userId: targetUserAuth.user.userId,
                query: {
                    view: "created"
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Public user events retrieved successfully");

            expect(response.body).toHaveProperty("view", "created");
            expect(response.body).toHaveProperty("page", 1);
            expect(response.body).toHaveProperty("pageSize");
            expect(response.body).toHaveProperty("totalEvents");
            expect(response.body).toHaveProperty("totalPages");

            expect(Array.isArray(response.body.events)).toBe(true);
        });

        it("retrieves created public user events", async () => {
            const targetUserAuth = await registerAndAuthenticateUser({
                name: "Creator",
                email: `createdtarget${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(targetUserAuth.headers, {
                title: "Created Public Event"
            });

            const response = await getPublicUserEvents({
                userId: targetUserAuth.user.userId,
                query: {
                    view: "created"
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Public user events retrieved successfully");

            expect(response.body.events.some(
                (event) => event.title === "Created Public Event"
            )).toBe(true);
        });

        it("retrieves joined public user events", async () => {
            const targetUserAuth = await registerAndAuthenticateUser({
                name: "Participant",
                email: `joinedtarget${Date.now()}@test.com`
            });

            const eventCreatorAuth = await registerAndAuthenticateUser({
                name: "Event Creator",
                email: `eventcreator${Date.now()}@test.com`
            });

            const eventResponse = await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
                title: "Joined Public Event"
            });

            await joinEventAsAuthenticatedUser(eventResponse.body.event.id, targetUserAuth.headers);

            const response = await getPublicUserEvents({
                userId: targetUserAuth.user.userId,
                query: {
                    view: "joined"
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Public user events retrieved successfully");

            expect(response.body.events.some(
                (event) => event.title === "Joined Public Event"
            )).toBe(true);
        });

        it("does not return created events in joined view", async () => {
            const targetUserAuth = await registerAndAuthenticateUser({
                name: "Target User",
                email: `creatednotjoined${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(targetUserAuth.headers, {
                title: "Created Only Event"
            });

            const response = await getPublicUserEvents({
                userId: targetUserAuth.user.userId,
                query: {
                    view: "joined"
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("view", "joined");

            expect(response.body.events.some(
                (event) => event.title === "Created Only Event"
            )).toBe(false);
        });
    });

    /* =============================
       MEMBERSHIP STATE
    ============================= */

    describe("Membership state", () => {
        it("excludes inactive memberships from joined public user events", async () => {
            const targetUserAuth = await registerAndAuthenticateUser({
                name: "Inactive Participant",
                email: `inactiveparticipant${Date.now()}@test.com`
            });

            const eventCreatorAuth = await registerAndAuthenticateUser({
                name: "Event Creator",
                email: `inactivecreator${Date.now()}@test.com`
            });

            const eventResponse = await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
                title: "Inactive Joined Public Event"
            });

            await joinEventAsAuthenticatedUser(eventResponse.body.event.id, targetUserAuth.headers);
            await leaveEventAsAuthenticatedUser(eventResponse.body.event.id, targetUserAuth.headers);

            const response = await getPublicUserEvents({
                userId: targetUserAuth.user.userId,
                query: {
                    view: "joined"
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Public user events retrieved successfully");

            expect(response.body.events.some(
                (event) => event.title === "Inactive Joined Public Event"
            )).toBe(false);
        });
    });

    /* =============================
       EVENT METADATA
    ============================= */

    describe("Event metadata", () => {
        it("includes like count and false current user like state for anonymous public user events", async () => {
            const targetUserAuth = await registerAndAuthenticateUser({
                name: "Public Like Target",
                email: `publicliketarget${Date.now()}@test.com`
            });

            const likerAuth = await registerAndAuthenticateUser({
                name: "Public Liker",
                email: `publicliker${Date.now()}@test.com`
            });

            const eventResponse = await createEventAsAuthenticatedUser(targetUserAuth.headers, {
                title: "Public Like Stats Event"
            });

            await EventLike.create({
                eventId: eventResponse.body.event.id,
                userId: likerAuth.user.userId
            });

            const response = await getPublicUserEvents({
                userId: targetUserAuth.user.userId,
                query: {
                    view: "created"
                }
            });

            expect(response.statusCode).toBe(200);

            const event = response.body.events.find(
                (item) => item.id === eventResponse.body.event.id
            );

            expect(event).toBeDefined();
            expect(Number(event.likesCount)).toBe(1);
            expect(event.isLikedByCurrentUser).toBe(false);
        });

        it("includes current user like state for authenticated public user events", async () => {
            const targetUserAuth = await registerAndAuthenticateUser({
                name: "Liked Public Target",
                email: `likedpublictarget${Date.now()}@test.com`
            });

            const viewerAuth = await registerAndAuthenticateUser({
                name: "Public Viewer",
                email: `publicviewer${Date.now()}@test.com`
            });

            const eventResponse = await createEventAsAuthenticatedUser(targetUserAuth.headers, {
                title: "Liked Public Event"
            });

            await EventLike.create({
                eventId: eventResponse.body.event.id,
                userId: viewerAuth.user.userId
            });

            const response = await getPublicUserEvents({
                userId: targetUserAuth.user.userId,
                headers: viewerAuth.headers,
                query: {
                    view: "created"
                }
            });

            expect(response.statusCode).toBe(200);

            const event = response.body.events.find(
                (item) => item.id === eventResponse.body.event.id
            );

            expect(event).toBeDefined();
            expect(Number(event.likesCount)).toBe(1);
            expect(event.isLikedByCurrentUser).toBe(true);
        });
    });

    /* =============================
       PAGINATION AND SORTING
    ============================= */

    describe("Pagination and sorting", () => {
        it("paginates public user events by view", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Pagination User",
                email: `pagination${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(userAuth.headers, {
                title: "Event A"
            });

            await createEventAsAuthenticatedUser(userAuth.headers, {
                title: "Event B"
            });

            await createEventAsAuthenticatedUser(userAuth.headers, {
                title: "Event C"
            });

            const response = await getPublicUserEvents({
                userId: userAuth.user.userId,
                query: {
                    view: "created",
                    page: 1,
                    pageSize: 2
                }
            });

            expect(response.statusCode).toBe(200);

            expect(response.body.events.length).toBe(2);
            expect(response.body.totalEvents).toBe(3);
            expect(response.body.totalPages).toBe(2);
        });

        it("sorts public user events by title", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Sorting User",
                email: `sorting${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(userAuth.headers, {
                title: "Zulu Event"
            });

            await createEventAsAuthenticatedUser(userAuth.headers, {
                title: "Alpha Event"
            });

            const response = await getPublicUserEvents({
                userId: userAuth.user.userId,
                query: {
                    view: "created",
                    sortBy: "title",
                    order: "asc"
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.events[0].title).toBe("Alpha Event");
            expect(response.body.events[1].title).toBe("Zulu Event");
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid user identifiers", async () => {
            const response = await getPublicUserEvents({
                userId: "abc"
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid view", async () => {
            const response = await getPublicUserEvents({
                userId: 1,
                query: {
                    view: "invalid"
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid page", async () => {
            const response = await getPublicUserEvents({
                userId: 1,
                query: {
                    page: 0
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid pageSize", async () => {
            const response = await getPublicUserEvents({
                userId: 1,
                query: {
                    pageSize: 500
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid sortBy", async () => {
            const response = await getPublicUserEvents({
                userId: 1,
                query: {
                    sortBy: "invalid"
                }
            });

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the user does not exist", async () => {
            const response = await getPublicUserEvents({
                userId: 999999
            });

            expect(response.statusCode).toBe(404);
        });
    });
});
