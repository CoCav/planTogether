/* ==================================================
   EVENT LIKE SERVICE - UNLIKE EVENT TESTS

   Tests:
   - successful event unlike
   - idempotent unlike
   - updated likes count return
   - transaction commit
   - missing event rejection
   - transaction rollback
   - database error propagation

   Ensures:
   - users can remove their likes
   - unliking an already unliked event succeeds
   - missing events return a 404 error
   - unlike uses transactions
   - updated likes count is returned
   - failed operations rollback transactions
================================================== */

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/associations/eventLikeModel", () => ({
    findOne: jest.fn(),
    count: jest.fn()
}));

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const EventLike = require("../../../../src/models/associations/eventLikeModel");

const eventLikeService = require("../../../../src/services/eventLikeService");

describe("eventLikeService - unlikeEvent", () => {

    let transaction;
    let existingLike;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = {
            commit: jest.fn(),
            rollback: jest.fn()
        };

        sequelize.transaction.mockResolvedValue(transaction);

        Event.findByPk.mockResolvedValue({
            id: 1,
            title: "Liked Event"
        });

        existingLike = {
            destroy: jest.fn()
        };

        EventLike.findOne.mockResolvedValue(existingLike);

        EventLike.count.mockResolvedValue(0);
    });

    /* =============================
       UNLIKE EVENT SUCCESS
    ============================= */

    it("should unlike an event for the current user", async () => {

        const result = await eventLikeService.unlikeEvent({
            eventId: 1,
            userId: 10
        });

        expect(Event.findByPk).toHaveBeenCalledWith(1, {
            transaction
        });

        expect(EventLike.findOne).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                userId: 10
            },
            transaction
        });

        expect(existingLike.destroy).toHaveBeenCalledWith({
            transaction
        });

        expect(result).toEqual({
            eventId: 1,
            userId: 10,
            liked: false,
            likesCount: 0
        });
    });

    it("should return updated likes count", async () => {

        EventLike.count.mockResolvedValue(7);

        const result = await eventLikeService.unlikeEvent({
            eventId: 1,
            userId: 10
        });

        expect(EventLike.count).toHaveBeenCalledWith({
            where: {
                eventId: 1
            },
            transaction
        });

        expect(result.likesCount).toBe(7);
    });

    it("should commit transaction after successful unlike", async () => {

        await eventLikeService.unlikeEvent({
            eventId: 1,
            userId: 10
        });

        expect(transaction.commit).toHaveBeenCalledWith();
        expect(transaction.rollback).not.toHaveBeenCalled();
    });

    it("should start a database transaction", async () => {
        await eventLikeService.unlikeEvent({
            eventId: 1,
            userId: 10
        });

        expect(sequelize.transaction).toHaveBeenCalledTimes(1);
    });

    /* =============================
       IDEMPOTENT UNLIKE
    ============================= */

    it("should succeed when the event was not previously liked", async () => {

        EventLike.findOne.mockResolvedValue(null);

        const result = await eventLikeService.unlikeEvent({
            eventId: 1,
            userId: 10
        });

        expect(result).toEqual({
            eventId: 1,
            userId: 10,
            liked: false,
            likesCount: 0
        });

        expect(EventLike.count).toHaveBeenCalled();

        expect(transaction.commit).toHaveBeenCalledWith();
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when event is not found", async () => {

        Event.findByPk.mockResolvedValue(null);

        await expect(
            eventLikeService.unlikeEvent({
                eventId: 999,
                userId: 10
            })
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });

        expect(transaction.rollback).toHaveBeenCalledWith();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should rollback and forward database errors", async () => {

        existingLike.destroy.mockRejectedValue(new Error("DB error"));

        await expect(
            eventLikeService.unlikeEvent({
                eventId: 1,
                userId: 10
            })
        ).rejects.toThrow("DB error");

        expect(transaction.rollback).toHaveBeenCalledWith();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

});
