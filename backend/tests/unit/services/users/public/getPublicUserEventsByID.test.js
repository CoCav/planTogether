/* ==================================================
   USER SERVICE - GET PUBLIC USER EVENTS BY ID TESTS

   Tests:
   - created and joined events retrieval
   - created events exclusion from joined events
   - empty event lists
   - missing user rejection
   - database error propagation

   Ensures:
   - public user events are correctly separated
   - created events are not duplicated in joined events
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

const User = require("../../../../../src/models/userModel");
const Event = require("../../../../../src/models/eventModel");
const EventUserRole = require("../../../../../src/models/relations/eventUserRoleModel");

const userService = require("../../../../../src/services/userService");

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

        const createdEvents = [
            {
                id: 1,
                title: "Created event",
                creatorId: 1
            }
        ];

        const joinedEvent = {
            id: 2,
            title: "Joined event",
            creatorId: 3
        };

        User.findByPk.mockResolvedValue(user);
        Event.findAll.mockResolvedValue(createdEvents);
        EventUserRole.findAll.mockResolvedValue([
            { event: joinedEvent }
        ]);

        const result = await userService.getPublicUserEventsByID(1);

        expect(User.findByPk).toHaveBeenCalledWith(1);

        expect(Event.findAll).toHaveBeenCalledWith({
            where: { creatorId: 1 },
            order: [["startDateTime", "ASC"]]
        });

        expect(EventUserRole.findAll).toHaveBeenCalledWith({
            where: { userId: 1 },
            include: [
                {
                    model: Event,
                    as: "event"
                }
            ]
        });

        expect(result).toEqual({
            createdEvents,
            joinedEvents: [joinedEvent]
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

    it("should exclude created events from joined events", async () => {
        const user = createMockUser({
            name: "John",
            avatar: null
        });

        const createdEvent = {
            id: 1,
            title: "Created event",
            creatorId: 1
        };

        const joinedEvent = {
            id: 2,
            title: "Joined event",
            creatorId: 3
        };

        User.findByPk.mockResolvedValue(user);
        Event.findAll.mockResolvedValue([createdEvent]);
        EventUserRole.findAll.mockResolvedValue([
            { event: createdEvent },
            { event: joinedEvent }
        ]);

        const result = await userService.getPublicUserEventsByID(1);

        expect(result).toEqual({
            createdEvents: [createdEvent],
            joinedEvents: [joinedEvent]
        });
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
