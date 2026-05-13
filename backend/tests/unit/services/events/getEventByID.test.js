/* ==================================================
   EVENT SERVICE - GET EVENT BY ID TESTS

   Tests:
   - successful event retrieval with optimized participant count
   - event status enrichment
   - active participant include configuration
   - missing event rejection
   - database error propagation

   Ensures:
   - single events are retrieved correctly
   - active participants are counted through optimized query helpers
   - computed status is added before response
   - missing events return a 404 error
   - shared event status constants are used for expected statuses
================================================== */

jest.mock("../../../../src/models/eventModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventQueryBuilder", () => ({
    buildEventCreatorInclude: jest.fn(),
    buildActiveParticipantInclude: jest.fn(),
    buildParticipantCountAttribute: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");

const eventService = require("../../../../src/services/eventService");

const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");
const { getEventStatus } = require("../../../../src/utils/events/eventStatus");

const {
    buildEventCreatorInclude,
    buildActiveParticipantInclude,
    buildParticipantCountAttribute
} = require("../../../../src/utils/events/eventQueryBuilder");

const { createMockEventModel } = require("../../../factories/eventFactory");

describe("eventService - getEventByID", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        buildActiveParticipantInclude.mockReturnValue({
            model: User,
            as: "participants",
            attributes: []
        });

        buildParticipantCountAttribute.mockReturnValue([
            "COUNT_DISTINCT_PARTICIPANTS",
            "participantCount"
        ]);
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
       PARTICIPANT COUNT
    ============================= */

    it("should use optimized active participant count helpers", async () => {
        Event.findOne.mockResolvedValue(createMockEventModel());

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        await eventService.getEventByID(1);

        expect(buildParticipantCountAttribute).toHaveBeenCalledWith(
            expect.any(Object),
            "participants.id"
        );

        expect(buildEventCreatorInclude).toHaveBeenCalledWith(User);
        expect(buildActiveParticipantInclude).toHaveBeenCalledWith(User);
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
