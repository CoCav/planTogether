/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - JOIN EVENT

   Tests:
   - joining an event
   - authentication requirement
   - duplicate join rejection
   - nonexistent event handling
   - past event restriction

   Ensures:
   - authenticated users can join events
   - invalid join requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

describe("Join Event API", () => {
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

        return res.body.token;
    };

    const createEvent = async (token, overrides = {}) => {
        const res = await request(app)
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

        return res.body.event;
    };

    it("should allow an authenticated user to join an event", async () => {
        const creatorToken = await registerUser("Creator", `creator${Date.now()}@test.com`);
        const event = await createEvent(creatorToken);

        const userToken = await registerUser("User", `user${Date.now()}@test.com`);

        const res = await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
    });

    it("should reject joining without token", async () => {
        const creatorToken = await registerUser("Creator", `creator${Date.now()}@test.com`);
        const event = await createEvent(creatorToken);

        const res = await request(app)
            .post(`/api/events/${event.id}/members/join`);

        expect(res.statusCode).toBe(401);
    });

    it("should reject joining the same event twice", async () => {
        const creatorToken = await registerUser("Creator", `creator${Date.now()}@test.com`);
        const event = await createEvent(creatorToken);

        const userToken = await registerUser("User", `user${Date.now()}@test.com`);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${userToken}`);

        const res = await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(409);
    });

    it("should reject joining a nonexistent event", async () => {
        const userToken = await registerUser("User", `missingjoin${Date.now()}@test.com`);

        const res = await request(app)
            .post("/api/events/999999/members/join")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
    });

    it("should reject joining a past event", async () => {
        const creatorToken = await registerUser("Creator", `creator${Date.now()}@test.com`);

        const event = await createEvent(creatorToken, {
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const userToken = await registerUser("User", `user${Date.now()}@test.com`);

        const res = await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });
});
