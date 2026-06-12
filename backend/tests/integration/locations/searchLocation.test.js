/* ==================================================
   LOCATIONS INTEGRATION - SEARCH LOCATION TESTS

   Tests:
   - authenticated location search
   - cached location reuse
   - authentication protection
   - missing query validation
   - short query validation
   - provider empty result handling
   - provider rate limit handling
   - provider unavailable handling

   Ensures:
   - authenticated users can search locations
   - provider results are persisted in the location cache
   - cached results avoid repeated provider calls
   - validators protect location search input
   - provider errors are returned as API errors
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { Location } = require("../../../src/models");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");

describe("Search Location API", () => {

    beforeAll(async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue([
                {
                    lat: "45.5031824",
                    lon: "-73.5698065",
                    display_name: "Montréal, Québec, Canada"
                }
            ])
        });

        await initDB();
    });

    afterEach(async () => {
        await resetDB();
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await closeDB();
        delete global.fetch;
    });

    /* =============================
       LOCATION SEARCH SUCCESS
    ============================= */

    it("should search locations when authenticated", async () => {
        const userAuth = await registerAndGetToken({
            name: "Location User",
            email: `location${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/locations/search")
            .query({ q: "Montreal" })
            .set(userAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Locations retrieved successfully");

        expect(res.body.locations).toEqual([
            expect.objectContaining({
                query: "montreal",
                label: "Montréal, Québec, Canada",
                latitude: 45.5031824,
                longitude: -73.5698065,
                provider: "nominatim"
            })
        ]);

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should persist provider results in location cache", async () => {
        const userAuth = await registerAndGetToken({
            name: "Cache User",
            email: `cache${Date.now()}@test.com`
        });

        await request(app)
            .get("/api/locations/search")
            .query({ q: "Montreal" })
            .set(userAuth.headers);

        const cachedLocation = await Location.findOne({
            where: {
                query: "montreal",
                provider: "nominatim"
            }
        });

        expect(cachedLocation).toBeDefined();
        expect(cachedLocation.label).toBe("Montréal, Québec, Canada");
    });

    it("should reuse cached locations without calling provider again", async () => {
        const userAuth = await registerAndGetToken({
            name: "Reuse Cache User",
            email: `reusecache${Date.now()}@test.com`
        });

        await request(app)
            .get("/api/locations/search")
            .query({ q: "Montreal" })
            .set(userAuth.headers);

        jest.clearAllMocks();

        const res = await request(app)
            .get("/api/locations/search")
            .query({ q: "Montreal" })
            .set(userAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject location search without token", async () => {
        const res = await request(app)
            .get("/api/locations/search")
            .query({ q: "Montreal" });

        expect(res.statusCode).toBe(401);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject missing location query", async () => {
        const userAuth = await registerAndGetToken({
            name: "Missing Query User",
            email: `missingquery${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/locations/search")
            .set(userAuth.headers);

        expect(res.statusCode).toBe(400);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should reject too short location query", async () => {
        const userAuth = await registerAndGetToken({
            name: "Short Query User",
            email: `shortquery${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/locations/search")
            .query({ q: "a" })
            .set(userAuth.headers);

        expect(res.statusCode).toBe(400);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    /* =============================
       PROVIDER ERRORS
    ============================= */

    it("should return 404 when provider returns no locations", async () => {
        const userAuth = await registerAndGetToken({
            name: "No Result User",
            email: `noresult${Date.now()}@test.com`
        });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue([])
        });

        const res = await request(app)
            .get("/api/locations/search")
            .query({ q: "Unknown place" })
            .set(userAuth.headers);

        expect(res.statusCode).toBe(404);
    });

    it("should return 429 when provider rate limit is reached", async () => {
        const userAuth = await registerAndGetToken({
            name: "Rate Limit User",
            email: `ratelimit${Date.now()}@test.com`
        });

        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 429,
            json: jest.fn()
        });

        const res = await request(app)
            .get("/api/locations/search")
            .query({ q: "Rate Limit City" })
            .set(userAuth.headers);

        expect(res.statusCode).toBe(429);
    });

    it("should return 502 when provider is unavailable", async () => {
        const userAuth = await registerAndGetToken({
            name: "Provider Down User",
            email: `providerdown${Date.now()}@test.com`
        });

        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: jest.fn()
        });

        const res = await request(app)
            .get("/api/locations/search")
            .query({ q: "Provider Down City" })
            .set(userAuth.headers);

        expect(res.statusCode).toBe(502);
    });
});
