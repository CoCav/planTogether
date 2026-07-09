const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const {
    getEventMembers,
    joinEventAsAuthenticatedUser,
    leaveEventAsAuthenticatedUser
} = require("../../helpers/http/eventMembershipTestHelper");

/* ==========================================================================
   Event Membership Integration Tests - Get Event Members

   Tests event member listing behavior.

   Responsibilities
   - Test successful member retrieval
   - Test public access to event members
   - Test inactive membership exclusion
   - Test validation errors
   - Test missing event handling

   Notes
   - Event members can be viewed publicly.
   - Inactive memberships must not appear in member listings.
=========================================================================== */

const getMemberEmail = (member) => {
    return member.email || member.User?.email;
};

describe("Get Event Members API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       MEMBERS SUCCESS
    ============================= */

    describe("Members success", () => {
        it("retrieves event members", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Member List Creator",
                    email: `memberlistcreator${Date.now()}@test.com`
                },
                event: {
                    title: "Community Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Listed Participant",
                email: `listedparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getEventMembers(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event members retrieved successfully");
            expect(response.body).toHaveProperty("members");
            expect(Array.isArray(response.body.members)).toBe(true);

            const memberEmails = response.body.members.map(getMemberEmail);

            expect(memberEmails).toContain(participantAuth.email);
        });

        it("includes member avatars in event members response", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Member Avatar Creator",
                    email: `memberavatarcreator${Date.now()}@test.com`
                },
                event: {
                    title: "Photography Workshop"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Avatar Participant",
                email: `avatarparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getEventMembers(event.id);

            expect(response.statusCode).toBe(200);

            const participant = response.body.members.find(
                (member) => getMemberEmail(member) === participantAuth.email
            );

            expect(participant).toBeDefined();
            expect(participant.User).toHaveProperty("avatar");
        });

        it("allows public access to event members", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Public Members Creator",
                    email: `publicmemberscreator${Date.now()}@test.com`
                },
                event: {
                    title: "Board Game Night"
                }
            });

            const response = await getEventMembers(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event members retrieved successfully");
            expect(response.body).toHaveProperty("members");
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("excludes inactive memberships from event members", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Coffee Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Inactive Participant",
                email: `inactiveparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
            await leaveEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getEventMembers(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event members retrieved successfully");

            const memberEmails = response.body.members.map(getMemberEmail);

            expect(memberEmails).not.toContain(participantAuth.email);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const response = await getEventMembers("abc");

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the event does not exist", async () => {
            const response = await getEventMembers(999999);

            expect(response.statusCode).toBe(404);
        });
    });
});
