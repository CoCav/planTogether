const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const mockJoinEvent = jest.fn();
const mockLeaveEvent = jest.fn();
const mockGetEventMembers = jest.fn();
const mockGetEventStaff = jest.fn();
const mockUpdateEventMemberRole = jest.fn();
const mockRemoveEventMember = jest.fn();
const mockTransferEventOwnership = jest.fn();

const mockAuthenticateToken = jest.fn();
const mockHandleValidationErrors = jest.fn();

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

const mockAuthorizeEventMemberRoleUpdate = jest.fn();
const mockAuthorizeEventMemberRemoval = jest.fn();

const mockEventIdParamValidator = jest.fn();
const mockUpdateEventMemberRoleValidator = jest.fn();
const mockRemoveEventMemberValidator = jest.fn();
const mockTransferEventOwnershipValidator = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/controllers/eventMembershipController", () => ({
    joinEvent: mockJoinEvent,
    leaveEvent: mockLeaveEvent,
    getEventMembers: mockGetEventMembers,
    getEventStaff: mockGetEventStaff,
    updateEventMemberRole: mockUpdateEventMemberRole,
    removeEventMember: mockRemoveEventMember,
    transferEventOwnership: mockTransferEventOwnership
}));

jest.mock("../../../src/middlewares/auth/authenticateToken", () => ({
    authenticateToken: mockAuthenticateToken
}));

jest.mock("../../../src/middlewares/authorization/authorizeEventRole", () => mockAuthorizeEventRole);

jest.mock("../../../src/middlewares/authorization/eventMemberAuthorization", () => ({
    authorizeEventMemberRoleUpdate: mockAuthorizeEventMemberRoleUpdate,
    authorizeEventMemberRemoval: mockAuthorizeEventMemberRemoval
}));

jest.mock("../../../src/middlewares/errors/handleValidationErrors", () => mockHandleValidationErrors);

jest.mock("../../../src/validators/eventMembershipValidator", () => ({
    eventIdParamValidator: mockEventIdParamValidator,
    updateEventMemberRoleValidator: mockUpdateEventMemberRoleValidator,
    removeEventMemberValidator: mockRemoveEventMemberValidator,
    transferEventOwnershipValidator: mockTransferEventOwnershipValidator
}));

/* =============================
   TEST IMPORTS
============================= */

const eventMembershipRoutes = require("../../../src/routes/eventMembershipRoutes");

const { expectRoute } = require("../../helpers/express/routeTestHelper");

/* ==========================================================================
   Event Membership Routes Unit Tests

   Tests event membership route configuration.

   Responsibilities
   - Test join and leave route composition
   - Test member and staff retrieval routes
   - Test member role update authorization
   - Test member removal authorization
   - Test ownership transfer authorization
   - Test route handler ordering

   Notes
   - Controllers, validators and middlewares are mocked.
   - HTTP behavior remains covered by event membership integration tests.
=========================================================================== */

describe("event membership routes", () => {

    /* =============================
       JOIN AND LEAVE ROUTES
    ============================= */

    describe("Join and leave routes", () => {
        it("registers POST /:eventId/members/join", () => {
            expectRoute(eventMembershipRoutes, {
                method: "post",
                path: "/:eventId/members/join",
                handlers: [
                    mockAuthenticateToken,
                    mockEventIdParamValidator,
                    mockHandleValidationErrors,
                    mockJoinEvent
                ]
            });
        });

        it("registers DELETE /:eventId/members/leave", () => {
            expectRoute(eventMembershipRoutes, {
                method: "delete",
                path: "/:eventId/members/leave",
                handlers: [
                    mockAuthenticateToken,
                    mockEventIdParamValidator,
                    mockHandleValidationErrors,
                    mockLeaveEvent
                ]
            });
        });
    });

    /* =============================
       MEMBER AND STAFF ROUTES
    ============================= */

    describe("Member and staff routes", () => {
        it("registers GET /:eventId/members", () => {
            expectRoute(eventMembershipRoutes, {
                method: "get",
                path: "/:eventId/members",
                handlers: [
                    mockEventIdParamValidator,
                    mockHandleValidationErrors,
                    mockGetEventMembers
                ]
            });
        });

        it("registers GET /:eventId/staff", () => {
            expectRoute(eventMembershipRoutes, {
                method: "get",
                path: "/:eventId/staff",
                handlers: [
                    mockEventIdParamValidator,
                    mockHandleValidationErrors,
                    mockGetEventStaff
                ]
            });
        });
    });

    /* =============================
       MEMBER ROLE ROUTE
    ============================= */

    describe("PUT /:eventId/members/:userId/role", () => {
        it("registers the expected handlers in order", () => {
            expectRoute(eventMembershipRoutes, {
                method: "put",
                path: "/:eventId/members/:userId/role",
                handlers: [
                    mockAuthenticateToken,
                    mockUpdateEventMemberRoleValidator,
                    mockHandleValidationErrors,
                    mockAuthorizeOrganizer,
                    mockAuthorizeEventMemberRoleUpdate,
                    mockUpdateEventMemberRole
                ]
            });
        });
    });

    /* =============================
       MEMBER REMOVAL ROUTE
    ============================= */

    describe("DELETE /:eventId/members/:userId", () => {
        it("registers the expected handlers in order", () => {
            expectRoute(eventMembershipRoutes, {
                method: "delete",
                path: "/:eventId/members/:userId",
                handlers: [
                    mockAuthenticateToken,
                    mockRemoveEventMemberValidator,
                    mockHandleValidationErrors,
                    mockAuthorizeStaff,
                    mockAuthorizeEventMemberRemoval,
                    mockRemoveEventMember
                ]
            });
        });
    });

    /* =============================
       OWNERSHIP TRANSFER ROUTE
    ============================= */

    describe("PUT /:eventId/ownership", () => {
        it("registers the expected handlers in order", () => {
            expectRoute(eventMembershipRoutes, {
                method: "put",
                path: "/:eventId/ownership",
                handlers: [
                    mockAuthenticateToken,
                    mockTransferEventOwnershipValidator,
                    mockHandleValidationErrors,
                    mockAuthorizeOrganizer,
                    mockTransferEventOwnership
                ]
            });
        });
    });
});
