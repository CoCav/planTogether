const mockSearchLocations = jest.fn();

const mockAuthenticateToken = jest.fn();
const mockGeocodingRateLimiter = jest.fn();
const mockHandleValidationErrors = jest.fn();

const mockSearchQueryValidator = jest.fn();
const mockSearchLimitValidator = jest.fn();

const searchLocationsValidator = [
    mockSearchQueryValidator,
    mockSearchLimitValidator
];

const geocodingRoutes = require("../../../src/routes/geocodingRoutes");

const { expectRoute } = require("../../helpers/express/routeTestHelper");

/* ==========================================================================
   Geocoding Routes Unit Tests

   Tests geocoding route configuration.

   Responsibilities
   - Test authenticated location search route composition
   - Test public location search route composition
   - Test geocoding rate limiter usage
   - Test search validation ordering
   - Test route handler ordering

   Notes
   - Controllers, validators and middlewares are mocked.
   - Validator arrays are flattened by the shared route test helper.
   - HTTP behavior remains covered by geocoding integration tests.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/controllers/geocodingController", () => ({
    searchLocations: mockSearchLocations
}));

jest.mock("../../../src/middlewares/auth/authenticateToken", () => ({
    authenticateToken: mockAuthenticateToken
}));

jest.mock("../../../src/middlewares/rateLimiters/geocodingRateLimiter", () => mockGeocodingRateLimiter);

jest.mock("../../../src/middlewares/errors/handleValidationErrors", () => mockHandleValidationErrors);

jest.mock("../../../src/validators/geocodingValidator", () => ({
    searchLocationsValidator
}));

describe("geocoding routes", () => {

    /* =============================
       LOCATION SEARCH ROUTES
    ============================= */

    describe.each([{
        name: "authenticated search",
        path: "/search",
        handlers: [
            mockAuthenticateToken,
            mockGeocodingRateLimiter,
            searchLocationsValidator,
            mockHandleValidationErrors,
            mockSearchLocations
        ]
    }, {
        name: "public search",
        path: "/public-search",
        handlers: [
            mockGeocodingRateLimiter,
            searchLocationsValidator,
            mockHandleValidationErrors,
            mockSearchLocations
        ]
    }])("$name", ({
        path,
        handlers
    }) => {
        it(`registers GET ${path} with the expected handlers`, () => {
            expectRoute(geocodingRoutes, {
                method: "get",
                path,
                handlers
            });
        });
    });
});
