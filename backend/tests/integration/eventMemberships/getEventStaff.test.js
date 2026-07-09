/* =======================================================
   EVENT MEMBERSHIP INTEGRATION - GET EVENT STAFF TESTS

   Tests:
   - event staff retrieval
   - participant exclusion from staff
   - inactive staff exclusion
   - public access to event staff endpoint
   - organizer assignment to event creator
   - nonexistent event handling
   - invalid event ID validation

   Ensures:
   - organizers and co-organizers are returned correctly
   - participants are excluded from event staff
   - inactive organizer/co_organizer memberships are excluded from staff listings
   - public users can access event staff endpoint
   - event creator is automatically assigned organizer role
   - invalid requests are rejected correctly
========================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const {
    joinEventAsAuthenticatedUser,
    updateEventMemberRole
} = require("../../helpers/http/eventMembershipTestHelper");
const { findUserIdByEmail } = require("../../helpers/http/userTestHelper");

describe("Get Event Staff API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       EVENT STAFF RETRIEVAL
    ============================= */

    it("should retrieve event staff", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Event Creator",
                email: `creator${Date.now()}@test.com`
            }
        });

        const coOrganizerAuth = await registerAndAuthenticateUser({
            name: "Co Organizer",
            email: `coorg${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

        const coOrganizerId = await findUserIdByEmail(coOrganizerAuth.email);

        await updateEventMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        const res = await request(app).get(`/api/events/${event.id}/staff`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event staff retrieved successfully");
        expect(res.body).toHaveProperty("eventStaff");

        expect(Array.isArray(res.body.eventStaff)).toBe(true);

        const staffEmails = res.body.eventStaff.map((staffMember) => staffMember.email || staffMember.User?.email);

        expect(staffEmails).toContain(organizerAuth.email);
        expect(staffEmails).toContain(coOrganizerAuth.email);
    });

    it("should include staff avatars in event staff response", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Event Creator",
                email: `creatoravatar${Date.now()}@test.com`
            }
        });

        const res = await request(app).get(`/api/events/${event.id}/staff`);

        expect(res.statusCode).toBe(200);

        const organizer = res.body.eventStaff.find(
            (staffMember) => (staffMember.email || staffMember.User?.email) === organizerAuth.email
        );

        expect(organizer).toBeDefined();
        expect(organizer.User).toHaveProperty("avatar");
    });

    it("should not include participants in event staff", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Event Creator",
                email: `creator${Date.now()}@test.com`
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await request(app).get(`/api/events/${event.id}/staff`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event staff retrieved successfully");

        const staffEmails = res.body.eventStaff.map((staffMember) => staffMember.email || staffMember.User?.email);

        expect(staffEmails).not.toContain(participantAuth.email);
    });

    it("should allow public access to event staff endpoint", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Event Creator",
                email: `creator${Date.now()}@test.com`
            }
        });

        const res = await request(app).get(`/api/events/${event.id}/staff`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event staff retrieved successfully");
        expect(res.body).toHaveProperty("eventStaff");
    });

    it("should assign organizer role to the event creator", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Main Organizer",
                email: `mainorganizer${Date.now()}@test.com`
            }
        });

        const res = await request(app).get(`/api/events/${event.id}/staff`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event staff retrieved successfully");

        expect(Array.isArray(res.body.eventStaff)).toBe(true);

        const creatorStaffMember = res.body.eventStaff.find(
            (staffMember) => (staffMember.email || staffMember.User?.email) === organizerAuth.email
        );

        expect(creatorStaffMember).toBeDefined();
        expect(creatorStaffMember.role).toBe(EVENT_ROLES.ORGANIZER);
    });

    it("should exclude inactive co_organizer memberships from event staff", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const coOrganizerAuth = await registerAndAuthenticateUser({
            name: "Inactive Co Organizer",
            email: `inactivecoorg${Date.now()}@test.com`
        });

        const coOrganizerId = await findUserIdByEmail(coOrganizerAuth.email);

        await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

        await updateEventMemberRole(
            event.id,
            coOrganizerId,
            organizerAuth.headers,
            EVENT_ROLES.CO_ORGANIZER
        );

        await request(app)
            .delete(`/api/events/${event.id}/members/${coOrganizerId}`)
            .set(organizerAuth.headers);

        const res = await request(app).get(`/api/events/${event.id}/staff`);

        const staffEmails = res.body.eventStaff.map((staffMember) => staffMember.email || staffMember.User?.email);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event staff retrieved successfully");

        expect(staffEmails).not.toContain(coOrganizerAuth.email);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const res = await request(app).get("/api/events/abc/staff");

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should return 404 for nonexistent event", async () => {
        const res = await request(app).get("/api/events/999999/staff");

        expect(res.statusCode).toBe(404);
    });
});
