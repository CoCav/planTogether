const { Location } = require("../../../src/models");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { publicSearchLocations } = require("../../helpers/http/geocodingTestHelper");

const {
    createGeocodingQuery,
    createNominatimResult,
    createNominatimFetchResponse
} = require("../../factories/geocodingFactory");

/* ==========================================================================
   Geocoding Integration Tests - Public Search Locations

   Tests public location search behavior.

   Responsibilities
   - Test public location search
   - Test cached location retrieval
   - Test provider search and cache persistence
   - Test validation errors
   - Test provider errors

   Notes
   - Public geocoding search does not require authentication.
   - Cached locations should avoid provider requests.
   - Provider results are normalized and saved to cache.
=========================================================================== */

describe("Public Search Locations API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       PUBLIC LOCATION SEARCH SUCCESS
    ============================= */

    describe("Public location search success", () => {
        it("returns cached locations without calling provider", async () => {
            await Location.create({
                query: "montreal",
                label: "Montreal, Quebec, Canada",
                streetAddress: "1500 Rue Sainte-Catherine O",
                city: "Montreal",
                region: "Quebec",
                postalCode: "H2X",
                country: "Canada",
                latitude: 45.5017,
                longitude: -73.5673,
                provider: "nominatim"
            });

            global.fetch = jest.fn();

            const response = await publicSearchLocations({
                query: createGeocodingQuery()
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Locations retrieved successfully");

            expect(response.body.locations).toHaveLength(1);
            expect(response.body.locations[0]).toMatchObject({
                query: "montreal",
                label: "Montreal, Quebec, Canada",
                streetAddress: "1500 Rue Sainte-Catherine O",
                city: "Montreal",
                region: "Quebec",
                postalCode: "H2X",
                country: "Canada",
                latitude: 45.5017,
                longitude: -73.5673,
                provider: "nominatim"
            });

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it("searches provider when cache is empty", async () => {
            global.fetch = jest.fn().mockResolvedValue(
                createNominatimFetchResponse({
                    results: [
                        createNominatimResult({
                            display_name: "Montreal, Quebec, Canada"
                        })
                    ]
                })
            );

            const response = await publicSearchLocations({
                query: createGeocodingQuery()
            });

            expect(response.statusCode).toBe(200);
            expect(global.fetch).toHaveBeenCalledTimes(1);

            expect(response.body.locations).toHaveLength(1);
            expect(response.body.locations[0]).toMatchObject({
                query: "montreal",
                label: "Montreal, Quebec, Canada",
                streetAddress: "1500 Rue Sainte-Catherine O",
                city: "Montreal",
                region: "Quebec",
                postalCode: "H2X",
                country: "Canada",
                latitude: 45.5017,
                longitude: -73.5673,
                provider: "nominatim"
            });

            const cachedLocations = await Location.findAll({
                where: {
                    query: "montreal",
                    provider: "nominatim"
                }
            });

            expect(cachedLocations).toHaveLength(1);
        });

        it("uses cache after provider results are saved", async () => {
            global.fetch = jest.fn().mockResolvedValue(
                createNominatimFetchResponse({
                    results: [createNominatimResult()]
                })
            );

            await publicSearchLocations({
                query: createGeocodingQuery()
            });

            const response = await publicSearchLocations({
                query: createGeocodingQuery()
            });

            expect(response.statusCode).toBe(200);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(response.body.locations).toHaveLength(1);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects missing location query", async () => {
            const response = await publicSearchLocations();

            expect(response.statusCode).toBe(400);
        });

        it("rejects too short location query", async () => {
            const response = await publicSearchLocations({
                query: createGeocodingQuery({
                    q: "A"
                })
            });

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       PROVIDER ERRORS
    ============================= */

    describe("Provider errors", () => {
        it("returns 404 when provider returns no locations", async () => {
            global.fetch = jest.fn().mockResolvedValue(
                createNominatimFetchResponse({
                    results: []
                })
            );

            const response = await publicSearchLocations({
                query: createGeocodingQuery()
            });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Location not found");
        });

        it("returns 429 when provider rate limits location search", async () => {
            global.fetch = jest.fn().mockResolvedValue(
                createNominatimFetchResponse({
                    ok: false,
                    status: 429,
                    results: []
                })
            );

            const response = await publicSearchLocations({
                query: createGeocodingQuery()
            });

            expect(response.statusCode).toBe(429);
            expect(response.body.message).toBe("Location search rate limit exceeded. Please try again later.");
        });

        it("returns 502 when provider is unavailable", async () => {
            global.fetch = jest.fn().mockResolvedValue(
                createNominatimFetchResponse({
                    ok: false,
                    status: 500,
                    results: []
                })
            );

            const response = await publicSearchLocations({
                query: createGeocodingQuery()
            });

            expect(response.statusCode).toBe(502);
            expect(response.body.message).toBe("Location search service unavailable");
        });

        it("returns 502 when provider response has invalid coordinates", async () => {
            global.fetch = jest.fn().mockResolvedValue(
                createNominatimFetchResponse({
                    results: [
                        createNominatimResult({
                            lat: "invalid",
                            lon: "-73.5673"
                        })
                    ]
                })
            );

            const response = await publicSearchLocations({
                query: createGeocodingQuery()
            });

            expect(response.statusCode).toBe(502);
            expect(response.body.message).toBe("Invalid location provider response");
        });
    });
});
