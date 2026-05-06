/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - REMOVE EVENT MEMBER

   Tests:
   - organizer member removal permissions
   - co-organizer removal permissions and restrictions
   - participant removal restrictions
   - protected organizer rules
   - member removal validation

   Ensures:
   - event role hierarchy is enforced correctly
   - unauthorized member removals are rejected
   - invalid params return proper HTTP errors
================================================== */

const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

describe("Remove Event Member API", () => {
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
       HELPERS
    ============================= */

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

    const createEvent = async (token) => {
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
                theme: "Tech"
            });

        return res.body.event;
    };

    const getUserId = async (email) => {
        const user = await User.findOne({
            where: { email }
        });

        return user.id;
    };

    const joinEvent = async (eventId, token) => {
        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set("Authorization", `Bearer ${token}`);
    };

    const updateMemberRole = async (eventId, userId, token, newRole) => {
        await request(app)
            .put(`/api/events/${eventId}/members/${userId}/role`)
            .set("Authorization", `Bearer ${token}`)
            .send({ newRole });
    };

    /* =============================
       ORGANIZER PERMISSIONS
    ============================= */

    it("should allow organizer to remove a participant", async () => {
        const organizer = await registerUser(
            "Organizer",
            `org${Date.now()}@test.com`
        );

        const participantEmail = `participant${Date.now()}@test.com`;

        const participant = await registerUser(
            "Participant",
            participantEmail
        );

        const participantId = await getUserId(participantEmail);

        const event = await createEvent(organizer.token);

        await joinEvent(event.id, participant.token);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantId}`)
            .set("Authorization", `Bearer ${organizer.token}`);

        expect(res.statusCode).toBe(200);
    });

    it("should reject organizer removing themselves", async () => {
        const organizerEmail = `org${Date.now()}@test.com`;

        const organizer = await registerUser(
            "Organizer",
            organizerEmail
        );

        const organizerId = await getUserId(organizerEmail);

        const event = await createEvent(organizer.token);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${organizerId}`)
            .set("Authorization", `Bearer ${organizer.token}`);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       CO-ORGANIZER PERMISSIONS
    ============================= */

    it("should allow co_organizer to remove a participant", async () => {
        const organizer = await registerUser(
            "Organizer",
            `org${Date.now()}@test.com`
        );

        const coOrganizerEmail = `co${Date.now()}@test.com`;
        const participantEmail = `participant${Date.now()}@test.com`;

        const coOrganizer = await registerUser(
            "Co Organizer",
            coOrganizerEmail
        );

        const participant = await registerUser(
            "Participant",
            participantEmail
        );

        const coOrganizerId = await getUserId(coOrganizerEmail);
        const participantId = await getUserId(participantEmail);

        const event = await createEvent(organizer.token);

        await joinEvent(event.id, coOrganizer.token);
        await joinEvent(event.id, participant.token);

        await updateMemberRole(
            event.id,
            coOrganizerId,
            organizer.token,
            "co_organizer"
        );

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantId}`)
            .set("Authorization", `Bearer ${coOrganizer.token}`);

        expect(res.statusCode).toBe(200);
    });

    it("should reject removing another co_organizer", async () => {
        const organizer = await registerUser(
            "Organizer",
            `org${Date.now()}@test.com`
        );

        const coOneEmail = `co1${Date.now()}@test.com`;
        const coTwoEmail = `co2${Date.now()}@test.com`;

        const coOne = await registerUser(
            "Co Organizer One",
            coOneEmail
        );

        const coTwo = await registerUser(
            "Co Organizer Two",
            coTwoEmail
        );

        const coOneId = await getUserId(coOneEmail);
        const coTwoId = await getUserId(coTwoEmail);

        const event = await createEvent(organizer.token);

        await joinEvent(event.id, coOne.token);
        await joinEvent(event.id, coTwo.token);

        await updateMemberRole(
            event.id,
            coOneId,
            organizer.token,
            "co_organizer"
        );

        await updateMemberRole(
            event.id,
            coTwoId,
            organizer.token,
            "co_organizer"
        );

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${coTwoId}`)
            .set("Authorization", `Bearer ${coOne.token}`);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       PARTICIPANT RESTRICTIONS
    ============================= */

    it("should reject member removal by participant", async () => {
        const organizer = await registerUser(
            "Organizer",
            `org${Date.now()}@test.com`
        );

        const participantOneEmail = `p1${Date.now()}@test.com`;
        const participantTwoEmail = `p2${Date.now()}@test.com`;

        const participantOne = await registerUser(
            "Participant One",
            participantOneEmail
        );

        const participantTwo = await registerUser(
            "Participant Two",
            participantTwoEmail
        );

        const participantTwoId = await getUserId(participantTwoEmail);

        const event = await createEvent(organizer.token);

        await joinEvent(event.id, participantOne.token);
        await joinEvent(event.id, participantTwo.token);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantTwoId}`)
            .set("Authorization", `Bearer ${participantOne.token}`);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION
    ============================= */

    it("should reject member removal with non-integer eventId", async () => {
        const organizer = await registerUser(
            "Organizer",
            `removeinvalideventid${Date.now()}@test.com`
        );

        const res = await request(app)
            .delete("/api/events/abc/members/1")
            .set("Authorization", `Bearer ${organizer.token}`);

        expect(res.statusCode).toBe(400);
    });

    it("should reject member removal with non-integer userId", async () => {
        const organizer = await registerUser(
            "Organizer",
            `removeinvaliduserid${Date.now()}@test.com`
        );

        const event = await createEvent(organizer.token);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/abc`)
            .set("Authorization", `Bearer ${organizer.token}`);

        expect(res.statusCode).toBe(400);
    });
});
