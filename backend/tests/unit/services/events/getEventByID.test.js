const mockBuildEventCreatorInclude = jest.fn();

const mockBuildActiveParticipantInclude = jest.fn();
const mockBuildEventParticipantCountAttribute = jest.fn();

const mockBuildEventReviewInclude = jest.fn();
const mockBuildEventReviewCountAttribute = jest.fn();
const mockBuildEventAverageRatingAttribute = jest.fn();

const mockBuildEventLikeInclude = jest.fn();
const mockBuildEventLikeCountAttribute = jest.fn();
const mockFindEventLike = jest.fn();

const mockGetEventStatus = jest.fn();

jest.mock("../../../../src/config/database", () => ({
    fn: jest.fn(),
    col: jest.fn(),
    cast: jest.fn()
}));

jest.mock("../../../../src/models/eventModel", () => ({
    findOne: jest.fn()
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

jest.mock("../../../../src/services/geocodingService", () => ({
    resolveEventLocation: jest.fn()
}));

jest.mock("../../../../src/utils/stringNormalizer", () => ({
    normalizeString: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventFilters", () => ({
    buildEventWhereConditions: jest.fn()
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
    findLikedEventIdsByUser: jest.fn(),
    findEventLike: mockFindEventLike
}));

jest.mock("../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventReview = require("../../../../src/models/associations/eventReviewModel");
const EventLike = require("../../../../src/models/associations/eventLikeModel");

const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");

const { getEventById } = require("../../../../src/services/eventService");

const { createMockEventModel } = require("../../../factories/eventFactory");

/* ==========================================================================
   Get Event By ID Service Unit Tests

   Tests detailed event retrieval.

   Responsibilities
   - Test event detail query composition
   - Test creator, participant, review and like includes
   - Test aggregated event attributes
   - Test event status enrichment
   - Test authenticated user like state
   - Test anonymous user like state
   - Test missing event handling
   - Test unexpected error propagation

   Notes
   - Event query builders and like lookup utilities are mocked.
   - Aggregation helper behavior remains covered by utility unit tests.
=========================================================================== */

describe("get event by ID service", () => {
    let event;

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

        event = createMockEventModel({
            id: 1,
            title: "Test Event"
        });

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

        mockGetEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        mockFindEventLike.mockResolvedValue(null);

        Event.findOne.mockResolvedValue(event);
    });

    /* =============================
       EVENT RETRIEVAL
    ============================= */

    describe("getEventById", () => {
        it("returns an event with computed status and anonymous like state", async () => {
            const result = await getEventById(1);

            expect(mockBuildEventParticipantCountAttribute).toHaveBeenCalledWith(
                sequelize,
                "participants.id"
            );

            expect(mockBuildEventReviewCountAttribute).toHaveBeenCalledWith(
                sequelize,
                "reviews.id"
            );

            expect(mockBuildEventAverageRatingAttribute).toHaveBeenCalledWith(
                sequelize,
                "reviews.rating"
            );

            expect(mockBuildEventLikeCountAttribute).toHaveBeenCalledWith(
                sequelize,
                "likes.id"
            );

            expect(mockBuildEventCreatorInclude).toHaveBeenCalledWith(User);
            expect(mockBuildActiveParticipantInclude).toHaveBeenCalledWith(User);
            expect(mockBuildEventReviewInclude).toHaveBeenCalledWith(EventReview);
            expect(mockBuildEventLikeInclude).toHaveBeenCalledWith(EventLike);

            expect(Event.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1
                },
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
                ]
            });

            expect(mockGetEventStatus).toHaveBeenCalledWith(event);

            expect(mockFindEventLike).not.toHaveBeenCalled();

            expect(result).toEqual({
                ...event.toJSON(),
                status: EVENT_STATUS.UPCOMING,
                isLikedByCurrentUser: false
            });
        });
    });

    /* =============================
       EVENT STATUS
    ============================= */

    describe("Event status", () => {
        it("returns the computed event status", async () => {
            mockGetEventStatus.mockReturnValue(EVENT_STATUS.PAST);

            const result = await getEventById(1);

            expect(result.status).toBe(EVENT_STATUS.PAST);
        });
    });

    /* =============================
       CURRENT USER LIKE STATE
    ============================= */

    describe("Current user like state", () => {
        it("returns true when the authenticated user liked the event", async () => {
            mockFindEventLike.mockResolvedValue({
                id: 1,
                eventId: 1,
                userId: 10
            });

            const result = await getEventById(
                1,
                10
            );

            expect(mockFindEventLike).toHaveBeenCalledTimes(1);

            expect(mockFindEventLike).toHaveBeenCalledWith(
                EventLike,
                {
                    eventId: 1,
                    userId: 10
                }
            );

            expect(result.isLikedByCurrentUser).toBe(true);
        });

        it("returns false when the authenticated user did not like the event", async () => {
            const result = await getEventById(
                1,
                10
            );

            expect(mockFindEventLike).toHaveBeenCalledWith(
                EventLike,
                {
                    eventId: 1,
                    userId: 10
                }
            );

            expect(result.isLikedByCurrentUser).toBe(false);
        });

        it.each([
            ["undefined", undefined],
            ["null", null],
            ["zero", 0]
        ])("does not query likes for an anonymous %s user ID",
            async (_, currentUserId) => {
                const result = await getEventById(
                    1,
                    currentUserId
                );

                expect(mockFindEventLike).not.toHaveBeenCalled();

                expect(result.isLikedByCurrentUser).toBe(false);
            }
        );
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    describe("Event validation", () => {
        it("throws a 404 error when the event does not exist", async () => {
            Event.findOne.mockResolvedValue(null);

            await expect(getEventById(999)).rejects.toMatchObject({
                message: "Event not found",
                statusCode: 404
            });

            expect(mockGetEventStatus).not.toHaveBeenCalled();
            expect(mockFindEventLike).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates event query errors", async () => {
            const error = new Error("Event query failed");

            Event.findOne.mockRejectedValue(error);

            await expect(getEventById(1)).rejects.toBe(error);

            expect(mockGetEventStatus).not.toHaveBeenCalled();
            expect(mockFindEventLike).not.toHaveBeenCalled();
        });

        it("propagates current user like lookup errors", async () => {
            const error = new Error("Like lookup failed");

            mockFindEventLike.mockRejectedValue(error);

            await expect(getEventById(1, 10)).rejects.toBe(error);

            expect(Event.findOne).toHaveBeenCalledTimes(1);

            expect(mockGetEventStatus).toHaveBeenCalledWith(event);
        });

        it("propagates event serialization errors", async () => {
            const error = new Error("Event serialization failed");

            event.toJSON.mockImplementation(() => {
                throw error;
            });

            await expect(getEventById(1)).rejects.toBe(error);

            expect(mockFindEventLike).not.toHaveBeenCalled();
        });
    });
});
