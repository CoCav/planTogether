/* ==================================================
   USER SERVICE - GET CURRENT USER EVENTS BY ID TESTS

   Tests:
   - paginated current user events retrieval
   - participant count enrichment
   - event status enrichment
   - created / joined / history views
   - creator filter handling
   - missing user rejection
   - database error forwarding

   Ensures:
   - current user event lists are filtered correctly
   - pagination metadata is returned correctly
   - event metadata is added before response
   - missing users and database errors are handled safely
================================================== */

const { Op } = require("sequelize");

const EventUserRole = require("../../../../../src/models/relations/eventUserRoleModel");
const Event = require("../../../../../src/models/eventModel");
const User = require("../../../../../src/models/userModel");

const userService = require("../../../../../src/services/userService");

const { buildEventWhereConditions, buildEventCreatorInclude } = require("../../../../../src/utils/eventQueryBuilder");
const { getPaginationOptions } = require("../../../../../src/utils/pagination");
const { getEventStatus } = require("../../../../../src/utils/eventStatus");

const { mockConsoleError } = require("../../../../helpers/mocks/consoleMocks");

jest.mock("../../../../../src/models/relations/eventUserRoleModel", () => ({
    findAndCountAll: jest.fn(),
    count: jest.fn()
}));

jest.mock("../../../../../src/models/eventModel");

jest.mock("../../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../../src/utils/pagination");

jest.mock("../../../../../src/utils/eventStatus");

jest.mock("../../../../../src/utils/eventQueryBuilder", () => ({
    buildEventWhereConditions: jest.fn(),
    buildEventCreatorInclude: jest.fn()
}));

describe("userService - getCurrentUserEventsByID", () => {

    const pagination = {
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
        orderField: "startDateTime",
        orderDirection: "ASC"
    };

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
        buildEventWhereConditions.mockImplementation((where) => where);

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator",
            attributes: ["id", "name"]
        });

        getPaginationOptions.mockReturnValue(pagination);
    });

    /* =============================
       CURRENT USER EVENTS SUCCESS
    ============================= */

    it("should return paginated current user events with metadata", async () => {
        const membership = {
            toJSON: () => ({
                id: 1,
                event: {
                    id: 100,
                    title: "Event"
                }
            })
        };

        User.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [membership]
        });

        EventUserRole.count.mockResolvedValue(5);
        getEventStatus.mockReturnValue("upcoming");

        const result = await userService.getCurrentUserEventsByID(1, {});

        expect(User.findByPk).toHaveBeenCalledWith(1);

        expect(result).toEqual({
            page: 1,
            pageSize: 10,
            totalEvents: 1,
            totalPages: 1,
            events: [
                {
                    id: 1,
                    event: {
                        id: 100,
                        title: "Event",
                        participantCount: 5,
                        status: "upcoming"
                    }
                }
            ]
        });
    });

    /* =============================
       QUERY FILTERS
    ============================= */

    it("should apply creator filter through creator include", async () => {
        User.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await userService.getCurrentUserEventsByID(1, {
            view: "joined",
            creator: "john"
        });

        expect(buildEventCreatorInclude).toHaveBeenCalledWith(
            User,
            "john"
        );
    });

    it("should apply role filter for created view", async () => {
        User.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await userService.getCurrentUserEventsByID(1, {
            view: "created"
        });

        const queryOptions = EventUserRole.findAndCountAll.mock.calls[0][0];

        expect(queryOptions.where.role).toBe("organizer");
    });

    it("should apply role filter for joined view", async () => {
        User.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await userService.getCurrentUserEventsByID(1, {
            view: "joined"
        });

        const queryOptions = EventUserRole.findAndCountAll.mock.calls[0][0];

        expect(queryOptions.where.role[Op.in]).toEqual([
            "participant",
            "co_organizer"
        ]);
    });

    it("should apply history date filter", async () => {
        User.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await userService.getCurrentUserEventsByID(1, {
            view: "createdHistory"
        });

        const queryOptions = EventUserRole.findAndCountAll.mock.calls[0][0];

        expect(queryOptions.include[0].where.endDateTime[Op.lt]).toBeDefined();
    });

    it("should not pass creator to generic event filters", async () => {
        User.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await userService.getCurrentUserEventsByID(1, {
            view: "joined",
            creator: "john",
            search: "music"
        });

        expect(buildEventWhereConditions).toHaveBeenCalledWith(
            expect.any(Object),
            expect.not.objectContaining({
                creator: "john"
            }),
            { includeStatus: false }
        );
    });

    /* =============================
       EVENT METADATA
    ============================= */

    it("should enrich each event with participant count and status", async () => {
        const membership = {
            toJSON: () => ({
                id: 1,
                event: {
                    id: 100,
                    title: "Metadata Event"
                }
            })
        };

        User.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [membership]
        });

        EventUserRole.count.mockResolvedValue(3);
        getEventStatus.mockReturnValue("past");

        const result = await userService.getCurrentUserEventsByID(1, {});

        expect(EventUserRole.count).toHaveBeenCalledWith({
            where: {
                eventId: 100,
                role: "participant"
            }
        });

        expect(getEventStatus).toHaveBeenCalledWith({
            id: 100,
            title: "Metadata Event"
        });

        expect(result.events[0].event).toMatchObject({
            participantCount: 3,
            status: "past"
        });
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when user is not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(userService.getCurrentUserEventsByID(999, {})).rejects.toMatchObject({
            message: "User not found",
            statusCode: 404
        });

        expect(EventUserRole.findAndCountAll).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        User.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(userService.getCurrentUserEventsByID(1, {})).rejects.toThrow("DB error");
    });
});
