/* ================================================
   EVENTS INTEGRATION - UPDATE EVENT TESTS

   Tests:
   - organizer event update
   - co-organizer event update
   - event update with image upload
   - event image removal
   - image cleanup after replacement
   - event geolocation update
   - online event geolocation cleanup
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
   - in-person event updates persist resolved coordinates
   - online event updates clear geolocation data
   - validators and authorization protect event updates
   - uploaded event images are preserved, replaced or removed correctly
   - shared event role constants are used for valid role scenarios
================================================ */

const request = require("supertest");
const app = require("../../../src/app");

const fs = require("fs");
const path = require("path");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");
const { EVENT_MODES } = require("../../../src/constants/eventModes");

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const {
    joinEventAsAuthenticatedUser,
    updateEventMemberRole
} = require("../../helpers/http/eventMembershipTestHelper");
const { findUserIdByEmail } = require("../../helpers/http/userTestHelper");

describe("Update Event API", () => {

    beforeAll(async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue([
                {
                    lat: "45.5031824",
                    lon: "-73.5698065",
                    display_name: "Montréal, Québec, Canada",
                    address: {
                        road: "Rue Sainte-Catherine O",
                        house_number: "1500",
                        city: "Montréal",
                        state: "Québec",
                        postcode: "H3G 1S8",
                        country: "Canada"
                    }
                }
            ])
        });

        await initializeTestDatabase();
    });

    afterEach(async () => {
        await resetTestDatabase();
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await closeTestDatabase();
        delete global.fetch;
    });

    /* =============================
       EVENT UPDATE SUCCESS
    ============================= */

    it("should allow organizer to update event", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .send({
                title: "Updated Event Title"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event updated successfully");

        expect(res.body.event.title).toBe("Updated Event Title");
    });

    it("should allow co-organizer to update event", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Organizer",
                email: `mainorganizer${Date.now()}@test.com`
            }
        });

        const coOrganizerAuth = await registerAndAuthenticateUser({
            name: "Co Organizer",
            email: `coorganizer${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

        const coOrganizerId = await findUserIdByEmail(coOrganizerAuth.email);

        await updateEventMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(coOrganizerAuth.headers)
            .send({
                title: "Co Organizer Updated Event"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event updated successfully");

        expect(res.body.event.title).toBe("Co Organizer Updated Event");
    });

    it("should update event geolocation data", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .send({
                location: "Quebec City"
            });

        expect(res.statusCode).toBe(200);

        expect(global.fetch).toHaveBeenCalledTimes(1);

        expect(res.body.event).toMatchObject({
            location: "Quebec City",

            locationLabel: "Montréal, Québec, Canada",

            streetAddress: "1500 Rue Sainte-Catherine O",
            city: "Montréal",
            region: "Québec",
            postalCode: "H3G 1S8",
            country: "Canada",

            latitude: 45.5031824,
            longitude: -73.5698065
        });
    });

    it("should clear geolocation data when updating event to online", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .send({
                mode: EVENT_MODES.ONLINE
            });

        expect(res.statusCode).toBe(200);

        expect(global.fetch).not.toHaveBeenCalled();

        expect(res.body.event.location).toBeNull();
        expect(res.body.event.locationLabel).toBeNull();

        expect(res.body.event.streetAddress).toBeNull();
        expect(res.body.event.city).toBeNull();
        expect(res.body.event.region).toBeNull();
        expect(res.body.event.postalCode).toBeNull();
        expect(res.body.event.country).toBeNull();

        expect(res.body.event.latitude).toBeNull();
        expect(res.body.event.longitude).toBeNull();
    });

    it("should update event image", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Image Organizer",
                email: `imageorganizer${Date.now()}@test.com`
            }
        });

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .field("title", "Updated Image Event")
            .attach("image", Buffer.from("fake image"), {
                filename: "updated.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event updated successfully");

        expect(res.body.event.image).toMatch(/^\/uploads\/events\/event-/);
    });

    it("should delete old image when replacing event image", async () => {
        const { organizerAuth } = await createOrganizerAndEvent({
            organizer: {
                name: "Cleanup Organizer",
                email: `cleanup${Date.now()}@test.com`
            }
        });

        // Create event with initial image
        const createRes = await request(app)
            .post("/api/events")
            .set(organizerAuth.headers)
            .field("title", "Cleanup Event")
            .field("description", "Image cleanup test")
            .field("type", "Meetup")
            .field("theme", "Technology")
            .field("mode", EVENT_MODES.IN_PERSON)
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
        expect(updateRes.body).toHaveProperty("message", "Event updated successfully");

        // Old image should be deleted
        expect(fs.existsSync(oldImagePath)).toBe(false);
    });

    it("should remove event image and fallback to default image", async () => {
        const { organizerAuth } = await createOrganizerAndEvent({
            organizer: {
                name: "Remove Image Organizer",
                email: `removeimage${Date.now()}@test.com`
            }
        });

        // Create event with image
        const createRes = await request(app)
            .post("/api/events")
            .set(organizerAuth.headers)
            .field("title", "Remove Image Event")
            .field("description", "Image removal test")
            .field("type", "Meetup")
            .field("theme", "Technology")
            .field("mode", EVENT_MODES.IN_PERSON)
            .field("location", "Montreal")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", Buffer.from("event image"), {
                filename: "event.png",
                contentType: "image/png"
            });

        const event = createRes.body.event;

        const oldImagePath = path.join(__dirname, "../../../", event.image);

        expect(fs.existsSync(oldImagePath)).toBe(true);

        // Remove image
        const updateRes = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .field("image", "");

        expect(updateRes.statusCode).toBe(200);

        expect(updateRes.body.event.image).toBeNull();

        // Old image should be deleted
        expect(fs.existsSync(oldImagePath)).toBe(false);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject update without token", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Organizer",
                email: `unauth${Date.now()}@test.com`
            }
        });

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
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Organizer",
                email: `authorganizer${Date.now()}@test.com`
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(participantAuth.headers)
            .send({
                title: "Participant Update"
            });

        expect(res.statusCode).toBe(403);
    });

    it("should reject updating past event", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Past Organizer",
                email: `pastorganizer${Date.now()}@test.com`
            },
            event: {
                title: "Past Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

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
        const { organizerAuth } = await createOrganizerAndEvent({
            organizer: {
                name: "Validator Organizer",
                email: `validator${Date.now()}@test.com`
            }
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
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Payload Organizer",
                email: `payload${Date.now()}@test.com`
            }
        });

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set(organizerAuth.headers)
            .send({
                mode: "physical"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid image type", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Invalid Image Organizer",
                email: `invalidimage${Date.now()}@test.com`
            }
        });

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
        const { organizerAuth, event } = await createOrganizerAndEvent({
            organizer: {
                name: "Oversized Organizer",
                email: `oversized${Date.now()}@test.com`
            }
        });

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

    it("should reject updating inaccessible event", async () => {
        const { organizerAuth } = await createOrganizerAndEvent({
            organizer: {
                name: "Organizer",
                email: `missing${Date.now()}@test.com`
            }
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
