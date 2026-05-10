/* ==================================================
   EVENT MEMBER AUTHORIZATION MIDDLEWARE TESTS

   Tests:
   - role change authorization
   - member removal authorization
   - protected creator rules
   - protected organizer rules
   - co-organizer restrictions
   - unexpected database error handling

   Ensures:
   - event role hierarchy is enforced
   - unauthorized role changes are rejected
   - unauthorized removals are rejected
   - valid actions continue with next()

   Notes:
   - shared event role constants are used for valid role scenarios
================================================== */

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const { authorizeEventMemberRoleUpdate, authorizeEventMemberRemoval } = require("../../../../src/middlewares/authorization/eventMemberAuthorization");
const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { createEventMemberAuthorizationMocks } = require("../../../helpers/express/mockExpress");
const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

const { createMockEvent, createMockMembership } = require("../../../factories/membershipFactory");

jest.mock("../../../../src/models/eventModel.js", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));


describe("eventMemberAuthorization middleware", () => {

    mockConsoleError();

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

            Event.findByPk.mockResolvedValue(createMockEvent());

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        /* =============================
           ROLE UPDATE AUTHORIZATION ERRORS
        ============================= */

        it("should return 403 when requester is not organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne.mockResolvedValueOnce(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.CO_ORGANIZER
                })
            );

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Only the organizer can update member roles"
            });

            expect(next).not.toHaveBeenCalled();
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
                createMockEvent({
                    creatorId: 2
                })
            );

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "You cannot change the role of the event creator"
            });

            expect(next).not.toHaveBeenCalled();
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

            Event.findByPk.mockResolvedValue(createMockEvent());

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Only one organizer is allowed per event"
            });

            expect(next).not.toHaveBeenCalled();
        });

        /* =============================
           ROLE UPDATE EDGE CASES
        ============================= */

        it("should return 404 when event is not found", async () => {
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

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Event not found"
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("should return 404 when target membership is not found", async () => {
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

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Target membership not found"
            });

            expect(next).not.toHaveBeenCalled();
        });

        /* =============================
           ROLE UPDATE DATABASE ERRORS
        ============================= */

        it("should return 500 on unexpected database error", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne.mockRejectedValue(new Error("DB error"));

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Internal server error"
            });

            expect(next).not.toHaveBeenCalled();
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

            Event.findByPk.mockResolvedValue(createMockEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalled();
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

            Event.findByPk.mockResolvedValue(createMockEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        /* =============================
            MEMBER REMOVAL AUTHORIZATION ERRORS
        ============================= */

        it("should return 403 when requester is not organizer or co_organizer", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne.mockResolvedValueOnce(
                createMockMembership({
                    userId: 10,
                    role: EVENT_ROLES.PARTICIPANT
                })
            );

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
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
                createMockEvent({
                    creatorId: 2
                })
            );

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "You cannot remove the event creator"
            });

            expect(next).not.toHaveBeenCalled();
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

            Event.findByPk.mockResolvedValue(createMockEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Organizer cannot be removed"
            });

            expect(next).not.toHaveBeenCalled();
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

            Event.findByPk.mockResolvedValue(createMockEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "You cannot remove yourself from the event"
            });

            expect(next).not.toHaveBeenCalled();
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

            Event.findByPk.mockResolvedValue(createMockEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Co-organizers cannot remove other co-organizers"
            });

            expect(next).not.toHaveBeenCalled();
        });

        /* =============================
           MEMBER REMOVAL EDGE CASES
        ============================= */

        it("should return 404 when event is not found", async () => {
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

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Event not found"
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("should return 404 when target membership is not found", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMockMembership({
                        userId: 10,
                        role: EVENT_ROLES.ORGANIZER
                    })
                )
                .mockResolvedValueOnce(null);

            Event.findByPk.mockReset();

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Target membership not found"
            });

            expect(next).not.toHaveBeenCalled();
        });

        /* =============================
           MEMBER REMOVAL DATABASE ERRORS
        ============================= */

        it("should return 500 on unexpected database error", async () => {
            const { req, res, next } = createEventMemberAuthorizationMocks();

            EventUserRole.findOne.mockRejectedValue(new Error("DB error"));

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Internal server error"
            });

            expect(next).not.toHaveBeenCalled();
        });
    });
});
