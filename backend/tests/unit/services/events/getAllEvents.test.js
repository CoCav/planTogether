/* ==================================================
   EVENT SERVICE - GET ALL EVENTS TESTS

   Tests:
   - paginated event listing with optimized participant count
   - event filter forwarding
   - creator include configuration
   - active participant include configuration
   - review stats include configuration
   - review count and average rating enrichment
   - like stats include configuration
   - like count enrichment
   - current user like state enrichment
   - status enrichment
   - grouped count handling
   - database error propagation

   Ensures:
   - event listing supports filters and pagination
   - query helpers are called with expected arguments
   - active participants are counted through optimized query helpers
   - pagination metadata is returned correctly
   - events are enriched with computed status
   - review stats are built through optimized query helpers
   - like stats are built through optimized query helpers
   - current user like state is computed when currentUserId is provided
   - shared event status constants are used for expected statuses
================================================== */

jest.mock("../../../../src/models/eventModel", () => ({
    findAndCountAll: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventQueryBuilder", () => ({
    buildEventWhereConditions: jest.fn(),
    buildEventCreatorInclude: jest.fn(),
    buildActiveParticipantInclude: jest.fn(),
    buildParticipantCountAttribute: jest.fn(),
    buildEventReviewInclude: jest.fn(),
    buildReviewCountAttribute: jest.fn(),
    buildAverageRatingAttribute: jest.fn(),
    buildEventLikeInclude: jest.fn(),
    buildLikeCountAttribute: jest.fn(),
    findLikedEventIdsByUser: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn((count) =>
        Array.isArray(count) ? count.length : count
    ),
    getTotalPages: jest.fn((totalItems, pageSize) =>
        Math.ceil(totalItems / pageSize)
    )
}));

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");

const eventService = require("../../../../src/services/eventService");
const EventReview = require("../../../../src/models/relations/eventReviewModel");
const EventLike = require("../../../../src/models/relations/eventLikeModel");

const { EVENT_MODES } = require("../../../../src/constants/eventModes");
const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");
const { getEventStatus } = require("../../../../src/utils/events/eventStatus");

const {
    buildEventWhereConditions,
    buildEventCreatorInclude,
    buildActiveParticipantInclude,
    buildParticipantCountAttribute,
    buildEventReviewInclude,
    buildReviewCountAttribute,
    buildAverageRatingAttribute,
    buildEventLikeInclude,
    buildLikeCountAttribute,
    findLikedEventIdsByUser
} = require("../../../../src/utils/events/eventQueryBuilder");

const { getPaginationOptions, getTotalCount, getTotalPages } = require("../../../../src/utils/pagination");

const { createMockEventModel } = require("../../../factories/eventFactory");

describe("eventService - getAllEvents", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        buildParticipantCountAttribute.mockReturnValue(["COUNT_DISTINCT_PARTICIPANTS", "participantCount"]);

        buildActiveParticipantInclude.mockReturnValue({
            model: User,
            as: "participants",
            attributes: []
        });

        buildEventReviewInclude.mockReturnValue({
            model: EventReview,
            as: "reviews",
            attributes: []
        });

        buildReviewCountAttribute.mockReturnValue([
            "COUNT_DISTINCT_REVIEWS",
            "reviewCount"
        ]);

        buildAverageRatingAttribute.mockReturnValue([
            "AVG_REVIEWS_RATING",
            "averageRating"
        ]);

        buildEventLikeInclude.mockReturnValue({
            model: EventLike,
            as: "likes",
            attributes: []
        });

        buildLikeCountAttribute.mockReturnValue([
            "COUNT_DISTINCT_LIKES",
            "likesCount"
        ]);

        findLikedEventIdsByUser.mockResolvedValue(new Set());
    });

    /* =============================
        EVENTS RETRIEVAL SUCCESS
    ============================= */

    it("should return paginated events with computed status", async () => {

        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }],
            rows: [createMockEventModel()]
        });

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        const result = await eventService.getAllEvents({});

        expect(result).toMatchObject({
            page: 1,
            pageSize: 10,
            totalEvents: 1,
            totalPages: 1
        });

        expect(result.events).toHaveLength(1);

        expect(result.events[0]).toMatchObject({
            id: 1,
            title: "Test Event",
            status: EVENT_STATUS.UPCOMING,
            isLikedByCurrentUser: false
        });
    });

    /* =============================
        QUERY FILTERS
    ============================= */

    it("should forward filters to buildEventWhereConditions", async () => {
        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [],
            rows: []
        });

        await eventService.getAllEvents({
            mode: EVENT_MODES.ONLINE,
            theme: "Tech"
        });

        expect(buildEventWhereConditions).toHaveBeenCalledWith({},
            {
                mode: EVENT_MODES.ONLINE,
                theme: "Tech"
            }
        );
    });

    it("should apply creator include configuration", async () => {
        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        const creatorInclude = {
            model: User,
            as: "creator"
        };

        buildEventCreatorInclude.mockReturnValue(creatorInclude);

        Event.findAndCountAll.mockResolvedValue({
            count: [],
            rows: []
        });

        await eventService.getAllEvents({
            creator: "john"
        });

        expect(buildEventCreatorInclude).toHaveBeenCalledWith(User, "john");
    });

    /* =============================
        EVENT METADATA
    ============================= */

    it("should enrich events with computed status", async () => {
        const mockEvent = createMockEventModel({
            title: "Metadata Event"
        });

        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }],
            rows: [mockEvent]
        });

        getEventStatus.mockReturnValue(EVENT_STATUS.PAST);

        const result = await eventService.getAllEvents({});

        expect(getEventStatus).toHaveBeenCalledWith(mockEvent);

        expect(result.events[0]).toMatchObject({
            status: EVENT_STATUS.PAST
        });
    });

    it("should use optimized review stats helpers", async () => {
        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [],
            rows: []
        });

        await eventService.getAllEvents({});

        expect(buildReviewCountAttribute).toHaveBeenCalledWith(
            expect.any(Object),
            "reviews.id"
        );

        expect(buildAverageRatingAttribute).toHaveBeenCalledWith(
            expect.any(Object),
            "reviews.rating"
        );

        expect(buildEventReviewInclude).toHaveBeenCalledWith(EventReview);
    });

    it("should use optimized like stats helpers", async () => {
        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [],
            rows: []
        });

        await eventService.getAllEvents({});

        expect(buildLikeCountAttribute).toHaveBeenCalledWith(
            expect.any(Object),
            "likes.id"
        );

        expect(buildEventLikeInclude).toHaveBeenCalledWith(EventLike);
    });

    it("should enrich events with current user like state", async () => {
        const mockEvent = createMockEventModel({
            id: 1,
            title: "Liked Event"
        });

        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }],
            rows: [mockEvent]
        });

        findLikedEventIdsByUser.mockResolvedValue(new Set([1]));

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        const result = await eventService.getAllEvents({}, 10);

        expect(findLikedEventIdsByUser).toHaveBeenCalledWith(
            EventLike,
            [1],
            10
        );

        expect(result.events[0].isLikedByCurrentUser).toBe(true);
    });

    it("should return false like state for anonymous users", async () => {
        const mockEvent = createMockEventModel({
            id: 1,
            title: "Anonymous Event"
        });

        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }],
            rows: [mockEvent]
        });

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        const result = await eventService.getAllEvents({});

        expect(findLikedEventIdsByUser).toHaveBeenCalledWith(
            EventLike,
            [1],
            null
        );

        expect(result.events[0].isLikedByCurrentUser).toBe(false);
    });

    /* =============================
        PARTICIPANT COUNT
    ============================= */

    it("should use optimized active participant count helpers", async () => {
        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [],
            rows: []
        });

        await eventService.getAllEvents({});

        expect(buildParticipantCountAttribute).toHaveBeenCalledWith(
            expect.any(Object),
            "participants.id"
        );

        expect(buildActiveParticipantInclude).toHaveBeenCalledWith(User);
    });

    /* =============================
        COUNT / PAGINATION
    ============================= */

    it("should handle grouped Sequelize count results", async () => {
        getPaginationOptions.mockReturnValue({
            page: 2,
            pageSize: 5,
            limit: 5,
            offset: 5,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        Event.findAndCountAll.mockResolvedValue({
            count: [{ count: 1 }, { count: 1 }, { count: 1 }],
            rows: [],
        });

        const result = await eventService.getAllEvents({});

        expect(getTotalCount).toHaveBeenCalledWith([
            { count: 1 },
            { count: 1 },
            { count: 1 }
        ]);

        expect(getTotalPages).toHaveBeenCalledWith(3, 5);

        expect(result.totalEvents).toBe(3);
        expect(result.totalPages).toBe(1);
    });

    /* =============================
        DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        getPaginationOptions.mockReturnValue({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });

        Event.findAndCountAll.mockRejectedValue(new Error("DB error"));

        await expect(eventService.getAllEvents({})).rejects.toThrow("DB error");
    });
});
