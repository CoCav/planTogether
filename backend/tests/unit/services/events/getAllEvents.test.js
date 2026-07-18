/* =============================
   MOCK FUNCTIONS
============================= */

const mockBuildEventWhereConditions = jest.fn();
const mockBuildEventCreatorInclude = jest.fn();

const mockBuildActiveParticipantInclude = jest.fn();
const mockBuildEventParticipantCountAttribute = jest.fn();

const mockBuildEventReviewInclude = jest.fn();
const mockBuildEventReviewCountAttribute = jest.fn();
const mockBuildEventAverageRatingAttribute = jest.fn();

const mockBuildEventLikeInclude = jest.fn();
const mockBuildEventLikeCountAttribute = jest.fn();
const mockFindLikedEventIdsByUser = jest.fn();

const mockGetEventStatus = jest.fn();

const mockGetPaginationOptions = jest.fn();
const mockGetTotalCount = jest.fn();
const mockGetTotalPages = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/models/eventModel", () => ({
    findAndCountAll: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({
    name: "User"
}));

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({
    name: "EventUserRole"
}));

jest.mock("../../../../src/models/associations/eventReviewModel", () => ({
    name: "EventReview"
}));

jest.mock("../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../src/config/database", () => ({
    fn: jest.fn(),
    col: jest.fn(),
    cast: jest.fn()
}));

jest.mock("../../../../src/services/geocodingService", () => ({
    resolveEventLocation: jest.fn()
}));

jest.mock("../../../../src/utils/stringNormalizer", () => ({
    normalizeString: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventFilters", () => ({
    buildEventWhereConditions: mockBuildEventWhereConditions
}));

jest.mock("../../../../src/utils/events/eventCreatorInclude", () => ({
    buildEventCreatorInclude: mockBuildEventCreatorInclude
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventPayloadBuilder", () => ({
    buildCreateEventPayload: jest.fn(),
    buildUpdateEventPayload: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn(),
    assertEventNotStarted: jest.fn(),
    hasEventStarted: jest.fn(),
    getEventStatus: mockGetEventStatus
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventParticipants", () => ({
    buildActiveParticipantInclude: mockBuildActiveParticipantInclude,
    buildEventParticipantCountAttribute: mockBuildEventParticipantCountAttribute
}));

jest.mock("../../../../src/utils/eventReviews/eventReviews", () => ({
    buildEventReviewInclude: mockBuildEventReviewInclude,
    buildEventReviewCountAttribute: mockBuildEventReviewCountAttribute,
    buildEventAverageRatingAttribute: mockBuildEventAverageRatingAttribute
}));

jest.mock("../../../../src/utils/eventLikes/eventLikes", () => ({
    buildEventLikeInclude: mockBuildEventLikeInclude,
    buildEventLikeCountAttribute: mockBuildEventLikeCountAttribute,
    findLikedEventIdsByUser: mockFindLikedEventIdsByUser,
    findEventLike: jest.fn()
}));

jest.mock("../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: mockGetPaginationOptions,
    getTotalCount: mockGetTotalCount,
    getTotalPages: mockGetTotalPages
}));

/* =============================
   TEST IMPORTS
============================= */

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventReview = require("../../../../src/models/associations/eventReviewModel");
const EventLike = require("../../../../src/models/associations/eventLikeModel");

const { EVENT_SORT_FIELDS } = require("../../../../src/constants/eventSortFields");
const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");

const { getAllEvents } = require("../../../../src/services/eventService");

const { createMockEventModel } = require("../../../factories/eventFactory");

/* ==========================================================================
   Get All Events Service Unit Tests

   Tests paginated event listing retrieval.

   Responsibilities
   - Test event filter delegation
   - Test pagination option delegation
   - Test aggregate attribute construction
   - Test creator, participant, review and like includes
   - Test grouped count normalization
   - Test event status enrichment
   - Test current user like state enrichment
   - Test pagination metadata
   - Test unexpected error propagation

   Notes
   - Query builder and pagination utilities are mocked.
   - Aggregate helper behavior remains covered by utility unit tests.
=========================================================================== */

describe("get all events service", () => {
    let creatorInclude;
    let participantInclude;
    let reviewInclude;
    let likeInclude;

    let participantCountAttribute;
    let reviewCountAttribute;
    let averageRatingAttribute;
    let likeCountAttribute;

    beforeEach(() => {
        jest.clearAllMocks();

        creatorInclude = {
            model: User,
            as: "creator"
        };

        participantInclude = {
            model: User,
            as: "participants",
            attributes: []
        };

        reviewInclude = {
            model: EventReview,
            as: "reviews",
            attributes: []
        };

        likeInclude = {
            model: EventLike,
            as: "likes",
            attributes: []
        };

        participantCountAttribute = [
            "COUNT_DISTINCT_PARTICIPANTS",
            "participantCount"
        ];

        reviewCountAttribute = [
            "COUNT_DISTINCT_REVIEWS",
            "reviewCount"
        ];

        averageRatingAttribute = [
            "AVERAGE_RATING",
            "averageRating"
        ];

        likeCountAttribute = [
            "COUNT_DISTINCT_LIKES",
            "likesCount"
        ];

        mockBuildEventCreatorInclude.mockReturnValue(creatorInclude);
        mockBuildActiveParticipantInclude.mockReturnValue(participantInclude);
        mockBuildEventParticipantCountAttribute.mockReturnValue(participantCountAttribute);

        mockBuildEventReviewInclude.mockReturnValue(reviewInclude);
        mockBuildEventReviewCountAttribute.mockReturnValue(reviewCountAttribute);
        mockBuildEventAverageRatingAttribute.mockReturnValue(averageRatingAttribute);

        mockBuildEventLikeInclude.mockReturnValue(likeInclude);
        mockBuildEventLikeCountAttribute.mockReturnValue(likeCountAttribute);

        mockGetPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        mockGetTotalCount.mockReturnValue(1);
        mockGetTotalPages.mockReturnValue(1);

        mockFindLikedEventIdsByUser.mockResolvedValue(new Set());

        mockGetEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        Event.findAndCountAll.mockResolvedValue({
            count: [
                {
                    count: 1
                }
            ],
            rows: [
                createMockEventModel({
                    id: 1
                })
            ]
        });
    });

    /* =============================
       EVENT LISTING
    ============================= */

    describe("getAllEvents", () => {
        it("returns paginated events with computed status and like state", async () => {
            const query = {
                page: "1",
                pageSize: "10",
                sortBy: "createdAt",
                order: "desc"
            };

            const result = await getAllEvents(query, 10);

            expect(mockBuildEventWhereConditions).toHaveBeenCalledTimes(1);
            expect(mockBuildEventWhereConditions).toHaveBeenCalledWith({}, query);

            expect(mockGetPaginationOptions).toHaveBeenCalledTimes(1);
            expect(mockGetPaginationOptions).toHaveBeenCalledWith(
                query,
                EVENT_SORT_FIELDS,
                "createdAt",
                "DESC"
            );

            expect(mockBuildEventParticipantCountAttribute).toHaveBeenCalledWith(sequelize, "participants.id");
            expect(mockBuildEventReviewCountAttribute).toHaveBeenCalledWith(sequelize, "reviews.id");

            expect(mockBuildEventAverageRatingAttribute).toHaveBeenCalledWith(sequelize, "reviews.rating");
            expect(mockBuildEventLikeCountAttribute).toHaveBeenCalledWith(sequelize, "likes.id");

            expect(mockBuildEventCreatorInclude).toHaveBeenCalledWith(User, undefined);

            expect(mockBuildActiveParticipantInclude).toHaveBeenCalledWith(User);
            expect(mockBuildEventReviewInclude).toHaveBeenCalledWith(EventReview);
            expect(mockBuildEventLikeInclude).toHaveBeenCalledWith(EventLike);

            expect(Event.findAndCountAll).toHaveBeenCalledWith({
                where: {},
                limit: 10,
                offset: 0,
                order: [[
                    "createdAt",
                    "DESC"
                ]],
                attributes: {
                    include: [
                        participantCountAttribute,
                        reviewCountAttribute,
                        averageRatingAttribute,
                        likeCountAttribute
                    ]
                },
                include: [
                    creatorInclude,
                    participantInclude,
                    reviewInclude,
                    likeInclude
                ],
                group: [
                    "Event.id",
                    "creator.id"
                ],
                subQuery: false
            });

            expect(mockGetTotalCount).toHaveBeenCalledWith([{
                count: 1
            }]);

            expect(mockFindLikedEventIdsByUser).toHaveBeenCalledWith(EventLike, [1], 10);

            expect(mockGetEventStatus).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1
                })
            );

            expect(mockGetTotalPages).toHaveBeenCalledWith(1, 10);

            expect(result).toEqual({
                page: 1,
                pageSize: 10,
                totalEvents: 1,
                totalPages: 1,
                events: [
                    expect.objectContaining({
                        id: 1,
                        status:
                            EVENT_STATUS.UPCOMING,
                        isLikedByCurrentUser:
                            false
                    })
                ]
            });
        });
    });

    /* =============================
       FILTERS AND SORTING
    ============================= */

    describe("Filters and sorting", () => {
        it("forwards event filters and creator search configuration", async () => {
            const query = {
                mode: "online",
                theme: "Technology",
                creator: "John"
            };

            await getAllEvents(query);

            expect(mockBuildEventWhereConditions).toHaveBeenCalledWith({}, query);

            expect(mockBuildEventCreatorInclude).toHaveBeenCalledWith(User, "John");
        });

        it("forwards custom pagination and sorting values to the event query", async () => {
            mockGetPaginationOptions.mockReturnValue({
                page: 2,
                pageSize: 5,
                limit: 5,
                offset: 5,
                orderField: "startDateTime",
                orderDirection: "ASC"
            });

            await getAllEvents({
                page: "2",
                pageSize: "5",
                sortBy: "startDateTime",
                order: "asc"
            });

            expect(Event.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 5,
                    offset: 5,
                    order: [[
                        "startDateTime",
                        "ASC"
                    ]]
                })
            );
        });
    });

    /* =============================
       LIKE STATE
    ============================= */

    describe("Current user like state", () => {
        it("marks events liked by the current user", async () => {
            const firstEvent = createMockEventModel({
                id: 1,
                title: "Liked Event"
            });

            const secondEvent = createMockEventModel({
                id: 2,
                title: "Unliked Event"
            });

            Event.findAndCountAll.mockResolvedValue({
                count: [
                    {
                        count: 1
                    },
                    {
                        count: 1
                    }
                ],
                rows: [
                    firstEvent,
                    secondEvent
                ]
            });

            mockGetTotalCount.mockReturnValue(2);

            mockFindLikedEventIdsByUser.mockResolvedValue(new Set([1]));

            const result = await getAllEvents({}, 10);

            expect(mockFindLikedEventIdsByUser).toHaveBeenCalledWith(EventLike, [1, 2], 10);

            expect(result.events[0]).toMatchObject({
                id: 1,
                isLikedByCurrentUser: true
            });

            expect(result.events[1]).toMatchObject({
                id: 2,
                isLikedByCurrentUser: false
            });
        });

        it("forwards a null user ID for anonymous event listings", async () => {
            await getAllEvents();

            expect(mockFindLikedEventIdsByUser).toHaveBeenCalledWith(EventLike, [1], null);
        });

        it("supports an empty event result without like lookups failing", async () => {
            Event.findAndCountAll.mockResolvedValue({
                count: [],
                rows: []
            });

            mockGetTotalCount.mockReturnValue(0);
            mockGetTotalPages.mockReturnValue(0);

            mockFindLikedEventIdsByUser.mockResolvedValue(new Set());

            const result = await getAllEvents();

            expect(mockFindLikedEventIdsByUser).toHaveBeenCalledWith(EventLike, [], null);

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
       GROUPED COUNT
    ============================= */

    describe("Grouped event count", () => {
        it("normalizes grouped Sequelize counts through the pagination helper", async () => {
            const groupedCount = [{
                count: "1"
            }, {
                count: "1"
            }, {
                count: "1"
            }];

            Event.findAndCountAll.mockResolvedValue({
                count: groupedCount,
                rows: []
            });

            mockGetTotalCount.mockReturnValue(3);
            mockGetTotalPages.mockReturnValue(1);

            const result = await getAllEvents({
                pageSize: "5"
            });

            expect(mockGetTotalCount).toHaveBeenCalledWith(groupedCount);
            expect(mockGetTotalPages).toHaveBeenCalledWith(3, 10);

            expect(result.totalEvents).toBe(3);
        });
    });

    /* =============================
       EVENT ENRICHMENT
    ============================= */

    describe("Event enrichment", () => {
        it("serializes every event before adding computed metadata", async () => {
            const event = createMockEventModel({
                id: 1
            });

            Event.findAndCountAll.mockResolvedValue({
                count: [
                    {
                        count: 1
                    }
                ],
                rows: [event]
            });

            await getAllEvents();

            expect(event.toJSON).toHaveBeenCalledTimes(1);
        });

        it("propagates event serialization errors", async () => {
            const error = new Error("Event serialization failed");

            const event = createMockEventModel({
                id: 1
            });

            event.toJSON.mockImplementation(() => {
                throw error;
            });

            Event.findAndCountAll.mockResolvedValue({
                count: [
                    {
                        count: 1
                    }
                ],
                rows: [event]
            });

            await expect(getAllEvents()).rejects.toBe(error);
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates event query errors", async () => {
            const error = new Error("Event query failed");

            Event.findAndCountAll.mockRejectedValue(error);

            await expect(getAllEvents()).rejects.toBe(error);

            expect(mockFindLikedEventIdsByUser).not.toHaveBeenCalled();
        });

        it("propagates liked event lookup errors", async () => {
            const error = new Error("Liked events lookup failed");

            mockFindLikedEventIdsByUser.mockRejectedValue(error);

            await expect(getAllEvents({}, 10)).rejects.toBe(error);

            expect(Event.findAndCountAll).toHaveBeenCalledTimes(1);

            expect(mockGetEventStatus).not.toHaveBeenCalled();
        });
    });
});
