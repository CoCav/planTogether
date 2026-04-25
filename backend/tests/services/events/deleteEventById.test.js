const Event = require("../../../src/models/eventModel");
const { assertEventNotPast } = require("../../../src/utils/eventTime");

const eventService = require("../../../src/services/eventService");

/**
 * Event Service - Delete Event By ID
 *
 * Tests event deletion logic.
 *
 * Ensures events can be deleted only when allowed.
*/

jest.mock("../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../src/utils/eventTime", () => ({
    assertEventNotPast: jest.fn()
}));

describe("eventService - deleteEventById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should delete an event", async () => {
        const event = {
            id: 1,
            destroy: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => {});

        await eventService.deleteEventById(1);

        expect(assertEventNotPast).toHaveBeenCalledWith(event);
        expect(event.destroy).toHaveBeenCalled();
    });

    it("should throw 404 when event not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            eventService.deleteEventById(999)
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should block deletion if event is past", async () => {
        const event = {
            id: 1,
            destroy: jest.fn()
        };

        Event.findByPk.mockResolvedValue(event);

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(
            eventService.deleteEventById(1)
        ).rejects.toMatchObject({
            message: "No action is allowed on a past event",
            statusCode: 403
        });

        expect(event.destroy).not.toHaveBeenCalled();
    });

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventService.deleteEventById(1)).rejects.toThrow("DB error");
    });
});