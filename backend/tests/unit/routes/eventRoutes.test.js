/* =============================
   MOCK FUNCTIONS
============================= */

const mockCreateEvent = jest.fn();
const mockGetAllEvents = jest.fn();
const mockGetCurrentUserEventAccess = jest.fn();
const mockGetEvent = jest.fn();
const mockUpdateEvent = jest.fn();
const mockDeleteEvent = jest.fn();

const mockAuthenticateToken = jest.fn();
const mockResolveCurrentUser = jest.fn();
const mockHandleValidationErrors = jest.fn();

const mockUploadEventImageMiddleware = jest.fn();
const mockUploadEventImageSingle = jest.fn(() => mockUploadEventImageMiddleware);

const mockAuthorizeOrganizer = jest.fn();
const mockAuthorizeStaff = jest.fn();

const mockAuthorizeEventRole = jest.fn(
    (allowedRoles) => {
        if (
            allowedRoles.length === 1 &&
            allowedRoles[0] === EVENT_ROLES.ORGANIZER
        ) {
            return mockAuthorizeOrganizer;
        }

        return mockAuthorizeStaff;
    }
);

const mockEventIdParamValidator = jest.fn();

const mockCreateEventTitleValidator = jest.fn();
const mockCreateEventDateValidator = jest.fn();

const mockUpdateEventTitleValidator = jest.fn();
const mockUpdateEventDateValidator = jest.fn();

const mockGetAllEventsPageValidator = jest.fn();
const mockGetAllEventsStatusValidator = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/controllers/eventController", () => ({
    createEvent: mockCreateEvent,
    getAllEvents: mockGetAllEvents,
    getCurrentUserEventAccess: mockGetCurrentUserEventAccess,
    getEvent: mockGetEvent,
    updateEvent: mockUpdateEvent,
    deleteEvent: mockDeleteEvent
}));

jest.mock("../../../src/middlewares/auth/authenticateToken", () => ({
    authenticateToken: mockAuthenticateToken
}));

jest.mock("../../../src/middlewares/auth/resolveCurrentUser", () => ({
    resolveCurrentUser: mockResolveCurrentUser
}));

jest.mock("../../../src/middlewares/files/uploadFiles", () => ({
    uploadEventImage: {
        single: mockUploadEventImageSingle
    }
}));

jest.mock("../../../src/middlewares/authorization/authorizeEventRole", () => mockAuthorizeEventRole);

jest.mock("../../../src/middlewares/errors/handleValidationErrors", () => mockHandleValidationErrors);

jest.mock("../../../src/validators/eventValidator", () => ({
    createEventValidator: [
        mockCreateEventTitleValidator,
        mockCreateEventDateValidator
    ],
    updateEventValidator: [
        mockUpdateEventTitleValidator,
        mockUpdateEventDateValidator
    ],
    eventIdParamValidator: mockEventIdParamValidator,
    getAllEventsValidator: [
        mockGetAllEventsPageValidator,
        mockGetAllEventsStatusValidator
    ]
}));

/* =============================
   TEST IMPORTS
============================= */

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const {
    createEventValidator,
    updateEventValidator,
    getAllEventsValidator
} = require("../../../src/validators/eventValidator");

const eventRoutes = require("../../../src/routes/eventRoutes");

const {
    expectRoute,
    expectRouteOrder
} = require("../../helpers/express/routeTestHelper");

/* ==========================================================================
   Event Routes Unit Tests

   Tests event route configuration.

   Responsibilities
   - Test public event listing route composition
   - Test current user event access route composition
   - Test public event detail route composition
   - Test event creation route composition
   - Test event update authorization
   - Test event deletion authorization
   - Test upload field configuration
   - Test event route declaration order

   Notes
   - Controllers, validators and middlewares are mocked.
   - Validator arrays are flattened by the shared route test helper.
   - HTTP behavior remains covered by event integration tests.
=========================================================================== */

describe("event routes", () => {

    /* =============================
       EVENT LISTING ROUTE
    ============================= */

    describe("GET /", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventRoutes, {
                method: "get",
                path: "/",
                handlers: [
                    mockResolveCurrentUser,
                    getAllEventsValidator,
                    mockHandleValidationErrors,
                    mockGetAllEvents
                ]
            });
        });
    });

    /* =============================
       CURRENT USER EVENT ACCESS ROUTE
    ============================= */

    describe("GET /:eventId/me", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventRoutes, {
                method: "get",
                path: "/:eventId/me",
                handlers: [
                    mockAuthenticateToken,
                    mockEventIdParamValidator,
                    mockHandleValidationErrors,
                    mockGetCurrentUserEventAccess
                ]
            });
        });
    });

    /* =============================
       EVENT DETAIL ROUTE
    ============================= */

    describe("GET /:eventId", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventRoutes, {
                method: "get",
                path: "/:eventId",
                handlers: [
                    mockResolveCurrentUser,
                    mockEventIdParamValidator,
                    mockHandleValidationErrors,
                    mockGetEvent
                ]
            });
        });
    });

    /* =============================
       EVENT CREATION ROUTE
    ============================= */

    describe("POST /", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventRoutes, {
                method: "post",
                path: "/",
                handlers: [
                    mockAuthenticateToken,
                    mockUploadEventImageMiddleware,
                    createEventValidator,
                    mockHandleValidationErrors,
                    mockCreateEvent
                ]
            });
        });
    });

    /* =============================
       EVENT UPDATE ROUTE
    ============================= */

    describe("PUT /:eventId", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventRoutes, {
                method: "put",
                path: "/:eventId",
                handlers: [
                    mockAuthenticateToken,
                    mockUploadEventImageMiddleware,
                    mockEventIdParamValidator,
                    updateEventValidator,
                    mockHandleValidationErrors,
                    mockAuthorizeStaff,
                    mockUpdateEvent
                ]
            });
        });
    });

    /* =============================
       EVENT DELETION ROUTE
    ============================= */

    describe("DELETE /:eventId", () => {
        it("registers the expected route handlers in order", () => {
            expectRoute(eventRoutes, {
                method: "delete",
                path: "/:eventId",
                handlers: [
                    mockAuthenticateToken,
                    mockEventIdParamValidator,
                    mockHandleValidationErrors,
                    mockAuthorizeOrganizer,
                    mockDeleteEvent
                ]
            });
        });
    });

    /* =============================
       ROUTE DECLARATION ORDER
    ============================= */

    describe("Route declaration order", () => {
        it("registers current user access before the generic event detail route", () => {
            expectRouteOrder(eventRoutes, [{
                method: "get",
                path: "/"
            }, {
                method: "get",
                path: "/:eventId/me"
            }, {
                method: "get",
                path: "/:eventId"
            }, {
                method: "post",
                path: "/"
            }, {
                method: "put",
                path: "/:eventId"
            }, {
                method: "delete",
                path: "/:eventId"
            }]);
        });
    });
});
