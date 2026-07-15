const mockCountActiveParticipantsByEventIds = jest.fn();
const mockCountEventLikesByEventIds = jest.fn();
const mockFindLikedEventIdsByUser = jest.fn();

jest.mock("../../../../src/utils/eventMemberships/eventParticipants", () => ({
    countActiveParticipantsByEventIds: mockCountActiveParticipantsByEventIds
}));

jest.mock("../../../../src/utils/eventLikes/eventLikes", () => ({
    countEventLikesByEventIds: mockCountEventLikesByEventIds,
    findLikedEventIdsByUser: mockFindLikedEventIdsByUser
}));

const { getEventListStats } = require("../../../../src/utils/events/eventListStats");

/* ==========================================================================
   Event List Stats Unit Tests

   Tests shared event list statistic retrieval.

   Responsibilities
   - Test participant count delegation
   - Test like count delegation
   - Test current user like state delegation
   - Test aggregated result formatting
   - Test empty event list handling
   - Test parallel query execution
   - Test error propagation

   Notes
   - Domain-specific participant and like helpers are mocked.
   - Empty list behavior is delegated to the underlying helpers.
=========================================================================== */

describe("event list stats", () => {
    let EventUserRole;
    let EventLike;
    let sequelize;

    beforeEach(() => {
        jest.clearAllMocks();

        EventUserRole = {
            name: "EventUserRole"
        };

        EventLike = {
            name: "EventLike"
        };

        sequelize = {
            fn: jest.fn(),
            col: jest.fn()
        };

        mockCountActiveParticipantsByEventIds.mockResolvedValue({
            1: 4,
            2: 2
        });

        mockCountEventLikesByEventIds.mockResolvedValue({
            1: 7,
            2: 3
        });

        mockFindLikedEventIdsByUser.mockResolvedValue(new Set([1]));
    });

    /* =============================
       EVENT LIST STATISTICS
    ============================= */

    describe("getEventListStats", () => {
        it("returns participant counts, like counts and liked event IDs", async () => {
            const eventIds = [1, 2];

            const result = await getEventListStats({
                EventUserRole,
                EventLike,
                sequelize,
                eventIds,
                currentUserId: 10
            });

            expect(mockCountActiveParticipantsByEventIds).toHaveBeenCalledTimes(1);

            expect(mockCountActiveParticipantsByEventIds).toHaveBeenCalledWith(
                EventUserRole,
                sequelize,
                eventIds
            );

            expect(mockCountEventLikesByEventIds).toHaveBeenCalledTimes(1);

            expect(mockCountEventLikesByEventIds).toHaveBeenCalledWith(
                EventLike,
                sequelize,
                eventIds
            );

            expect(mockFindLikedEventIdsByUser).toHaveBeenCalledTimes(1);

            expect(mockFindLikedEventIdsByUser).toHaveBeenCalledWith(
                EventLike,
                eventIds,
                10
            );

            expect(result).toEqual({
                participantCountByEventId: {
                    1: 4,
                    2: 2
                },
                likesCountByEventId: {
                    1: 7,
                    2: 3
                },
                likedEventIds: new Set([1])
            });
        });

        it("forwards a null current user ID for anonymous lists", async () => {
            await getEventListStats({
                EventUserRole,
                EventLike,
                sequelize,
                eventIds: [1],
                currentUserId: null
            });

            expect(mockFindLikedEventIdsByUser).toHaveBeenCalledWith(
                EventLike,
                [1],
                null
            );
        });
    });

    /* =============================
       EMPTY EVENT LIST
    ============================= */

    describe("Empty event list", () => {
        it("returns empty statistics from the underlying helpers", async () => {
            mockCountActiveParticipantsByEventIds.mockResolvedValue({});
            mockCountEventLikesByEventIds.mockResolvedValue({});
            mockFindLikedEventIdsByUser.mockResolvedValue(new Set());

            const result = await getEventListStats({
                EventUserRole,
                EventLike,
                sequelize,
                eventIds: [],
                currentUserId: 10
            });

            expect(mockCountActiveParticipantsByEventIds).toHaveBeenCalledWith(
                EventUserRole,
                sequelize,
                []
            );

            expect(mockCountEventLikesByEventIds).toHaveBeenCalledWith(
                EventLike,
                sequelize,
                []
            );

            expect(mockFindLikedEventIdsByUser).toHaveBeenCalledWith(
                EventLike,
                [],
                10
            );

            expect(result).toEqual({
                participantCountByEventId: {},
                likesCountByEventId: {},
                likedEventIds: new Set()
            });
        });
    });

    /* =============================
       PARALLEL EXECUTION
    ============================= */

    describe("Parallel execution", () => {
        it("starts all statistic queries before waiting for their results", async () => {
            const participantResolution = {};
            const likeCountResolution = {};
            const likedIdsResolution = {};

            const participantPromise = new Promise(
                (resolve) => {
                    participantResolution.resolve = resolve;
                }
            );

            const likeCountPromise = new Promise(
                (resolve) => {
                    likeCountResolution.resolve = resolve;
                }
            );

            const likedIdsPromise = new Promise(
                (resolve) => {
                    likedIdsResolution.resolve = resolve;
                }
            );

            mockCountActiveParticipantsByEventIds.mockReturnValue(participantPromise);
            mockCountEventLikesByEventIds.mockReturnValue(likeCountPromise);
            mockFindLikedEventIdsByUser.mockReturnValue(likedIdsPromise);

            const resultPromise = getEventListStats({
                EventUserRole,
                EventLike,
                sequelize,
                eventIds: [1],
                currentUserId: 10
            });

            expect(mockCountActiveParticipantsByEventIds).toHaveBeenCalledTimes(1);

            expect(mockCountEventLikesByEventIds).toHaveBeenCalledTimes(1);

            expect(mockFindLikedEventIdsByUser).toHaveBeenCalledTimes(1);

            participantResolution.resolve({
                1: 3
            });

            likeCountResolution.resolve({
                1: 5
            });

            likedIdsResolution.resolve(new Set([1]));

            await expect(resultPromise)
                .resolves
                .toEqual({
                    participantCountByEventId: {
                        1: 3
                    },
                    likesCountByEventId: {
                        1: 5
                    },
                    likedEventIds:
                        new Set([1])
                });
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it.each([[
            "participant count",
            mockCountActiveParticipantsByEventIds,
            "Participant count failed"
        ], [
            "like count",
            mockCountEventLikesByEventIds,
            "Like count failed"
        ], [
            "liked event lookup",
            mockFindLikedEventIdsByUser,
            "Liked event lookup failed"
        ]])("propagates %s errors",
            async (_, mockFunction, message) => {
                const error = new Error(message);

                mockFunction.mockRejectedValue(error);

                await expect(
                    getEventListStats({
                        EventUserRole,
                        EventLike,
                        sequelize,
                        eventIds: [1],
                        currentUserId: 10
                    })
                ).rejects.toBe(error);
            }
        );
    });
});
