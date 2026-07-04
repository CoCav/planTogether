/* ==================================================
   LOCATION SERVICE - RESOLVE EVENT LOCATION TESTS

   Tests:
   - best event location resolution

   Ensures:
   - event geolocation uses the first available result
================================================== */

jest.mock("../../../../src/models/locationModel", () => ({
    findAll: jest.fn(),
    findOrCreate: jest.fn()
}));

jest.mock("../../../../src/config/geocoding.js", () => ({
    provider: "nominatim",
    nominatim: {
        searchUrl: "https://nominatim.test/search",
        userAgent: "PlanTogetherTest/1.0",
        resultLimit: 5
    }
}));

const Location = require("../../../../src/models/locationModel");

const locationService = require("../../../../src/services/locationService");

describe("locationService - resolveEventLocation", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        global.fetch = jest.fn();
    });

    afterEach(() => {
        delete global.fetch;
    });

    /* =============================
       EVENT LOCATION RESOLUTION
    ============================= */

    it("should resolve the best event location", async () => {
        const cachedLocations = [
            {
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
            },
            {
                id: 2,
                query: "montreal",
                label: "Montréal alternative",
                latitude: 45.5,
                longitude: -73.5,
                provider: "nominatim"
            }
        ];

        Location.findAll.mockResolvedValue(cachedLocations);

        const result = await locationService.resolveEventLocation("Montreal");

        expect(result).toBe(cachedLocations[0]);
    });
});
