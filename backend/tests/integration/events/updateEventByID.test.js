/* ==================================================
   EVENTS INTEGRATION - UPDATE EVENT BY ID

   Tests:
   - organizer event update
   - image replacement
   - authentication requirement
   - authorization rules
   - nonexistent event update rejection
   - past event update rejection
   - participant limit and registration deadline updates
   - validation errors

   Ensures:
   - only authorized users can update events
   - old uploaded images are deleted correctly
   - business rules prevent invalid updates
   - event update flow works end-to-end
================================================== */

const fs = require("fs");
const path = require("path");
const request = require("supertest");

const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { getValidEventPayload, createEvent } = require("../../helpers/eventHelper");
const { getUserIdByEmail } = require('../../helpers/userHelper');

describe("Update Event by ID API", () => {
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
       EVENT UPDATE
    ============================= */

    it("should allow organizer to update an event", async () => {
        const auth = await registerAndGetToken({
            name: "Event Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(auth.headers)
            .send({
                title: "Updated Event",
                description: "Updated description",
                type: "Conference",
                theme: "Business",
                mode: "online",
                startDateTime: "2026-12-31T14:00:00.000Z",
                endDateTime: "2026-12-31T16:00:00.000Z"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.event).toMatchObject({
            title: "Updated Event",
            description: "Updated description",
            type: "Conference",
            theme: "Business",
            mode: "online"
        });
    });

    it("should update participant limit and registration deadline", async () => {
        const auth = await registerAndGetToken({
            name: "Advanced Update User",
            email: `advanced${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(auth.headers)
            .send({
                title: "Updated Event",
                description: "Updated",
                type: "Meetup",
                theme: "Technology",
                mode: "online",
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z",
                maxParticipants: 50,
                registrationDeadline: "2026-12-30T10:00:00.000Z"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.event.maxParticipants).toBe(50);

        expect(new Date(res.body.event.registrationDeadline).toISOString())
            .toBe("2026-12-30T10:00:00.000Z");
    });

    /* =============================
       IMAGE UPDATE
    ============================= */

    it("should update event image and delete old image", async () => {
        const auth = await registerAndGetToken({
            name: "Image Organizer",
            email: `image${Date.now()}@test.com`
        });

        const createRes = await request(app)
            .post("/api/events")
            .set(auth.headers)
            .field("title", "Image Event")
            .field("description", "Image description")
            .field("type", "Meetup")
            .field("theme", "Technology")
            .field("mode", "online")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", Buffer.from("old image"), {
                filename: "old.png",
                contentType: "image/png"
            });

        const event = createRes.body.event;
        const oldImagePath = path.join(__dirname, "../../../", event.image);

        expect(fs.existsSync(oldImagePath)).toBe(true);

        const updateRes = await request(app)
            .put(`/api/events/${event.id}`)
            .set(auth.headers)
            .field("title", "Updated Image Event")
            .field("description", "Updated")
            .field("type", "Meetup")
            .field("theme", "Technology")
            .field("mode", "online")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", Buffer.from("new image"), {
                filename: "new.png",
                contentType: "image/png"
            });

        expect(updateRes.statusCode).toBe(200);
        expect(fs.existsSync(oldImagePath)).toBe(false);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject update without token", async () => {
        const auth = await registerAndGetToken({
            name: "Unauthorized User",
            email: `unauthorized${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .send({
                title: "Unauthorized Update"
            });

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       AUTHORIZATION
    ============================= */

    it("should allow co_organizer to update an event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Org",
            email: `orgu${Date.now()}@test.com`
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co",
            email: `cou${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(coOrganizerAuth.headers);

        const coId = await getUserIdByEmail(coOrganizerAuth.email);

        await request(app)
            .put(`/api/events/${event.id}/members/${coId}/role`)
            .set(organizerAuth.headers)
            .send({
                newRole: "co_organizer"
            });

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(coOrganizerAuth.headers)
            .send({
                title: "Updated by Co",
                description: "Updated by Co",
                type: "Meetup",
                theme: "Tech",
                mode: "in_person",
                location: "Montreal",
                startDateTime: "2026-12-31T14:00:00.000Z",
                endDateTime: "2026-12-31T16:00:00.000Z"
            });

        expect(res.statusCode).toBe(200);
    });

    it("should prevent participant from updating an event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Org",
            email: `org${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Part",
            email: `part${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(participantAuth.headers);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(participantAuth.headers)
            .send({
                title: "Hacked",
                description: "Hacked",
                type: "Meetup",
                theme: "Tech",
                mode: "in_person",
                location: "Montreal",
                startDateTime: "2026-12-31T14:00:00.000Z",
                endDateTime: "2026-12-31T16:00:00.000Z"
            });

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject update for nonexistent event", async () => {
        const auth = await registerAndGetToken({
            name: "Missing Event User",
            email: `missing${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/events/999999")
            .set(auth.headers)
            .send({
                title: "Missing Event",
                description: "Missing description",
                type: "Meetup",
                theme: "Technology",
                mode: "online",
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z"
            });

        expect(res.statusCode).toBe(403);
    });

    it("should reject update for past event", async () => {
        const auth = await registerAndGetToken({
            name: "Past Event User",
            email: `pastupdate${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers, {
            title: "Past Event",
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(auth.headers)
            .send({
                title: "Updated Past Event",
                description: "Updated past description",
                type: "Meetup",
                theme: "Technology",
                mode: "online",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            });

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid registration deadline update", async () => {
        const auth = await registerAndGetToken({
            name: "Deadline User",
            email: `deadline${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(auth.headers)
            .send({
                title: "Invalid Deadline Event",
                description: "Invalid",
                type: "Meetup",
                theme: "Technology",
                mode: "online",
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z",
                registrationDeadline: "2027-01-01T10:00:00.000Z"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject non-integer eventId", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `id${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/events/abc")
            .set(auth.headers)
            .send({
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z",
                mode: "online"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid startDateTime", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `start${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(auth.headers)
            .send({
                startDateTime: "invalid",
                endDateTime: "2026-12-31T12:00:00.000Z",
                mode: "online"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid endDateTime", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `end${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(auth.headers)
            .send({
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "invalid",
                mode: "online"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid date order", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `order${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(auth.headers)
            .send({
                startDateTime: "2026-12-31T12:00:00.000Z",
                endDateTime: "2026-12-31T10:00:00.000Z",
                mode: "online"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid mode", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `mode2${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(auth.headers)
            .send({
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z",
                mode: "hybrid"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject in-person event without location", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `loc2${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(auth.headers)
            .send({
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z",
                mode: "in_person",
                location: ""
            });

        expect(res.statusCode).toBe(400);
    });
});
