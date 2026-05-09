/* ==================================================
   EVENT SERVICE - GET ALL EVENTS TESTS

   Tests:
   - paginated event listing
   - event filter forwarding
   - creator include configuration
   - status enrichment
   - grouped count handling
   - database error forwarding

   Ensures:
   - event listing supports filters and pagination
   - query helpers are called with expected arguments
   - pagination metadata is returned correctly
   - events are enriched with computed status
   - shared event status constants are used for expected statuses
   - database errors are forwarded correctly
================================================== */

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");

const eventService = require("../../../../src/services/eventService");

const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");
const { getEventStatus } = require("../../../../src/utils/events/eventStatus");

const { buildEventWhereConditions, buildEventCreatorInclude } = require("../../../../src/utils/events/eventQueryBuilder");
const { getPaginationOptions } = require("../../../../src/utils/pagination");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

const { createMockEvent } = require("../../../factories/eventFactory");

jest.mock("../../../../src/models/eventModel", () => ({
    findAndCountAll: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({}));

jest.mock("../../../../src/utils/events/eventQueryBuilder", () => ({
    buildEventWhereConditions: jest.fn(),
    buildEventCreatorInclude: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn()
}));

describe("eventService - getAllEvents", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
         EVENTS RETRIEVAL SUCCESS
      ============================= */

    it("should return paginated events with computed status", async () => {

        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }],
            rows: [createMockEvent()]
        });

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        const result = await eventService.getAllEvents({});

        expect(result).toEqual({
            page: 1,
            pageSize: 10,
            totalEvents: 1,
            totalPages: 1,

            events: [
                {
                    id: 1,
                    title: "Test Event",
                    status: EVENT_STATUS.UPCOMING
                }
            ]
        });
    });

    /* =============================
         QUERY FILTERS
      ============================= */

    it("should forward filters to buildEventWhereConditions", async () => {
        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [],
            rows: []
        });

        await eventService.getAllEvents({
            mode: "online",
            theme: "Tech"
        });

        expect(buildEventWhereConditions).toHaveBeenCalledWith({},
            {
                mode: "online",
                theme: "Tech"
            }
        );
    });

    it("should apply creator include configuration", async () => {
        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        const creatorInclude = {
            model: User,
            as: "creator"
        };

        buildEventCreatorInclude.mockReturnValue(creatorInclude);

        Event.findAndCountAll.mockResolvedValue({
            count: [],
            rows: []
        });

        await eventService.getAllEvents({
            creator: "john"
        });

        expect(buildEventCreatorInclude).toHaveBeenCalledWith(User, "john");
    });

    /* =============================
         EVENT METADATA
      ============================= */

    it("should enrich events with computed status", async () => {
        const mockEvent = createMockEvent({
            title: "Metadata Event"
        });

        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator",
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }],
            rows: [mockEvent]
        });

        getEventStatus.mockReturnValue(EVENT_STATUS.PAST);

        const result = await eventService.getAllEvents({});

        expect(getEventStatus).toHaveBeenCalledWith(mockEvent);

        expect(result.events[0]).toMatchObject({
            status: EVENT_STATUS.PAST
        });
    });

    /* =============================
         COUNT / PAGINATION
      ============================= */

    it("should handle grouped Sequelize count results", async () => {
        getPaginationOptions.mockReturnValue({
            page: 2,
            pageSize: 5,
            limit: 5,
            offset: 5,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }, { count: 1 }, { count: 1 }],
            rows: [],
        });

        const result = await eventService.getAllEvents({});

        expect(result.totalEvents).toBe(3);
        expect(result.totalPages).toBe(1);
    });

    /* =============================
         DATABASE ERRORS
      ============================= */

    it("should forward database errors", async () => {
        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        Event.findAndCountAll.mockRejectedValue(new Error("DB error"));

        await expect(eventService.getAllEvents({})).rejects.toThrow("DB error");
    });
});
