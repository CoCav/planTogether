/* ==========================================================
   EVENT MEMBERSHIP INTEGRATION - UPDATE EVENT MEMBER ROLE

   Tests:
   - organizer role update permissions
   - co-organizer restrictions
   - participant restrictions
   - role update validation
   - protected organizer rules

   Ensures:
   - event role hierarchy is enforced correctly
   - invalid role updates are rejected
   - validators run before service logic
========================================================== */

const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

describe("Update Event Member Role API", () => {

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

    /* =============================
       ORGANIZER PERMISSIONS
    ============================= */

    it("should allow organizer to promote participant to co_organizer", async () => {
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

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${participant.token}`);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantId}/role`)
            .set("Authorization", `Bearer ${organizer.token}`)
            .send({
                newRole: "co_organizer"
            });

        expect(res.statusCode).toBe(200);
    });

    it("should allow organizer to demote co_organizer to participant", async () => {
        const organizer = await registerUser(
            "Organizer",
            `org${Date.now()}@test.com`
        );

        const coOrganizerEmail = `co${Date.now()}@test.com`;

        const coOrganizer = await registerUser(
            "Co Organizer",
            coOrganizerEmail
        );

        const coOrganizerId = await getUserId(coOrganizerEmail);

        const event = await createEvent(organizer.token);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${coOrganizer.token}`);

        await request(app)
            .put(`/api/events/${event.id}/members/${coOrganizerId}/role`)
            .set("Authorization", `Bearer ${organizer.token}`)
            .send({
                newRole: "co_organizer"
            });

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${coOrganizerId}/role`)
            .set("Authorization", `Bearer ${organizer.token}`)
            .send({
                newRole: "participant"
            });

        expect(res.statusCode).toBe(200);
    });

    it("should reject promoting to organizer role", async () => {
        const organizer = await registerUser(
            "Organizer",
            `org${Date.now()}@test.com`
        );

        const userEmail = `user${Date.now()}@test.com`;

        const user = await registerUser(
            "User",
            userEmail
        );

        const userId = await getUserId(userEmail);

        const event = await createEvent(organizer.token);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${user.token}`);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${userId}/role`)
            .set("Authorization", `Bearer ${organizer.token}`)
            .send({
                newRole: "organizer"
            });

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       CO-ORGANIZER RESTRICTIONS
    ============================= */

    it("should reject role update by co_organizer", async () => {
        const organizer = await registerUser(
            "Organizer",
            `org${Date.now()}@test.com`
        );

        const coEmail = `co${Date.now()}@test.com`;
        const targetEmail = `target${Date.now()}@test.com`;

        const coOrganizer = await registerUser(
            "Co Organizer",
            coEmail
        );

        const target = await registerUser(
            "Target",
            targetEmail
        );

        const coOrganizerId = await getUserId(coEmail);
        const targetId = await getUserId(targetEmail);

        const event = await createEvent(organizer.token);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${coOrganizer.token}`);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${target.token}`);

        await request(app)
            .put(`/api/events/${event.id}/members/${coOrganizerId}/role`)
            .set("Authorization", `Bearer ${organizer.token}`)
            .send({
                newRole: "co_organizer"
            });

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${targetId}/role`)
            .set("Authorization", `Bearer ${coOrganizer.token}`)
            .send({
                newRole: "co_organizer"
            });

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       PARTICIPANT RESTRICTIONS
    ============================= */

    it("should reject role update by participant", async () => {
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

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${participantOne.token}`);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${participantTwo.token}`);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantTwoId}/role`)
            .set("Authorization", `Bearer ${participantOne.token}`)
            .send({
                newRole: "co_organizer"
            });

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION
    ============================= */

    it("should reject role update without newRole", async () => {
        const organizerEmail = `validatororg${Date.now()}@test.com`;
        const participantEmail = `validatorparticipant${Date.now()}@test.com`;

        const organizer = await registerUser(
            "Validator Organizer",
            organizerEmail
        );

        const participant = await registerUser(
            "Validator Participant",
            participantEmail
        );

        const participantId = await getUserId(participantEmail);

        const event = await createEvent(organizer.token);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${participant.token}`);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantId}/role`)
            .set("Authorization", `Bearer ${organizer.token}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    it("should reject role update with invalid newRole", async () => {
        const organizerEmail = `invalidroleorg${Date.now()}@test.com`;
        const participantEmail = `invalidroleparticipant${Date.now()}@test.com`;

        const organizer = await registerUser(
            "Invalid Role Organizer",
            organizerEmail
        );

        const participant = await registerUser(
            "Invalid Role Participant",
            participantEmail
        );

        const participantId = await getUserId(participantEmail);

        const event = await createEvent(organizer.token);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set("Authorization", `Bearer ${participant.token}`);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantId}/role`)
            .set("Authorization", `Bearer ${organizer.token}`)
            .send({
                newRole: "admin"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject role update with non-integer eventId", async () => {
        const organizer = await registerUser(
            "Organizer",
            `organizer${Date.now()}@test.com`
        );

        const res = await request(app)
            .put("/api/events/abc/members/1/role")
            .set("Authorization", `Bearer ${organizer.token}`)
            .send({
                newRole: "participant"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject role update with non-integer userId", async () => {
        const organizer = await registerUser(
            "Organizer",
            `organizer${Date.now()}@test.com`
        );

        const event = await createEvent(organizer.token);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/abc/role`)
            .set("Authorization", `Bearer ${organizer.token}`)
            .send({
                newRole: "participant"
            });

        expect(res.statusCode).toBe(400);
    });
});
