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

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");
const { joinEvent, updateMemberRole } = require("../../helpers/eventMembershipHelper");
const { getUserIdByEmail } = require("../../helpers/userHelper");

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
       ORGANIZER PERMISSIONS
    ============================= */

    it("should allow organizer to promote participant to co_organizer", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantID = await getUserIdByEmail(participantAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, participantAuth.headers);

        const res = await updateMemberRole(
            event.id,
            participantID,
            organizerAuth.headers,
            "co_organizer"
        );

        expect(res.statusCode).toBe(200);
    });

    it("should allow organizer to demote co_organizer to participant", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `co${Date.now()}@test.com`
        });

        const coOrganizerID = await getUserIdByEmail(coOrganizerAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, coOrganizerAuth.headers);

        await updateMemberRole(
            event.id,
            coOrganizerID,
            organizerAuth.headers,
            "co_organizer"
        );

        const res = await updateMemberRole(
            event.id,
            coOrganizerID,
            organizerAuth.headers,
            "participant"
        );

        expect(res.statusCode).toBe(200);
    });

    it("should reject promoting to organizer role", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const userAuth = await registerAndGetToken({
            name: "User",
            email: `user${Date.now()}@test.com`
        });

        const userID = await getUserIdByEmail(userAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, userAuth.headers);

        const res = await updateMemberRole(
            event.id,
            userID,
            organizerAuth.headers,
            "organizer"
        );

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       CO-ORGANIZER RESTRICTIONS
    ============================= */

    it("should reject role update by co_organizer", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `co${Date.now()}@test.com`
        });

        const targetUserAuth = await registerAndGetToken({
            name: "Target User",
            email: `target${Date.now()}@test.com`
        });

        const coOrganizerID = await getUserIdByEmail(coOrganizerAuth.email);
        const targetUserID = await getUserIdByEmail(targetUserAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(coOrganizerAuth.headers);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(targetUserAuth.headers);

        await request(app)
            .put(`/api/events/${event.id}/members/${coOrganizerID}/role`)
            .set(organizerAuth.headers)
            .send({
                newRole: "co_organizer"
            });

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${targetUserID}/role`)
            .set(coOrganizerAuth.headers)
            .send({
                newRole: "co_organizer"
            });

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       PARTICIPANT RESTRICTIONS
    ============================= */

    it("should reject role update by participant", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const participantOneAuth = await registerAndGetToken({
            name: "Participant One",
            email: `p1${Date.now()}@test.com`
        });

        const participantTwoAuth = await registerAndGetToken({
            name: "Participant Two",
            email: `p2${Date.now()}@test.com`
        });

        const participantTwoID = await getUserIdByEmail(participantTwoAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(participantOneAuth.headers);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(participantTwoAuth.headers);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantTwoID}/role`)
            .set(participantOneAuth.headers)
            .send({
                newRole: "co_organizer"
            });

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION
    ============================= */

    it("should reject role update without newRole", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Validator Organizer",
            email: `validatororg${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Validator Participant",
            email: `validatorparticipant${Date.now()}@test.com`
        });

        const participantID = await getUserIdByEmail(participantAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(participantAuth.headers);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantID}/role`)
            .set(organizerAuth.headers)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    it("should reject role update with invalid newRole", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Invalid Role Organizer",
            email: `invalidroleorg${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Invalid Role Participant",
            email: `invalidroleparticipant${Date.now()}@test.com`
        });

        const participantID = await getUserIdByEmail(participantAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(participantAuth.headers);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantID}/role`)
            .set(organizerAuth.headers)
            .send({
                newRole: "admin"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject role update with non-integer eventId", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/events/abc/members/1/role")
            .set(organizerAuth.headers)
            .send({
                newRole: "participant"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject role update with non-integer userId", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}/members/abc/role`)
            .set(organizerAuth.headers)
            .send({
                newRole: "participant"
            });

        expect(res.statusCode).toBe(400);
    });
});
