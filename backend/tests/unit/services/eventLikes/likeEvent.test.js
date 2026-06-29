/* ==================================================
   EVENT LIKE SERVICE - LIKE EVENT TESTS

   Tests:
   - successful event like creation
   - duplicate like rejection
   - missing event rejection
   - updated likes count return
   - transaction commit
   - transaction rollback
   - database error propagation

   Ensures:
   - users can like an event once
   - duplicate likes return a 409 error
   - missing events return a 404 error
   - like creation uses transactions
   - likes count is returned after creation
   - failed operations rollback transactions
================================================== */

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventLikeModel", () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
}));

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const EventLike = require("../../../../src/models/relations/eventLikeModel");

const eventLikeService = require("../../../../src/services/eventLikeService");

describe("eventLikeService - likeEvent", () => {

    let transaction;

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

        EventLike.findOne.mockResolvedValue(null);

        EventLike.create.mockResolvedValue({
            id: 1,
            eventId: 1,
            userId: 10
        });

        EventLike.count.mockResolvedValue(1);
    });

    /* =============================
       LIKE EVENT SUCCESS
    ============================= */

    it("should like an event for the current user", async () => {
        const result = await eventLikeService.likeEvent({
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

        expect(EventLike.create).toHaveBeenCalledWith({
            eventId: 1,
            userId: 10
        }, {
            transaction
        });

        expect(result).toEqual({
            eventId: 1,
            userId: 10,
            liked: true,
            likesCount: 1
        });
    });

    it("should return updated likes count", async () => {
        EventLike.count.mockResolvedValue(3);

        const result = await eventLikeService.likeEvent({
            eventId: 1,
            userId: 10
        });

        expect(EventLike.count).toHaveBeenCalledWith({
            where: {
                eventId: 1
            },
            transaction
        });

        expect(result.likesCount).toBe(3);
    });

    it("should commit transaction after successful like", async () => {
        await eventLikeService.likeEvent({
            eventId: 1,
            userId: 10
        });

        expect(transaction.commit).toHaveBeenCalledWith();
        expect(transaction.rollback).not.toHaveBeenCalled();
    });

    it("should start a database transaction", async () => {
        await eventLikeService.likeEvent({
            eventId: 1,
            userId: 10
        });

        expect(sequelize.transaction).toHaveBeenCalledTimes(1);
    });

    /* =============================
       LIKE EVENT ERRORS
    ============================= */

    it("should throw 404 when event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventLikeService.likeEvent({
            eventId: 999,
            userId: 10
        })).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });

        expect(EventLike.create).not.toHaveBeenCalled();
        expect(transaction.rollback).toHaveBeenCalledWith();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    it("should throw 409 when user already liked the event", async () => {
        EventLike.findOne.mockResolvedValue({
            id: 1,
            eventId: 1,
            userId: 10
        });

        await expect(eventLikeService.likeEvent({
            eventId: 1,
            userId: 10
        })).rejects.toMatchObject({
            message: "You have already liked this event",
            statusCode: 409
        });

        expect(EventLike.create).not.toHaveBeenCalled();
        expect(transaction.rollback).toHaveBeenCalledWith();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should rollback and forward database errors", async () => {
        EventLike.create.mockRejectedValue(new Error("DB error"));

        await expect(eventLikeService.likeEvent({
            eventId: 1,
            userId: 10
        })).rejects.toThrow("DB error");

        expect(transaction.rollback).toHaveBeenCalledWith();
        expect(transaction.commit).not.toHaveBeenCalled();
    });
});
