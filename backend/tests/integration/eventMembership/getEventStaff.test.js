/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - GET EVENT STAFF

   Tests:
   - event staff retrieval
   - public access to event staff endpoint
   - organizer assignment to event creator

   Ensures:
   - event organizer and co-organizer(s) are returned correctly
   - public users can access event staff endpoint
   - event creator is automatically assigned organizer role
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");
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
        const eventId = eventRes.body.event.id;

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set(coOrganizerAuth.headers);

        const coOrganizerId = await getUserIdByEmail(
            coOrganizerAuth.email
        );

        await request(app)
            .put(`/api/events/${eventId}/members/${coOrganizerId}/role`)
            .set(eventCreatorAuth.headers)
            .send({
                newRole: "co_organizer"
            });

        const res = await request(app).get(`/api/events/${eventId}/staff`);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("eventStaff");
        expect(Array.isArray(res.body.eventStaff)).toBe(true);

        const staffEmails = res.body.eventStaff.map(
            (staffMember) => staffMember.email || staffMember.User?.email
        );

        expect(staffEmails).toContain(eventCreatorAuth.email);
        expect(staffEmails).toContain(coOrganizerAuth.email);
    });

    it("should allow public access to event staff endpoint", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);

        const eventId = eventRes.body.event.id;

        const res = await request(app).get(`/api/events/${eventId}/staff`);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("eventStaff");
    });

    it("should assign organizer role to the event creator", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Main Organizer",
            email: `mainorganizer${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);

        const eventId = eventRes.body.event.id;

        const res = await request(app).get(`/api/events/${eventId}/staff`);

        expect(res.statusCode).toBe(200);

        expect(Array.isArray(res.body.eventStaff)).toBe(true);

        const creatorStaffMember = res.body.eventStaff.find(
            (staffMember) => (staffMember.email || staffMember.User?.email) === eventCreatorAuth.email
        );

        expect(creatorStaffMember).toBeDefined();
        expect(creatorStaffMember.role).toBe("organizer");
    });
});
