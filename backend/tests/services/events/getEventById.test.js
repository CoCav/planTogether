const Event = require("../../../src/models/eventModel");
const { getEventStatus } = require("../../../src/utils/eventTime");

const eventService = require("../../../src/services/eventService");

/**
 * Event Service - Get Event By ID
 *
 * Tests retrieval of a single event.
 *
 * Ensures correct data is returned or a 404 is thrown.
*/

jest.mock("../../../src/models/eventModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../src/utils/eventTime", () => ({
    getEventStatus: jest.fn()
}));

describe("eventService - getEventById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should return event with status", async () => {
        const mockEvent = {
            toJSON: () => ({
                id: 1,
                title: "Test Event"
            })
        };

        Event.findOne.mockResolvedValue(mockEvent);
        getEventStatus.mockReturnValue("upcoming");

        const result = await eventService.getEventById(1);

        expect(Event.findOne).toHaveBeenCalled();
        expect(result).toEqual({
            id: 1,
            title: "Test Event",
            status: "upcoming"
        });
    });

    it("should throw 404 when event is not found", async () => {
        Event.findOne.mockResolvedValue(null);

        await expect(eventService.getEventById(999)).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should forward database errors", async () => {
        Event.findOne.mockRejectedValue(new Error("DB error"));

        await expect(eventService.getEventById(1)).rejects.toThrow("DB error");
    });
});