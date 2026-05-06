/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - GET EVENT MEMBERS

   Tests:
   - event members retrieval
   - public access to event members endpoint

   Ensures:
   - event members are returned correctly
   - public users can access event members endpoint
================================================== */

const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

describe("Get Event Members API", () => {
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

    it("should retrieve event members", async () => {
        const creator = await registerUser(
            "Members Creator",
            `memberscreator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token);
        const eventId = eventRes.body.event.id;

        const participant = await registerUser(
            "Members Participant",
            `membersparticipant${Date.now()}@test.com`
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set("Authorization", `Bearer ${participant.token}`);

        const res = await request(app).get(`/api/events/${eventId}/members`);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("members");
        expect(Array.isArray(res.body.members)).toBe(true);
        expect(res.body.members.length).toBeGreaterThan(0);
    });

    it("should allow public access to event members endpoint", async () => {
        const creator = await registerUser(
            "Public Members Creator",
            `publicmembers${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token);

        const res = await request(app).get(`/api/events/${eventRes.body.event.id}/members`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("members");
    });
});
