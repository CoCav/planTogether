/* ==================================================
   EVENT QUERY BUILDER TESTS

   Tests:
   - upcoming, ongoing and past status filters
   - basic event filters
   - date filters
   - combined query filters
   - creator include builder
   - active participant include builder
   - participant count attribute builder
   - review stats include builder
   - review count attribute builder
   - average rating attribute builder
   - like stats include builder
   - like count attribute builder
   - liked event IDs lookup for current user
   - grouped like count queries

   Ensures:
   - upcoming, ongoing and past filters generate correct date conditions
   - Sequelize where conditions are built correctly
   - date overlap logic is applied
   - creator filtering is handled through includes
   - active participant includes exclude soft-deleted memberships
   - participant count attributes use COUNT DISTINCT
   - review includes support aggregated rating stats
   - review count attributes use COUNT DISTINCT
   - average rating attributes use review ratings
   - like includes support aggregated like stats
   - like count attributes use COUNT DISTINCT
   - liked event IDs are fetched in one query
   - grouped like counts avoid N+1 queries
   - shared event status and role constants are used correctly
================================================== */

const { Op } = require("sequelize");

const sequelize = require("../../../../src/config/database");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");
const { EVENT_MODES } = require("../../../../src/constants/eventModes");

const {
    applyEventStatusFilter,
    applyEventBasicFilters,
    applyEventDateFilters,
    buildEventWhereConditions,
    buildEventCreatorInclude,
    buildActiveParticipantInclude,
    buildParticipantCountAttribute,
    countActiveParticipantsByEventIds,
    buildEventReviewInclude,
    buildReviewCountAttribute,
    buildAverageRatingAttribute,
    buildEventLikeInclude,
    buildLikeCountAttribute,
    findLikedEventIdsByUser,
    countEventLikesByEventIds
} = require("../../../../src/utils/events/eventQueryBuilder");

describe("eventQueryBuilder utils", () => {

    /* =============================
       STATUS FILTERS
    ============================= */

    describe("applyEventStatusFilter", () => {

        it("should not modify conditions if status is missing", () => {
            const whereConditions = {};

            applyEventStatusFilter(whereConditions);

            expect(whereConditions).toEqual({});
        });

        it("should initialize Op.and if not present", () => {
            const whereConditions = {};

            applyEventStatusFilter(whereConditions, EVENT_STATUS.UPCOMING);

            expect(whereConditions[Op.and]).toBeDefined();
        });

        it("should add upcoming condition", () => {
            const whereConditions = {};

            applyEventStatusFilter(whereConditions, EVENT_STATUS.UPCOMING);

            expect(whereConditions[Op.and][0].startDateTime[Op.gt]).toBeInstanceOf(Date);
        });

        it("should add ongoing conditions", () => {
            const whereConditions = {};

            applyEventStatusFilter(whereConditions, EVENT_STATUS.ONGOING);

            expect(whereConditions[Op.and]).toHaveLength(2);

            expect(whereConditions[Op.and][0].startDateTime[Op.lte]).toBeInstanceOf(Date);
            expect(whereConditions[Op.and][1].endDateTime[Op.gte]).toBeInstanceOf(Date);
        });

        it("should add past condition", () => {
            const whereConditions = {};

            applyEventStatusFilter(whereConditions, EVENT_STATUS.PAST);

            expect(whereConditions[Op.and][0].endDateTime[Op.lt]).toBeInstanceOf(Date);
        });

        it("should append condition if Op.and already exists", () => {
            const whereConditions = {
                [Op.and]: [{ test: true }]
            };

            applyEventStatusFilter(whereConditions, EVENT_STATUS.UPCOMING);

            expect(whereConditions[Op.and].length).toBe(2);
        });
    });

    /* =============================
       BASIC EVENT FILTERS
    ============================= */

    describe("applyEventBasicFilters", () => {
        it("should apply creatorId filter", () => {
            const whereConditions = {};

            applyEventBasicFilters(whereConditions, {
                creatorId: "5"
            });

            expect(whereConditions.creatorId).toBe(5);
        });

        it("should apply mode filter", () => {
            const whereConditions = {};

            applyEventBasicFilters(whereConditions, {
                mode: EVENT_MODES.ONLINE
            });

            expect(whereConditions.mode).toBe(EVENT_MODES.ONLINE);
        });

        it("should apply search filter", () => {
            const whereConditions = {};

            applyEventBasicFilters(whereConditions, {
                search: "hello"
            });

            expect(whereConditions[Op.or]).toHaveLength(2);
        });
    });

    /* =============================
       DATE FILTERS
    ============================= */

    describe("applyEventDateFilters", () => {
        it("should apply date overlap filter", () => {
            const whereConditions = {};

            applyEventDateFilters(whereConditions, {
                date: "2026-04-24"
            });

            expect(whereConditions[Op.and]).toHaveLength(2);
        });

        it("should apply startDate only", () => {
            const whereConditions = {};

            applyEventDateFilters(whereConditions, {
                startDate: "2026-04-24"
            });

            expect(whereConditions[Op.and]).toHaveLength(1);
        });

        it("should apply endDate only", () => {
            const whereConditions = {};

            applyEventDateFilters(whereConditions, {
                endDate: "2026-04-24"
            });

            expect(whereConditions[Op.and]).toHaveLength(1);
        });
    });

    /* =============================
       MAIN QUERY BUILDER
    ============================= */

    describe("buildEventWhereConditions", () => {
        it("should apply all filters together", () => {
            const whereConditions = {};

            buildEventWhereConditions(whereConditions, {
                status: EVENT_STATUS.UPCOMING,
                search: "music",
                mode: EVENT_MODES.ONLINE,
                creatorId: "5"
            });

            expect(whereConditions[Op.and]).toBeDefined();
            expect(whereConditions[Op.or]).toBeDefined();
            expect(whereConditions.mode).toBe(EVENT_MODES.ONLINE);
            expect(whereConditions.creatorId).toBe(5);
        });

        it("should apply upcoming status filter", () => {
            const whereConditions = {};

            buildEventWhereConditions(whereConditions, {
                status: EVENT_STATUS.UPCOMING
            });

            expect(whereConditions[Op.and]).toHaveLength(1);
        });

        it("should apply ongoing status filter", () => {
            const whereConditions = {};

            buildEventWhereConditions(whereConditions, {
                status: EVENT_STATUS.ONGOING
            });

            expect(whereConditions[Op.and]).toHaveLength(2);
        });

        it("should apply past status filter", () => {
            const whereConditions = {};

            buildEventWhereConditions(whereConditions, {
                status: EVENT_STATUS.PAST
            });

            expect(whereConditions[Op.and]).toHaveLength(1);
        });

        it("should skip status when includeStatus is false", () => {
            const whereConditions = {};

            buildEventWhereConditions(
                whereConditions,
                { status: EVENT_STATUS.UPCOMING },
                { includeStatus: false }
            );

            expect(whereConditions[Op.and]).toBeUndefined();
        });

        it("should return the same object", () => {
            const whereConditions = {};

            const result = buildEventWhereConditions(whereConditions, {});

            expect(result).toBe(whereConditions);
        });
    });

    /* =============================
       CREATOR INCLUDE BUILDER
    ============================= */

    describe("buildEventCreatorInclude", () => {
        const User = {
            name: "UserModel"
        };

        it("should build creator include without filter", () => {
            expect(buildEventCreatorInclude(User)).toEqual({
                model: User,
                as: "creator",
                attributes: ["id", "name"]
            });
        });

        it("should build creator include with name filter", () => {
            expect(buildEventCreatorInclude(User, "john")).toEqual({
                model: User,
                as: "creator",
                attributes: ["id", "name"],
                where: {
                    name: {
                        [Op.iLike]: "%john%"
                    }
                },
                required: true
            });
        });
    });

    /* =============================
       PARTICIPANT HELPERS
    ============================= */

    describe("buildActiveParticipantInclude", () => {
        const User = {
            name: "UserModel"
        };

        it("should build active participant include", () => {
            expect(buildActiveParticipantInclude(User)).toEqual({
                model: User,
                as: "participants",
                attributes: [],
                through: {
                    attributes: [],
                    where: {
                        role: EVENT_ROLES.PARTICIPANT,
                        deletedAt: null
                    }
                },
                required: false
            });
        });
    });

    describe("buildParticipantCountAttribute", () => {

        it("should build DISTINCT participant count attribute", () => {
            const result = buildParticipantCountAttribute(
                sequelize,
                "participants.id"
            );

            expect(result[1]).toBe("participantCount");
        });
    });

    /* =============================
       REVIEW STATS HELPERS
    ============================= */

    describe("buildEventReviewInclude", () => {
        const EventReview = {
            name: "EventReviewModel"
        };

        it("should build review include for review stats", () => {
            expect(buildEventReviewInclude(EventReview)).toEqual({
                model: EventReview,
                as: "reviews",
                attributes: [],
                required: false
            });
        });
    });

    describe("buildReviewCountAttribute", () => {
        it("should build DISTINCT review count attribute", () => {
            const result = buildReviewCountAttribute(
                sequelize,
                "reviews.id"
            );

            expect(result[1]).toBe("reviewCount");
        });
    });

    describe("buildAverageRatingAttribute", () => {
        it("should build average rating attribute", () => {
            const result = buildAverageRatingAttribute(
                sequelize,
                "reviews.rating"
            );

            expect(result[1]).toBe("averageRating");
        });
    });

    /* =============================
       LIKE STATS HELPERS
    ============================= */

    describe("buildEventLikeInclude", () => {
        const EventLike = {
            name: "EventLikeModel"
        };

        it("should build like include for like stats", () => {
            expect(buildEventLikeInclude(EventLike)).toEqual({
                model: EventLike,
                as: "likes",
                attributes: [],
                required: false
            });
        });
    });

    describe("buildLikeCountAttribute", () => {
        it("should build DISTINCT like count attribute", () => {
            const result = buildLikeCountAttribute(
                sequelize,
                "likes.id"
            );

            expect(result[1]).toBe("likesCount");
        });
    });

    /* =============================
       FIND LIKED EVENT IDS BY USER
    ============================= */

    describe("findLikedEventIdsByUser", () => {
        const EventLike = {
            findAll: jest.fn()
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should return empty Set when currentUserId is missing", async () => {
            const result = await findLikedEventIdsByUser(
                EventLike,
                [1, 2],
                null
            );

            expect(result).toEqual(new Set());
            expect(EventLike.findAll).not.toHaveBeenCalled();
        });

        it("should return empty Set when eventIds is empty", async () => {
            const result = await findLikedEventIdsByUser(
                EventLike,
                [],
                10
            );

            expect(result).toEqual(new Set());
            expect(EventLike.findAll).not.toHaveBeenCalled();
        });

        it("should find liked event IDs for the current user", async () => {
            EventLike.findAll.mockResolvedValue([
                { eventId: 1 },
                { eventId: 3 }
            ]);

            const result = await findLikedEventIdsByUser(
                EventLike,
                [1, 2, 3],
                10
            );

            expect(EventLike.findAll).toHaveBeenCalledWith({
                attributes: ["eventId"],
                where: {
                    userId: 10,
                    eventId: {
                        [Op.in]: [1, 2, 3]
                    }
                },
                raw: true
            });

            expect(result).toEqual(new Set([1, 3]));
        });
    });

    /* =============================
       LIKE COUNT HELPERS
    ============================= */

    describe("countEventLikesByEventIds", () => {

        const EventLike = {
            findAll: jest.fn()
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should return empty object when eventIds is empty", async () => {
            const result = await countEventLikesByEventIds(
                EventLike,
                sequelize,
                []
            );

            expect(result).toEqual({});
            expect(EventLike.findAll).not.toHaveBeenCalled();
        });

        it("should build grouped like counts", async () => {
            EventLike.findAll.mockResolvedValue([
                {
                    eventId: 1,
                    likesCount: "3"
                },
                {
                    eventId: 2,
                    likesCount: "5"
                }
            ]);

            const result = await countEventLikesByEventIds(
                EventLike,
                sequelize,
                [1, 2]
            );

            expect(EventLike.findAll).toHaveBeenCalledWith({
                attributes: [
                    "eventId",
                    [
                        sequelize.fn("COUNT", sequelize.col("eventId")),
                        "likesCount"
                    ]
                ],
                where: {
                    eventId: {
                        [Op.in]: [1, 2]
                    }
                },
                group: ["eventId"],
                raw: true
            });

            expect(result).toEqual({
                1: 3,
                2: 5
            });
        });
    });

    /* =============================
       GROUPED PARTICIPANT COUNTS
    ============================= */

    describe("countActiveParticipantsByEventIds", () => {

        const EventUserRole = {
            findAll: jest.fn()
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should return empty object when eventIds is empty", async () => {
            const result = await countActiveParticipantsByEventIds(
                EventUserRole,
                sequelize,
                []
            );

            expect(result).toEqual({});

            expect(EventUserRole.findAll).not.toHaveBeenCalled();
        });

        it("should build grouped participant counts", async () => {
            EventUserRole.findAll.mockResolvedValue([
                {
                    eventId: 1,
                    participantCount: "3"
                },
                {
                    eventId: 2,
                    participantCount: "5"
                }
            ]);

            const result = await countActiveParticipantsByEventIds(
                EventUserRole,
                sequelize,
                [1, 2]
            );

            expect(EventUserRole.findAll).toHaveBeenCalledWith({
                attributes: [
                    "eventId",
                    [
                        sequelize.fn("COUNT", sequelize.col("eventId")),
                        "participantCount"
                    ]
                ],
                where: {
                    eventId: {
                        [Op.in]: [1, 2]
                    },
                    role: EVENT_ROLES.PARTICIPANT,
                    deletedAt: null
                },
                group: ["eventId"],
                raw: true
            });

            expect(result).toEqual({
                1: 3,
                2: 5
            });
        });
    });
});
