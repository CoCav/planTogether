const User = require("../../../src/models/userModel");
const Event = require("../../../src/models/eventModel");
const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");

const userService = require("../../../src/services/userService");

/**
 * User Service - Public Events
 *
 * Tests public user events retrieval logic.
 *
 * Ensures created and joined events are correctly separated
 * and duplicated creator events are excluded from joined events.
 */

jest.mock("../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../src/models/eventModel", () => ({
    findAll: jest.fn()
}));

jest.mock("../../../src/models/relations/eventUserRoleModel.js", () => ({
    findAll: jest.fn()
}));

describe("userService - getPublicUserEventsById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return created and joined events", async () => {
        const user = { name: "John", avatar: null };

        const createdEvents = [
            { id: 1, title: "Created event", creatorId: 1 }
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

        const result = await userService.getPublicUserEventsById(1);

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

    it("should exclude created events from joined events", async () => {
        const user = { name: "John", avatar: null };

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

        const result = await userService.getPublicUserEventsById(1);

        expect(result).toEqual({
            createdEvents: [createdEvent],
            joinedEvents: [joinedEvent]
        });
    });

    it("should return empty arrays when user has no events", async () => {
        const user = { name: "John", avatar: null };

        User.findByPk.mockResolvedValue(user);
        Event.findAll.mockResolvedValue([]);
        EventUserRole.findAll.mockResolvedValue([]);

        const result = await userService.getPublicUserEventsById(1);

        expect(result).toEqual({
            createdEvents: [],
            joinedEvents: []
        });
    });

    it("should throw if user is not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(userService.getPublicUserEventsById(1))
            .rejects
            .toMatchObject({
                statusCode: 404,
                message: "User not found"
            });

        expect(Event.findAll).not.toHaveBeenCalled();
        expect(EventUserRole.findAll).not.toHaveBeenCalled();
    });
});
