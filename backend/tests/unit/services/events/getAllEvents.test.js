/* ==================================================
   EVENT SERVICE - GET ALL EVENTS TESTS

   Tests:
   - paginated event listing
   - query filter helper usage
   - Sequelize where filter forwarding
   - creator filtering
   - status enrichment
   - grouped count handling
   - database error forwarding

   Ensures:
   - getAllEvents supports both full listing and filtered listing
   - filters are applied before querying events
   - pagination metadata is returned correctly
   - events are formatted with computed status
================================================== */

const Event = require("../../../../src/models/eventModel");

const { getPaginationOptions } = require("../../../../src/utils/pagination");
const { buildEventWhereConditions, buildEventCreatorInclude } = require("../../../../src/utils/eventQueryBuilder");
const { getEventStatus } = require("../../../../src/utils/eventStatus");

const eventService = require("../../../../src/services/eventService");

jest.mock("../../../../src/models/eventModel", () => ({
    findAndCountAll: jest.fn()
}));

jest.mock("../../../../src/utils/pagination");

jest.mock("../../../../src/utils/eventQueryBuilder", () => ({
    buildEventWhereConditions: jest.fn(),
    buildEventCreatorInclude: jest.fn()
}));

jest.mock("../../../../src/utils/eventStatus");

describe("eventService - getAllEvents", () => {
    const basePagination = {
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
        orderField: "createdAt",
        orderDirection: "DESC"
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });

        getPaginationOptions.mockReturnValue(basePagination);
        getEventStatus.mockReturnValue("upcoming");
        buildEventWhereConditions.mockImplementation((where) => where);

        buildEventCreatorInclude.mockReturnValue({
            model: {},
            as: "creator",
            attributes: ["id", "name"]
        });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should return paginated events with status", async () => {
        const mockEvent = {
            toJSON: () => ({
                id: 1,
                title: "Event"
            })
        };

        Event.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [mockEvent]
        });

        const result = await eventService.getAllEvents({
            status: "upcoming"
        });

        expect(buildEventWhereConditions).toHaveBeenCalledWith(
            {},
            { status: "upcoming" }
        );

        expect(Event.findAndCountAll).toHaveBeenCalled();

        expect(result).toEqual({
            page: 1,
            pageSize: 10,
            totalEvents: 1,
            totalPages: 1,
            events: [
                {
                    id: 1,
                    title: "Event",
                    status: "upcoming"
                }
            ]
        });
    });

    it("should pass filters to Sequelize query", async () => {
        buildEventWhereConditions.mockImplementation((where) => {
            where.mode = "online";
            return where;
        });

        Event.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await eventService.getAllEvents({
            mode: "online"
        });

        expect(Event.findAndCountAll).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    mode: "online"
                })
            })
        );
    });

    it("should include creator filter when creator query is provided", async () => {
        Event.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await eventService.getAllEvents({
            creator: "john"
        });

        expect(buildEventCreatorInclude).toHaveBeenCalledWith(
            expect.anything(),
            "john"
        );
    });

    it("should return events with computed status", async () => {
        const mockEvent = {
            toJSON: () => ({
                id: 1
            })
        };

        Event.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [mockEvent]
        });

        const result = await eventService.getAllEvents({});

        expect(result.events[0]).toMatchObject({
            id: 1,
            status: "upcoming"
        });
    });

    it("should handle grouped count array", async () => {
        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }, { count: 1 }],
            rows: [
                {
                    toJSON: () => ({ id: 1 })
                }
            ]
        });

        const result = await eventService.getAllEvents({});

        expect(result.totalEvents).toBe(2);
    });

    it("should forward database errors", async () => {
        Event.findAndCountAll.mockRejectedValue(new Error("DB error"));

        await expect(eventService.getAllEvents({})).rejects.toThrow("DB error");
    });
});
