/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindEventLike = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../src/utils/eventLikes/eventLikes", () => ({
    findEventLike: mockFindEventLike,
    getEventLikesCount: jest.fn()
}));

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/eventModel", () => ({
    name: "Event"
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const EventLike = require("../../../../src/models/associations/eventLikeModel");

const { getIsEventLikedByUser } = require("../../../../src/services/eventLikeService");

/* ==========================================================================
   Get Event Like State Service Unit Tests

   Tests current user event like state retrieval.

   Responsibilities
   - Test anonymous user handling
   - Test existing event like detection
   - Test missing event like detection
   - Test event like query delegation
   - Test error propagation

   Notes
   - Anonymous requests never query the event like model.
   - Event existence is validated by higher-level event flows.
=========================================================================== */

describe("get event like state service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       ANONYMOUS USER
    ============================= */

    describe("Anonymous user", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["zero", 0]
        ])(
            "returns false for a %s user ID", async (_, userId) => {
                const result = await getIsEventLikedByUser({
                    eventId: 42,
                    userId
                });

                expect(result).toBe(false);

                expect(mockFindEventLike).not.toHaveBeenCalled();
            }
        );
    });

    /* =============================
       AUTHENTICATED USER
    ============================= */

    describe("Authenticated user", () => {
        it.each([[
            "an existing like",
            {
                id: 1,
                eventId: 42,
                userId: 10
            },
            true
        ], [
            "no existing like",
            null,
            false
        ]])(
            "returns the correct state for %s", async (_, like, expected) => {
                mockFindEventLike.mockResolvedValue(like);

                const result = await getIsEventLikedByUser({
                    eventId: 42,
                    userId: 10
                });

                expect(mockFindEventLike).toHaveBeenCalledTimes(1);

                expect(mockFindEventLike).toHaveBeenCalledWith(EventLike, {
                    eventId: 42,
                    userId: 10
                });

                expect(result).toBe(expected);
            }
        );

        it("propagates event like query errors", async () => {
            const error = new Error("Like lookup failed");

            mockFindEventLike.mockRejectedValue(error);

            await expect(
                getIsEventLikedByUser({
                    eventId: 42,
                    userId: 10
                })
            ).rejects.toBe(error);
        });
    });
});
