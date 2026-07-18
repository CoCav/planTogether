/* =============================
   MOCK FUNCTIONS
============================= */

const mockAuthenticatedUserRoutes = jest.fn();
const mockPublicUserRoutes = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/routes/users/authenticatedUserRoutes", () => mockAuthenticatedUserRoutes);
jest.mock("../../../src/routes/users/publicUserRoutes", () => mockPublicUserRoutes);

/* =============================
   TEST IMPORTS
============================= */

const userRoutes = require("../../../src/routes/userRoutes");

const { expectMountedRouters } = require("../../helpers/express/routeTestHelper");

/* ==========================================================================
   User Routes Unit Tests

   Tests user subrouter composition.

   Responsibilities
   - Test authenticated user route mounting
   - Test public user route mounting
   - Test user subrouter declaration order

   Notes
   - User subrouters are mocked.
   - Authenticated routes must be mounted before public parameterized routes.
   - HTTP behavior remains covered by user integration tests.
=========================================================================== */

describe("user routes", () => {

    /* =============================
       SUBROUTER MOUNTING
    ============================= */

    describe("User subrouters", () => {
        it("mounts authenticated routes before public routes", () => {
            expectMountedRouters(userRoutes, [
                mockAuthenticatedUserRoutes,
                mockPublicUserRoutes
            ]);
        });
    });
});
