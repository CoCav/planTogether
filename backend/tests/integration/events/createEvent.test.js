/* ==================================================
   EVENTS INTEGRATION - CREATE EVENT TESTS

   Tests:
   - authenticated event creation
   - event creation with image upload
   - online event creation without location
   - organizer role assignment to event creator
   - authentication protection
   - missing required fields validation
   - invalid mode validation
   - invalid date validation
   - invalid registration deadline validation
   - invalid image type rejection
   - oversized image rejection

   Ensures:
   - authenticated users can create events
   - uploaded images are stored correctly
   - event creator automatically becomes organizer
   - validators protect event creation payloads
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventUserRole } = require("../../../src/models");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");

describe("Create Event API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       EVENT CREATION SUCCESS
    ============================= */

    it("should create an event when authenticated", async () => {
        const userAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send({
                title: "Tech Meetup",
                description: "A technology meetup",
                type: "Meetup",
                theme: "Technology",
                mode: "in_person",
                location: "Montreal",
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z"
            });

        expect(res.statusCode).toBe(201);

        expect(res.body).toHaveProperty(
            "message",
            "Event created successfully"
        );

        expect(res.body).toHaveProperty("event");

        expect(res.body.event).toMatchObject({
            title: "Tech Meetup",
            mode: "in_person",
            location: "Montreal"
        });
    });

    it("should create an event with image upload", async () => {
        const userAuth = await registerAndGetToken({
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
            .field("mode", "in_person")
            .field("location", "Montreal")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", Buffer.from("fake image"), {
                filename: "event.png",
                contentType: "image/png"
            });

        expect(res.statusCode).toBe(201);

        expect(res.body.event.image).toMatch(/^\/uploads\/events\/event-/);
    });

    it("should create an online event without location", async () => {
        const userAuth = await registerAndGetToken({
            name: "Online Creator",
            email: `online${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send({
                title: "Online Event",
                description: "Remote event",
                type: "Workshop",
                theme: "Technology",
                mode: "online",
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z"
            });

        expect(res.statusCode).toBe(201);

        expect(res.body.event.location).toBeNull();
    });

    it("should assign organizer role to event creator", async () => {
        const userAuth = await registerAndGetToken({
            name: "Organizer Creator",
            email: `organizer${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send({
                title: "Organizer Event",
                description: "Organizer test",
                type: "Meetup",
                theme: "Technology",
                mode: "in_person",
                location: "Montreal",
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z"
            });

        const membership = await EventUserRole.findOne({
            where: {
                eventId: res.body.event.id,
                userId: userAuth.user.userId
            }
        });

        expect(membership).toBeDefined();
        expect(membership.role).toBe("organizer");
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
        const userAuth = await registerAndGetToken({
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
        const userAuth = await registerAndGetToken({
            name: "Invalid Mode User",
            email: `invalidmode${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send({
                title: "Invalid Mode Event",
                description: "Invalid mode",
                type: "Meetup",
                theme: "Technology",
                mode: "physical",
                location: "Montreal",
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid date order", async () => {
        const userAuth = await registerAndGetToken({
            name: "Date User",
            email: `date${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send({
                title: "Invalid Dates Event",
                description: "Bad dates",
                type: "Meetup",
                theme: "Technology",
                mode: "in_person",
                location: "Montreal",
                startDateTime: "2026-12-31T12:00:00.000Z",
                endDateTime: "2026-12-31T10:00:00.000Z"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid registration deadline", async () => {
        const userAuth = await registerAndGetToken({
            name: "Deadline User",
            email: `deadline${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events")
            .set(userAuth.headers)
            .send({
                title: "Deadline Event",
                description: "Deadline validation",
                type: "Meetup",
                theme: "Technology",
                mode: "in_person",
                location: "Montreal",
                registrationDeadline: "2026-12-31T11:00:00.000Z",
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid image type", async () => {
        const userAuth = await registerAndGetToken({
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
            .field("mode", "in_person")
            .field("location", "Montreal")
            .field("startDateTime", "2026-12-31T10:00:00.000Z")
            .field("endDateTime", "2026-12-31T12:00:00.000Z")
            .attach("image", Buffer.from("fake pdf"), {
                filename: "document.pdf",
                contentType: "application/pdf"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject oversized image upload", async () => {
        const userAuth = await registerAndGetToken({
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
            .field("mode", "in_person")
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
