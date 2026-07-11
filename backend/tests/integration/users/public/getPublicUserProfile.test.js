const { User } = require("../../../../src/models");

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

const { getPublicUserProfile } = require("../../../helpers/http/userTestHelper");

/* ==========================================================================
   Users Integration Tests - Get Public User Profile

   Tests public user profile retrieval.

   Responsibilities
   - Test public profile retrieval
   - Test public user stats
   - Test sensitive data protection
   - Test validation errors
   - Test missing user handling

   Notes
   - Public profiles must never expose private user fields.
   - Public stats only count active memberships.
=========================================================================== */

describe("Get Public User Profile API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       PUBLIC PROFILE SUCCESS
    ============================= */

    describe("Public profile success", () => {
        it("retrieves a public user profile", async () => {
            const targetUser = await User.create({
                name: "Target User",
                email: `target${Date.now()}@test.com`,
                password: "Password123",
                avatar: "/uploads/avatars/test.png"
            });

            const response = await getPublicUserProfile(targetUser.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Public user profile retrieved successfully");
            expect(response.body).toHaveProperty("user");
            expect(response.body).toHaveProperty("stats");

            expect(response.body.user).toMatchObject({
                name: "Target User",
                avatar: "/uploads/avatars/test.png"
            });
        });
    });

    /* =============================
       PUBLIC USER STATS
    ============================= */

    describe("Public user stats", () => {
        it("includes public user stats", async () => {
            const targetUserAuth = await registerAndAuthenticateUser({
                name: "Target User",
                email: `targetstats${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(
                targetUserAuth.headers,
                {
                    title: "Created Event"
                }
            );

            const joinedEventCreatorAuth = await registerAndAuthenticateUser({
                name: "Joined Event Creator",
                email: `joinedcreator${Date.now()}@test.com`
            });

            const joinedEventResponse = await createEventAsAuthenticatedUser(
                joinedEventCreatorAuth.headers,
                {
                    title: "Joined Event"
                }
            );

            await joinEventAsAuthenticatedUser(joinedEventResponse.body.event.id, targetUserAuth.headers);

            const response = await getPublicUserProfile(
                targetUserAuth.user.userId
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Public user profile retrieved successfully");

            expect(response.body.stats).toHaveProperty("createdEventsCount", 1);
            expect(response.body.stats).toHaveProperty("joinedEventsCount", 1);
        });

        it("excludes inactive memberships from public user stats", async () => {
            const targetUserAuth = await registerAndAuthenticateUser({
                name: "Inactive Stats User",
                email: `inactivestats${Date.now()}@test.com`
            });

            const eventCreatorAuth = await registerAndAuthenticateUser({
                name: "Event Creator",
                email: `inactiveprofilecreator${Date.now()}@test.com`
            });

            const eventResponse = await createEventAsAuthenticatedUser(
                eventCreatorAuth.headers,
                {
                    title: "Inactive Stats Event"
                }
            );

            await joinEventAsAuthenticatedUser(eventResponse.body.event.id, targetUserAuth.headers);
            await leaveEventAsAuthenticatedUser(eventResponse.body.event.id, targetUserAuth.headers);

            const response = await getPublicUserProfile(
                targetUserAuth.user.userId
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Public user profile retrieved successfully");

            expect(response.body.stats).toHaveProperty("joinedEventsCount", 0);
        });
    });

    /* =============================
       SENSITIVE DATA PROTECTION
    ============================= */

    describe("Sensitive data protection", () => {
        it("does not expose sensitive user fields publicly", async () => {
            const targetUser = await User.create({
                name: "Sensitive User",
                email: `sensitive${Date.now()}@test.com`,
                password: "Password123",
                avatar: "/uploads/avatars/test.png"
            });

            const response = await getPublicUserProfile(targetUser.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Public user profile retrieved successfully");

            expect(response.body.user).not.toHaveProperty("id");
            expect(response.body.user).not.toHaveProperty("email");
            expect(response.body.user).not.toHaveProperty("password");
            expect(response.body.user).not.toHaveProperty("createdAt");
            expect(response.body.user).not.toHaveProperty("updatedAt");
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid user identifiers", async () => {
            const response = await getPublicUserProfile("abc");

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the user does not exist", async () => {
            const response = await getPublicUserProfile(999999);

            expect(response.statusCode).toBe(404);
        });
    });
});
