const request = require("supertest");

const app = require("../../../src/app");

const fs = require("fs");
const path = require("path");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");
const { EVENT_MODES } = require("../../../src/constants/eventModes");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");

const {
    createOrganizer,
    createOrganizerAndEvent,
    createPastOrganizerAndEvent,
    createEventWithImage,
    updateEvent,
    updateMultipartEventRequest,
    updateEventWithImage
} = require("../../helpers/http/eventTestHelper");

const {
    joinEventAsAuthenticatedUser,
    updateEventMemberRole
} = require("../../helpers/http/eventMembershipTestHelper");

const { findCoOrganizerId } = require("../../helpers/http/userTestHelper");

/* ==========================================================================
   Events Integration Tests - Update Event

   Tests event update behavior.

   Responsibilities
   - Test successful event updates
   - Test geolocation updates
   - Test image updates
   - Test authentication errors
   - Test authorization errors
   - Test update business rules
   - Test validation errors
   - Test file upload errors

   Notes
   - Organizers and co-organizers can update events.
   - Participants cannot update events.
   - JSON updates use updateEvent().
   - Multipart updates use multipart event helpers.
=========================================================================== */

describe("Update Event API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       EVENT UPDATE SUCCESS
    ============================= */

    describe("Event update success", () => {
        it("allows organizer to update event", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent();

            const response = await updateEvent(
                event.id,
                organizerAuth.headers,
                { title: "Updated Event Title" }
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event updated successfully");
            expect(response.body.event.title).toBe("Updated Event Title");
        });

        it("allows co-organizer to update event", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent();

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "Event Update Co Organizer",
                email: `eventupdatecoorganizer${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

            const coOrganizerId = await findCoOrganizerId(coOrganizerAuth);

            await updateEventMemberRole(
                event.id,
                coOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            const response = await updateEvent(
                event.id,
                coOrganizerAuth.headers,
                { title: "Co Organizer Updated Event" }
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event updated successfully");
            expect(response.body.event.title).toBe("Co Organizer Updated Event");
        });

        it("updates event geolocation data", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Geolocation Update Event"
                }
            });

            jest.clearAllMocks();

            const response = await updateEvent(
                event.id,
                organizerAuth.headers,
                {
                    location: "Quebec City"
                }
            );

            expect(response.statusCode).toBe(200);
            expect(global.fetch).toHaveBeenCalledTimes(1);

            expect(response.body.event).toMatchObject({
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

        it("clears geolocation data when updating event to online", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Online Update Event"
                }
            });

            jest.clearAllMocks();

            const response = await updateEvent(
                event.id,
                organizerAuth.headers,
                {
                    mode: EVENT_MODES.ONLINE
                }
            );

            expect(response.statusCode).toBe(200);
            expect(global.fetch).not.toHaveBeenCalled();

            expect(response.body.event.location).toBeNull();
            expect(response.body.event.locationLabel).toBeNull();
            expect(response.body.event.streetAddress).toBeNull();
            expect(response.body.event.city).toBeNull();
            expect(response.body.event.region).toBeNull();
            expect(response.body.event.postalCode).toBeNull();
            expect(response.body.event.country).toBeNull();
            expect(response.body.event.latitude).toBeNull();
            expect(response.body.event.longitude).toBeNull();
        });
    });

    /* =============================
       IMAGE UPDATES
    ============================= */

    describe("Image updates", () => {
        it("updates event image", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent();

            const response = await updateEventWithImage(
                event.id,
                organizerAuth.headers,
                { title: "Updated Image Event" },
                {
                    buffer: Buffer.from("fake image"),
                    filename: "updated.png",
                    contentType: "image/png"
                }
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event updated successfully");
            expect(response.body.event.image).toMatch(/^\/uploads\/events\/event-/);
        });

        it("deletes old image when replacing event image", async () => {
            const organizerAuth = await createOrganizer({
                name: "Cleanup Organizer",
                email: `cleanuporganizer${Date.now()}@test.com`
            });

            const createResponse = await createEventWithImage(
                organizerAuth.headers,
                {
                    title: "Cleanup Event",
                    description: "Image cleanup test"
                },
                {
                    buffer: Buffer.from("old image"),
                    filename: "old.png",
                    contentType: "image/png"
                }
            );

            expect(createResponse.statusCode).toBe(201);
            expect(createResponse.body.event.image).toMatch(
                /^\/uploads\/events\/event-/
            );

            const event = createResponse.body.event;

            const oldImagePath = path.resolve(
                __dirname,
                "../../../uploads/events",
                path.basename(event.image)
            );

            expect(fs.existsSync(oldImagePath)).toBe(true);

            const updateResponse = await updateEventWithImage(
                event.id,
                organizerAuth.headers,
                { title: "Cleanup Event Updated" },
                {
                    buffer: Buffer.from("new image"),
                    filename: "new.png",
                    contentType: "image/png"
                }
            );

            expect(updateResponse.statusCode).toBe(200);
            expect(updateResponse.body).toHaveProperty("message", "Event updated successfully");

            expect(fs.existsSync(oldImagePath)).toBe(false);
        });

        it("removes event image and falls back to default image", async () => {
            const organizerAuth = await createOrganizer({
                name: "Remove Image Organizer",
                email: `removeimageorganizer${Date.now()}@test.com`
            });

            const createResponse = await createEventWithImage(
                organizerAuth.headers,
                {
                    title: "Remove Image Event",
                    description: "Image removal test"
                },
                {
                    buffer: Buffer.from("event image"),
                    filename: "event.png",
                    contentType: "image/png"
                }
            );

            expect(createResponse.statusCode).toBe(201);
            expect(createResponse.body.event.image).toMatch(
                /^\/uploads\/events\/event-/
            );

            const event = createResponse.body.event;

            const oldImagePath = path.resolve(
                __dirname,
                "../../../uploads/events",
                path.basename(event.image)
            );

            expect(fs.existsSync(oldImagePath)).toBe(true);

            const updateResponse = await updateMultipartEventRequest(
                event.id,
                organizerAuth.headers,
                { image: "" }
            );

            expect(updateResponse.statusCode).toBe(200);
            expect(updateResponse.body.event.image).toBeNull();

            expect(fs.existsSync(oldImagePath)).toBe(false);
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects update without token", async () => {
            const { event } = await createOrganizerAndEvent();

            const response = await updateEvent(
                event.id,
                undefined,
                { title: "Unauthorized Update" }
            );

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    describe("Authorization errors", () => {
        it("rejects update by participant", async () => {
            const { event } = await createOrganizerAndEvent();

            const participantAuth = await registerAndAuthenticateUser({
                name: "Unauthorized Event Participant",
                email: `unauthorizedeventparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await updateEvent(
                event.id,
                participantAuth.headers,
                { title: "Participant Update" }
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects updating inaccessible event", async () => {
            const organizerAuth = await createOrganizer({
                name: "Missing Event Organizer",
                email: `missingeventorganizer${Date.now()}@test.com`
            });

            const response = await updateEvent(
                999999,
                organizerAuth.headers,
                { title: "Missing Event" }
            );

            expect(response.statusCode).toBe(403);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects updating past event", async () => {
            const { organizerAuth, event } = await createPastOrganizerAndEvent();

            const response = await updateEvent(
                event.id,
                organizerAuth.headers,
                { title: "Updated Past Event" }
            );

            expect(response.statusCode).toBe(403);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const organizerAuth = await createOrganizer();

            const response = await updateEvent(
                "abc",
                organizerAuth.headers,
                { title: "Invalid Event ID" }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid payload", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent();

            const response = await updateEvent(
                event.id,
                organizerAuth.headers,
                { mode: "physical" }
            );

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       FILE UPLOAD ERRORS
    ============================= */

    describe("File upload errors", () => {
        it("rejects invalid image type", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent();

            const response = await updateEventWithImage(
                event.id,
                organizerAuth.headers,
                { title: "Invalid Image Update" },
                {
                    buffer: Buffer.from("fake pdf"),
                    filename: "document.pdf",
                    contentType: "application/pdf"
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects oversized image upload", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent();

            const oversizedBuffer = Buffer.alloc(4 * 1024 * 1024);

            const response = await updateEventWithImage(
                event.id,
                organizerAuth.headers,
                { title: "Oversized Image Update" },
                {
                    buffer: oversizedBuffer,
                    filename: "huge.png",
                    contentType: "image/png"
                }
            );

            expect(response.statusCode).toBe(400);
        });
    });
});
