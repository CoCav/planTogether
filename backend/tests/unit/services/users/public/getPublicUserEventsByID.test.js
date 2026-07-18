/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindUserByIdOrFail = jest.fn();

const mockBuildEventWhereConditions = jest.fn();
const mockBuildEventCreatorInclude = jest.fn();
const mockGetEventStatus = jest.fn();
const mockGetEventListStats = jest.fn();

const mockGetPublicCreatedEvents = jest.fn();
const mockGetPublicJoinedEvents = jest.fn();

const mockGetPaginationOptions = jest.fn();
const mockGetTotalCount = jest.fn();
const mockGetTotalPages = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../../src/config/database", () => ({
    name: "sequelize"
}));

jest.mock("../../../../../src/models/userModel", () => ({
    name: "User"
}));

jest.mock("../../../../../src/models/eventModel", () => ({
    name: "Event"
}));

jest.mock("../../../../../src/models/associations/eventUserRoleModel", () => ({
    name: "EventUserRole"
}));

jest.mock("../../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../../src/utils/users/userQueries", () => ({
    findUserByIdOrFail: mockFindUserByIdOrFail
}));

jest.mock("../../../../../src/utils/events/eventFilters", () => ({
    buildEventWhereConditions: mockBuildEventWhereConditions
}));

jest.mock("../../../../../src/utils/events/eventCreatorInclude", () => ({
    buildEventCreatorInclude: mockBuildEventCreatorInclude
}));

jest.mock("../../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: mockGetEventStatus
}));

jest.mock("../../../../../src/utils/events/eventListStats", () => ({
    getEventListStats: mockGetEventListStats
}));

jest.mock("../../../../../src/utils/users/public/publicUserEventQueries", () => ({
    getPublicCreatedEvents: mockGetPublicCreatedEvents,
    getPublicJoinedEvents: mockGetPublicJoinedEvents
}));

jest.mock("../../../../../src/utils/users/public/publicUserFormatter", () => ({
    formatPublicUser: jest.fn()
}));

jest.mock("../../../../../src/utils/pagination", () => ({
    getPaginationOptions: mockGetPaginationOptions,
    getTotalCount: mockGetTotalCount,
    getTotalPages: mockGetTotalPages
}));

/* =============================
   TEST IMPORTS
============================= */

const sequelize = require("../../../../../src/config/database");

const User = require("../../../../../src/models/userModel");
const Event = require("../../../../../src/models/eventModel");
const EventUserRole = require("../../../../../src/models/associations/eventUserRoleModel");
const EventLike = require("../../../../../src/models/associations/eventLikeModel");

const { EVENT_SORT_FIELDS } = require("../../../../../src/constants/eventSortFields");
const { EVENT_STATUS } = require("../../../../../src/constants/eventStatus");

const { getPublicUserEventsById } = require("../../../../../src/services/users/publicUserService");

const { createMockEventModel } = require("../../../../factories/eventFactory");

/* ==========================================================================
   Get Public User Events Service Unit Tests

   Tests public user event listing business logic.

   Responsibilities
   - Test public user existence validation
   - Test created and joined event query delegation
   - Test event filter delegation
   - Test pagination delegation
   - Test shared event statistic enrichment
   - Test event status and like state enrichment
   - Test pagination metadata
   - Test empty event results
   - Test unexpected error propagation

   Notes
   - Public event queries and shared event statistics are mocked.
   - The created view is used by default.
=========================================================================== */

describe("get public user events service", () => {
    let event;

    beforeEach(() => {
        jest.clearAllMocks();

        event = createMockEventModel({
            id: 100,
            creatorId: 10,
            title: "Public Event"
        });

        mockFindUserByIdOrFail.mockResolvedValue({
            id: 10
        });

        mockBuildEventWhereConditions.mockImplementation(
            (whereConditions) => whereConditions
        );

        mockBuildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        mockGetPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "startDateTime",
            orderDirection: "ASC"
        });

        mockGetPublicCreatedEvents.mockResolvedValue({
            count: 1,
            rows: [event]
        });

        mockGetPublicJoinedEvents.mockResolvedValue({
            count: 1,
            rows: [event]
        });

        mockGetEventListStats.mockResolvedValue({
            participantCountByEventId: {
                100: 4
            },
            likesCountByEventId: {
                100: 3
            },
            likedEventIds: new Set([100])
        });

        mockGetEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        mockGetTotalCount.mockReturnValue(1);
        mockGetTotalPages.mockReturnValue(1);
    });

    /* =============================
       CREATED EVENTS
    ============================= */

    describe("Created event view", () => {
        it("returns created events by default", async () => {
            const result = await getPublicUserEventsById(10);

            expect(mockFindUserByIdOrFail).toHaveBeenCalledWith(User, 10);

            expect(mockBuildEventWhereConditions).toHaveBeenCalledWith({}, {});

            expect(mockGetPaginationOptions).toHaveBeenCalledWith({
                sortBy: "startDateTime",
                order: "asc"
            },
                EVENT_SORT_FIELDS,
                "startDateTime",
                "ASC"
            );

            expect(mockGetPublicCreatedEvents).toHaveBeenCalledTimes(1);
            expect(mockGetPublicCreatedEvents).toHaveBeenCalledWith({
                Event,
                User,
                userId: 10,
                eventFilter: {},
                creator: undefined,
                pagination: {
                    limit: 10,
                    offset: 0,
                    orderField: "startDateTime",
                    orderDirection: "ASC"
                },
                buildEventCreatorInclude: mockBuildEventCreatorInclude
            });

            expect(mockGetPublicJoinedEvents).not.toHaveBeenCalled();

            expect(result.view).toBe("created");
        });

        it("uses the created query when the created view is explicit", async () => {
            await getPublicUserEventsById(10, {
                view: "created"
            });

            expect(mockGetPublicCreatedEvents).toHaveBeenCalledTimes(1);

            expect(mockGetPublicJoinedEvents).not.toHaveBeenCalled();
        });
    });

    /* =============================
       JOINED EVENTS
    ============================= */

    describe("Joined event view", () => {
        it("delegates joined event retrieval to the joined query helper", async () => {
            const result = await getPublicUserEventsById(10, {
                view: "joined"
            });

            expect(mockGetPublicJoinedEvents).toHaveBeenCalledTimes(1);

            expect(mockGetPublicJoinedEvents).toHaveBeenCalledWith({
                Event,
                User,
                EventUserRole,
                userId: 10,
                eventFilter: {},
                creator: undefined,
                pagination: {
                    limit: 10,
                    offset: 0,
                    orderField: "startDateTime",
                    orderDirection: "ASC"
                },
                buildEventCreatorInclude: mockBuildEventCreatorInclude
            });

            expect(mockGetPublicCreatedEvents).not.toHaveBeenCalled();

            expect(result.view).toBe("joined");
        });
    });

    /* =============================
       FILTERS AND PAGINATION
    ============================= */

    describe("Filters and pagination", () => {
        it("keeps creator filtering outside generic event filters", async () => {
            await getPublicUserEventsById(10, {
                creator: "John",
                search: "music",
                mode: "online"
            });

            expect(mockBuildEventWhereConditions).toHaveBeenCalledWith({}, {
                search: "music",
                mode: "online"
            });

            expect(mockGetPublicCreatedEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    creator: "John"
                }));
        });

        it("forwards custom pagination and sorting options", async () => {
            mockGetPaginationOptions.mockReturnValue({
                page: 2,
                pageSize: 5,
                limit: 5,
                offset: 5,
                orderField: "title",
                orderDirection: "DESC"
            });

            await getPublicUserEventsById(10, {
                page: "2",
                pageSize: "5",
                sortBy: "title",
                order: "desc"
            });

            expect(mockGetPaginationOptions).toHaveBeenCalledWith({
                page: "2",
                pageSize: "5",
                sortBy: "title",
                order: "desc"
            },
                EVENT_SORT_FIELDS,
                "startDateTime",
                "ASC"
            );

            expect(mockGetPublicCreatedEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    pagination: {
                        limit: 5,
                        offset: 5,
                        orderField: "title",
                        orderDirection: "DESC"
                    }
                })
            );
        });
    });

    /* =============================
       EVENT ENRICHMENT
    ============================= */

    describe("Event enrichment", () => {
        it("adds shared event statistics, status and current user like state", async () => {
            const result = await getPublicUserEventsById(10, {}, 20);

            expect(mockGetEventListStats).toHaveBeenCalledTimes(1);

            expect(mockGetEventListStats).toHaveBeenCalledWith({
                EventUserRole,
                EventLike,
                sequelize,
                eventIds: [100],
                currentUserId: 20
            });

            expect(mockGetEventStatus).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 100,
                    participantCount: 4,
                    likesCount: 3
                })
            );

            expect(result.events[0]).toMatchObject({
                id: 100,
                title: "Public Event",
                participantCount: 4,
                likesCount: 3,
                status: EVENT_STATUS.UPCOMING,
                isLikedByCurrentUser: true
            });
        });

        it("uses zero counts and a false like state when statistics are missing", async () => {
            mockGetEventListStats.mockResolvedValue({
                participantCountByEventId: {},
                likesCountByEventId: {},
                likedEventIds: new Set()
            });

            const result = await getPublicUserEventsById(10);

            expect(result.events[0]).toMatchObject({
                participantCount: 0,
                likesCount: 0,
                isLikedByCurrentUser: false
            });
        });

        it("forwards a null current user ID for anonymous listings", async () => {
            await getPublicUserEventsById(10);

            expect(mockGetEventListStats).toHaveBeenCalledWith(
                expect.objectContaining({
                    currentUserId: null
                })
            );
        });

        it("serializes each event before enrichment", async () => {
            await getPublicUserEventsById(10);

            expect(event.toJSON).toHaveBeenCalledTimes(1);
        });

        it("preserves existing event fields", async () => {
            event = createMockEventModel({
                id: 100,
                title: "Image Event",
                image: "/uploads/events/event.png"
            });

            mockGetPublicCreatedEvents.mockResolvedValue({
                count: 1,
                rows: [event]
            });

            const result = await getPublicUserEventsById(10);

            expect(result.events[0].image).toBe("/uploads/events/event.png");
        });
    });

    /* =============================
       PAGINATION METADATA
    ============================= */

    describe("Pagination metadata", () => {
        it("returns normalized pagination metadata", async () => {
            const groupedCount = [{
                count: "1"
            }, {
                count: "1"
            }];

            mockGetPublicCreatedEvents.mockResolvedValue({
                count: groupedCount,
                rows: [event]
            });

            mockGetTotalCount.mockReturnValue(2);
            mockGetTotalPages.mockReturnValue(1);

            const result = await getPublicUserEventsById(10);

            expect(mockGetTotalCount).toHaveBeenCalledWith(groupedCount);
            expect(mockGetTotalPages).toHaveBeenCalledWith(2, 10);

            expect(result).toMatchObject({
                view: "created",
                page: 1,
                pageSize: 10,
                totalEvents: 2,
                totalPages: 1
            });
        });
    });

    /* =============================
       EMPTY EVENTS
    ============================= */

    describe("Empty event results", () => {
        it("returns an empty paginated event list", async () => {
            mockGetPublicCreatedEvents.mockResolvedValue({
                count: 0,
                rows: []
            });

            mockGetEventListStats.mockResolvedValue({
                participantCountByEventId: {},
                likesCountByEventId: {},
                likedEventIds: new Set()
            });

            mockGetTotalCount.mockReturnValue(0);
            mockGetTotalPages.mockReturnValue(0);

            const result = await getPublicUserEventsById(10);

            expect(mockGetEventListStats).toHaveBeenCalledWith({
                EventUserRole,
                EventLike,
                sequelize,
                eventIds: [],
                currentUserId: null
            });

            expect(mockGetEventStatus).not.toHaveBeenCalled();

            expect(result).toEqual({
                view: "created",
                page: 1,
                pageSize: 10,
                totalEvents: 0,
                totalPages: 0,
                events: []
            });
        });
    });

    /* =============================
       USER VALIDATION
    ============================= */

    describe("User validation", () => {
        it("stops when the public user does not exist", async () => {
            const error = Object.assign(new Error("User not found"), {
                statusCode: 404
            });

            mockFindUserByIdOrFail.mockRejectedValue(error);

            await expect(getPublicUserEventsById(999)).rejects.toBe(error);

            expect(mockBuildEventWhereConditions).not.toHaveBeenCalled();

            expect(mockGetPublicCreatedEvents).not.toHaveBeenCalled();
            expect(mockGetPublicJoinedEvents).not.toHaveBeenCalled();

            expect(mockGetEventListStats).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates created event query errors", async () => {
            const error = new Error("Created event query failed");

            mockGetPublicCreatedEvents.mockRejectedValue(error);

            await expect(getPublicUserEventsById(10)).rejects.toBe(error);

            expect(mockGetEventListStats).not.toHaveBeenCalled();
        });

        it("propagates joined event query errors", async () => {
            const error = new Error("Joined event query failed");

            mockGetPublicJoinedEvents.mockRejectedValue(error);

            await expect(
                getPublicUserEventsById(10, {
                    view: "joined"
                })
            ).rejects.toBe(error);

            expect(mockGetEventListStats).not.toHaveBeenCalled();
        });

        it("propagates event statistic errors", async () => {
            const error = new Error("Event statistics failed");

            mockGetEventListStats.mockRejectedValue(error);

            await expect(getPublicUserEventsById(10)).rejects.toBe(error);

            expect(mockGetEventStatus).not.toHaveBeenCalled();
        });

        it("propagates event serialization errors", async () => {
            const error = new Error("Event serialization failed");

            event.toJSON.mockImplementation(() => {
                throw error;
            });

            await expect(getPublicUserEventsById(10)).rejects.toBe(error);

            expect(mockGetEventStatus).not.toHaveBeenCalled();
        });

        it("propagates pagination option errors", async () => {
            const error = new Error("Pagination failed");

            mockGetPaginationOptions.mockImplementation(() => {
                throw error;
            });

            await expect(getPublicUserEventsById(10)).rejects.toBe(error);

            expect(mockGetPublicCreatedEvents).not.toHaveBeenCalled();

            expect(mockGetPublicJoinedEvents).not.toHaveBeenCalled();
        });
    });
});
