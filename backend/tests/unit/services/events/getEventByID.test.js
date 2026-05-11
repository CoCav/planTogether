/* ==================================================
   EVENT SERVICE - GET EVENT BY ID TESTS

   Tests:
   - successful event retrieval
   - event status enrichment
   - missing event rejection
   - database error propagation

   Ensures:
   - single events are retrieved correctly
   - computed status is added before response
   - missing events return a 404 error
   - shared event status constants are used for expected statuses
================================================== */

jest.mock("../../../../src/models/eventModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

const Event = require("../../../../src/models/eventModel");

const eventService = require("../../../../src/services/eventService");

const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");
const { getEventStatus } = require("../../../../src/utils/events/eventStatus");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

const { createMockEventModel } = require("../../../factories/eventFactory");

describe("eventService - getEventByID", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       EVENT RETRIEVAL SUCCESS
    ============================= */

    it("should return event with computed status", async () => {

        Event.findOne.mockResolvedValue(createMockEventModel());

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        const result = await eventService.getEventByID(1);

        expect(Event.findOne).toHaveBeenCalled();

        expect(result).toMatchObject({
            id: 1,
            title: "Test Event",
            status: EVENT_STATUS.UPCOMING
        });
    });

    /* =============================
       EVENT METADATA
    ============================= */

    it("should enrich retrieved event with computed status", async () => {
        const mockEvent = createMockEventModel({
            title: "Past Event"
        });

        Event.findOne.mockResolvedValue(mockEvent);

        getEventStatus.mockReturnValue(EVENT_STATUS.PAST);

        const result = await eventService.getEventByID(1);

        expect(getEventStatus).toHaveBeenCalledWith(mockEvent);

        expect(result).toMatchObject({
            status: EVENT_STATUS.PAST
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
