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
================================================== */

const Event = require("../../../../src/models/eventModel");
const { getEventStatus } = require("../../../../src/utils/eventStatus");

const eventService = require("../../../../src/services/eventService");

jest.mock("../../../../src/models/eventModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/utils/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

describe("eventService - getEventByID", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
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

        const result = await eventService.getEventByID(1);

        expect(Event.findOne).toHaveBeenCalled();

        expect(result).toEqual({
            id: 1,
            title: "Test Event",
            status: "upcoming"
        });
    });

    it("should throw 404 when event is not found", async () => {
        Event.findOne.mockResolvedValue(null);

        await expect(
            eventService.getEventByID(999)
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should forward database errors", async () => {
        Event.findOne.mockRejectedValue(new Error("DB error"));

        await expect(eventService.getEventByID(1)).rejects.toThrow("DB error");
    });
});
