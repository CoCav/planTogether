const mockFindEventByIdOrFail = jest.fn();
const mockFindActiveMembership = jest.fn();
const mockGetEventStatus = jest.fn();
const mockHasEventStarted = jest.fn();

jest.mock("../../../../src/models/eventModel", () => ({
    name: "Event"
}));

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({
    name: "EventUserRole"
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: mockFindEventByIdOrFail
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: mockFindActiveMembership
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn(),
    assertEventNotStarted: jest.fn(),
    getEventStatus: mockGetEventStatus,
    hasEventStarted: mockHasEventStarted
}));

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({
    name: "User"
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
    buildEventCreatorInclude: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventPayloadBuilder", () => ({
    buildCreateEventPayload: jest.fn(),
    buildUpdateEventPayload: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventParticipants", () => ({
    buildActiveParticipantInclude: jest.fn(),
    buildEventParticipantCountAttribute: jest.fn()
}));

jest.mock("../../../../src/utils/eventReviews/eventReviews", () => ({
    buildEventReviewInclude: jest.fn(),
    buildEventReviewCountAttribute: jest.fn(),
    buildEventAverageRatingAttribute: jest.fn()
}));

jest.mock("../../../../src/utils/eventLikes/eventLikes", () => ({
    buildEventLikeInclude: jest.fn(),
    buildEventLikeCountAttribute: jest.fn(),
    findLikedEventIdsByUser: jest.fn(),
    findEventLike: jest.fn()
}));

jest.mock("../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");

const { getCurrentUserEventAccess } = require("../../../../src/services/eventService");

const { createMockEventModel } = require("../../../factories/eventFactory");
const { createMockMembership } = require("../../../factories/eventMembershipFactory");

/* ==========================================================================
   Get Current User Event Access Service Unit Tests

   Tests current user access resolution for one event.

   Responsibilities
   - Test active membership role resolution
   - Test organizer edit and delete access
   - Test co-organizer edit access
   - Test participant and non-member restrictions
   - Test past event restrictions
   - Test started event deletion restrictions
   - Test event and membership query error propagation

   Notes
   - Event and membership query utilities are mocked.
   - Access rules depend on role and computed event lifecycle state.
=========================================================================== */

describe("get current user event access service", () => {
    let event;

    beforeEach(() => {
        jest.clearAllMocks();

        event = createMockEventModel({
            id: 1
        });

        mockFindEventByIdOrFail.mockResolvedValue(event);

        mockFindActiveMembership.mockResolvedValue(null);

        mockGetEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);

        mockHasEventStarted.mockReturnValue(false);
    });

    /* =============================
       ORGANIZER ACCESS
    ============================= */

    describe("Organizer access", () => {
        it("allows editing and deletion for an upcoming event that has not started", async () => {
            mockFindActiveMembership.mockResolvedValue(
                createMockMembership({
                    eventId: 1,
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER,
                    deletedAt: null
                })
            );

            const result = await getCurrentUserEventAccess(
                1,
                10
            );

            expect(mockFindEventByIdOrFail).toHaveBeenCalledTimes(1);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(
                Event,
                1
            );

            expect(mockFindActiveMembership).toHaveBeenCalledTimes(1);

            expect(mockFindActiveMembership).toHaveBeenCalledWith(
                EventUserRole,
                {
                    eventId: 1,
                    userId: 10
                }
            );

            expect(mockGetEventStatus).toHaveBeenCalledWith(event);

            expect(mockHasEventStarted).toHaveBeenCalledWith(event);

            expect(result).toEqual({
                role: EVENT_ROLES.ORGANIZER,
                status: EVENT_STATUS.UPCOMING,
                canEdit: true,
                canDelete: true
            });
        });

        it("disables deletion after the event has started", async () => {
            mockFindActiveMembership.mockResolvedValue(
                createMockMembership({
                    eventId: 1,
                    userId: 10,
                    role: EVENT_ROLES.ORGANIZER
                })
            );

            mockHasEventStarted.mockReturnValue(true);

            const result = await getCurrentUserEventAccess(
                1,
                10
            );

            expect(result).toEqual({
                role: EVENT_ROLES.ORGANIZER,
                status: EVENT_STATUS.UPCOMING,
                canEdit: true,
                canDelete: false
            });
        });
    });

    /* =============================
       CO-ORGANIZER ACCESS
    ============================= */

    describe("Co-organizer access", () => {
        it("allows editing without deletion", async () => {
            mockFindActiveMembership.mockResolvedValue(
                createMockMembership({
                    eventId: 1,
                    userId: 20,
                    role: EVENT_ROLES.CO_ORGANIZER
                })
            );

            const result = await getCurrentUserEventAccess(
                1,
                20
            );

            expect(result).toEqual({
                role: EVENT_ROLES.CO_ORGANIZER,
                status: EVENT_STATUS.UPCOMING,
                canEdit: true,
                canDelete: false
            });
        });
    });

    /* =============================
       PARTICIPANT ACCESS
    ============================= */

    describe("Participant access", () => {
        it("does not allow editing or deletion", async () => {
            mockFindActiveMembership.mockResolvedValue(
                createMockMembership({
                    eventId: 1,
                    userId: 30,
                    role: EVENT_ROLES.PARTICIPANT
                })
            );

            const result = await getCurrentUserEventAccess(
                1,
                30
            );

            expect(result).toEqual({
                role: EVENT_ROLES.PARTICIPANT,
                status: EVENT_STATUS.UPCOMING,
                canEdit: false,
                canDelete: false
            });
        });
    });

    /* =============================
       NON-MEMBER ACCESS
    ============================= */

    describe("Non-member access", () => {
        it("returns a null role without edit or delete access", async () => {
            const result = await getCurrentUserEventAccess(
                1,
                40
            );

            expect(result).toEqual({
                role: null,
                status: EVENT_STATUS.UPCOMING,
                canEdit: false,
                canDelete: false
            });
        });
    });

    /* =============================
       PAST EVENT ACCESS
    ============================= */

    describe("Past event access", () => {
        it.each([[
            "organizer",
            EVENT_ROLES.ORGANIZER
        ], [
            "co-organizer",
            EVENT_ROLES.CO_ORGANIZER
        ]])("disables edit and delete access for an %s",
            async (_, role) => {
                mockFindActiveMembership.mockResolvedValue(
                    createMockMembership({
                        eventId: 1,
                        userId: 10,
                        role
                    })
                );

                mockGetEventStatus.mockReturnValue(EVENT_STATUS.PAST);

                const result = await getCurrentUserEventAccess(
                    1,
                    10
                );

                expect(result).toEqual({
                    role,
                    status: EVENT_STATUS.PAST,
                    canEdit: false,
                    canDelete: false
                });
            }
        );
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    describe("Event validation", () => {
        it("stops when the event does not exist", async () => {
            const error = Object.assign(
                new Error("Event not found"),
                {
                    statusCode: 404
                }
            );

            mockFindEventByIdOrFail.mockRejectedValue(error);

            await expect(getCurrentUserEventAccess(
                999,
                10
            )).rejects.toBe(error);

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(mockGetEventStatus).not.toHaveBeenCalled();

            expect(mockHasEventStarted).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates active membership lookup errors", async () => {
            const error = new Error("Membership lookup failed");

            mockFindActiveMembership.mockRejectedValue(error);

            await expect(getCurrentUserEventAccess(
                1,
                10
            )).rejects.toBe(error);

            expect(mockGetEventStatus).not.toHaveBeenCalled();

            expect(mockHasEventStarted).not.toHaveBeenCalled();
        });
    });
});
