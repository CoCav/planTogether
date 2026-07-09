/* ==================================================
   LOCATION CONTROLLER TESTS

   Tests:
   - location search
   - location search error forwarding

   Ensures:
   - controller calls locationService correctly
   - HTTP responses are properly formatted
   - errors are forwarded to next()
================================================== */

jest.mock("../../../src/services/locationService");

const locationController = require("../../../src/controllers/geocodingController");
const locationService = require("../../../src/services/locationService");

const { createEventControllerMocks } = require("../../helpers/express/expressTestHelper");

describe("geocodingController", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       SEARCH LOCATIONS
    ============================= */

    describe("searchLocations", () => {

        it("should search locations", async () => {
            const { req, res, next } = createEventControllerMocks({
                query: {
                    q: "Montreal"
                }
            });

            const locations = [
                {
                    id: 1,
                    query: "montreal",
                    label: "Montréal, Québec, Canada",
                    latitude: 45.5031824,
                    longitude: -73.5698065,
                    provider: "nominatim"
                }
            ];

            locationService.searchLocations.mockResolvedValue(locations);

            await locationController.searchLocations(req, res, next);

            expect(locationService.searchLocations)
                .toHaveBeenCalledWith("Montreal");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Locations retrieved successfully",
                locations
            });
        });

        it("should forward location search errors to next", async () => {
            const { req, res, next } = createEventControllerMocks({
                query: {
                    q: "Montreal"
                }
            });

            const error = new Error("Location search failed");

            locationService.searchLocations.mockRejectedValue(error);

            await locationController.searchLocations(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
