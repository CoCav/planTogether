/* ==================================================
   LOCATIONS INTEGRATION - SEARCH LOCATION TESTS

   Tests:
   - authenticated location search (/search)
   - public location search (/public-search)
   - authentication protection (/search only)
   - validation errors (missing query)
   - cache persistence (DB storage)
   - cache reuse (no provider call)

   Ensures:
   - /search is protected by authentication
   - /public-search is publicly accessible
   - location results are cached in database
   - repeated queries use cache instead of provider
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { Location } = require("../../../src/models");
const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");
const { registerAndGetToken } = require("../../helpers/api/authHelper");

describe("Location API - Integration Tests", () => {

    /* =============================
       SETUP
    ============================= */

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
       AUTHENTICATED SEARCH (/search)
    ============================= */

    describe("Authenticated search (/search)", () => {

        it("should return locations when authenticated", async () => {
            const user = await registerAndGetToken({
                name: "Test User",
                email: `test${Date.now()}@mail.com`
            });

            const res = await request(app)
                .get("/api/locations/search")
                .query({ q: "Montreal" })
                .set(user.headers);

            expect(res.statusCode).toBe(200);
            expect(res.body.locations).toBeDefined();
        });

        it("should reject unauthenticated access", async () => {
            const res = await request(app)
                .get("/api/locations/search")
                .query({ q: "Montreal" });

            expect(res.statusCode).toBe(401);
        });
    });

    /* =============================
       PUBLIC SEARCH (/public-search)
    ============================= */

    describe("Public search (/public-search)", () => {

        it("should allow public search", async () => {
            const res = await request(app)
                .get("/api/locations/public-search")
                .query({ q: "Montreal" });

            expect(res.statusCode).toBe(200);
            expect(res.body.locations).toBeDefined();
        });
    });

    /* =============================
       VALIDATION
    ============================= */

    describe("Validation", () => {

        it("should reject missing query (authenticated)", async () => {
            const user = await registerAndGetToken({
                name: "Test User",
                email: `test2${Date.now()}@mail.com`
            });

            const res = await request(app)
                .get("/api/locations/search")
                .set(user.headers);

            expect(res.statusCode).toBe(400);
        });

        it("should reject missing query (public)", async () => {
            const res = await request(app)
                .get("/api/locations/public-search");

            expect(res.statusCode).toBe(400);
        });
    });

    /* =============================
       CACHE BEHAVIOR
    ============================= */

    describe("Cache behavior", () => {

        it("should persist locations in cache", async () => {
            const user = await registerAndGetToken({
                name: "Cache User",
                email: `cache${Date.now()}@mail.com`
            });

            await request(app)
                .get("/api/locations/search")
                .query({ q: "Montreal" })
                .set(user.headers);

            const cached = await Location.findOne({
                where: { query: "montreal" }
            });

            expect(cached).toBeDefined();

            expect(cached).toMatchObject({
                query: "montreal",
                label: "Montréal, Québec, Canada",
                streetAddress: "1500 Rue Sainte-Catherine O",
                city: "Montréal",
                region: "Québec",
                postalCode: "H3G 1S8",
                country: "Canada",
                latitude: 45.5031824,
                longitude: -73.5698065,
                provider: "nominatim"
            });
        });

        it("should reuse cache instead of calling provider", async () => {
            const user = await registerAndGetToken({
                name: "Cache User",
                email: `cache2${Date.now()}@mail.com`
            });

            await request(app)
                .get("/api/locations/search")
                .query({ q: "Montreal" })
                .set(user.headers);

            jest.clearAllMocks();

            await request(app)
                .get("/api/locations/search")
                .query({ q: "Montreal" })
                .set(user.headers);

            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

});
