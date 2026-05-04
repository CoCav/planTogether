const Event = require("../../../src/models/eventModel");

const { getPaginationOptions } = require("../../../src/utils/pagination");
const { applyStatusFilter, buildCreatorInclude } = require("../../../src/utils/eventQueryFilters");
const { getEventStatus } = require("../../../src/utils/eventTime");

const eventService = require("../../../src/services/eventService");

/**
 * Event Service - Get All Events
 *
 * Tests event listing with pagination and filters.
 *
 * Ensures events are returned with correct metadata and status.
*/

jest.mock("../../../src/models/eventModel", () => ({
    findAndCountAll: jest.fn()
}));

jest.mock("../../../src/utils/pagination");
jest.mock("../../../src/utils/eventQueryFilters");
jest.mock("../../../src/utils/eventTime");

describe("eventService - getAllEvents", () => {

    buildCreatorInclude.mockReturnValue({
        model: {},
        as: "creator",
        attributes: ["id", "name"]
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should return paginated events with status", async () => {
        const mockEvent = {
            toJSON: () => ({ id: 1, title: "Event" })
        };

        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        applyStatusFilter.mockImplementation(() => { });
        getEventStatus.mockReturnValue("upcoming");

        Event.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [mockEvent]
        });

        const result = await eventService.getAllEvents({ status: "upcoming" });

        expect(applyStatusFilter).toHaveBeenCalled();

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

    it("should include creator filter when creator query is provided", async () => {
        Event.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        await eventService.getAllEvents({ creator: "john" });

        expect(buildCreatorInclude).toHaveBeenCalledWith(expect.anything(), "john");
    });

    it("should handle grouped count array", async () => {
        const mockEvent = {
            toJSON: () => ({ id: 1 })
        };

        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        getEventStatus.mockReturnValue("past");

        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }, { count: 1 }],
            rows: [mockEvent]
        });

        const result = await eventService.getAllEvents({});

        expect(result.totalEvents).toBe(2);
    });

    it("should forward errors", async () => {
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
