const mockFindUserByIdOrFail = jest.fn();
const mockBuildEventWhereConditions = jest.fn();
const mockBuildEventCreatorInclude = jest.fn();
const mockGetEventListStats = jest.fn();
const mockGetEventStatus = jest.fn();

const mockGetPaginationOptions = jest.fn();
const mockGetTotalCount = jest.fn();
const mockGetTotalPages = jest.fn();

const mockOpIn = Symbol("in");
const mockOpLt = Symbol("lt");
const mockOpGte = Symbol("gte");

jest.mock("sequelize", () => ({
    Op: {
        in: mockOpIn,
        lt: mockOpLt,
        gte: mockOpGte
    }
}));

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
    findAndCountAll: jest.fn()
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

jest.mock("../../../../../src/utils/events/eventListStats", () => ({
    getEventListStats: mockGetEventListStats
}));

jest.mock("../../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: mockGetEventStatus
}));

jest.mock("../../../../../src/utils/pagination", () => ({
    getPaginationOptions: mockGetPaginationOptions,
    getTotalCount: mockGetTotalCount,
    getTotalPages: mockGetTotalPages
}));

jest.mock("../../../../../src/utils/stringNormalizer", () => ({
    normalizeEmail: jest.fn()
}));

jest.mock("../../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

jest.mock("../../../../../src/utils/auth/passwordHasher", () => ({
    hashPassword: jest.fn(),
    comparePassword: jest.fn()
}));

const sequelize = require("../../../../../src/config/database");

const User = require("../../../../../src/models/userModel");
const Event = require("../../../../../src/models/eventModel");
const EventUserRole = require("../../../../../src/models/associations/eventUserRoleModel");
const EventLike = require("../../../../../src/models/associations/eventLikeModel");

const { EVENT_ROLES } = require("../../../../../src/constants/eventRoles");
const { EVENT_SORT_FIELDS } = require("../../../../../src/constants/eventSortFields");
const { EVENT_STATUS } = require("../../../../../src/constants/eventStatus");

const { getCurrentUserEventsById } = require("../../../../../src/services/users/authenticatedUserService");

/* ==========================================================================
   Get Current User Events Service Unit Tests

   Tests current user event listing business logic.

   Responsibilities
   - Test current user existence validation
   - Test created and joined view role filters
   - Test current and history date filters
   - Test event filter delegation
   - Test pagination delegation
   - Test membership query composition
   - Test shared event statistic enrichment
   - Test event status and like state enrichment
   - Test pagination metadata
   - Test unexpected error propagation

   Notes
   - User queries, filters, pagination and event statistics are mocked.
   - Active memberships are queried through EventUserRole.
=========================================================================== */

describe("get current user events service", () => {
    let creatorInclude;
    let membership;

    beforeEach(() => {
        jest.clearAllMocks();

        creatorInclude = {
            model: User,
            as: "creator"
        };

        membership = {
            toJSON: jest.fn(() => ({
                id: 1,
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT,
                event: {
                    id: 100,
                    title: "User Event"
                }
            }))
        };

        mockFindUserByIdOrFail.mockResolvedValue({
            id: 10
        });

        mockBuildEventWhereConditions.mockImplementation(
            (whereConditions) => whereConditions
        );

        mockBuildEventCreatorInclude.mockReturnValue(creatorInclude);

        mockGetPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "startDateTime",
            orderDirection: "ASC"
        });

        mockGetEventListStats.mockResolvedValue({
            participantCountByEventId: {
                100: 5
            },
            likesCountByEventId: {
                100: 2
            },
            likedEventIds: new Set([100])
        });

        mockGetEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        mockGetTotalCount.mockReturnValue(1);
        mockGetTotalPages.mockReturnValue(1);

        EventUserRole.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [membership]
        });
    });

    /* =============================
       EVENT LISTING
    ============================= */

    describe("getCurrentUserEventsById", () => {
        it("returns paginated current user events with shared metadata", async () => {
            const result = await getCurrentUserEventsById(10, {});

            expect(mockFindUserByIdOrFail).toHaveBeenCalledWith(User, 10);

            expect(mockBuildEventWhereConditions).toHaveBeenCalledWith({}, {}, {
                includeStatus: false
            });

            expect(mockBuildEventCreatorInclude).toHaveBeenCalledWith(User, undefined);

            expect(mockGetPaginationOptions).toHaveBeenCalledWith(
                {
                    sortBy: "startDateTime",
                    order: "asc"
                },
                EVENT_SORT_FIELDS,
                "startDateTime",
                "ASC"
            );

            expect(EventUserRole.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    userId: 10,
                    deletedAt: null
                },
                include: [{
                    model: Event,
                    as: "event",
                    where: {},
                    include: [
                        creatorInclude
                    ]
                }],
                limit: 10,
                offset: 0,
                order: [[
                    {
                        model: Event,
                        as: "event"
                    },
                    "startDateTime",
                    "ASC"
                ]],
                subQuery: false
            });

            expect(membership.toJSON).toHaveBeenCalled();

            expect(mockGetEventListStats).toHaveBeenCalledWith({
                EventUserRole,
                EventLike,
                sequelize,
                eventIds: [100],
                currentUserId: 10
            });

            expect(mockGetEventStatus).toHaveBeenCalledWith({
                id: 100,
                title: "User Event",
                participantCount: 5,
                likesCount: 2
            });

            expect(mockGetTotalCount).toHaveBeenCalledWith(1);
            expect(mockGetTotalPages).toHaveBeenCalledWith(1, 10);

            expect(result).toEqual({
                page: 1,
                pageSize: 10,
                totalEvents: 1,
                totalPages: 1,
                events: [{
                    id: 1,
                    userId: 10,
                    role: EVENT_ROLES.PARTICIPANT,
                    event: {
                        id: 100,
                        title: "User Event",
                        participantCount: 5,
                        likesCount: 2,
                        status: EVENT_STATUS.UPCOMING,
                        isLikedByCurrentUser: true
                    }
                }]
            });
        });

        it("returns empty pagination data when no memberships are found", async () => {
            EventUserRole.findAndCountAll.mockResolvedValue({
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

            const result = await getCurrentUserEventsById(10);

            expect(mockGetEventListStats).toHaveBeenCalledWith({
                EventUserRole,
                EventLike,
                sequelize,
                eventIds: [],
                currentUserId: 10
            });

            expect(result).toEqual({
                page: 1,
                pageSize: 10,
                totalEvents: 0,
                totalPages: 0,
                events: []
            });
        });
    });

    /* =============================
       VIEW FILTERS
    ============================= */

    describe("View filters", () => {
        it.each([[
            "created",
            EVENT_ROLES.ORGANIZER
        ], [
            "createdHistory",
            EVENT_ROLES.ORGANIZER
        ]])("filters %s views by organizer role",
            async (view, expectedRole) => {
                await getCurrentUserEventsById(10, {
                    view
                });

                const options = EventUserRole
                    .findAndCountAll
                    .mock.calls[0][0];

                expect(options.where.role).toBe(expectedRole);
            }
        );

        it.each([
            "joined",
            "joinedHistory"
        ])("filters %s views by participant and co-organizer roles",
            async (view) => {
                await getCurrentUserEventsById(10, {
                    view
                });

                const options = EventUserRole
                    .findAndCountAll
                    .mock.calls[0][0];

                expect(options.where.role[mockOpIn]).toEqual([
                    EVENT_ROLES.PARTICIPANT,
                    EVENT_ROLES.CO_ORGANIZER
                ]);
            }
        );

        it.each([
            "created",
            "joined"
        ])("filters %s views to active or upcoming events",
            async (view) => {
                await getCurrentUserEventsById(10, {
                    view
                });

                const options = EventUserRole
                    .findAndCountAll
                    .mock.calls[0][0];

                expect(options.include[0]
                    .where
                    .endDateTime[mockOpGte]
                ).toBeInstanceOf(Date);
            }
        );

        it.each([
            "createdHistory",
            "joinedHistory"
        ])("filters %s views to completed events",
            async (view) => {
                await getCurrentUserEventsById(10, {
                    view
                });

                const options = EventUserRole
                    .findAndCountAll
                    .mock.calls[0][0];

                expect(options.include[0]
                    .where
                    .endDateTime[mockOpLt]
                ).toBeInstanceOf(Date);
            }
        );
    });

    /* =============================
       FILTERS AND PAGINATION
    ============================= */

    describe("Filters and pagination", () => {
        it("keeps creator filtering outside generic event filters", async () => {
            await getCurrentUserEventsById(10, {
                view: "joined",
                creator: "John",
                search: "music"
            });

            expect(mockBuildEventWhereConditions).toHaveBeenCalledWith(expect.any(Object),
                {
                    view: "joined",
                    search: "music"
                }, {
                includeStatus: false
            });

            expect(mockBuildEventCreatorInclude).toHaveBeenCalledWith(User, "John");
        });

        it("uses descending defaults for history views", async () => {
            await getCurrentUserEventsById(10, {
                view: "createdHistory"
            });

            expect(mockGetPaginationOptions).toHaveBeenCalledWith(
                {
                    view: "createdHistory",
                    sortBy: "startDateTime",
                    order: "desc"
                },
                EVENT_SORT_FIELDS,
                "startDateTime",
                "DESC"
            );
        });

        it("forwards custom pagination options through the membership query", async () => {
            mockGetPaginationOptions.mockReturnValue({
                page: 2,
                pageSize: 5,
                limit: 5,
                offset: 5,
                orderField: "title",
                orderDirection: "DESC"
            });

            await getCurrentUserEventsById(10, {
                page: "2",
                pageSize: "5",
                sortBy: "title",
                order: "desc"
            }
            );

            expect(EventUserRole.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 5,
                    offset: 5,
                    order: [[
                        {
                            model: Event,
                            as: "event"
                        },
                        "title",
                        "DESC"
                    ]]
                })
            );
        });
    });

    /* =============================
       EVENT ENRICHMENT
    ============================= */

    describe("Event enrichment", () => {
        it("falls back to zero counts and false like state", async () => {
            mockGetEventListStats.mockResolvedValue({
                participantCountByEventId: {},
                likesCountByEventId: {},
                likedEventIds: new Set()
            });

            const result = await getCurrentUserEventsById(10);

            expect(result.events[0].event).toMatchObject({
                participantCount: 0,
                likesCount: 0,
                isLikedByCurrentUser: false
            });
        });

        it("preserves existing event response fields", async () => {
            membership.toJSON.mockReturnValue({
                id: 1,
                event: {
                    id: 100,
                    title: "Image Event",
                    image: "/uploads/events/image.jpg"
                }
            });

            const result = await getCurrentUserEventsById(10);

            expect(result.events[0].event.image).toBe("/uploads/events/image.jpg");
        });

        it("normalizes grouped membership counts through the pagination helper", async () => {
            const groupedCount = [{
                count: "1"
            }, {
                count: "1"
            }];

            EventUserRole.findAndCountAll.mockResolvedValue({
                count: groupedCount,
                rows: []
            });

            mockGetEventListStats.mockResolvedValue({
                participantCountByEventId: {},
                likesCountByEventId: {},
                likedEventIds: new Set()
            });

            mockGetTotalCount.mockReturnValue(2);
            mockGetTotalPages.mockReturnValue(1);

            const result = await getCurrentUserEventsById(10);

            expect(mockGetTotalCount).toHaveBeenCalledWith(groupedCount);

            expect(result.totalEvents).toBe(2);
        });
    });

    /* =============================
       USER VALIDATION
    ============================= */

    describe("User validation", () => {
        it("stops when the current user does not exist", async () => {
            const error = Object.assign(
                new Error("User not found"),
                {
                    statusCode: 404
                }
            );

            mockFindUserByIdOrFail.mockRejectedValue(error);

            await expect(getCurrentUserEventsById(999)).rejects.toBe(error);

            expect(mockBuildEventWhereConditions).not.toHaveBeenCalled();

            expect(EventUserRole.findAndCountAll).not.toHaveBeenCalled();

            expect(mockGetEventListStats).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it.each([[
            "membership query",
            () => {
                EventUserRole.findAndCountAll.mockRejectedValue(
                    new Error("Membership query failed")
                );
            }
        ], [
            "event statistics",
            () => {
                mockGetEventListStats.mockRejectedValue(
                    new Error("Event statistics failed")
                );
            }
        ]])("propagates %s errors",
            async (_, configureError) => {
                configureError();

                await expect(getCurrentUserEventsById(10)).rejects.toBeInstanceOf(Error);
            }
        );

        it("propagates membership serialization errors before statistic retrieval", async () => {
            const error = new Error("Membership serialization failed");

            membership.toJSON.mockImplementation(() => {
                throw error;
            });

            await expect(getCurrentUserEventsById(10)).rejects.toBe(error);

            expect(mockGetEventListStats).not.toHaveBeenCalled();
        });
    });
});
