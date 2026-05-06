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

    const registerUser = async (name, email) => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name,
                email,
                password: "Password123"
            });

        return {
            token: res.body.token,
            email
        };
    };

    const createEvent = async (token, overrides = {}) => {
        return request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Test Event",
                description: "Test",
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z",
                mode: "in_person",
                location: "Montreal",
                type: "Meetup",
                theme: "Tech",
                ...overrides
            });
    };

    it("should retrieve event staff", async () => {
        const creator = await registerUser(
            "Organizer User",
            `organizer${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token);
        const eventId = eventRes.body.event.id;

        const res = await request(app).get(`/api/events/${eventId}/staff`)

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("eventStaff");
        expect(Array.isArray(res.body.eventStaff)).toBe(true);
        expect(res.body.eventStaff.length).toBeGreaterThan(0);
    });

    it("should allow public access to event staff endpoint", async () => {
        const creator = await registerUser(
            "Public Organizer Creator",
            `publicorganizer${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token);

        const res = await request(app).get(`/api/events/${eventRes.body.event.id}/staff`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("eventStaff");
    });

    it("should assign organizer role to the event creator", async () => {
        const creatorEmail = `mainorganizer${Date.now()}@test.com`;

        const creator = await registerUser(
            "Main Organizer",
            creatorEmail
        );

        const eventRes = await createEvent(creator.token);
        const eventId = eventRes.body.event.id;

        const res = await request(app).get(`/api/events/${eventId}/staff`)

        expect(res.statusCode).toBe(200);

        expect(Array.isArray(res.body.eventStaff)).toBe(true);

        const organizerEmails = res.body.eventStaff.map(
            (staffMember) => staffMember.email || staffMember.User?.email
        );

        expect(organizerEmails).toContain(creatorEmail);
    });
});
