const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");
const Event = require("../../../src/models/eventModel");
const User = require("../../../src/models/userModel");

const { getPaginationOptions } = require("../../../src/utils/pagination");
const { getEventStatus } = require("../../../src/utils/eventTime");

const { Op } = require("sequelize");

const service = require("../../../src/services/eventMembershipService");

/**
 * Event Membership - List My Events
 *
 * Tests retrieval of user-related events.
 *
 * Ensures correct filtering, pagination, and event metadata.
*/

jest.mock("../../../src/models/relations/eventUserRoleModel", () => ({
    findAndCountAll: jest.fn(),
    count: jest.fn()
}));

jest.mock("../../../src/models/eventModel");
jest.mock("../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../src/utils/pagination");
jest.mock("../../../src/utils/eventTime");

describe("eventMembershipService - listMyEvents", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    const pagination = {
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
        orderField: "startDateTime",
        orderDirection: "ASC"
    };

    it("should return paginated user events with participantCount and status", async () => {
        User.findByPk.mockResolvedValue({ id: 1 });

        getPaginationOptions.mockReturnValue(pagination);
        getEventStatus.mockReturnValue("upcoming");

        const membership = {
            toJSON: () => ({
                id: 1,
                Event: { id: 100, title: "Event" }
            })
        };

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [membership]
        });

        EventUserRole.count.mockResolvedValue(5);

        const result = await service.listMyEvents(1, {});

        expect(User.findByPk).toHaveBeenCalledWith(1);

        expect(result).toEqual({
            page: 1,
            pageSize: 10,
            totalEvents: 1,
            totalPages: 1,
            events: [
                {
                    id: 1,
                    Event: {
                        id: 100,
                        title: "Event",
                        participantCount: 5,
                        status: "upcoming"
                    }
                }
            ]
        });
    });

    it("should apply role filter for created view", async () => {
        User.findByPk.mockResolvedValue({ id: 1 });

        getPaginationOptions.mockReturnValue(pagination);

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await service.listMyEvents(1, { view: "created" });

        const args = EventUserRole.findAndCountAll.mock.calls[0][0];

        expect(args.where.role).toBe("organizer");
    });

    it("should apply role filter for joined view", async () => {
        User.findByPk.mockResolvedValue({ id: 1 });

        getPaginationOptions.mockReturnValue(pagination);

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await service.listMyEvents(1, { view: "joined" });

        const args = EventUserRole.findAndCountAll.mock.calls[0][0];

        expect(args.where.role[Op.in]).toBeDefined();
    });

    it("should apply history filter", async () => {
        User.findByPk.mockResolvedValue({ id: 1 });

        getPaginationOptions.mockReturnValue(pagination);

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await service.listMyEvents(1, { view: "createdHistory" });

        const args = EventUserRole.findAndCountAll.mock.calls[0][0];

        expect(args.include[0].where.endDateTime[Op.lt]).toBeDefined();
    });

    it("should throw 404 if user not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(
            service.listMyEvents(999, {})
        ).rejects.toMatchObject({
            message: "User not found",
            statusCode: 404
        });
    });

    it("should forward errors", async () => {
        User.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(service.listMyEvents(1, {})).rejects.toThrow("DB error");
    });
});