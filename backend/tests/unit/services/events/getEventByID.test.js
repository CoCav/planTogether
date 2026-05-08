/* ==================================================
   EVENT SERVICE - GET EVENT BY ID TESTS

   Tests:
   - successful event retrieval
   - event status enrichment
   - missing event rejection
   - database error forwarding

   Ensures:
   - single events are retrieved correctly
   - computed status is added before response
   - missing events return a 404 error
   - database errors are forwarded correctly
================================================== */

const Event = require("../../../../src/models/eventModel");

const eventService = require("../../../../src/services/eventService");

const { getEventStatus } = require("../../../../src/utils/eventStatus");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

const { createMockEvent } = require("../../../factories/eventFactory");

jest.mock("../../../../src/models/eventModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/utils/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

describe("eventService - getEventByID", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       EVENT RETRIEVAL SUCCESS
    ============================= */

    it("should return event with computed status", async () => {

        Event.findOne.mockResolvedValue(createMockEvent());

        getEventStatus.mockReturnValue("upcoming");

        const result = await eventService.getEventByID(1);

        expect(Event.findOne).toHaveBeenCalled();

        expect(result).toEqual({
            id: 1,
            title: "Test Event",
            status: "upcoming"
        });
    });

    /* =============================
       EVENT METADATA
    ============================= */

    it("should enrich retrieved event with computed status", async () => {
        const mockEvent = createMockEvent({
            title: "Past Event"
        });

        Event.findOne.mockResolvedValue(mockEvent);

        getEventStatus.mockReturnValue("past");

        const result = await eventService.getEventByID(1);

        expect(getEventStatus).toHaveBeenCalledWith(mockEvent);

        expect(result).toMatchObject({
            status: "past"
        });
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when event is not found", async () => {
        Event.findOne.mockResolvedValue(null);

        await expect(eventService.getEventByID(999)).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        Event.findOne.mockRejectedValue(new Error("DB error"));

        await expect(eventService.getEventByID(1)).rejects.toThrow("DB error");
    });
});
