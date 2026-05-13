/* ==================================================
   USER SERVICE - GET CURRENT USER EVENTS BY ID TESTS

   Tests:
   - paginated active current user events retrieval
   - optimized participant count enrichment
   - event status enrichment
   - created / joined / history views
   - creator filter handling
   - inactive membership exclusion
   - missing user rejection
   - database error propagation

   Ensures:
   - current user event lists only include active memberships
   - pagination metadata is returned correctly
   - event metadata is added before response
   - participant counts are retrieved through optimized grouped queries
   - shared event role constants are used for role-based filters
   - shared event status constants are used for expected statuses
   - missing users and database errors are handled safely
================================================== */

jest.mock("../../../../../src/models/relations/eventUserRoleModel", () => ({
    findAndCountAll: jest.fn()
}));

jest.mock("../../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../../src/utils/pagination");

jest.mock("../../../../../src/utils/events/eventStatus");

jest.mock("../../../../../src/utils/events/eventQueryBuilder", () => ({
    buildEventWhereConditions: jest.fn(),
    buildEventCreatorInclude: jest.fn(),
    countActiveParticipantsByEventIds: jest.fn()
}));

const { Op } = require("sequelize");

const EventUserRole = require("../../../../../src/models/relations/eventUserRoleModel");
const Event = require("../../../../../src/models/eventModel");
const User = require("../../../../../src/models/userModel");

const userService = require("../../../../../src/services/userService");

const { EVENT_ROLES } = require("../../../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../../../src/constants/eventStatus");

const { getEventStatus } = require("../../../../../src/utils/events/eventStatus");

const {
    buildEventWhereConditions,
    buildEventCreatorInclude,
    countActiveParticipantsByEventIds
} = require("../../../../../src/utils/events/eventQueryBuilder");

const { getPaginationOptions } = require("../../../../../src/utils/pagination");

describe("userService - getCurrentUserEventsByID", () => {

    const pagination = {
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
        orderField: "startDateTime",
        orderDirection: "ASC"
    };

    beforeEach(() => {
        jest.clearAllMocks();
        buildEventWhereConditions.mockImplementation((where) => where);

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator",
            attributes: ["id", "name"]
        });

        countActiveParticipantsByEventIds.mockResolvedValue({
            100: 5
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
                    title: "Event",
                    participantCount: 5
                }
            })
        };

        User.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [membership]
        });

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        const result = await userService.getCurrentUserEventsByID(1, {});

        expect(User.findByPk).toHaveBeenCalledWith(1);

        const queryOptions = EventUserRole.findAndCountAll.mock.calls[0][0];

        expect(queryOptions.where).toMatchObject({
            userId: 1,
            deletedAt: null
        });

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
                        status: EVENT_STATUS.UPCOMING
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

        expect(queryOptions.where.role).toBe(EVENT_ROLES.ORGANIZER);
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
            EVENT_ROLES.PARTICIPANT,
            EVENT_ROLES.CO_ORGANIZER
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
                    title: "Metadata Event",
                    participantCount: 5
                }
            })
        };

        User.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [membership]
        });

        getEventStatus.mockReturnValue(EVENT_STATUS.PAST);

        const result = await userService.getCurrentUserEventsByID(1, {});

        expect(getEventStatus).toHaveBeenCalledWith({
            id: 100,
            title: "Metadata Event",
            participantCount: 5
        });

        expect(result.events[0].event).toMatchObject({
            participantCount: 5,
            status: EVENT_STATUS.PAST
        });
    });

    /* =============================
       PARTICIPANT COUNT
    ============================= */

    it("should use optimized participant count query helpers", async () => {
        User.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 0,
            rows: []
        });

        await userService.getCurrentUserEventsByID(1, {});

        expect(countActiveParticipantsByEventIds).toHaveBeenCalledWith(
            EventUserRole,
            expect.any(Object),
            []
        );
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
