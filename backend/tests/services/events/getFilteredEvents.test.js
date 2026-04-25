const Event = require("../../../src/models/eventModel");
const { getPaginationOptions } = require("../../../src/utils/pagination");
const { applyStatusFilter } = require("../../../src/utils/eventQuery");
const { getEventStatus } = require("../../../src/utils/eventTime");

const { Op } = require("sequelize");

const eventService = require("../../../src/services/eventService");

/**
 * Event Service - Get Filtered Events
 *
 * Tests event filtering logic.
 *
 * Ensures filters (search, status, mode, etc.) are correctly applied.
*/

jest.mock("../../../src/models/eventModel", () => ({
    findAndCountAll: jest.fn()
}));

jest.mock("../../../src/utils/pagination");
jest.mock("../../../src/utils/eventQuery");
jest.mock("../../../src/utils/eventTime");

describe("eventService - getFilteredEvents", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    const basePagination = {
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
        orderField: "createdAt",
        orderDirection: "DESC"
    };

    it("should return filtered events with status", async () => {
        const mockEvent = {
            toJSON: () => ({ id: 1, title: "Event" })
        };

        getPaginationOptions.mockReturnValue(basePagination);
        applyStatusFilter.mockImplementation(() => {});
        getEventStatus.mockReturnValue("upcoming");

        Event.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [mockEvent]
        });

        const result = await eventService.getFilteredEvents({
            status: "upcoming",
            search: "test"
        });

        expect(applyStatusFilter).toHaveBeenCalled();

        expect(Event.findAndCountAll).toHaveBeenCalled();

        expect(result.events[0]).toMatchObject({
            id: 1,
            status: "upcoming"
        });
    });

    it("should apply search filter (title/description)", async () => {
        getPaginationOptions.mockReturnValue(basePagination);
        getEventStatus.mockReturnValue("upcoming");

        Event.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await eventService.getFilteredEvents({ search: "hello" });

        const callArgs = Event.findAndCountAll.mock.calls[0][0];

        expect(callArgs.where[Op.or]).toBeDefined();
        expect(callArgs.where[Op.or]).toHaveLength(2);
    });

    it("should apply mode filter", async () => {
        getPaginationOptions.mockReturnValue(basePagination);
        getEventStatus.mockReturnValue("upcoming");

        Event.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await eventService.getFilteredEvents({ mode: "online" });

        const callArgs = Event.findAndCountAll.mock.calls[0][0];

        expect(callArgs.where.mode).toBe("online");
    });

    it("should apply creatorId filter", async () => {
        getPaginationOptions.mockReturnValue(basePagination);
        getEventStatus.mockReturnValue("upcoming");

        Event.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await eventService.getFilteredEvents({ creatorId: "5" });

        const callArgs = Event.findAndCountAll.mock.calls[0][0];

        expect(callArgs.where.creatorId).toBe(5);
    });

    it("should handle grouped count array", async () => {
        const mockEvent = {
            toJSON: () => ({ id: 1 })
        };

        getPaginationOptions.mockReturnValue(basePagination);
        getEventStatus.mockReturnValue("past");

        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }, { count: 1 }],
            rows: [mockEvent]
        });

        const result = await eventService.getFilteredEvents({});

        expect(result.totalEvents).toBe(2);
    });

    it("should forward errors", async () => {
        getPaginationOptions.mockReturnValue(basePagination);

        Event.findAndCountAll.mockRejectedValue(new Error("DB error"));

        await expect(eventService.getFilteredEvents({})).rejects.toThrow("DB error");
    });
});