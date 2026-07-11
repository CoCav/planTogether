const { EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");
const { EVENT_MODES } = require("../../../src/constants/eventModes");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const {
    createOrganizer,
    createEventAsAuthenticatedUser,
    createEventWithImage,
    createMultipartEventRequest
} = require("../../helpers/http/eventTestHelper");

/* ==========================================================================
   Events Integration Tests - Create Event

   Tests event creation behavior.

   Responsibilities
   - Test successful event creation
   - Test geolocation handling
   - Test image uploads
   - Test organizer role assignment
   - Test authentication errors
   - Test validation errors
   - Test file upload errors

   Notes
   - Authenticated users can create events.
   - In-person events persist resolved geolocation data.
   - Online events skip geocoding and keep location data null.
=========================================================================== */

describe("Create Event API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       EVENT CREATION SUCCESS
    ============================= */

    describe("Event creation success", () => {
        it("creates an event when authenticated", async () => {
            const organizerAuth = await createOrganizer({
                name: "Event Creator",
                email: `eventcreator${Date.now()}@test.com`
            });

            const response = await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "Tech Meetup",
                    description: "A technology meetup"
                }
            );

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("message", "Event created successfully");
            expect(response.body).toHaveProperty("event");

            expect(response.body.event).toMatchObject({
                title: "Tech Meetup",
                mode: EVENT_MODES.IN_PERSON,
                location: "Montreal",

                locationLabel: "Montréal, Québec, Canada",
                streetAddress: "1500 Rue Sainte-Catherine O",
                city: "Montréal",
                region: "Québec",
                postalCode: "H3G 1S8",
                country: "Canada",

                latitude: 45.5031824,
                longitude: -73.5698065
            });

            expect(global.fetch.mock.calls[0][0]).toContain("q=Montreal");
        });

        it("creates an event with image upload", async () => {
            const organizerAuth = await createOrganizer({
                name: "Image Creator",
                email: `imagecreator${Date.now()}@test.com`
            });

            const response = await createEventWithImage(
                organizerAuth.headers,
                {
                    title: "Image Event",
                    description: "Event with image"
                },
                {
                    buffer: Buffer.from("fake image"),
                    filename: "event.png",
                    contentType: "image/png"
                }
            );

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("message", "Event created successfully");
            expect(response.body.event.image).toMatch(/^\/uploads\/events\/event-/);
        });

        it("calls location provider when creating an in-person event", async () => {
            const organizerAuth = await createOrganizer({
                name: "Geo Creator",
                email: `geocreator${Date.now()}@test.com`
            });

            const response = await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "Geo Event",
                    description: "Geocoded event",
                    location: "Sherbrooke"
                }
            );

            expect(response.statusCode).toBe(201);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch.mock.calls[0][0]).toContain("q=Sherbrooke");
        });

        it("creates an online event without geolocation data", async () => {
            const organizerAuth = await createOrganizer({
                name: "Online Creator",
                email: `onlinecreator${Date.now()}@test.com`
            });

            const response = await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "Online Event",
                    description: "Remote event",
                    type: "Workshop",
                    mode: EVENT_MODES.ONLINE,
                    location: undefined
                }
            );

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("message", "Event created successfully");

            expect(response.body.event.location).toBeNull();
            expect(response.body.event.locationLabel).toBeNull();

            expect(response.body.event.streetAddress).toBeNull();
            expect(response.body.event.city).toBeNull();
            expect(response.body.event.region).toBeNull();
            expect(response.body.event.postalCode).toBeNull();
            expect(response.body.event.country).toBeNull();

            expect(response.body.event.latitude).toBeNull();
            expect(response.body.event.longitude).toBeNull();

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it("assigns organizer role to event creator", async () => {
            const organizerAuth = await createOrganizer({
                name: "Organizer Creator",
                email: `organizercreator${Date.now()}@test.com`
            });

            const response = await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "Organizer Event",
                    description: "Organizer test"
                }
            );

            const membership = await EventUserRole.findOne({
                where: {
                    eventId: response.body.event.id,
                    userId: organizerAuth.user.userId
                }
            });

            expect(response.body).toHaveProperty("message", "Event created successfully");
            expect(membership).toBeDefined();
            expect(membership.role).toBe(EVENT_ROLES.ORGANIZER);
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects event creation without token", async () => {
            const response = await createEventAsAuthenticatedUser(
                undefined,
                {
                    title: "Unauthorized Event"
                }
            );

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects missing required fields", async () => {
            const organizerAuth = await createOrganizer({
                name: "Validation User",
                email: `validationeventuser${Date.now()}@test.com`
            });

            const response = await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "",
                    description: "",
                    type: "",
                    theme: "",
                    mode: ""
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid mode", async () => {
            const organizerAuth = await createOrganizer({
                name: "Invalid Mode User",
                email: `invalidmodeuser${Date.now()}@test.com`
            });

            const response = await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "Invalid Mode Event",
                    description: "Invalid mode",
                    mode: "physical"
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid date order", async () => {
            const organizerAuth = await createOrganizer({
                name: "Invalid Date User",
                email: `invaliddateuser${Date.now()}@test.com`
            });

            const response = await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "Invalid Dates Event",
                    description: "Bad dates",
                    startDateTime: "2026-12-31T12:00:00.000Z",
                    endDateTime: "2026-12-31T10:00:00.000Z"
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid registration deadline", async () => {
            const organizerAuth = await createOrganizer({
                name: "Deadline User",
                email: `deadlineuser${Date.now()}@test.com`
            });

            const response = await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "Deadline Event",
                    description: "Deadline validation",
                    registrationDeadline: "2026-12-31T11:00:00.000Z"
                }
            );

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       FILE UPLOAD ERRORS
    ============================= */

    describe("File upload errors", () => {
        it("rejects invalid image type", async () => {
            const organizerAuth = await createOrganizer({
                name: "Invalid Image User",
                email: `invalidimageuser${Date.now()}@test.com`
            });

            const response = await createMultipartEventRequest(
                organizerAuth.headers,
                {
                    title: "Invalid Image Event",
                    description: "Invalid image"
                }
            ).attach("image", Buffer.from("fake pdf"), {
                filename: "document.pdf",
                contentType: "application/pdf"
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid image extension even with image mimetype", async () => {
            const organizerAuth = await createOrganizer({
                name: "Invalid Extension User",
                email: `invalidextensionuser${Date.now()}@test.com`
            });

            const response = await createMultipartEventRequest(
                organizerAuth.headers,
                {
                    title: "Invalid Extension Event",
                    description: "Invalid extension"
                }
            ).attach("image", Buffer.from("fake image"), {
                filename: "image.txt",
                contentType: "image/png"
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects oversized image upload", async () => {
            const organizerAuth = await createOrganizer({
                name: "Oversized Image User",
                email: `oversizedimageuser${Date.now()}@test.com`
            });

            const oversizedBuffer = Buffer.alloc(4 * 1024 * 1024);

            const response = await createMultipartEventRequest(
                organizerAuth.headers,
                {
                    title: "Oversized Image Event",
                    description: "Oversized upload"
                }
            ).attach("image", oversizedBuffer, {
                filename: "huge.png",
                contentType: "image/png"
            });

            expect(response.statusCode).toBe(400);
        });
    });
});
