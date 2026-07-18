const { Op } = require("sequelize");

const {
    buildEventLikeInclude,
    buildEventLikeCountAttribute,
    findEventLike,
    getEventLikesCount,
    findLikedEventIdsByUser,
    countEventLikesByEventIds
} = require("../../../../src/utils/eventLikes/eventLikes");

/* ==========================================================================
   Event Like Utility Unit Tests

   Tests event like include, query and count helpers.

   Responsibilities
   - Test event like include building
   - Test distinct like count attribute building
   - Test individual like lookup
   - Test event like counting
   - Test liked event ID lookup
   - Test grouped event like counts
   - Test empty input short-circuits

   Notes
   - Grouped counts are normalized into an eventId-to-count object.
   - Liked event IDs are normalized into a Set of numbers.
=========================================================================== */

describe("event like utility", () => {
    const EventLike = {
        findOne: jest.fn(),
        findAll: jest.fn(),
        count: jest.fn()
    };

    const sequelize = {
        fn: jest.fn(),
        col: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       EVENT LIKE INCLUDE
    ============================= */

    describe("buildEventLikeInclude", () => {
        it("builds the event like include", () => {
            const result = buildEventLikeInclude(EventLike);

            expect(result).toEqual({
                model: EventLike,
                as: "likes",
                attributes: [],
                required: false
            });
        });
    });

    /* =============================
       LIKE COUNT ATTRIBUTE
    ============================= */

    describe("buildEventLikeCountAttribute", () => {
        it("builds a distinct like count attribute", () => {
            const likeColumn = {
                type: "column",
                path: "likes.id"
            };

            const distinctExpression = {
                type: "distinct",
                value: likeColumn
            };

            const countExpression = {
                type: "count",
                value: distinctExpression
            };

            sequelize.col.mockReturnValue(likeColumn);

            sequelize.fn
                .mockReturnValueOnce(distinctExpression)
                .mockReturnValueOnce(countExpression);

            const result = buildEventLikeCountAttribute(sequelize, "likes.id");

            expect(sequelize.col).toHaveBeenCalledWith("likes.id");
            expect(sequelize.fn).toHaveBeenNthCalledWith(1, "DISTINCT", likeColumn);
            expect(sequelize.fn).toHaveBeenNthCalledWith(2, "COUNT", distinctExpression);

            expect(result).toEqual([
                countExpression,
                "likesCount"
            ]);
        });
    });

    /* =============================
       EVENT LIKE LOOKUP
    ============================= */

    describe("findEventLike", () => {
        it("finds a like for an event and user", async () => {
            const like = {
                eventId: 10,
                userId: 20
            };

            EventLike.findOne.mockResolvedValue(like);

            const result = await findEventLike(EventLike, {
                eventId: 10,
                userId: 20
            });

            expect(EventLike.findOne).toHaveBeenCalledWith({
                where: {
                    eventId: 10,
                    userId: 20
                },
                transaction: undefined
            });

            expect(result).toBe(like);
        });

        it("forwards the transaction option", async () => {
            const transaction = {
                id: "transaction"
            };

            EventLike.findOne.mockResolvedValue(null);

            const result = await findEventLike(EventLike, {
                eventId: 10,
                userId: 20,
                transaction
            });

            expect(EventLike.findOne).toHaveBeenCalledWith({
                where: {
                    eventId: 10,
                    userId: 20
                },
                transaction
            });

            expect(result).toBeNull();
        });
    });

    /* =============================
       EVENT LIKE COUNT
    ============================= */

    describe("getEventLikesCount", () => {
        it("counts likes for an event", async () => {
            EventLike.count.mockResolvedValue(4);

            const result = await getEventLikesCount(EventLike, 10);

            expect(EventLike.count).toHaveBeenCalledWith({
                where: {
                    eventId: 10
                }
            });

            expect(result).toBe(4);
        });

        it("forwards additional count options", async () => {
            const transaction = {
                id: "transaction"
            };

            EventLike.count.mockResolvedValue(2);

            const result = await getEventLikesCount(EventLike, 10, {
                transaction,
                distinct: true
            });

            expect(EventLike.count).toHaveBeenCalledWith({
                where: {
                    eventId: 10
                },
                transaction,
                distinct: true
            });

            expect(result).toBe(2);
        });
    });

    /* =============================
       LIKED EVENT IDS
    ============================= */

    describe("findLikedEventIdsByUser", () => {
        it("returns an empty Set when current user ID is missing", async () => {
            const result = await findLikedEventIdsByUser(EventLike, [10, 20], undefined);

            expect(result).toEqual(new Set());
            expect(EventLike.findAll).not.toHaveBeenCalled();
        });

        it("returns an empty Set when no event IDs are provided", async () => {
            const result = await findLikedEventIdsByUser(EventLike, [], 1);

            expect(result).toEqual(new Set());
            expect(EventLike.findAll).not.toHaveBeenCalled();
        });

        it("queries liked event IDs for the current user", async () => {
            EventLike.findAll.mockResolvedValue([]);

            await findLikedEventIdsByUser(EventLike, [10, 20], 1);

            expect(EventLike.findAll).toHaveBeenCalledWith({
                attributes: ["eventId"],
                where: {
                    userId: 1,
                    eventId: {
                        [Op.in]: [10, 20]
                    }
                },
                raw: true
            });
        });

        it("normalizes liked event IDs into a numeric Set", async () => {
            EventLike.findAll.mockResolvedValue([{
                eventId: "10"
            }, {
                eventId: 20
            }]);

            const result = await findLikedEventIdsByUser(EventLike, [10, 20], 1);

            expect(result).toEqual(new Set([10, 20]));
        });

        it("returns an empty Set when the query returns no likes", async () => {
            EventLike.findAll.mockResolvedValue([]);

            const result = await findLikedEventIdsByUser(EventLike, [10], 1);

            expect(result).toEqual(new Set());
        });
    });

    /* =============================
       GROUPED LIKE COUNTS
    ============================= */

    describe("countEventLikesByEventIds", () => {
        it("returns an empty object when no event IDs are provided", async () => {
            const result = await countEventLikesByEventIds(EventLike, sequelize, []);

            expect(result).toEqual({});
            expect(EventLike.findAll).not.toHaveBeenCalled();
        });

        it("queries grouped like counts", async () => {
            const countColumn = {
                type: "column",
                path: "eventId"
            };

            const countExpression = {
                type: "count",
                value: countColumn
            };

            sequelize.col.mockReturnValue(countColumn);
            sequelize.fn.mockReturnValue(countExpression);

            EventLike.findAll.mockResolvedValue([]);

            await countEventLikesByEventIds(EventLike, sequelize, [10, 20]);

            expect(sequelize.col).toHaveBeenCalledWith("eventId");
            expect(sequelize.fn).toHaveBeenCalledWith("COUNT", countColumn);

            expect(EventLike.findAll).toHaveBeenCalledWith({
                attributes: [
                    "eventId",
                    [
                        countExpression,
                        "likesCount"
                    ]
                ],
                where: {
                    eventId: {
                        [Op.in]: [10, 20]
                    }
                },
                group: ["eventId"],
                raw: true
            });
        });

        it("normalizes grouped counts into an event count map", async () => {
            EventLike.findAll.mockResolvedValue([{
                eventId: "10",
                likesCount: "3"
            }, {
                eventId: "20",
                likesCount: "1"
            }]);

            const result = await countEventLikesByEventIds(EventLike, sequelize, [10, 20]);

            expect(result).toEqual({
                10: 3,
                20: 1
            });
        });

        it("returns an empty object when the grouped query returns no rows", async () => {
            EventLike.findAll.mockResolvedValue([]);

            const result = await countEventLikesByEventIds(EventLike, sequelize, [10]);

            expect(result).toEqual({});
        });
    });
});
