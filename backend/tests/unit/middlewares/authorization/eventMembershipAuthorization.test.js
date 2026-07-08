/* ==================================================
   EVENT MEMBER AUTHORIZATION MIDDLEWARE TESTS

   Tests:
   - active role change authorization
   - active member removal authorization
   - protected creator rules
   - protected organizer rules
   - co-organizer restrictions
   - unexpected database error forwarding

   Ensures:
   - event role hierarchy is enforced for active memberships only
   - inactive memberships are ignored by authorization checks
   - unauthorized role changes are rejected
   - unauthorized removals are rejected
   - valid actions continue with next()
   - authorization errors are forwarded to the global errorHandler

   Notes:
   - shared event role constants are used for valid role scenarios
================================================== */

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { authorizeEventMemberRoleUpdate, authorizeEventMemberRemoval } = require("../../../../src/middlewares/authorization/eventMemberAuthorization");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { createEventMemberAuthorizationMocks } = require("../../../helpers/express/mockExpress");
const { createMockMembershipEvent, createMockMembership } = require("../../../factories/eventMembershipFactory");

jest.mock("../../../../src/models/eventModel.js", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

describe("eventMemberAuthorization middleware", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       ROLE UPDATE AUTHORIZATION
    ============================= */

    describe("authorizeEventMemberRoleUpdate", () => {

        /* =============================
           ROLE UPDATE SUCCESS
        ============================= */

        it("should call next when organizer updates participant role", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2",
                newRole: EVENT_ROLES.CO_ORGANIZER
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 2,
                        role: EVENT_ROLES.PARTICIPANT
                    })
                );

            Event.findByPk.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(EventUserRole.findOne).toHaveBeenNthCalledWith(1, {
                where: {
                    eventId: "1",
                    userId: 10,
                    deletedAt: null
                }
            });

            expect(EventUserRole.findOne).toHaveBeenNthCalledWith(2, {
                where: {
                    eventId: "1",
                    userId: 2,
                    deletedAt: null
                }
            });

            expect(next).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
        });

        /* =============================
           ROLE UPDATE AUTHORIZATION ERRORS
        ============================= */

        it("should forward 403 when requester is not organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne.mockResolvedValueOnce(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.CO_ORGANIZER
                })
            );

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "Only the organizer can update member roles"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        it("should prevent changing the event creator role", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 2,
                        role: EVENT_ROLES.PARTICIPANT
                    })
                );

            Event.findByPk.mockResolvedValue(
                createMockMembershipEvent({
                    creatorId: 2
                })
            );

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "You cannot change the role of the event creator"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        it("should prevent promoting a member to organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2",
                newRole: EVENT_ROLES.ORGANIZER
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 2,
                        role: EVENT_ROLES.PARTICIPANT
                    })
                );

            Event.findByPk.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "Only one organizer is allowed per event"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        /* =============================
           ROLE UPDATE EDGE CASES
        ============================= */

        it("should forward 404 when event is not found", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 2,
                        role: EVENT_ROLES.PARTICIPANT
                    })
                );

            Event.findByPk.mockResolvedValue(null);

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 404,
                    message: "Event not found"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        it("should forward 404 when target membership is not found", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(null);

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 404,
                    message: "Target membership not found"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        /* =============================
           ROLE UPDATE DATABASE ERRORS
        ============================= */

        it("should forward unexpected database errors", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            const error = new Error("DB error");

            EventUserRole.findOne.mockRejectedValue(error);

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(next).toHaveBeenCalledWith(error);

            expect(res.status).not.toHaveBeenCalled();
        });
    });

    /* =============================
       MEMBER REMOVAL AUTHORIZATION
    ============================= */

    describe("authorizeEventMemberRemoval", () => {

        /* =============================
           MEMBER REMOVAL SUCCESS
        ============================= */

        it("should allow organizer to remove participant", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 2,
                        role: EVENT_ROLES.PARTICIPANT
                    })
                );

            Event.findByPk.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(EventUserRole.findOne).toHaveBeenNthCalledWith(1, {
                where: {
                    eventId: "1",
                    userId: 10,
                    deletedAt: null
                }
            });

            expect(EventUserRole.findOne).toHaveBeenNthCalledWith(2, {
                where: {
                    eventId: "1",
                    userId: 2,
                    deletedAt: null
                }
            });

            expect(next).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
        });

        it("should allow co_organizer to remove participant", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.CO_ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 2,
                        role: EVENT_ROLES.PARTICIPANT
                    })
                );

            Event.findByPk.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
        });

        /* =============================
           MEMBER REMOVAL AUTHORIZATION ERRORS
        ============================= */

        it("should forward 403 when requester is not organizer or co_organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne.mockResolvedValueOnce(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.PARTICIPANT
                })
            );

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "Only organizers and co-organizers can remove members"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        it("should prevent removing the event creator", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 2,
                        role: EVENT_ROLES.PARTICIPANT
                    })
                );

            Event.findByPk.mockResolvedValue(
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

            expect(res.status).not.toHaveBeenCalled();
        });

        it("should prevent removing organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 2,
                        role: EVENT_ROLES.ORGANIZER
                    })
                );

            Event.findByPk.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "Organizer cannot be removed"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        it("should prevent self-removal through admin route", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                requesterUserId: 10,
                targetUserId: "10"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.PARTICIPANT
                    })
                );

            Event.findByPk.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "You cannot remove yourself from the event"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        it("should prevent co_organizer from removing another co_organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.CO_ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 2,
                        role: EVENT_ROLES.CO_ORGANIZER
                    })
                );

            Event.findByPk.mockResolvedValue(createMockMembershipEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    message: "Co-organizers cannot remove other co-organizers"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        /* =============================
           MEMBER REMOVAL EDGE CASES
        ============================= */

        it("should forward 404 when event is not found", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 2,
                        role: EVENT_ROLES.PARTICIPANT
                    })
                );

            Event.findByPk.mockResolvedValue(null);

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 404,
                    message: "Event not found"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        it("should forward 404 when target membership is not found", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(null);

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 404,
                    message: "Target membership not found"
                })
            );

            expect(res.status).not.toHaveBeenCalled();
        });

        /* =============================
           MEMBER REMOVAL DATABASE ERRORS
        ============================= */

        it("should forward unexpected database errors", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            const error = new Error("DB error");

            EventUserRole.findOne.mockRejectedValue(error);

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalledWith(error);

            expect(res.status).not.toHaveBeenCalled();
        });
    });
});
