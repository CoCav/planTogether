/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - LEAVE EVENT

   Tests:
   - leaving an event
   - authentication requirement
   - leave without membership rejection
   - nonexistent event handling
   - past event restriction

   Ensures:
   - authenticated members can leave events
   - invalid leave requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

describe("Leave Event API", () => {
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

    it("should allow a user to leave an event", async () => {
        const creatorToken = await registerUser("Creator", `creator${Date.now()}@test.com`);
        const event = await createEvent(creatorToken);

        const userToken = await registerUser("User", `user${Date.now()}@test.com`);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${userToken}`);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
    });

    it("should reject leaving without token", async () => {
        const creatorToken = await registerUser("Creator", `creator${Date.now()}@test.com`);
        const event = await createEvent(creatorToken);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`);

        expect(res.statusCode).toBe(401);
    });

    it("should reject leaving an event without being a member", async () => {
        const creatorToken = await registerUser("Creator", `creator${Date.now()}@test.com`);
        const event = await createEvent(creatorToken);

        const userToken = await registerUser("User", `nonmember${Date.now()}@test.com`);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
    });

    it("should reject leaving a nonexistent event", async () => {
        const userToken = await registerUser("User", `missingleave${Date.now()}@test.com`);

        const res = await request(app)
            .delete("/api/events/999999/members/leave")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
    });

    it("should reject leaving a past event", async () => {
        const creatorToken = await registerUser("Creator", `creator${Date.now()}@test.com`);

        const event = await createEvent(creatorToken, {
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const userToken = await registerUser("User", `user${Date.now()}@test.com`);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });
});
