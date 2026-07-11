const User = require("../../../../src/models/userModel");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../../helpers/database/dbTestHelper");

const {
    registerAndAuthenticateUser,
    deleteCurrentUser,
    loginUser
} = require("../../../helpers/http/authTestHelper");

const { createOrganizerAndEvent } = require("../../../helpers/http/eventTestHelper");

/* ==========================================================================
   Users Integration Tests - Delete Current User

   Tests current user account deletion.

   Responsibilities
   - Test successful account deletion
   - Test authentication errors
   - Test account deletion business rules
   - Test deleted account state

   Notes
   - Deleted users remain visible for history.
   - Deleted users cannot log in again.
   - Users owning active or upcoming events cannot delete their account.
=========================================================================== */

describe("Delete Current User API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       ACCOUNT DELETION SUCCESS
    ============================= */

    describe("Account deletion success", () => {
        it("deletes the authenticated user account", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Deleted User",
                email: `deleted${Date.now()}@test.com`,
                password: "Password123"
            });

            const response = await deleteCurrentUser(userAuth.headers);

            const deletedUser = await User.scope("withPassword").findByPk(
                userAuth.user.userId
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty(
                "message",
                "Account deleted successfully"
            );

            expect(deletedUser).not.toBeNull();
            expect(deletedUser.deletedAt).not.toBeNull();
            expect(deletedUser.name).toBe("Deleted User");
            expect(deletedUser.email).toMatch(/^deleted_user_/);
            expect(deletedUser.avatar).toBeNull();
            expect(deletedUser.password).toBeDefined();
        });

        it("allows account deletion when user only owns past events", async () => {
            const { organizerAuth } = await createOrganizerAndEvent({
                organizer: {
                    name: "Past Organizer",
                    email: `pastorganizer${Date.now()}@test.com`
                },
                event: {
                    title: "Past Organizer Event",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            const response = await deleteCurrentUser(organizerAuth.headers);

            const deletedUser = await User.scope("withPassword").findByPk(
                organizerAuth.user.userId
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Account deleted successfully");
            expect(deletedUser.deletedAt).not.toBeNull();
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects account deletion without authentication", async () => {
            const response = await deleteCurrentUser();

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects account deletion when user owns active or upcoming events", async () => {
            const { organizerAuth } = await createOrganizerAndEvent({
                organizer: {
                    name: "Active Organizer",
                    email: `activeorganizer${Date.now()}@test.com`
                },
                event: {
                    title: "Active Organizer Event"
                }
            });

            const response = await deleteCurrentUser(organizerAuth.headers);

            const user = await User.findByPk(organizerAuth.user.userId);

            expect(response.statusCode).toBe(403);
            expect(user.deletedAt).toBeNull();
        });
    });

    /* =============================
       ACCOUNT STATE
    ============================= */

    describe("Account state", () => {
        it("rejects login after account deletion", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Deleted Login User",
                email: `deletedlogin${Date.now()}@test.com`,
                password: "Password123"
            });

            await deleteCurrentUser(userAuth.headers);

            const response = await loginUser({
                email: userAuth.email,
                password: userAuth.password
            });

            expect(response.statusCode).toBe(401);
        });
    });
});
