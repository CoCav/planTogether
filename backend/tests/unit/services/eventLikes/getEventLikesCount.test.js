/* =============================
   MOCK FUNCTIONS
============================= */

const mockGetEventLikesCount = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../src/utils/eventLikes/eventLikes", () => ({
    findEventLike: jest.fn(),
    getEventLikesCount: mockGetEventLikesCount
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

const { getEventLikesCount } = require("../../../../src/services/eventLikeService");

/* ==========================================================================
   Get Event Likes Count Service Unit Tests

   Tests event like count retrieval.

   Responsibilities
   - Test event like count utility delegation
   - Test query option forwarding
   - Test result forwarding
   - Test error propagation

   Notes
   - Event like count behavior is tested separately in event like utilities.
=========================================================================== */

describe("get event likes count service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       EVENT LIKE COUNT
    ============================= */

    describe("getEventLikesCount", () => {
        it("returns the event like count", async () => {
            const options = {
                transaction: {
                    id: "transaction"
                }
            };

            mockGetEventLikesCount.mockResolvedValue(7);

            const result = await getEventLikesCount(42, options);

            expect(mockGetEventLikesCount).toHaveBeenCalledTimes(1);
            expect(mockGetEventLikesCount).toHaveBeenCalledWith(EventLike, 42, options);

            expect(result).toBe(7);
        });

        it("uses empty query options by default", async () => {
            mockGetEventLikesCount.mockResolvedValue(0);

            await getEventLikesCount(42);

            expect(mockGetEventLikesCount).toHaveBeenCalledWith(EventLike, 42, {});
        });

        it("propagates like count errors", async () => {
            const error = new Error("Like count failed");

            mockGetEventLikesCount.mockRejectedValue(error);

            await expect(getEventLikesCount(42)).rejects.toBe(error);
        });
    });
});
