/* ==================================================
   USER SERVICE - GET PUBLIC USER EVENTS BY ID TESTS

   Tests:
   - paginated created events retrieval
   - paginated joined events retrieval
   - empty paginated event results
   - participant count enrichment
   - missing user rejection
   - database error propagation

   Ensures:
   - public user events use view-based pagination
   - created and joined event queries are delegated correctly
   - participant counts and statuses are enriched safely
   - missing users and database errors are handled safely
================================================== */

jest.mock("../../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../../src/models/eventModel", () => ({}));

jest.mock("../../../../../src/models/relations/eventUserRoleModel", () => ({}));

jest.mock("../../../../../src/utils/events/eventQueryBuilder", () => ({
    buildEventWhereConditions: jest.fn(),
    buildEventCreatorInclude: jest.fn(() => ({
        model: "User",
        as: "creator"
    })),
    countActiveParticipantsByEventIds: jest.fn()
}));

jest.mock("../../../../../src/utils/users/publicUserEventQueryBuilder", () => ({
    getPublicCreatedEvents: jest.fn(),
    getPublicJoinedEvents: jest.fn()
}));

const User = require("../../../../../src/models/userModel");

const userService = require("../../../../../src/services/userService");

const {
    buildEventWhereConditions,
    buildEventCreatorInclude,
    countActiveParticipantsByEventIds
} = require("../../../../../src/utils/events/eventQueryBuilder");

const { getPublicCreatedEvents, getPublicJoinedEvents } = require("../../../../../src/utils/users/publicUserEventQueryBuilder");

const { createMockUser } = require("../../../../factories/userFactory");

describe("userService - getPublicUserEventsByID", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       TEST DATA
    ============================= */

    const createMockEvent = (overrides = {}) => {
        const event = {
            id: overrides.id ?? 1,
            title: overrides.title ?? "Public Event",
            creatorId: overrides.creatorId ?? 1,
            startDateTime: overrides.startDateTime ?? new Date(Date.now() + 60_000).toISOString(),
            endDateTime: overrides.endDateTime ?? new Date(Date.now() + 120_000).toISOString(),
            ...overrides
        };

        return {
            id: event.id,
            toJSON: () => event
        };
    };

    /* =============================
       PUBLIC USER EVENTS RETRIEVAL SUCCESS
    ============================= */

    it("should return paginated created events by default", async () => {
        const user = createMockUser();

        const event = createMockEvent({
            id: 1,
            title: "Created Event"
        });

        User.findByPk.mockResolvedValue(user);

        getPublicCreatedEvents.mockResolvedValue({
            count: 1,
            rows: [event]
        });

        countActiveParticipantsByEventIds.mockResolvedValue({
            1: 2
        });

        const result = await userService.getPublicUserEventsByID(1);

        expect(User.findByPk).toHaveBeenCalledWith(1);

        expect(buildEventWhereConditions).toHaveBeenCalledWith(
            {},
            {}
        );

        expect(getPublicCreatedEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 1,
                eventFilter: {},
                creator: undefined,
                buildEventCreatorInclude
            })
        );

        expect(getPublicJoinedEvents).not.toHaveBeenCalled();

        expect(result).toEqual({
            view: "created",
            page: 1,
            pageSize: 10,
            totalEvents: 1,
            totalPages: 1,
            events: [
                expect.objectContaining({
                    id: 1,
                    title: "Created Event",
                    participantCount: 2,
                    status: expect.any(String)
                })
            ]
        });
    });

    it("should return paginated joined events when view is joined", async () => {
        const user = createMockUser();

        const event = createMockEvent({
            id: 2,
            title: "Joined Event",
            creatorId: 3
        });

        User.findByPk.mockResolvedValue(user);

        getPublicJoinedEvents.mockResolvedValue({
            count: 1,
            rows: [event]
        });

        countActiveParticipantsByEventIds.mockResolvedValue({
            2: 4
        });

        const result = await userService.getPublicUserEventsByID(1, {
            view: "joined"
        });

        expect(getPublicJoinedEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 1,
                eventFilter: {},
                creator: undefined,
                buildEventCreatorInclude
            })
        );

        expect(getPublicCreatedEvents).not.toHaveBeenCalled();

        expect(result).toEqual({
            view: "joined",
            page: 1,
            pageSize: 10,
            totalEvents: 1,
            totalPages: 1,
            events: [
                expect.objectContaining({
                    id: 2,
                    title: "Joined Event",
                    creatorId: 3,
                    participantCount: 4,
                    status: expect.any(String)
                })
            ]
        });
    });

    it("should return an empty paginated result when user has no events", async () => {
        const user = createMockUser();

        User.findByPk.mockResolvedValue(user);

        getPublicCreatedEvents.mockResolvedValue({
            count: 0,
            rows: []
        });

        countActiveParticipantsByEventIds.mockResolvedValue({});

        const result = await userService.getPublicUserEventsByID(1);

        expect(result).toEqual({
            view: "created",
            page: 1,
            pageSize: 10,
            totalEvents: 0,
            totalPages: 0,
            events: []
        });
    });

    /* =============================
       FILTERS / PAGINATION
    ============================= */

    it("should pass filters and pagination options to the public created events query", async () => {
        const user = createMockUser();

        User.findByPk.mockResolvedValue(user);

        getPublicCreatedEvents.mockResolvedValue({
            count: 0,
            rows: []
        });

        countActiveParticipantsByEventIds.mockResolvedValue({});

        await userService.getPublicUserEventsByID(1, {
            view: "created",
            creator: "Alice",
            search: "React",
            page: 2,
            pageSize: 5,
            sortBy: "title",
            order: "asc"
        });

        expect(buildEventWhereConditions).toHaveBeenCalledWith(
            {},
            {
                search: "React",
                page: 2,
                pageSize: 5,
                sortBy: "title",
                order: "asc"
            }
        );

        expect(getPublicCreatedEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                creator: "Alice",
                pagination: {
                    limit: 5,
                    offset: 5,
                    orderField: "title",
                    orderDirection: "ASC"
                }
            })
        );
    });

    it("should return pagination metadata", async () => {
        const user = createMockUser();

        const eventA = createMockEvent({
            id: 1,
            title: "Event A"
        });

        const eventB = createMockEvent({
            id: 2,
            title: "Event B"
        });

        User.findByPk.mockResolvedValue(user);

        getPublicCreatedEvents.mockResolvedValue({
            count: 3,
            rows: [eventA, eventB]
        });

        countActiveParticipantsByEventIds.mockResolvedValue({});

        const result = await userService.getPublicUserEventsByID(1, {
            page: 1,
            pageSize: 2
        });

        expect(result.page).toBe(1);
        expect(result.pageSize).toBe(2);
        expect(result.totalEvents).toBe(3);
        expect(result.totalPages).toBe(2);
        expect(result.events).toHaveLength(2);
    });

    it("should normalize grouped count results", async () => {
        const user = createMockUser();

        const eventA = createMockEvent({
            id: 1,
            title: "Event A"
        });

        const eventB = createMockEvent({
            id: 2,
            title: "Event B"
        });

        User.findByPk.mockResolvedValue(user);

        getPublicCreatedEvents.mockResolvedValue({
            count: [
                { count: 1 },
                { count: 1 }
            ],
            rows: [eventA, eventB]
        });

        countActiveParticipantsByEventIds.mockResolvedValue({});

        const result = await userService.getPublicUserEventsByID(1, {
            pageSize: 2
        });

        expect(result.totalEvents).toBe(2);
        expect(result.totalPages).toBe(1);
    });

    /* =============================
       PARTICIPANT COUNTS
    ============================= */

    it("should call countActiveParticipantsByEventIds with public event ids", async () => {
        const user = createMockUser();

        const eventA = createMockEvent({
            id: 1
        });

        const eventB = createMockEvent({
            id: 2
        });

        User.findByPk.mockResolvedValue(user);

        getPublicCreatedEvents.mockResolvedValue({
            count: 2,
            rows: [eventA, eventB]
        });

        countActiveParticipantsByEventIds.mockResolvedValue({});

        await userService.getPublicUserEventsByID(1);

        expect(countActiveParticipantsByEventIds).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            [1, 2]
        );
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when user is not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(userService.getPublicUserEventsByID(1)).rejects.toMatchObject({
            statusCode: 404,
            message: "User not found"
        });

        expect(getPublicCreatedEvents).not.toHaveBeenCalled();
        expect(getPublicJoinedEvents).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        User.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(userService.getPublicUserEventsByID(1)).rejects.toThrow("DB error");
    });
});
