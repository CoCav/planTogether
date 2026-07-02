/* ==================================================
   LOCATION SERVICE - SEARCH LOCATIONS TESTS

   Tests:
   - empty query rejection
   - cached location lookup
   - provider search when cache is empty
   - fallback provider search when first query has no result
   - stale cache refresh when structured address data is missing
   - provider result persistence
   - provider rate limit handling
   - provider unavailable handling
   - provider empty result handling

   Ensures:
   - empty location queries are rejected early
   - cached locations avoid external provider calls
   - fallback queries improve detailed address matching
   - stale cached locations are refreshed with structured address data
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
        const cachedLocations = [{
            id: 1,
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
        }];

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
            streetAddress: "1500 Rue Sainte-Catherine O",
            city: "Montréal",
            region: "Québec",
            postalCode: "H3G 1S8",
            country: "Canada",
            latitude: 45.5031824,
            longitude: -73.5698065,
            provider: "nominatim"
        };

        Location.findOrCreate.mockResolvedValue([savedLocation, true]);

        const result = await locationService.searchLocations("Montreal");

        expect(global.fetch).toHaveBeenCalledWith(
            "https://nominatim.test/search?q=Montreal&format=json&addressdetails=1&limit=5",
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
                streetAddress: "1500 Rue Sainte-Catherine O",
                city: "Montréal",
                region: "Québec",
                postalCode: "H3G 1S8",
                country: "Canada",
                latitude: 45.5031824,
                longitude: -73.5698065,
                provider: "nominatim"
            }
        });

        expect(result).toEqual([savedLocation]);
    });

    it("should try fallback queries when provider returns no result for the first query", async () => {
        Location.findAll.mockResolvedValue([]);

        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue([])
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue([
                    {
                        lat: "46.8137431",
                        lon: "-71.2084061",
                        display_name: "Québec, Capitale-Nationale, Québec, Canada"
                    }
                ])
            });

        const savedLocation = {
            id: 1,
            query: "179 grande allée o, québec, qc g1r 2h1, canada",
            label: "Québec, Capitale-Nationale, Québec, Canada",
            latitude: 46.8137431,
            longitude: -71.2084061,
            provider: "nominatim"
        };

        Location.findOrCreate.mockResolvedValue([savedLocation, true]);

        const result = await locationService.searchLocations("179 Grande Allée O, Québec, QC G1R 2H1, Canada");

        expect(global.fetch).toHaveBeenCalledTimes(2);

        expect(global.fetch.mock.calls[0][0]).toContain("addressdetails=1");
        expect(global.fetch.mock.calls[1][0]).toContain("addressdetails=1");

        expect(Location.findOrCreate).toHaveBeenCalledWith({
            where: {
                query: "179 grande allée o, québec, qc g1r 2h1, canada",
                provider: "nominatim",
                latitude: 46.8137431,
                longitude: -71.2084061
            },
            defaults: {
                query: "179 grande allée o, québec, qc g1r 2h1, canada",
                label: "Québec, Capitale-Nationale, Québec, Canada",
                streetAddress: null,
                city: null,
                region: null,
                postalCode: null,
                country: null,
                latitude: 46.8137431,
                longitude: -71.2084061,
                provider: "nominatim"
            }
        });

        expect(result).toEqual([savedLocation]);
    });

    it("should refresh stale cached locations without structured address data", async () => {
        const staleCachedLocations = [
            {
                id: 1,
                query: "montreal",
                label: "Old Montréal label",
                latitude: 45.5031824,
                longitude: -73.5698065,
                provider: "nominatim"
            }
        ];

        const savedLocation = {
            id: 1,
            query: "montreal",
            label: "Old Montréal label",
            latitude: 45.5031824,
            longitude: -73.5698065,
            provider: "nominatim",
            update: jest.fn().mockResolvedValue()
        };

        Location.findAll.mockResolvedValue(staleCachedLocations);
        Location.findOrCreate.mockResolvedValue([savedLocation, false]);

        const result = await locationService.searchLocations("Montreal");

        expect(global.fetch).toHaveBeenCalled();

        expect(savedLocation.update).toHaveBeenCalledWith({
            label: "Montréal, Québec, Canada",
            streetAddress: "1500 Rue Sainte-Catherine O",
            city: "Montréal",
            region: "Québec",
            postalCode: "H3G 1S8",
            country: "Canada"
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
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});
