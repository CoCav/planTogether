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
    create: jest.fn()
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

const { likeEvent } = require("../../../../src/services/eventLikeService");

const { createTransactionMock } = require("../../../helpers/database/modelTestHelper");

/* ==========================================================================
   Like Event Service Unit Tests

   Tests event like creation business logic.

   Responsibilities
   - Test event existence validation
   - Test duplicate like protection
   - Test like creation
   - Test updated like count retrieval
   - Test transaction commit and rollback
   - Test unexpected error propagation

   Notes
   - Event queries and event like utilities are mocked.
   - Utility behavior is tested separately.
=========================================================================== */

describe("like event service", () => {
    let transaction;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = createTransactionMock();

        sequelize.transaction.mockResolvedValue(transaction);

        mockFindEventByIdOrFail.mockResolvedValue({
            id: 1
        });

        mockFindEventLike.mockResolvedValue(null);

        EventLike.create.mockResolvedValue({
            id: 1,
            eventId: 1,
            userId: 10
        });

        mockGetEventLikesCount.mockResolvedValue(1);
    });

    /* =============================
       EVENT LIKE CREATION
    ============================= */

    describe("likeEvent", () => {
        it("creates an event like and returns the updated like state", async () => {
            const result = await likeEvent({
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

            expect(EventLike.create).toHaveBeenCalledWith(
                {
                    eventId: 1,
                    userId: 10
                },
                {
                    transaction
                }
            );

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
                liked: true,
                likesCount: 1
            });
        });
    });

    /* =============================
       DUPLICATE LIKE PROTECTION
    ============================= */

    describe("Duplicate like protection", () => {
        it("throws a 409 error when the user already liked the event", async () => {
            mockFindEventLike.mockResolvedValue({
                id: 1,
                eventId: 1,
                userId: 10
            });

            await expect(
                likeEvent({
                    eventId: 1,
                    userId: 10
                })
            ).rejects.toMatchObject({
                message: "You have already liked this event",
                statusCode: 409
            });

            expect(EventLike.create).not.toHaveBeenCalled();

            expect(mockGetEventLikesCount).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
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
                likeEvent({
                    eventId: 999,
                    userId: 10
                })
            ).rejects.toBe(error);

            expect(mockFindEventLike).not.toHaveBeenCalled();

            expect(EventLike.create).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(transaction.commit).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it.each([[
            "like creation", () => {
                EventLike.create.mockRejectedValue(
                    new Error("Like creation failed")
                );
            }
        ], [
            "like count retrieval", () => {
                mockGetEventLikesCount.mockRejectedValue(
                    new Error("Like count failed")
                );
            }
        ]])("rolls back and propagates %s errors",
            async (_, configureError) => {
                configureError();

                await expect(
                    likeEvent({
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
