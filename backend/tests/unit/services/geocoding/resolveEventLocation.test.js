/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/models/locationModel", () => ({
    findAll: jest.fn(),
    findOrCreate: jest.fn()
}));

jest.mock("../../../../src/config/geocoding", () => ({
    nominatim: {
        searchUrl: "https://nominatim.example.com/search",
        userAgent: "PlanTogether Test"
    }
}));

jest.mock("../../../../src/utils/stringNormalizer", () => ({
    normalizeString: jest.fn(
        (value) => String(value ?? "").trim()
    ),
    normalizeSearchKey: jest.fn(
        (value) => String(value ?? "")
            .trim()
            .toLowerCase()
    )
}));

jest.mock("../../../../src/utils/geocoding/geocodingParams", () => ({
    buildNominatimSearchParams: jest.fn(
        (query) => ({
            toString: () => `q=${encodeURIComponent(query)}`
        })
    )
}));

jest.mock("../../../../src/utils/geocoding/geocodingSearchQueries", () => ({
    buildLocationSearchQueries: jest.fn(
        (query) => [query]
    )
}));

jest.mock("../../../../src/utils/geocoding/geocodingNormalizer", () => ({
    GEOCODING_PROVIDER: "nominatim",
    normalizeLocation: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const Location = require("../../../../src/models/locationModel");

const { resolveEventLocation } = require("../../../../src/services/geocodingService");

/* ==========================================================================
   Resolve Event Location Service Unit Tests

   Tests event location resolution.

   Responsibilities
   - Test best matching location selection
   - Test cached location reuse
   - Test location search error propagation

   Notes
   - Event location resolution delegates to the shared location search flow.
   - The first available location is used for event persistence.
=========================================================================== */

describe("resolve event location service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       EVENT LOCATION RESOLUTION
    ============================= */

    describe("resolveEventLocation", () => {
        it("returns the first matching cached location", async () => {
            const locations = [{
                id: 1,
                query: "montreal",
                label: "Montréal, Québec, Canada",
                city: "Montréal",
                region: "Québec",
                country: "Canada"
            }, {
                id: 2,
                query: "montreal",
                label: "Montréal-Est, Québec, Canada",
                city: "Montréal-Est",
                region: "Québec",
                country: "Canada"
            }];

            Location.findAll.mockResolvedValue(locations);

            const result = await resolveEventLocation("Montreal");

            expect(result).toBe(locations[0]);

            expect(Location.findAll).toHaveBeenCalledWith({
                where: {
                    query: "montreal",
                    provider: "nominatim"
                },
                order: [
                    ["createdAt", "ASC"]
                ]
            });

            expect(Location.findOrCreate).not.toHaveBeenCalled();
        });

        it("propagates location search errors", async () => {
            Location.findAll.mockRejectedValue(new Error("Database unavailable"));

            await expect(resolveEventLocation("Montreal")).rejects.toThrow("Database unavailable");

            expect(Location.findOrCreate).not.toHaveBeenCalled();
        });
    });
});
