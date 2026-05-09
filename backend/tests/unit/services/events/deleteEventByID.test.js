/* ==================================================
   EVENT SERVICE - DELETE EVENT BY ID TESTS

   Tests:
   - successful event deletion
   - past event deletion rejection
   - missing event rejection
   - database error forwarding

   Ensures:
   - events can be deleted only when allowed
   - past event rules are enforced
   - missing events are handled safely
   - database errors are forwarded correctly
================================================== */

const Event = require("../../../../src/models/eventModel");

const eventService = require("../../../../src/services/eventService");

const { assertEventNotPast } = require("../../../../src/utils/events/eventStatus");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

describe("eventService - deleteEventByID", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       EVENT DELETION SUCCESS
    ============================= */

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

    /* =============================
       BUSINESS RULES
    ============================= */

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

        await expect(eventService.deleteEventByID(1)).rejects.toMatchObject({
            message: "No action is allowed on a past event",
            statusCode: 403
        });

        expect(event.destroy).not.toHaveBeenCalled();
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventService.deleteEventByID(999)).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventService.deleteEventByID(1)).rejects.toThrow("DB error");
    });
});
