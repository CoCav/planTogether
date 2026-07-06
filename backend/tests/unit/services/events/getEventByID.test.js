/* ==================================================
   EVENT SERVICE - GET EVENT BY ID TESTS

   Tests:
   - successful event retrieval with optimized participant count
   - event status enrichment
   - active participant include configuration
   - review stats include configuration
   - review count and average rating enrichment
   - like stats include configuration
   - like count enrichment
   - current user like state enrichment
   - missing event rejection
   - database error propagation

   Ensures:
   - single events are retrieved correctly
   - active participants are counted through optimized query helpers
   - computed status is added before response
   - review stats are built through optimized query helpers
   - like stats are built through optimized query helpers
   - current user like state is computed when currentUserId is provided
   - missing events return a 404 error
   - shared event status constants are used for expected statuses
================================================== */

jest.mock("../../../../src/models/eventModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventLikeModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventCreator.js", () => ({
    buildEventCreatorInclude: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventParticipants.js", () => ({
    buildActiveParticipantInclude: jest.fn(),
    buildEventParticipantCountAttribute: jest.fn()
}));

jest.mock("../../../../src/utils/eventReviews/eventReviews.js", () => ({
    buildEventReviewInclude: jest.fn(),
    buildEventReviewCountAttribute: jest.fn(),
    buildEventAverageRatingAttribute: jest.fn()
}));

jest.mock("../../../../src/utils/eventLikes/eventLikes.js", () => ({
    buildEventLikeInclude: jest.fn(),
    buildEventLikeCountAttribute: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventLike = require("../../../../src/models/relations/eventLikeModel");

const eventService = require("../../../../src/services/eventService");
const EventReview = require("../../../../src/models/relations/eventReviewModel");

const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");
const { getEventStatus } = require("../../../../src/utils/events/eventStatus");

const { buildEventCreatorInclude } = require("../../../../src/utils/events/eventCreator");

const {
    buildActiveParticipantInclude,
    buildEventParticipantCountAttribute
} = require("../../../../src/utils/eventMemberships/eventParticipants");

const {
    buildEventReviewInclude,
    buildEventReviewCountAttribute,
    buildEventAverageRatingAttribute
} = require("../../../../src/utils/eventReviews/eventReviews");

const {
    buildEventLikeInclude,
    buildEventLikeCountAttribute
} = require("../../../../src/utils/eventLikes/eventLikes");

const { createMockEventModel } = require("../../../factories/eventFactory");

describe("eventService - getEventByID", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        buildEventCreatorInclude.mockReturnValue({
            model: User,
            as: "creator"
        });

        buildActiveParticipantInclude.mockReturnValue({
            model: User,
            as: "participants",
            attributes: []
        });

        buildEventParticipantCountAttribute.mockReturnValue([
            "COUNT_DISTINCT_PARTICIPANTS",
            "participantCount"
        ]);

        buildEventReviewInclude.mockReturnValue({
            model: EventReview,
            as: "reviews",
            attributes: []
        });

        buildEventReviewCountAttribute.mockReturnValue([
            "COUNT_DISTINCT_REVIEWS",
            "reviewCount"
        ]);

        buildEventAverageRatingAttribute.mockReturnValue([
            "AVG_REVIEWS_RATING",
            "averageRating"
        ]);

        buildEventLikeInclude.mockReturnValue({
            model: EventLike,
            as: "likes",
            attributes: []
        });

        buildEventLikeCountAttribute.mockReturnValue([
            "COUNT_DISTINCT_LIKES",
            "likesCount"
        ]);

        EventLike.findOne.mockResolvedValue(null);
    });

    /* =============================
       EVENT RETRIEVAL SUCCESS
    ============================= */

    it("should return event with computed status", async () => {

        Event.findOne.mockResolvedValue(createMockEventModel());

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        const result = await eventService.getEventByID(1);

        expect(Event.findOne).toHaveBeenCalled();

        expect(result).toMatchObject({
            id: 1,
            title: "Test Event",
            status: EVENT_STATUS.UPCOMING,
            isLikedByCurrentUser: false
        });
    });

    /* =============================
       EVENT METADATA
    ============================= */

    it("should enrich retrieved event with computed status", async () => {
        const mockEvent = createMockEventModel({
            title: "Past Event"
        });

        Event.findOne.mockResolvedValue(mockEvent);

        getEventStatus.mockReturnValue(EVENT_STATUS.PAST);

        const result = await eventService.getEventByID(1);

        expect(getEventStatus).toHaveBeenCalledWith(mockEvent);

        expect(result).toMatchObject({
            status: EVENT_STATUS.PAST
        });
    });

    /* =============================
       PARTICIPANT COUNT
    ============================= */

    it("should use optimized active participant count helpers", async () => {
        Event.findOne.mockResolvedValue(createMockEventModel());

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        await eventService.getEventByID(1);

        expect(buildEventParticipantCountAttribute).toHaveBeenCalledWith(
            expect.any(Object),
            "participants.id"
        );

        expect(buildEventCreatorInclude).toHaveBeenCalledWith(User);
        expect(buildActiveParticipantInclude).toHaveBeenCalledWith(User);
    });

    it("should use optimized review stats helpers", async () => {
        Event.findOne.mockResolvedValue(createMockEventModel());

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        await eventService.getEventByID(1);

        expect(buildEventReviewCountAttribute).toHaveBeenCalledWith(
            expect.any(Object),
            "reviews.id"
        );

        expect(buildEventAverageRatingAttribute).toHaveBeenCalledWith(
            expect.any(Object),
            "reviews.rating"
        );

        expect(buildEventReviewInclude).toHaveBeenCalledWith(EventReview);
    });

    it("should use optimized like stats helpers", async () => {
        Event.findOne.mockResolvedValue(createMockEventModel());

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        await eventService.getEventByID(1);

        expect(buildEventLikeCountAttribute).toHaveBeenCalledWith(
            expect.any(Object),
            "likes.id"
        );

        expect(buildEventLikeInclude).toHaveBeenCalledWith(EventLike);
    });

    it("should enrich event with current user like state", async () => {
        const mockEvent = createMockEventModel({
            id: 1,
            title: "Liked Event"
        });

        Event.findOne.mockResolvedValue(mockEvent);

        EventLike.findOne.mockResolvedValue({
            eventId: 1,
            userId: 10
        });

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        const result = await eventService.getEventByID(1, 10);

        expect(EventLike.findOne).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                userId: 10
            }
        });

        expect(result.isLikedByCurrentUser).toBe(true);
    });

    it("should return false like state without querying likes for anonymous users", async () => {
        Event.findOne.mockResolvedValue(createMockEventModel());

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        const result = await eventService.getEventByID(1);

        expect(EventLike.findOne).not.toHaveBeenCalled();
        expect(result.isLikedByCurrentUser).toBe(false);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when event is not found", async () => {
        Event.findOne.mockResolvedValue(null);

        await expect(eventService.getEventByID(999)).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        Event.findOne.mockRejectedValue(new Error("DB error"));

        await expect(eventService.getEventByID(1)).rejects.toThrow("DB error");
    });
});
