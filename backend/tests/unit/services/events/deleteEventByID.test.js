/* ==================================================
   EVENT SERVICE - DELETE EVENT BY ID TESTS

   Tests:
   - successful event deletion
   - missing event rejection
   - past event deletion rejection
   - database error forwarding

   Ensures:
   - events can be deleted only when allowed
   - past event rules are enforced
   - missing events are handled safely
================================================== */

const Event = require("../../../../src/models/eventModel");
const { assertEventNotPast } = require("../../../../src/utils/eventStatus");

const eventService = require("../../../../src/services/eventService");

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/utils/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

describe("eventService - deleteEventByID", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
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
        assertEventNotPast.mockImplementation(() => { });

        await eventService.deleteEventByID(1);

        expect(assertEventNotPast).toHaveBeenCalledWith(event);
        expect(event.destroy).toHaveBeenCalled();
    });

    it("should throw 404 when event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            eventService.deleteEventByID(999)
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
            eventService.deleteEventByID(1)
        ).rejects.toMatchObject({
            message: "No action is allowed on a past event",
            statusCode: 403
        });

        expect(event.destroy).not.toHaveBeenCalled();
    });

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventService.deleteEventByID(1)).rejects.toThrow("DB error");
    });
});
