/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/services/geocodingService");

/* =============================
   TEST IMPORTS
============================= */

const geocodingService = require("../../../src/services/geocodingService");

const geocodingController = require("../../../src/controllers/geocodingController");

const {
    createMockReqResNext,
    expectNoResponseSent,
    expectJsonResponse
} = require("../../helpers/express/expressTestHelper");

/* ==========================================================================
   Geocoding Controller Unit Tests

   Tests location search request handling and responses.

   Responsibilities
   - Test location search query forwarding
   - Test geocoding result responses
   - Test service error forwarding

   Notes
   - Geocoding services are mocked.
   - Cache and provider logic is tested separately in geocodingService tests.
=========================================================================== */

describe("geocoding controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       LOCATION SEARCH
    ============================= */

    describe("searchLocations", () => {
        it("searches locations using the provided query", async () => {
            const { req, res, next } = createMockReqResNext({
                query: {
                    q: "Montreal"
                }
            });

            const locations = [{
                id: 1,
                query: "montreal",
                label: "Montréal, Québec, Canada",
                city: "Montréal",
                region: "Québec",
                country: "Canada",
                latitude: 45.5031824,
                longitude: -73.5698065,
                provider: "nominatim"
            }];

            geocodingService.searchLocations.mockResolvedValue(locations);

            await geocodingController.searchLocations(req, res, next);

            expect(geocodingService.searchLocations).toHaveBeenCalledTimes(1);
            expect(geocodingService.searchLocations).toHaveBeenCalledWith("Montreal");

            expectJsonResponse(res, 200, {
                success: true,
                message: "Locations retrieved successfully",
                locations
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards location search errors to next", async () => {
            const { req, res, next } = createMockReqResNext({
                query: {
                    q: "Montreal"
                }
            });

            const error = new Error("Location search failed");

            geocodingService.searchLocations.mockRejectedValue(error);

            await geocodingController.searchLocations(req, res, next);

            expect(geocodingService.searchLocations).toHaveBeenCalledWith("Montreal");

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });
});
