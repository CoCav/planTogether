/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - GET EVENT STAFF

   Tests:
   - event staff retrieval
   - public access to event staff endpoint
   - organizer assignment to event creator
   - nonexistent event handling
   - invalid event ID validation

   Ensures:
   - event organizer and co-organizer(s) are returned correctly
   - public users can access event staff endpoint
   - event creator is automatically assigned organizer role
   - invalid requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");
const { joinEvent, updateMemberRole } = require("../../helpers/eventMembershipHelper");
const { getUserIdByEmail } = require("../../helpers/userHelper");

describe("Get Event Staff API", () => {

    beforeAll(async () => {
        await initDB();
    });

    afterEach(async () => {
        await EventUserRole.destroy({ where: {} });
        await Event.destroy({ where: {} });
        await User.destroy({ where: {} });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    /* =============================
       EVENT STAFF RETRIEVAL
    ============================= */

    it("should retrieve event staff", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `coorg${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, coOrganizerAuth.headers);

        const coOrganizerId = await getUserIdByEmail(coOrganizerAuth.email);

        await updateMemberRole(event.id, coOrganizerId, eventCreatorAuth.headers, "co_organizer");

        const res = await request(app).get(`/api/events/${event.id}/staff`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("eventStaff");
        expect(Array.isArray(res.body.eventStaff)).toBe(true);

        const staffEmails = res.body.eventStaff.map(
            (staffMember) => staffMember.email || staffMember.User?.email
        );

        expect(staffEmails).toContain(eventCreatorAuth.email);
        expect(staffEmails).toContain(coOrganizerAuth.email);
    });

    it("should not include participants in event staff", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app).get(`/api/events/${event.id}/staff`);

        expect(res.statusCode).toBe(200);

        const staffEmails = res.body.eventStaff.map(
            (staffMember) => staffMember.email || staffMember.User?.email
        );

        expect(staffEmails).not.toContain(participantAuth.email);
    });

    it("should allow public access to event staff endpoint", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app).get(`/api/events/${event.id}/staff`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("eventStaff");
    });

    it("should assign organizer role to the event creator", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Main Organizer",
            email: `mainorganizer${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app).get(`/api/events/${event.id}/staff`);

        expect(res.statusCode).toBe(200);

        expect(Array.isArray(res.body.eventStaff)).toBe(true);

        const creatorStaffMember = res.body.eventStaff.find(
            (staffMember) => (staffMember.email || staffMember.User?.email) === eventCreatorAuth.email
        );

        expect(creatorStaffMember).toBeDefined();
        expect(creatorStaffMember.role).toBe("organizer");
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should return 404 for nonexistent event", async () => {
        const res = await request(app).get("/api/events/999999/staff");

        expect(res.statusCode).toBe(404);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const res = await request(app).get("/api/events/abc/staff");

        expect(res.statusCode).toBe(400);
    });
});
