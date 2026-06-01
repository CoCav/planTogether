/* ==================================================
   USER SERVICE - GET PUBLIC USER EVENTS BY ID TESTS

   Tests:
   - active created and joined events retrieval
   - active non-organizer membership filtering
   - empty event lists
   - missing user rejection
   - database error propagation

   Ensures:
   - public user events are correctly separated
   - only active non-organizer memberships are included in joined events
   - empty event lists are handled safely
   - missing users and database errors are handled safely
================================================== */

jest.mock("../../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../../src/models/eventModel", () => ({
    findAll: jest.fn()
}));

jest.mock("../../../../../src/models/relations/eventUserRoleModel", () => ({
    findAll: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventQueryBuilder", () => ({
    buildEventWhereConditions: jest.fn(),
    buildEventCreatorInclude: jest.fn(() => ({
        model: "User",
        as: "creator"
    })),
    countActiveParticipantsByEventIds: jest.fn()
}));

const { Op } = require("sequelize");
const User = require("../../../../../src/models/userModel");
const Event = require("../../../../../src/models/eventModel");
const EventUserRole = require("../../../../../src/models/relations/eventUserRoleModel");

const userService = require("../../../../../src/services/userService");

const { EVENT_ROLES } = require("../../../../../src/constants/eventRoles");

const {
    buildEventCreatorInclude,
    countActiveParticipantsByEventIds
} = require("../../../../../src/utils/events/eventQueryBuilder");

const { createMockUser } = require("../../../../factories/userFactory");

describe("userService - getPublicUserEventsByID", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       PUBLIC USER EVENTS RETRIEVAL SUCCESS
    ============================= */

    it("should return created and joined events", async () => {
        const user = createMockUser({
            name: "John",
            avatar: null
        });

        const createdEvent = {
            id: 1,
            toJSON: () => ({
                id: 1,
                title: "Created event",
                creatorId: 1,
                startDateTime: new Date(Date.now() + 60_000).toISOString(),
                endDateTime: new Date(Date.now() + 120_000).toISOString()
            })
        };

        const joinedEvent = {
            id: 2,
            toJSON: () => ({
                id: 2,
                title: "Joined event",
                creatorId: 3,
                startDateTime: new Date(Date.now() + 60_000).toISOString(),
                endDateTime: new Date(Date.now() + 120_000).toISOString()
            })
        };

        User.findByPk.mockResolvedValue(user);
        Event.findAll.mockResolvedValue([createdEvent]);
        EventUserRole.findAll.mockResolvedValue([
            { event: joinedEvent }
        ]);

        countActiveParticipantsByEventIds.mockResolvedValue({
            1: 2,
            2: 4
        });


        const result = await userService.getPublicUserEventsByID(1);

        expect(User.findByPk).toHaveBeenCalledWith(1);

        expect(Event.findAll).toHaveBeenCalledWith({
            where: { creatorId: 1 },
            include: [
                buildEventCreatorInclude(User)
            ],
            order: [["startDateTime", "ASC"]]
        });

        expect(EventUserRole.findAll).toHaveBeenCalledWith({
            where: {
                userId: 1,
                deletedAt: null,
                role: {
                    [Op.ne]: EVENT_ROLES.ORGANIZER
                }
            },
            include: [{
                model: Event,
                as: "event",
                include: [
                    buildEventCreatorInclude(User)
                ]
            }]
        });

        expect(result).toEqual({
            createdEvents: [
                expect.objectContaining({
                    id: 1,
                    title: "Created event",
                    creatorId: 1,
                    participantCount: 2,
                    status: expect.any(String)
                })
            ],
            joinedEvents: [
                expect.objectContaining({
                    id: 2,
                    title: "Joined event",
                    creatorId: 3,
                    participantCount: 4,
                    status: expect.any(String)
                })
            ]
        });
    });

    it("should return empty arrays when user has no events", async () => {
        const user = createMockUser({
            name: "John",
            avatar: null
        });

        User.findByPk.mockResolvedValue(user);
        Event.findAll.mockResolvedValue([]);
        EventUserRole.findAll.mockResolvedValue([]);

        const result = await userService.getPublicUserEventsByID(1);

        expect(result).toEqual({
            createdEvents: [],
            joinedEvents: []
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should query only active non-organizer memberships", async () => {
        const user = createMockUser({
            name: "John",
            avatar: null
        });

        User.findByPk.mockResolvedValue(user);
        Event.findAll.mockResolvedValue([]);
        EventUserRole.findAll.mockResolvedValue([]);
        countActiveParticipantsByEventIds.mockResolvedValue({});

        await userService.getPublicUserEventsByID(1);

        expect(EventUserRole.findAll).toHaveBeenCalledWith({
            where: {
                userId: 1,
                deletedAt: null,
                role: {
                    [Op.ne]: EVENT_ROLES.ORGANIZER
                }
            },
            include: [{
                model: Event,
                as: "event",
                include: [
                    buildEventCreatorInclude(User)
                ]
            }]
        });
    });

    it("should call countActiveParticipantsByEventIds with all public event ids", async () => {
        const user = createMockUser();

        const createdEvent = {
            id: 1,
            toJSON: () => ({ id: 1 })
        };

        const joinedEvent = {
            id: 2,
            toJSON: () => ({ id: 2 })
        };

        User.findByPk.mockResolvedValue(user);
        Event.findAll.mockResolvedValue([createdEvent]);
        EventUserRole.findAll.mockResolvedValue([
            { event: joinedEvent }
        ]);

        countActiveParticipantsByEventIds.mockResolvedValue({});

        await userService.getPublicUserEventsByID(1);

        expect(countActiveParticipantsByEventIds).toHaveBeenCalledWith(
            EventUserRole,
            expect.anything(),
            [1, 2]
        );
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when user is not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(userService.getPublicUserEventsByID(1)).rejects.toMatchObject({
            statusCode: 404,
            message: "User not found"
        });

        expect(Event.findAll).not.toHaveBeenCalled();
        expect(EventUserRole.findAll).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        User.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(userService.getPublicUserEventsByID(1)).rejects.toThrow("DB error");
    });
});
