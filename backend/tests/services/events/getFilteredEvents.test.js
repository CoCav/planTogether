const Event = require("../../../src/models/eventModel");
const { getPaginationOptions } = require("../../../src/utils/pagination");
const { applyEventQueryFilters } = require("../../../src/utils/eventQueryFilters");
const { getEventStatus } = require("../../../src/utils/eventTime");

const eventService = require("../../../src/services/eventService");

/**
 * Event Service - Get Filtered Events
 *
 * Tests event filtering logic.
 *
 * Ensures filters are applied, pagination is respected,
 * and results are correctly formatted.
*/

jest.mock("../../../src/models/eventModel", () => ({
    findAndCountAll: jest.fn()
}));

jest.mock("../../../src/utils/pagination");

jest.mock("../../../src/utils/eventQueryFilters", () => ({
    applyEventQueryFilters: jest.fn()
}));

jest.mock("../../../src/utils/eventTime");

describe("eventService - getFilteredEvents", () => {

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

        applyEventQueryFilters.mockImplementation((where) => where);
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should call applyEventQueryFilters", async () => {
        Event.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

        await eventService.getFilteredEvents({ search: "test" });

        expect(applyEventQueryFilters).toHaveBeenCalled();
    });

    it("should pass filters to Sequelize query", async () => {
        applyEventQueryFilters.mockImplementation((where) => {
            where.mode = "online";
            return where;
        });

        Event.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

        await eventService.getFilteredEvents({ mode: "online" });

        expect(Event.findAndCountAll).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ mode: "online" })
            })
        );
    });

    it("should return events with computed status", async () => {
        const mockEvent = {
            toJSON: () => ({ id: 1 })
        };

        Event.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [mockEvent]
        });

        const result = await eventService.getFilteredEvents({});

        expect(result.events[0]).toMatchObject({
            id: 1,
            status: "upcoming"
        });
    });

    it("should handle grouped count array", async () => {
        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }, { count: 1 }],
            rows: [{ toJSON: () => ({}) }]
        });

        const result = await eventService.getFilteredEvents({});

        expect(result.totalEvents).toBe(2);
    });

    it("should forward errors", async () => {
        Event.findAndCountAll.mockRejectedValue(new Error("DB error"));

        await expect(eventService.getFilteredEvents({})).rejects.toThrow("DB error");
    });
});
