/* ==================================================
   EVENTS INTEGRATION - CREATE EVENT TESTS

   Tests:
   - authenticated event creation
   - in-person event geolocation persistence
   - event creation with image upload
   - online event creation without location or geolocation
   - organizer role assignment to event creator
   - authentication protection
   - missing required fields validation
   - invalid mode validation
   - invalid date validation
   - invalid registration deadline validation
   - invalid image type rejection
   - invalid image extension rejection
   - oversized image rejection

   Ensures:
   - authenticated users can create events
   - in-person events persist resolved coordinates
   - online events skip geocoding and keep location data null
   - uploaded images are stored correctly
   - event creator automatically becomes organizer
   - validators protect event creation payloads
   - shared event role constants are used for valid role scenarios
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");
const { EVENT_MODES } = require("../../../src/constants/eventModes");

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");

const { createEventPayload } = require("../../factories/eventFactory");

describe("Create Event API", () => {

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
       EVENT CREATION SUCCESS
    ============================= */

    it("should create an event when authenticated", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send(createEventPayload({
                title: "Tech Meetup",
                description: "A technology meetup"
            }));

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Event created successfully");
        expect(res.body).toHaveProperty("event");

        expect(res.body.event).toMatchObject({
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

    it("should create an event with image upload", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Image Creator",
            email: `image${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .field("title", "Image Event")
            .field("description", "Event with image")
            .field("type", "Meetup")
            .field("theme", "Technology")
            .field("mode", EVENT_MODES.IN_PERSON)
            .field("location", "Montreal")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", Buffer.from("fake image"), {
                filename: "event.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Event created successfully");

        expect(res.body.event.image).toMatch(/^\/uploads\/events\/event-/);
    });

    it("should call location provider when creating an in-person event", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Geo Creator",
            email: `geo${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send(createEventPayload({
                title: "Geo Event",
                description: "Geocoded event",
                location: "Sherbrooke"
            }));

        expect(res.statusCode).toBe(201);

        expect(global.fetch).toHaveBeenCalledTimes(1);

        expect(global.fetch.mock.calls[0][0]).toContain("q=Sherbrooke");
    });

    it("should create an online event without geolocation data", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Online Creator",
            email: `online${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send(createEventPayload({
                title: "Online Event",
                description: "Remote event",
                type: "Workshop",
                mode: EVENT_MODES.ONLINE,
                location: undefined
            }));

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Event created successfully");

        expect(res.body.event.location).toBeNull();
        expect(res.body.event.locationLabel).toBeNull();

        expect(res.body.event.streetAddress).toBeNull();
        expect(res.body.event.city).toBeNull();
        expect(res.body.event.region).toBeNull();
        expect(res.body.event.postalCode).toBeNull();
        expect(res.body.event.country).toBeNull();

        expect(res.body.event.latitude).toBeNull();
        expect(res.body.event.longitude).toBeNull();

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should assign organizer role to event creator", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Organizer Creator",
            email: `organizer${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send(createEventPayload({
                title: "Organizer Event",
                description: "Organizer test"
            }));

        const membership = await EventUserRole.findOne({
            where: {
                eventId: res.body.event.id,
                userId: userAuth.user.userId
            }
        });

        expect(membership).toBeDefined();

        expect(res.body).toHaveProperty("message", "Event created successfully");

        expect(membership.role).toBe(EVENT_ROLES.ORGANIZER);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject event creation without token", async () => {
        const res = await request(app)
            .post("/api/events")
            .send({
                title: "Unauthorized Event"
            });

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject missing required fields", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Validation User",
            email: `validation${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send({
                title: "",
                description: "",
                type: "",
                theme: "",
                mode: ""
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid mode", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Invalid Mode User",
            email: `invalidmode${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send(createEventPayload({
                title: "Invalid Mode Event",
                description: "Invalid mode",
                mode: "physical"
            }));

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid date order", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Date User",
            email: `date${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send(createEventPayload({
                title: "Invalid Dates Event",
                description: "Bad dates",
                startDateTime: "2026-12-31T12:00:00.000Z",
                endDateTime: "2026-12-31T10:00:00.000Z"
            }));

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid registration deadline", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Deadline User",
            email: `deadline${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send(createEventPayload({
                title: "Deadline Event",
                description: "Deadline validation",
                registrationDeadline: "2026-12-31T11:00:00.000Z"
            }));

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid image type", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Invalid Image User",
            email: `invalidimage${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .field("title", "Invalid Image Event")
            .field("description", "Invalid image")
            .field("type", "Meetup")
            .field("theme", "Technology")
            .field("mode", EVENT_MODES.IN_PERSON)
            .field("location", "Montreal")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", Buffer.from("fake pdf"), {
                filename: "document.pdf",
                contentType: "application/pdf"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid image extension even with image mimetype", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Invalid Extension User",
            email: `invalidext${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .field("title", "Invalid Extension Event")
            .field("description", "Invalid extension")
            .field("type", "Meetup")
            .field("theme", "Technology")
            .field("mode", EVENT_MODES.IN_PERSON)
            .field("location", "Montreal")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", Buffer.from("fake image"), {
                filename: "image.txt",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject oversized image upload", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Oversized Image User",
            email: `oversized${Date.now()}@test.com`
        });

        const oversizedBuffer = Buffer.alloc(4 * 1024 * 1024);

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .field("title", "Oversized Image Event")
            .field("description", "Oversized upload")
            .field("type", "Meetup")
            .field("theme", "Technology")
            .field("mode", EVENT_MODES.IN_PERSON)
            .field("location", "Montreal")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", oversizedBuffer, {
                filename: "huge.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(400);
    });
});
