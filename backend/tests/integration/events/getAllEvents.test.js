/* ==================================================
   EVENTS INTEGRATION - GET ALL EVENTS

   Tests:
   - retrieve event listing
   - type, theme and search filters
   - exact date and date range filters
   - combined filters
   - status filtering
   - pagination
   - sorting behavior

   Ensures:
   - /api/events supports listing with optional filters
   - filtering logic returns correct events
   - pagination and sorting work correctly
   - event status is included in listings
================================================== */

const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require('../../helpers/authHelper');
const { getValidEventPayload, createEvent } = require('../../helpers/eventHelper');

describe("Get All Events API", () => {
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
       EVENT LISTING
    ============================= */

    it("should retrieve all events", async () => {
        const auth = await registerAndGetToken({
            name: "Event User",
            email: `events${Date.now()}@test.com`
        });

        await createEvent(auth.headers);

        const res = await request(app).get("/api/events");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    it("should include status in event listing", async () => {
        const auth = await registerAndGetToken({
            name: "Listing User",
            email: `listing${Date.now()}@test.com`
        });

        await createEvent(auth.headers, {
            title: "Future Event",
            startDateTime: "2030-01-01T10:00:00.000Z",
            endDateTime: "2030-01-01T12:00:00.000Z"
        });

        const res = await request(app).get("/api/events");

        expect(res.statusCode).toBe(200);
        expect(res.body.events.some((event) => event.status)).toBe(true);
    });

    /* =============================
       BASIC FILTERS
    ============================= */

    it("should filter events by type", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `type${Date.now()}@test.com`
        });

        await createEvent(auth.headers, { type: "Meetup" });
        await createEvent(auth.headers, { type: "Conference" });

        const res = await request(app)
            .get("/api/events")
            .query({ type: "Meetup" });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.every((event) => event.type === "Meetup")).toBe(true);
    });

    it("should filter events by theme", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `theme${Date.now()}@test.com`
        });

        await createEvent(auth.headers, { theme: "Technology" });
        await createEvent(auth.headers, { theme: "Business" });

        const res = await request(app)
            .get("/api/events")
            .query({ theme: "Technology" });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.every((event) => event.theme === "Technology")).toBe(true);
    });

    it("should filter events by search term", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `search${Date.now()}@test.com`
        });

        await createEvent(auth.headers, { title: "JavaScript Meetup" });
        await createEvent(auth.headers, { title: "Cooking Workshop" });

        const res = await request(app)
            .get("/api/events")
            .query({ search: "JavaScript" });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.some((event) => event.title.includes("JavaScript"))).toBe(true);
    });

    /* =============================
       DATE FILTERS
    ============================= */

    it("should filter events by exact date", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `date${Date.now()}@test.com`
        });

        await createEvent(auth.headers, {
            startDateTime: "2026-12-31T10:00:00.000Z",
            endDateTime: "2026-12-31T12:00:00.000Z"
        });

        const res = await request(app)
            .get("/api/events")
            .query({ date: "2026-12-31" });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    it("should filter events by date range", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `range${Date.now()}@test.com`
        });

        await createEvent(auth.headers, {
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z"
        });

        const res = await request(app)
            .get("/api/events")
            .query({
                startDate: "2026-12-01",
                endDate: "2026-12-31"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    /* =============================
       COMBINED FILTERS
    ============================= */

    it("should filter events with combined params", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `combo${Date.now()}@test.com`
        });

        await createEvent(auth.headers, {
            type: "Meetup",
            theme: "Technology",
            location: "Montreal"
        });

        await createEvent(auth.headers, {
            type: "Meetup",
            theme: "Business",
            location: "Quebec"
        });

        const res = await request(app)
            .get("/api/events")
            .query({
                type: "Meetup",
                theme: "Technology",
                location: "Montreal"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every((event) =>
            event.type === "Meetup" &&
            event.theme === "Technology" &&
            event.location === "Montreal"
        )).toBe(true);
    });

    it("should return empty array when no match", async () => {
        const res = await request(app)
            .get("/api/events")
            .query({ type: "DoesNotExist" });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBe(0);
    });

    /* =============================
       STATUS FILTERS
    ============================= */

    it("should filter upcoming events", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `upcoming${Date.now()}@test.com`
        });

        await createEvent(auth.headers, {
            title: "Upcoming Event",
            startDateTime: "2030-01-01T10:00:00.000Z",
            endDateTime: "2030-01-01T12:00:00.000Z"
        });

        await createEvent(auth.headers, {
            title: "Past Event",
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const res = await request(app)
            .get("/api/events")
            .query({ status: "upcoming" });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.every((event) => event.status === "upcoming")).toBe(true);
    });

    it("should filter past events", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `past${Date.now()}@test.com`
        });

        await createEvent(auth.headers, {
            title: "Past Event",
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const res = await request(app)
            .get("/api/events")
            .query({ status: "past" });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.every((event) => event.status === "past")).toBe(true);
    });

    /* =============================
       PAGINATION
    ============================= */

    it("should paginate events", async () => {
        const auth = await registerAndGetToken({
            name: "Pagination User",
            email: `pagination${Date.now()}@test.com`
        });

        await createEvent(auth.headers, { title: "Event 1" });
        await createEvent(auth.headers, { title: "Event 2" });
        await createEvent(auth.headers, { title: "Event 3" });

        const res = await request(app)
            .get("/api/events")
            .query({
                page: 1,
                pageSize: 2
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBe(2);
        expect(res.body.totalEvents).toBe(3);
    });

    /* =============================
       SORTING
    ============================= */

    it("should sort events by title ascending", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `sort${Date.now()}@test.com`
        });

        await createEvent(auth.headers, { title: "Zulu" });
        await createEvent(auth.headers, { title: "Alpha" });

        const res = await request(app)
            .get("/api/events")
            .query({
                sortBy: "title",
                order: "asc"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.events[0].title).toBe("Alpha");
    });

    it("should reject invalid sort field", async () => {
        const res = await request(app)
            .get("/api/events")
            .query({ sortBy: "invalid" });

        expect(res.statusCode).toBe(400);
    });
});
