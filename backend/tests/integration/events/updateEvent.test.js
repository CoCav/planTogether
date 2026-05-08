/* ================================================
   EVENTS INTEGRATION - UPDATE EVENT TESTS

   Tests:
   - organizer event update
   - co-organizer event update
   - event update with image upload
   - authentication protection
   - participant update rejection
   - nonexistent event handling
   - past event update rejection
   - invalid event ID validation
   - invalid payload validation
   - invalid image type rejection
   - oversized image rejection

   Ensures:
   - organizers and co-organizers can update events
   - participants cannot update events
   - validators and authorization protect event updates
   - uploaded event images are updated correctly
================================================ */

const request = require("supertest");
const app = require("../../../src/app");

const fs = require("fs");
const path = require("path");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEvent } = require("../../helpers/api/eventHelper");
const { joinEvent, updateMemberRole } = require("../../helpers/api/eventMembershipHelper");
const { getUserIdByEmail } = require("../../helpers/api/userHelper");

describe("Update Event API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       EVENT UPDATE SUCCESS
    ============================= */

    it("should allow organizer to update event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .send({
                title: "Updated Event Title"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.event.title).toBe("Updated Event Title");
    });

    it("should allow co-organizer to update event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `mainorganizer${Date.now()}@test.com`
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `coorganizer${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, coOrganizerAuth.headers);

        const coOrganizerId = await getUserIdByEmail(coOrganizerAuth.email);

        await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, "co_organizer");

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(coOrganizerAuth.headers)
            .send({
                title: "Co Organizer Updated Event"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.event.title).toBe("Co Organizer Updated Event");
    });

    it("should update event image", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Image Organizer",
            email: `imageorganizer${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .field("title", "Updated Image Event")
            .attach("image", Buffer.from("fake image"), {
                filename: "updated.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.event.image).toMatch(/^\/uploads\/events\/event-/);
    });

    it("should delete old image when replacing event image", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Cleanup Organizer",
            email: `cleanup${Date.now()}@test.com`
        });

        // Create event with initial image
        const createRes = await request(app)
            .post("/api/events")
            .set(organizerAuth.headers)
            .field("title", "Cleanup Event")
            .field("description", "Image cleanup test")
            .field("type", "Meetup")
            .field("theme", "Technology")
            .field("mode", "in_person")
            .field("location", "Montreal")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", Buffer.from("old image"), {
                filename: "old.png",
                contentType: "image/png"
            });

        const event = createRes.body.event;

        const oldImagePath = path.join(__dirname, "../../../", event.image);

        expect(fs.existsSync(oldImagePath)).toBe(true);

        // Replace image
        const updateRes = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .field("title", "Cleanup Event Updated")
            .attach("image", Buffer.from("new image"), {
                filename: "new.png",
                contentType: "image/png"
            });

        expect(updateRes.statusCode).toBe(200);

        // Old image should be deleted
        expect(fs.existsSync(oldImagePath)).toBe(false);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject update without token", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `unauth${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .send({
                title: "Unauthorized Update"
            });

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should reject update by participant", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `authorganizer${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(participantAuth.headers)
            .send({
                title: "Participant Update"
            });

        expect(res.statusCode).toBe(403);
    });

    it("should reject updating past event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Past Organizer",
            email: `pastorganizer${Date.now()}@test.com`
        });

        const eventRes = await createEvent(
            organizerAuth.headers,
            {
                title: "Past Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        );

        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .send({
                title: "Updated Past Event"
            });

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Validator Organizer",
            email: `validator${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/events/abc")
            .set(organizerAuth.headers)
            .send({
                title: "Invalid Event ID"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid payload", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Payload Organizer",
            email: `payload${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .send({
                mode: "physical"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid image type", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Invalid Image Organizer",
            email: `invalidimage${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .field("title", "Invalid Image Update")
            .attach("image", Buffer.from("fake pdf"), {
                filename: "document.pdf",
                contentType: "application/pdf"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject oversized image upload", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Oversized Organizer",
            email: `oversized${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const oversizedBuffer = Buffer.alloc(4 * 1024 * 1024);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .field("title", "Oversized Image Update")
            .attach("image", oversizedBuffer, {
                filename: "huge.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should reject update for nonexistent event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `missing${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/events/999999")
            .set(organizerAuth.headers)
            .send({
                title: "Missing Event"
            });

        expect(res.statusCode).toBe(403);
    });
});
