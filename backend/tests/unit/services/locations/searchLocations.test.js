/* ==================================================
   LOCATION SERVICE - SEARCH LOCATIONS TESTS

   Tests:
   - empty query rejection
   - cached location lookup
   - provider search when cache is empty
   - provider result persistence
   - provider rate limit handling
   - provider unavailable handling
   - provider empty result handling

   Ensures:
   - empty location queries are rejected early
   - cached locations avoid external provider calls
   - provider results are normalized and persisted
   - provider errors are converted into HTTP errors
================================================== */

jest.mock("../../../../src/models/locationModel", () => ({
    findAll: jest.fn(),
    findOrCreate: jest.fn()
}));

jest.mock("../../../../src/config/location", () => ({
    provider: "nominatim",
    nominatim: {
        searchUrl: "https://nominatim.test/search",
        userAgent: "PlanTogetherTest/1.0",
        resultLimit: 5
    }
}));

const Location = require("../../../../src/models/locationModel");

const locationService = require("../../../../src/services/locationService");

describe("locationService - searchLocations", () => {

    beforeEach(() => {
        jest.clearAllMocks();

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
    });

    afterEach(() => {
        delete global.fetch;
    });

    /* =============================
       QUERY VALIDATION
    ============================= */

    it("should reject empty location query", async () => {
        await expect(locationService.searchLocations(""))
            .rejects
            .toMatchObject({
                message: "Location query is required",
                statusCode: 400
            });

        expect(Location.findAll).not.toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    /* =============================
       CACHE LOOKUP
    ============================= */

    it("should return cached locations when available", async () => {
        const cachedLocations = [
            {
                id: 1,
                query: "montreal",
                label: "Montréal, Québec, Canada",
                latitude: 45.5031824,
                longitude: -73.5698065,
                provider: "nominatim"
            }
        ];

        Location.findAll.mockResolvedValue(cachedLocations);

        const result = await locationService.searchLocations(" Montreal ");

        expect(Location.findAll).toHaveBeenCalledWith({
            where: {
                query: "montreal",
                provider: "nominatim"
            },
            order: [["createdAt", "ASC"]]
        });

        expect(global.fetch).not.toHaveBeenCalled();
        expect(result).toBe(cachedLocations);
    });

    /* =============================
       PROVIDER SEARCH
    ============================= */

    it("should search provider and save results when cache is empty", async () => {
        Location.findAll.mockResolvedValue([]);

        const savedLocation = {
            id: 1,
            query: "montreal",
            label: "Montréal, Québec, Canada",
            latitude: 45.5031824,
            longitude: -73.5698065,
            provider: "nominatim"
        };

        Location.findOrCreate.mockResolvedValue([savedLocation]);

        const result = await locationService.searchLocations("Montreal");

        expect(global.fetch).toHaveBeenCalledWith(
            "https://nominatim.test/search?q=Montreal&format=json&limit=5",
            {
                headers: {
                    Accept: "application/json",
                    "User-Agent": "PlanTogetherTest/1.0"
                }
            }
        );

        expect(Location.findOrCreate).toHaveBeenCalledWith({
            where: {
                query: "montreal",
                provider: "nominatim",
                latitude: 45.5031824,
                longitude: -73.5698065
            },
            defaults: {
                query: "montreal",
                label: "Montréal, Québec, Canada",
                latitude: 45.5031824,
                longitude: -73.5698065,
                provider: "nominatim"
            }
        });

        expect(result).toEqual([savedLocation]);
    });

    it("should throw 429 when provider rate limit is reached", async () => {
        Location.findAll.mockResolvedValue([]);

        global.fetch.mockResolvedValue({
            ok: false,
            status: 429,
            json: jest.fn()
        });

        await expect(locationService.searchLocations("Montreal"))
            .rejects
            .toMatchObject({
                message: "Location search rate limit exceeded. Please try again later.",
                statusCode: 429
            });

        expect(Location.findOrCreate).not.toHaveBeenCalled();
    });

    it("should throw 502 when provider is unavailable", async () => {
        Location.findAll.mockResolvedValue([]);

        global.fetch.mockResolvedValue({
            ok: false,
            status: 500,
            json: jest.fn()
        });

        await expect(locationService.searchLocations("Montreal"))
            .rejects
            .toMatchObject({
                message: "Location search service unavailable",
                statusCode: 502
            });

        expect(Location.findOrCreate).not.toHaveBeenCalled();
    });

    it("should throw 404 when provider returns no result", async () => {
        Location.findAll.mockResolvedValue([]);

        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue([])
        });

        await expect(locationService.searchLocations("Unknown place"))
            .rejects
            .toMatchObject({
                message: "Location not found",
                statusCode: 404
            });

        expect(Location.findOrCreate).not.toHaveBeenCalled();
    });
});
