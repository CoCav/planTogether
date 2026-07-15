const mockNormalizeString = jest.fn();
const mockNormalizeSearchKey = jest.fn();

const mockBuildNominatimSearchParams = jest.fn();
const mockBuildLocationSearchQueries = jest.fn();
const mockNormalizeLocation = jest.fn();

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
    normalizeString: mockNormalizeString,
    normalizeSearchKey: mockNormalizeSearchKey
}));

jest.mock("../../../../src/utils/geocoding/geocodingParams", () => ({
    buildNominatimSearchParams: mockBuildNominatimSearchParams
}));

jest.mock("../../../../src/utils/geocoding/geocodingSearchQueries", () => ({
    buildLocationSearchQueries: mockBuildLocationSearchQueries
}));

jest.mock("../../../../src/utils/geocoding/geocodingNormalizer", () => ({
    GEOCODING_PROVIDER: "nominatim",
    normalizeLocation: mockNormalizeLocation
}));

const Location = require("../../../../src/models/locationModel");

const { searchLocations } = require("../../../../src/services/geocodingService");

/* ==========================================================================
   Search Locations Service Unit Tests

   Tests cached and provider-backed location searches.

   Responsibilities
   - Test location query validation
   - Test normalized cache lookups
   - Test usable cached location reuse
   - Test provider fallback queries
   - Test provider request configuration
   - Test provider error handling
   - Test location normalization
   - Test location cache creation and refresh

   Notes
   - Location model, geocoding utilities and fetch are mocked.
   - Event location selection is tested separately.
=========================================================================== */

const createProviderResponse = ({
    ok = true,
    status = 200,
    results = []
} = {}) => ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(results)
});

describe("search locations service", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        jest.clearAllMocks();

        global.fetch = jest.fn();

        mockNormalizeString.mockImplementation(
            (value) => String(value ?? "").trim()
        );

        mockNormalizeSearchKey.mockImplementation(
            (value) => String(value ?? "")
                .trim()
                .toLowerCase()
        );

        mockBuildLocationSearchQueries.mockImplementation((query) => [query]);

        mockBuildNominatimSearchParams.mockImplementation((query) => ({
            toString: () =>
                `q=${encodeURIComponent(query)}`
        }));

        mockNormalizeLocation.mockImplementation(
            (originalQuery, result) => ({
                query: originalQuery.toLowerCase(),
                label: result.display_name,
                streetAddress: result.address?.road ?? null,
                city: result.address?.city ?? null,
                region: result.address?.state ?? null,
                postalCode: result.address?.postcode ?? null,
                country: result.address?.country ?? null,
                latitude: Number(result.lat),
                longitude: Number(result.lon),
                provider: "nominatim"
            })
        );
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    /* =============================
       QUERY VALIDATION
    ============================= */

    describe("Query validation", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["empty string", ""],
            ["whitespace", "   "]
        ])("throws a 400 error for an %s query",
            async (_, query) => {
                await expect(searchLocations(query)).rejects.toMatchObject({
                    message: "Location query is required",
                    statusCode: 400
                });

                expect(Location.findAll).not.toHaveBeenCalled();

                expect(global.fetch).not.toHaveBeenCalled();
            }
        );
    });

    /* =============================
       LOCATION CACHE
    ============================= */

    describe("Location cache", () => {
        it("returns cached locations containing structured address data", async () => {
            const cachedLocations = [{
                id: 1,
                query: "montreal",
                label: "Montréal, Québec, Canada",
                city: "Montréal",
                region: "Québec",
                country: "Canada"
            }];

            Location.findAll.mockResolvedValue(cachedLocations);

            const result = await searchLocations(
                "  Montreal  "
            );

            expect(mockNormalizeString).toHaveBeenCalledWith("  Montreal  ");

            expect(mockNormalizeSearchKey).toHaveBeenCalledWith("Montreal");

            expect(Location.findAll).toHaveBeenCalledWith({
                where: {
                    query: "montreal",
                    provider: "nominatim"
                },
                order: [
                    ["createdAt", "ASC"]
                ]
            });

            expect(result).toBe(cachedLocations);

            expect(global.fetch).not.toHaveBeenCalled();

            expect(Location.findOrCreate).not.toHaveBeenCalled();
        });

        it("searches the provider when cached locations have no structured address data", async () => {
            Location.findAll.mockResolvedValue([{
                id: 1,
                query: "montreal",
                label: "Montreal",
                streetAddress: null,
                city: null,
                region: null,
                postalCode: null,
                country: null
            }]);

            const providerResult = {
                display_name: "Montréal, Québec, Canada",
                lat: "45.5031824",
                lon: "-73.5698065",
                address: {
                    city: "Montréal",
                    state: "Québec",
                    country: "Canada"
                }
            };

            const normalizedLocation = {
                query: "montreal",
                label: "Montréal, Québec, Canada",
                streetAddress: null,
                city: "Montréal",
                region: "Québec",
                postalCode: null,
                country: "Canada",
                latitude: 45.5031824,
                longitude: -73.5698065,
                provider: "nominatim"
            };

            global.fetch.mockResolvedValue(
                createProviderResponse({
                    results: [providerResult]
                })
            );

            mockNormalizeLocation.mockReturnValue(normalizedLocation);

            Location.findOrCreate.mockResolvedValue([
                normalizedLocation,
                true
            ]);

            const result = await searchLocations(
                "Montreal"
            );

            expect(global.fetch).toHaveBeenCalledTimes(1);

            expect(result).toEqual([
                normalizedLocation
            ]);
        });
    });

    /* =============================
       PROVIDER SEARCH
    ============================= */

    describe("Provider search", () => {
        it("calls Nominatim with the expected URL and headers", async () => {
            Location.findAll.mockResolvedValue([]);

            const providerResult = {
                display_name: "Montreal",
                lat: "45.5",
                lon: "-73.5",
                address: {
                    city: "Montreal"
                }
            };

            const normalizedLocation = {
                query: "montreal",
                label: "Montreal",
                city: "Montreal",
                latitude: 45.5,
                longitude: -73.5,
                provider: "nominatim"
            };

            global.fetch.mockResolvedValue(
                createProviderResponse({
                    results: [providerResult]
                })
            );

            mockNormalizeLocation.mockReturnValue(normalizedLocation);

            Location.findOrCreate.mockResolvedValue([
                normalizedLocation,
                true
            ]);

            await searchLocations("Montreal");

            expect(
                mockBuildNominatimSearchParams
            ).toHaveBeenCalledWith("Montreal");

            expect(global.fetch).toHaveBeenCalledWith(
                "https://nominatim.example.com/search?q=Montreal",
                {
                    headers: {
                        Accept: "application/json",
                        "User-Agent":
                            "PlanTogether Test"
                    }
                }
            );
        });

        it("tries fallback queries until locations are found", async () => {
            Location.findAll.mockResolvedValue([]);

            mockBuildLocationSearchQueries.mockReturnValue([
                "123 Main Street Montreal",
                "Montreal"
            ]);

            const providerResult = {
                display_name: "Montréal, Québec, Canada",
                lat: "45.5",
                lon: "-73.5",
                address: {
                    city: "Montréal"
                }
            };

            const normalizedLocation = {
                query: "123 main street montreal",
                label: "Montréal, Québec, Canada",
                city: "Montréal",
                latitude: 45.5,
                longitude: -73.5,
                provider: "nominatim"
            };

            global.fetch
                .mockResolvedValueOnce(
                    createProviderResponse({
                        results: []
                    })
                )
                .mockResolvedValueOnce(
                    createProviderResponse({
                        results: [providerResult]
                    })
                );

            mockNormalizeLocation.mockReturnValue(normalizedLocation);

            Location.findOrCreate.mockResolvedValue([
                normalizedLocation,
                true
            ]);

            const result = await searchLocations(
                "123 Main Street Montreal"
            );

            expect(global.fetch).toHaveBeenCalledTimes(2);

            expect(mockNormalizeLocation).toHaveBeenCalledWith(
                "123 Main Street Montreal",
                providerResult
            );

            expect(result).toEqual([
                normalizedLocation
            ]);
        });

        it("throws a 404 error when all provider queries return no results", async () => {
            Location.findAll.mockResolvedValue([]);

            mockBuildLocationSearchQueries.mockReturnValue([
                "Unknown Street",
                "Unknown City"
            ]);

            global.fetch.mockResolvedValue(
                createProviderResponse({
                    results: []
                })
            );

            await expect(searchLocations("Unknown Street")).rejects.toMatchObject({
                message: "Location not found",
                statusCode: 404
            });

            expect(global.fetch).toHaveBeenCalledTimes(2);

            expect(Location.findOrCreate).not.toHaveBeenCalled();
        });
    });

    /* =============================
       PROVIDER ERRORS
    ============================= */

    describe("Provider errors", () => {
        beforeEach(() => {
            Location.findAll.mockResolvedValue([]);
        });

        it("throws a 429 error when the provider rate limit is exceeded", async () => {
            global.fetch.mockResolvedValue(
                createProviderResponse({
                    ok: false,
                    status: 429
                })
            );

            await expect(searchLocations("Montreal")).rejects.toMatchObject({
                message: "Location search rate limit exceeded. Please try again later.",
                statusCode: 429
            });

            expect(Location.findOrCreate).not.toHaveBeenCalled();
        });

        it("throws a 502 error for unsuccessful provider responses", async () => {
            global.fetch.mockResolvedValue(
                createProviderResponse({
                    ok: false,
                    status: 500
                })
            );

            await expect(searchLocations("Montreal")).rejects.toMatchObject({
                message: "Location search service unavailable",
                statusCode: 502
            });
        });

        it("throws a 502 error for network failures", async () => {
            global.fetch.mockRejectedValue(new Error("Network unavailable"));

            await expect(searchLocations("Montreal")).rejects.toMatchObject({
                message: "Location search service unavailable",
                statusCode: 502
            });
        });

        it("throws a 502 error for invalid JSON responses", async () => {
            const response = createProviderResponse();

            response.json.mockRejectedValue(new Error("Invalid JSON"));

            global.fetch.mockResolvedValue(response);

            await expect(searchLocations("Montreal")).rejects.toMatchObject({
                message: "Location search service unavailable",
                statusCode: 502
            });
        });
    });

    /* =============================
       LOCATION CACHE PERSISTENCE
    ============================= */

    describe("Location cache persistence", () => {
        it("creates new cache entries and refreshes existing entries", async () => {
            Location.findAll.mockResolvedValue([]);

            const providerResults = [{
                display_name: "Montreal",
                lat: "45.5",
                lon: "-73.5"
            }, {
                display_name: "Montreal East",
                lat: "45.6",
                lon: "-73.4"
            }];

            const newLocation = {
                query: "montreal",
                label: "Montreal",
                streetAddress: null,
                city: "Montreal",
                region: "Quebec",
                postalCode: null,
                country: "Canada",
                latitude: 45.5,
                longitude: -73.5,
                provider: "nominatim"
            };

            const refreshedLocationData = {
                query: "montreal",
                label: "Montreal East",
                streetAddress: "Main Street",
                city: "Montreal",
                region: "Quebec",
                postalCode: "H1A 1A1",
                country: "Canada",
                latitude: 45.6,
                longitude: -73.4,
                provider: "nominatim"
            };

            const existingLocation = {
                id: 2,
                update: jest.fn().mockResolvedValue()
            };

            global.fetch.mockResolvedValue(
                createProviderResponse({
                    results: providerResults
                })
            );

            mockNormalizeLocation
                .mockReturnValueOnce(newLocation)
                .mockReturnValueOnce(refreshedLocationData);

            Location.findOrCreate
                .mockResolvedValueOnce([
                    newLocation,
                    true
                ])
                .mockResolvedValueOnce([
                    existingLocation,
                    false
                ]);

            const result = await searchLocations(
                "Montreal"
            );

            expect(Location.findOrCreate).toHaveBeenNthCalledWith(
                1,
                {
                    where: {
                        query: "montreal",
                        provider: "nominatim",
                        latitude: 45.5,
                        longitude: -73.5
                    },
                    defaults: newLocation
                }
            );

            expect(Location.findOrCreate).toHaveBeenNthCalledWith(
                2,
                {
                    where: {
                        query: "montreal",
                        provider: "nominatim",
                        latitude: 45.6,
                        longitude: -73.4
                    },
                    defaults:
                        refreshedLocationData
                }
            );

            expect(existingLocation.update).toHaveBeenCalledWith({
                label: "Montreal East",
                streetAddress: "Main Street",
                city: "Montreal",
                region: "Quebec",
                postalCode: "H1A 1A1",
                country: "Canada"
            });

            expect(result).toEqual([
                newLocation,
                existingLocation
            ]);
        });
    });
});
