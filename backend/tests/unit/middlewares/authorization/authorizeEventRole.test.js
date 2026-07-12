const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const authorizeEventRole = require("../../../../src/middlewares/authorization/authorizeEventRole");

const { findActiveMembership } = require("../../../../src/utils/eventMemberships/eventMembershipQueries");

const {
    createEventRoleMocks,
    expectNoResponseSent
} = require("../../../helpers/express/expressTestHelper");

/* ==========================================================================
   Authorize Event Role Middleware Unit Tests

   Tests event role authorization.

   Responsibilities
   - Test allowed event role authorization
   - Test active membership lookup
   - Test missing event identifier handling
   - Test missing membership handling
   - Test insufficient role handling
   - Test unexpected dependency errors

   Notes
   - Active membership lookup is mocked.
   - Authorization errors are forwarded to next().
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock(
    "../../../../src/models/associations/eventUserRoleModel",
    () => ({
        findOne: jest.fn()
    })
);

jest.mock(
    "../../../../src/utils/eventMemberships/eventMembershipQueries",
    () => ({
        findActiveMembership: jest.fn()
    })
);

describe("authorizeEventRole middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       AUTHORIZATION SUCCESS
    ============================= */

    describe("Allowed event roles", () => {
        it.each([
            EVENT_ROLES.ORGANIZER,
            EVENT_ROLES.CO_ORGANIZER
        ])(
            "attaches membership and continues when %s is allowed",
            async (role) => {
                const { req, res, next } =
                    createEventRoleMocks({
                        eventId: "42",
                        userId: 7
                    });

                const membership = {
                    eventId: 42,
                    userId: 7,
                    role
                };

                findActiveMembership.mockResolvedValue(membership);

                const middleware = authorizeEventRole([
                    EVENT_ROLES.ORGANIZER,
                    EVENT_ROLES.CO_ORGANIZER
                ]);

                await middleware(req, res, next);

                expect(findActiveMembership).toHaveBeenCalledWith(
                    EventUserRole,
                    {
                        eventId: "42",
                        userId: 7
                    }
                );

                expect(req.eventMembership).toBe(membership);

                expect(next).toHaveBeenCalledTimes(1);
                expect(next).toHaveBeenCalledWith();

                expectNoResponseSent(res);
            }
        );
    });

    /* =============================
       EVENT ID ERRORS
    ============================= */

    describe("Event ID validation", () => {
        it.each([
            ["null", null],
            ["undefined", undefined]
        ])(
            "forwards 400 when event ID is %s",
            async (_, eventId) => {
                const { req, res, next } =
                    createEventRoleMocks({
                        eventId
                    });

                const middleware = authorizeEventRole([
                    EVENT_ROLES.ORGANIZER
                ]);

                await middleware(req, res, next);

                expect(findActiveMembership).not.toHaveBeenCalled();

                expect(req.eventMembership).toBeUndefined();

                expect(next).toHaveBeenCalledTimes(1);
                expect(next).toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                        message: "Event ID is required"
                    })
                );

                expectNoResponseSent(res);
            }
        );
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    describe("Membership authorization errors", () => {
        it("forwards 403 when active membership is not found", async () => {
            const { req, res, next } = createEventRoleMocks();

            findActiveMembership.mockResolvedValue(null);

            const middleware = authorizeEventRole([
                EVENT_ROLES.ORGANIZER
            ]);

            await middleware(req, res, next);

            expect(req.eventMembership).toBeUndefined();

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "Forbidden: insufficient event role"
                })
            );

            expectNoResponseSent(res);
        });

        it("forwards 403 when membership role is not allowed", async () => {
            const { req, res, next } = createEventRoleMocks();

            findActiveMembership.mockResolvedValue({
                eventId: 1,
                userId: 1,
                role: EVENT_ROLES.PARTICIPANT
            });

            const middleware = authorizeEventRole([
                EVENT_ROLES.ORGANIZER,
                EVENT_ROLES.CO_ORGANIZER
            ]);

            await middleware(req, res, next);

            expect(req.eventMembership).toBeUndefined();

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "Forbidden: insufficient event role"
                })
            );

            expectNoResponseSent(res);
        });
    });

    /* =============================
       DEPENDENCY ERRORS
    ============================= */

    describe("Dependency errors", () => {
        it("forwards unexpected membership lookup errors", async () => {
            const { req, res, next } = createEventRoleMocks();

            const lookupError = new Error("Membership lookup failed");

            findActiveMembership.mockRejectedValue(lookupError);

            const middleware = authorizeEventRole([
                EVENT_ROLES.ORGANIZER
            ]);

            await middleware(req, res, next);

            expect(req.eventMembership).toBeUndefined();

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(lookupError);

            expectNoResponseSent(res);
        });
    });
});
