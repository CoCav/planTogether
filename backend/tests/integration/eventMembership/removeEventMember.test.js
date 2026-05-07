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

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");
const { getUserIdByEmail } = require("../../helpers/userHelper");
const { joinEvent, updateMemberRole } = require("../../helpers/eventMembershipHelper");

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
       ORGANIZER PERMISSIONS
    ============================= */

    it("should allow organizer to remove a participant", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantAuthID = await getUserIdByEmail(participantAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantAuthID}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(200);
    });

    it("should reject organizer removing themselves", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const organizerID = await getUserIdByEmail(organizerAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${organizerID}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       CO-ORGANIZER PERMISSIONS
    ============================= */

    it("should allow co_organizer to remove a participant", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `co${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const coOrganizerID = await getUserIdByEmail(coOrganizerAuth.email);
        const participantID = await getUserIdByEmail(participantAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, coOrganizerAuth.headers);
        await joinEvent(event.id, participantAuth.headers);

        await updateMemberRole(
            event.id,
            coOrganizerID,
            organizerAuth.headers,
            "co_organizer"
        );

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantID}`)
            .set(coOrganizerAuth.headers);

        expect(res.statusCode).toBe(200);
    });

    it("should reject removing another co_organizer", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `org${Date.now()}@test.com`
        });

        const coOneAuth = await registerAndGetToken({
            name: "Co Organizer One",
            email: `co1${Date.now()}@test.com`
        });

        const coTwoAuth = await registerAndGetToken({
            name: "Co Organizer Two",
            email: `co2${Date.now()}@test.com`
        });

        const coOneID = await getUserIdByEmail(coOneAuth.email);
        const coTwoID = await getUserIdByEmail(coTwoAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, coOneAuth.headers);
        await joinEvent(event.id, coTwoAuth.headers);

        await updateMemberRole(
            event.id,
            coOneID,
            organizerAuth.headers,
            "co_organizer"
        );

        await updateMemberRole(
            event.id,
            coTwoID,
            organizerAuth.headers,
            "co_organizer"
        );

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${coTwoID}`)
            .set(coOneAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       PARTICIPANT RESTRICTIONS
    ============================= */

    it("should reject member removal by participant", async () => {
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

        const participantOneID = await getUserIdByEmail(participantOneAuth.email);
        const participantTwoID = await getUserIdByEmail(participantTwoAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, participantOneAuth.headers);
        await joinEvent(event.id, participantTwoAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantTwoID}`)
            .set(participantOneAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION
    ============================= */

    it("should reject member removal with non-integer eventId", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `removeinvalideventid${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/abc/members/1")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should reject member removal with non-integer userId", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `removeinvaliduserid${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/abc`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(400);
    });
});
