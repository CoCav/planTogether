const mockFindEventByIdOrFail = jest.fn();
const mockFindEventLike = jest.fn();
const mockGetEventLikesCount = jest.fn();

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/eventModel", () => ({
    name: "Event"
}));

jest.mock("../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: mockFindEventByIdOrFail
}));

jest.mock("../../../../src/utils/eventLikes/eventLikes", () => ({
    findEventLike: mockFindEventLike,
    getEventLikesCount: mockGetEventLikesCount
}));

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const EventLike = require("../../../../src/models/associations/eventLikeModel");

const { unlikeEvent } = require("../../../../src/services/eventLikeService");

const { createTransactionMock } = require("../../../helpers/database/modelTestHelper");

/* ==========================================================================
   Unlike Event Service Unit Tests

   Tests event like removal business logic.

   Responsibilities
   - Test event existence validation
   - Test existing like deletion
   - Test idempotent unlike behavior
   - Test updated like count retrieval
   - Test transaction commit and rollback
   - Test unexpected error propagation

   Notes
   - Event queries and event like utilities are mocked.
   - Unlike succeeds when no existing like is found.
=========================================================================== */

describe("unlike event service", () => {
    let transaction;
    let existingLike;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = createTransactionMock();

        existingLike = {
            destroy: jest.fn().mockResolvedValue()
        };

        sequelize.transaction.mockResolvedValue(transaction);

        mockFindEventByIdOrFail.mockResolvedValue({
            id: 1
        });

        mockFindEventLike.mockResolvedValue(existingLike);

        mockGetEventLikesCount.mockResolvedValue(0);
    });

    /* =============================
       EVENT LIKE REMOVAL
    ============================= */

    describe("unlikeEvent", () => {
        it("deletes an existing like and returns the updated like state", async () => {
            const result = await unlikeEvent({
                eventId: 1,
                userId: 10
            });

            expect(sequelize.transaction).toHaveBeenCalledTimes(1);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(
                Event,
                1,
                {
                    transaction
                }
            );

            expect(mockFindEventLike).toHaveBeenCalledWith(
                EventLike,
                {
                    eventId: 1,
                    userId: 10,
                    transaction
                }
            );

            expect(existingLike.destroy).toHaveBeenCalledWith({
                transaction
            });

            expect(mockGetEventLikesCount).toHaveBeenCalledWith(
                EventLike,
                1,
                {
                    transaction
                }
            );

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(result).toEqual({
                eventId: 1,
                userId: 10,
                liked: false,
                likesCount: 0
            });
        });

        it("succeeds when the event was not previously liked", async () => {
            mockFindEventLike.mockResolvedValue(null);

            mockGetEventLikesCount.mockResolvedValue(3);

            const result = await unlikeEvent({
                eventId: 1,
                userId: 10
            });

            expect(existingLike.destroy).not.toHaveBeenCalled();

            expect(mockGetEventLikesCount).toHaveBeenCalledWith(
                EventLike,
                1,
                {
                    transaction
                }
            );

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(result).toEqual({
                eventId: 1,
                userId: 10,
                liked: false,
                likesCount: 3
            });
        });
    });

    /* =============================
       EVENT VALIDATION ERRORS
    ============================= */

    describe("Event validation errors", () => {
        it("rolls back when the event does not exist", async () => {
            const error = Object.assign(
                new Error("Event not found"),
                {
                    statusCode: 404
                }
            );

            mockFindEventByIdOrFail.mockRejectedValue(error);

            await expect(
                unlikeEvent({
                    eventId: 999,
                    userId: 10
                })
            ).rejects.toBe(error);

            expect(mockFindEventLike).not.toHaveBeenCalled();

            expect(existingLike.destroy).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(transaction.commit).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it.each([
            ["like deletion", () => {
                existingLike.destroy.mockRejectedValue(
                    new Error("Like deletion failed")
                );
            }
            ], ["like count retrieval", () => {
                mockGetEventLikesCount.mockRejectedValue(
                    new Error("Like count failed")
                );
            }
            ]])("rolls back and propagates %s errors",
                async (_, configureError) => {
                    configureError();

                    await expect(
                        unlikeEvent({
                            eventId: 1,
                            userId: 10
                        })
                    ).rejects.toBeInstanceOf(Error);

                    expect(transaction.rollback).toHaveBeenCalledTimes(1);

                    expect(transaction.commit).not.toHaveBeenCalled();
                }
            );
    });
});
