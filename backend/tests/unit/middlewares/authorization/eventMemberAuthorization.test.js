/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/models/eventModel", () => ({}));

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const {
    authorizeEventMemberRoleUpdate,
    authorizeEventMemberRemoval
} = require("../../../../src/middlewares/authorization/eventMemberAuthorization");

const { findEventByIdOrFail } = require("../../../../src/utils/events/eventQueries");
const { findActiveMembership } = require("../../../../src/utils/eventMemberships/eventMembershipQueries");

const {
    createEventMemberAuthorizationMocks,
    expectNoResponseSent
} = require("../../../helpers/express/expressTestHelper");

const {
    createMockMembershipEvent,
    createMockMembership
} = require("../../../factories/eventMembershipFactory");

/* ==========================================================================
   Event Member Authorization Middleware Unit Tests

   Tests event member management authorization.

   Responsibilities
   - Test member role update permissions
   - Test member removal permissions
   - Test event creator protections
   - Test organizer and co-organizer restrictions
   - Test target membership reuse
   - Test unexpected dependency errors

   Notes
   - Membership and event lookup utilities are mocked.
   - Authorization errors are forwarded to next().
=========================================================================== */

describe("event member authorization middleware", () => {
    const mockMembershipLookups = (requesterMembership, targetMembership) => {
        findActiveMembership
            .mockResolvedValueOnce(requesterMembership)
            .mockResolvedValueOnce(targetMembership);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       ROLE UPDATE SUCCESS
    ============================= */

    describe("authorizeEventMemberRoleUpdate success", () => {
        it("allows an organizer to update a member role", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2",
                newRole: EVENT_ROLES.CO_ORGANIZER
            });

            const requesterMembership = createMockMembership({
                userId: 10,
                role: EVENT_ROLES.ORGANIZER
            });

            const targetMembership = createMockMembership({
                userId: 2,
                role: EVENT_ROLES.PARTICIPANT
            });

            mockMembershipLookups(requesterMembership, targetMembership);

            const event = createMockMembershipEvent();

            findEventByIdOrFail.mockResolvedValue(event);

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(findActiveMembership).toHaveBeenNthCalledWith(1, EventUserRole, {
                eventId: "1",
                userId: 10
            });

            expect(findActiveMembership).toHaveBeenNthCalledWith(2, EventUserRole, {
                eventId: "1",
                userId: 2
            });

            expect(findEventByIdOrFail).toHaveBeenCalledWith(Event, "1");

            expect(req.targetMembership).toBe(targetMembership);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();

            expectNoResponseSent(res);
        });
    });

    /* =============================
       ROLE UPDATE PERMISSION ERRORS
    ============================= */

    describe("authorizeEventMemberRoleUpdate permission errors", () => {
        it.each([[
            "missing membership",
            null
        ], [
            "participant membership",
            createMockMembership({
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT
            })
        ], [
            "co-organizer membership",
            createMockMembership({
                userId: 10,
                role: EVENT_ROLES.CO_ORGANIZER
            })
        ]])(
            "forwards 403 for requester with %s", async (_, requesterMembership) => {
                const { req, res, next } = createEventMemberAuthorizationMocks();

                findActiveMembership.mockResolvedValueOnce(requesterMembership);

                await authorizeEventMemberRoleUpdate(req, res, next);

                expect(findActiveMembership).toHaveBeenCalledTimes(1);

                expect(findEventByIdOrFail).not.toHaveBeenCalled();

                expect(req.targetMembership).toBeUndefined();

                expect(next).toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 403,
                        message: "Only the organizer can update member roles"
                    })
                );

                expectNoResponseSent(res);
            }
        );

        it("forwards 404 when target membership is not found", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                }),
                null
            );

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(findEventByIdOrFail).not.toHaveBeenCalled();

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 404,
                    message: "Target membership not found"
                })
            );
        });

        it("prevents changing the event creator role", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            const targetMembership = createMockMembership({
                userId: 2,
                role: EVENT_ROLES.PARTICIPANT
            });

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                }),
                targetMembership
            );

            findEventByIdOrFail.mockResolvedValue(
                createMockMembershipEvent({
                    creatorId: 2
                })
            );

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(req.targetMembership).toBeUndefined();

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "You cannot change the role of the event creator"
                })
            );
        });

        it("prevents assigning a second organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2",
                newRole: EVENT_ROLES.ORGANIZER
            });

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                }),
                createMockMembership({
                    userId: 2,
                    role: EVENT_ROLES.PARTICIPANT
                })
            );

            findEventByIdOrFail.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(req.targetMembership).toBeUndefined();

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "Only one organizer is allowed per event"
                })
            );
        });
    });

    /* =============================
       ROLE UPDATE DEPENDENCY ERRORS
    ============================= */

    describe("authorizeEventMemberRoleUpdate dependency errors", () => {
        it("forwards membership lookup errors", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            const lookupError = new Error("Membership lookup failed");

            findActiveMembership.mockRejectedValue(lookupError);

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(lookupError);
        });

        it("forwards event lookup errors", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                }),
                createMockMembership({
                    userId: 2,
                    role: EVENT_ROLES.PARTICIPANT
                })
            );

            const lookupError = new Error("Event lookup failed");

            findEventByIdOrFail.mockRejectedValue(lookupError);

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(lookupError);
        });
    });

    /* =============================
       MEMBER REMOVAL SUCCESS
    ============================= */

    describe("authorizeEventMemberRemoval success", () => {
        it.each([
            EVENT_ROLES.ORGANIZER,
            EVENT_ROLES.CO_ORGANIZER
        ])(
            "allows a %s to remove a participant", async (requesterRole) => {
                const { req, res, next } = createEventMemberAuthorizationMocks({
                    targetUserId: "2"
                });

                const targetMembership = createMockMembership({
                    userId: 2,
                    role: EVENT_ROLES.PARTICIPANT
                });

                mockMembershipLookups(
                    createMockMembership({
                        userId: 10,
                        role: requesterRole
                    }),
                    targetMembership
                );

                findEventByIdOrFail.mockResolvedValue(createMockMembershipEvent());

                await authorizeEventMemberRemoval(req, res, next);

                expect(req.targetMembership).toBe(targetMembership);

                expect(next).toHaveBeenCalledTimes(1);
                expect(next).toHaveBeenCalledWith();

                expectNoResponseSent(res);
            }
        );

        it("allows an organizer to remove a co-organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            const targetMembership = createMockMembership({
                userId: 2,
                role: EVENT_ROLES.CO_ORGANIZER
            });

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                }),
                targetMembership
            );

            findEventByIdOrFail.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(req.targetMembership).toBe(targetMembership);

            expect(next).toHaveBeenCalledWith();
        });
    });

    /* =============================
       MEMBER REMOVAL PERMISSION ERRORS
    ============================= */

    describe("authorizeEventMemberRemoval permission errors", () => {
        it.each([[
            "missing membership",
            null
        ], [
            "participant membership",
            createMockMembership({
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT
            })
        ]])(
            "forwards 403 for requester with %s", async (_, requesterMembership) => {
                const { req, res, next } = createEventMemberAuthorizationMocks();

                findActiveMembership.mockResolvedValueOnce(requesterMembership);

                await authorizeEventMemberRemoval(req, res, next);

                expect(findActiveMembership).toHaveBeenCalledTimes(1);

                expect(findEventByIdOrFail).not.toHaveBeenCalled();

                expect(next).toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 403,
                        message: "Only organizers and co-organizers can remove members"
                    })
                );
            }
        );

        it("forwards 404 when target membership is not found", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                }),
                null
            );

            await authorizeEventMemberRemoval(req, res, next);

            expect(findEventByIdOrFail).not.toHaveBeenCalled();

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 404,
                    message: "Target membership not found"
                })
            );
        });

        it("prevents removing the event creator", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                }),
                createMockMembership({
                    userId: 2,
                    role: EVENT_ROLES.PARTICIPANT
                })
            );

            findEventByIdOrFail.mockResolvedValue(
                createMockMembershipEvent({
                    creatorId: 2
                })
            );

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "You cannot remove the event creator"
                })
            );
        });

        it("prevents self-removal through the management route", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                requesterUserId: 10,
                targetUserId: "10"
            });

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                }),
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.PARTICIPANT
                })
            );

            findEventByIdOrFail.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "You cannot remove yourself from the event"
                })
            );
        });

        it("prevents removing an organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                }),
                createMockMembership({
                    userId: 2,
                    role: EVENT_ROLES.ORGANIZER
                })
            );

            findEventByIdOrFail.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "Organizer cannot be removed"
                })
            );
        });

        it("prevents a co-organizer from removing another co-organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.CO_ORGANIZER
                }),
                createMockMembership({
                    userId: 2,
                    role: EVENT_ROLES.CO_ORGANIZER
                })
            );

            findEventByIdOrFail.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "Co-organizers cannot remove other co-organizers"
                })
            );
        });
    });

    /* =============================
       MEMBER REMOVAL DEPENDENCY ERRORS
    ============================= */

    describe("authorizeEventMemberRemoval dependency errors", () => {
        it("forwards membership lookup errors", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            const lookupError = new Error("Membership lookup failed");

            findActiveMembership.mockRejectedValue(lookupError);

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(lookupError);
        });

        it("forwards event lookup errors", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            mockMembershipLookups(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                }),
                createMockMembership({
                    userId: 2,
                    role: EVENT_ROLES.PARTICIPANT
                })
            );

            const lookupError = new Error("Event lookup failed");

            findEventByIdOrFail.mockRejectedValue(lookupError);

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(lookupError);
        });
    });
});
