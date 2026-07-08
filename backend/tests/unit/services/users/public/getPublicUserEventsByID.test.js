/* ==================================================
   USER SERVICE - GET PUBLIC USER EVENTS BY ID TESTS

   Tests:
   - paginated created events retrieval
   - paginated joined events retrieval
   - empty paginated event results
   - participant count enrichment
   - like count enrichment
   - current user like state enrichment
   - missing user rejection
   - database error propagation

   Ensures:
   - public user events use view-based pagination
   - created and joined event queries are delegated correctly
   - participant counts and statuses are enriched safely
   - like counts are retrieved through optimized grouped queries
   - optional current user liked event IDs are fetched in one query
   - missing users and database errors are handled safely
================================================== */

jest.mock("../../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../../src/models/eventModel", () => ({}));

jest.mock("../../../../../src/models/associations/eventUserRoleModel", () => ({}));

jest.mock("../../../../../src/models/associations/eventLikeModel", () => ({}));

jest.mock("../../../../../src/utils/events/eventFilters.js", () => ({
    buildEventWhereConditions: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventCreator.js", () => ({
    buildEventCreatorInclude: jest.fn(() => ({
        model: "User",
        as: "creator"
    }))
}));

jest.mock("../../../../../src/utils/eventMemberships/eventParticipants.js", () => ({
    countActiveParticipantsByEventIds: jest.fn()
}));

jest.mock("../../../../../src/utils/eventLikes/eventLikes.js", () => ({
    findLikedEventIdsByUser: jest.fn(),
    countEventLikesByEventIds: jest.fn()
}));

jest.mock("../../../../../src/utils/users/public/publicUserEventQueries.js", () => ({
    getPublicCreatedEvents: jest.fn(),
    getPublicJoinedEvents: jest.fn()
}));

const User = require("../../../../../src/models/userModel");
const EventLike = require("../../../../../src/models/associations/eventLikeModel");

const userService = require("../../../../../src/services/userService");

const { buildEventWhereConditions } = require("../../../../../src/utils/events/eventFilters");
const { buildEventCreatorInclude } = require("../../../../../src/utils/events/eventCreatorInclude");
const { countActiveParticipantsByEventIds } = require("../../../../../src/utils/eventMemberships/eventParticipants");

const {
    findLikedEventIdsByUser,
    countEventLikesByEventIds
} = require("../../../../../src/utils/eventLikes/eventLikes");

const {
    getPublicCreatedEvents,
    getPublicJoinedEvents
} = require("../../../../../src/utils/users/public/publicUserEventQueries");

const { createMockUser } = require("../../../../factories/userFactory");

describe("userService - getPublicUserEventsById", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        countActiveParticipantsByEventIds.mockResolvedValue({});
        countEventLikesByEventIds.mockResolvedValue({});
        findLikedEventIdsByUser.mockResolvedValue(new Set());
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

        countEventLikesByEventIds.mockResolvedValue({
            1: 3
        });

        const result = await userService.getPublicUserEventsById(1);

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
                    likesCount: 3,
                    isLikedByCurrentUser: false,
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

        countEventLikesByEventIds.mockResolvedValue({
            2: 1
        });

        const result = await userService.getPublicUserEventsById(1, {
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
                    likesCount: 1,
                    isLikedByCurrentUser: false,
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

        const result = await userService.getPublicUserEventsById(1);

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

        await userService.getPublicUserEventsById(1, {
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

        const result = await userService.getPublicUserEventsById(1, {
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

        const result = await userService.getPublicUserEventsById(1, {
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

        await userService.getPublicUserEventsById(1);

        expect(countActiveParticipantsByEventIds).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            [1, 2]
        );
    });

    /* =============================
       LIKE METADATA
    ============================= */

    it("should call countEventLikesByEventIds with public event ids", async () => {
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

        await userService.getPublicUserEventsById(1);

        expect(countEventLikesByEventIds).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            [1, 2]
        );
    });

    it("should enrich public events with like count and current user like state", async () => {
        const user = createMockUser();

        const event = createMockEvent({
            id: 1,
            title: "Public Liked Event"
        });

        User.findByPk.mockResolvedValue(user);

        getPublicCreatedEvents.mockResolvedValue({
            count: 1,
            rows: [event]
        });

        countActiveParticipantsByEventIds.mockResolvedValue({
            1: 2
        });

        countEventLikesByEventIds.mockResolvedValue({
            1: 4
        });

        findLikedEventIdsByUser.mockResolvedValue(new Set([1]));

        const result = await userService.getPublicUserEventsById(
            1,
            { view: "created" },
            10
        );

        expect(countEventLikesByEventIds).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            [1]
        );

        expect(findLikedEventIdsByUser).toHaveBeenCalledWith(
            EventLike,
            [1],
            10
        );

        expect(result.events[0]).toMatchObject({
            id: 1,
            title: "Public Liked Event",
            participantCount: 2,
            likesCount: 4,
            isLikedByCurrentUser: true
        });
    });

    it("should fallback like count to zero and liked state to false when missing", async () => {
        const user = createMockUser();

        const event = createMockEvent({
            id: 9,
            title: "Unliked Public Event"
        });

        User.findByPk.mockResolvedValue(user);

        getPublicCreatedEvents.mockResolvedValue({
            count: 1,
            rows: [event]
        });

        countEventLikesByEventIds.mockResolvedValue({});
        findLikedEventIdsByUser.mockResolvedValue(new Set());

        const result = await userService.getPublicUserEventsById(1);

        expect(result.events[0]).toMatchObject({
            likesCount: 0,
            isLikedByCurrentUser: false
        });
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when user is not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(userService.getPublicUserEventsById(1)).rejects.toMatchObject({
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

        await expect(userService.getPublicUserEventsById(1)).rejects.toThrow("DB error");
    });
});
