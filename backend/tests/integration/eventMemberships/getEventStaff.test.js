const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const {
    getEventStaff,
    joinEventAsAuthenticatedUser,
    updateEventMemberRole,
    removeEventMember
} = require("../../helpers/http/eventMembershipTestHelper");

const { findUserIdByEmail } = require("../../helpers/http/userTestHelper");

/* ==========================================================================
   Event Membership Integration Tests - Get Event Staff

   Tests event staff listing behavior.

   Responsibilities
   - Test successful staff retrieval
   - Test public access to event staff
   - Test participant exclusion
   - Test inactive staff exclusion
   - Test organizer role assignment
   - Test validation errors
   - Test missing event handling

   Notes
   - Event staff can be viewed publicly.
   - Staff includes organizers and co-organizers.
   - Participants and inactive memberships must not appear in staff listings.
=========================================================================== */

const getStaffEmail = (staffMember) => {
    return staffMember.email || staffMember.User?.email;
};

describe("Get Event Staff API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       STAFF SUCCESS
    ============================= */

    describe("Staff success", () => {
        it("retrieves event staff", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Staff List Creator",
                    email: `stafflistcreator${Date.now()}@test.com`
                },
                event: {
                    title: "Community Meetup"
                }
            });

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "Listed Co Organizer",
                email: `listedcoorganizer${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

            const coOrganizerId = await findUserIdByEmail(coOrganizerAuth.email);

            await updateEventMemberRole(
                event.id,
                coOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            const response = await getEventStaff(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event staff retrieved successfully");
            expect(response.body).toHaveProperty("eventStaff");
            expect(Array.isArray(response.body.eventStaff)).toBe(true);

            const staffEmails = response.body.eventStaff.map(getStaffEmail);

            expect(staffEmails).toContain(organizerAuth.email);
            expect(staffEmails).toContain(coOrganizerAuth.email);
        });

        it("includes staff avatars in event staff response", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Staff Avatar Creator",
                    email: `staffavatarcreator${Date.now()}@test.com`
                },
                event: {
                    title: "Photography Workshop"
                }
            });

            const response = await getEventStaff(event.id);

            expect(response.statusCode).toBe(200);

            const organizer = response.body.eventStaff.find(
                (staffMember) => getStaffEmail(staffMember) === organizerAuth.email
            );

            expect(organizer).toBeDefined();
            expect(organizer.User).toHaveProperty("avatar");
        });

        it("allows public access to event staff", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Public Staff Creator",
                    email: `publicstaffcreator${Date.now()}@test.com`
                },
                event: {
                    title: "Board Game Night"
                }
            });

            const response = await getEventStaff(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event staff retrieved successfully");
            expect(response.body).toHaveProperty("eventStaff");
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("does not include participants in event staff", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Participant Exclusion Creator",
                    email: `participantexclusioncreator${Date.now()}@test.com`
                },
                event: {
                    title: "Coffee Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Staff Excluded Participant",
                email: `staffexcludedparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getEventStaff(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event staff retrieved successfully");

            const staffEmails = response.body.eventStaff.map(getStaffEmail);

            expect(staffEmails).not.toContain(participantAuth.email);
        });

        it("assigns organizer role to the event creator", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Main Organizer",
                    email: `mainorganizer${Date.now()}@test.com`
                },
                event: {
                    title: "Tech Meetup"
                }
            });

            const response = await getEventStaff(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event staff retrieved successfully");
            expect(Array.isArray(response.body.eventStaff)).toBe(true);

            const creatorStaffMember = response.body.eventStaff.find(
                (staffMember) => getStaffEmail(staffMember) === organizerAuth.email
            );

            expect(creatorStaffMember).toBeDefined();
            expect(creatorStaffMember.role).toBe(EVENT_ROLES.ORGANIZER);
        });

        it("excludes inactive co-organizer memberships from event staff", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Hiking Trip"
                }
            });

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "Inactive Co Organizer",
                email: `inactivecoorganizer${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

            const coOrganizerId = await findUserIdByEmail(coOrganizerAuth.email);

            await updateEventMemberRole(
                event.id,
                coOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            await removeEventMember(
                event.id,
                coOrganizerId,
                organizerAuth.headers
            );

            const response = await getEventStaff(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event staff retrieved successfully");

            const staffEmails = response.body.eventStaff.map(getStaffEmail);

            expect(staffEmails).not.toContain(coOrganizerAuth.email);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const response = await getEventStaff("abc");

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the event does not exist", async () => {
            const response = await getEventStaff(999999);

            expect(response.statusCode).toBe(404);
        });
    });
});
