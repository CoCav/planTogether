/* ==================================================
   EVENT MEMBER AUTHORIZATION MIDDLEWARE TESTS

   Tests:
   - role change authorization
   - member removal authorization
   - protected creator rules
   - protected organizer rules
   - co-organizer restrictions
   - unexpected database errors

   Ensures:
   - event role hierarchy is enforced
   - unauthorized role changes are rejected
   - unauthorized removals are rejected
   - valid actions continue with next()
================================================== */

const Event = require("../../../src/models/eventModel");
const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");

const { authorizeEventMemberRoleUpdate, authorizeEventMemberRemoval } = require("../../../src/middlewares/eventMemberAuthorization");

jest.mock("../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

const createMocks = ({ eventId = "1", targetUserId = "2", requesterUserId = 10, newRole = "co_organizer" } = {}) => {
    const req = {
        params: {
            eventId,
            userId: targetUserId
        },
        user: {
            userId: requesterUserId
        },
        body: {
            newRole
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return { req, res, next };
};

const createEvent = (overrides = {}) => ({
    id: 1,
    creatorId: 99,
    ...overrides
});

const createMembership = (overrides = {}) => ({
    eventId: 1,
    userId: 1,
    role: "participant",
    ...overrides
});

describe("eventMemberAuthorization middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    /* =============================
       ROLE UPDATE AUTHORIZATION
    ============================= */

    describe("authorizeEventMemberRoleUpdate", () => {
        it("should return 403 when requester is not organizer", async () => {
            const { req, res, next } = createMocks();

            EventUserRole.findOne.mockResolvedValueOnce(
                createMembership({
                    userId: 10,
                    role: "co_organizer"
                })
            );

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Only the organizer can update member roles" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 404 when event is not found", async () => {
            const { req, res, next } = createMocks();

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 2,
                        role: "participant"
                    })
                );

            Event.findByPk.mockResolvedValue(null);

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 404 when target membership is not found", async () => {
            const { req, res, next } = createMocks();

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(null);

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Target membership not found"
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should prevent changing the event creator role", async () => {
            const { req, res, next } = createMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 2,
                        role: "participant"
                    })
                );

            Event.findByPk.mockResolvedValue(
                createEvent({
                    creatorId: 2
                })
            );

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "You cannot change the role of the event creator" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should prevent promoting a member to organizer", async () => {
            const { req, res, next } = createMocks({
                targetUserId: "2",
                newRole: "organizer"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 2,
                        role: "participant"
                    })
                );

            Event.findByPk.mockResolvedValue(createEvent());

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Only one organizer is allowed per event" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next when organizer updates participant role", async () => {
            const { req, res, next } = createMocks({
                targetUserId: "2",
                newRole: "co_organizer"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 2,
                        role: "participant"
                    })
                );

            Event.findByPk.mockResolvedValue(createEvent());

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it("should return 500 on unexpected error", async () => {
            const { req, res, next } = createMocks();

            EventUserRole.findOne.mockRejectedValue(new Error("DB error"));

            await authorizeEventMemberRoleUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
            expect(next).not.toHaveBeenCalled();
        });
    });

    /* =============================
       MEMBER REMOVAL AUTHORIZATION
    ============================= */

    describe("authorizeEventMemberRemoval", () => {
        it("should return 403 when requester is not organizer or co_organizer", async () => {
            const { req, res, next } = createMocks();

            EventUserRole.findOne.mockResolvedValueOnce(
                createMembership({
                    userId: 10,
                    role: "participant"
                })
            );

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 404 when event is not found", async () => {
            const { req, res, next } = createMocks();

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 2,
                        role: "participant"
                    })
                );

            Event.findByPk.mockResolvedValue(null);

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 404 when target membership is not found", async () => {
            const { req, res, next } = createMocks();

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(null);

            Event.findByPk.mockReset();

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Target membership not found"
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("should prevent removing the event creator", async () => {
            const { req, res, next } = createMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 2,
                        role: "participant"
                    })
                );

            Event.findByPk.mockResolvedValue(
                createEvent({
                    creatorId: 2
                })
            );

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "You cannot remove the event creator" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should prevent removing organizer", async () => {
            const { req, res, next } = createMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 2,
                        role: "organizer"
                    })
                );

            Event.findByPk.mockResolvedValue(createEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Organizer cannot be removed" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should prevent self-removal through admin route", async () => {
            const { req, res, next } = createMocks({
                requesterUserId: 10,
                targetUserId: "10"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "participant"
                    })
                );

            Event.findByPk.mockResolvedValue(createEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "You cannot remove yourself from the event" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should allow organizer to remove participant", async () => {
            const { req, res, next } = createMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 2,
                        role: "participant"
                    })
                );

            Event.findByPk.mockResolvedValue(createEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it("should allow co_organizer to remove participant", async () => {
            const { req, res, next } = createMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "co_organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 2,
                        role: "participant"
                    })
                );

            Event.findByPk.mockResolvedValue(createEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it("should prevent co_organizer from removing another co_organizer", async () => {
            const { req, res, next } = createMocks({
                targetUserId: "2"
            });

            EventUserRole.findOne
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 10,
                        role: "co_organizer"
                    })
                )
                .mockResolvedValueOnce(
                    createMembership({
                        userId: 2,
                        role: "co_organizer"
                    })
                );

            Event.findByPk.mockResolvedValue(createEvent());

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Co-organizers cannot remove other co-organizers" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 500 on unexpected error", async () => {
            const { req, res, next } = createMocks();

            EventUserRole.findOne.mockRejectedValue(new Error("DB error"));

            await authorizeEventMemberRemoval(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
            expect(next).not.toHaveBeenCalled();
        });
    });
});
