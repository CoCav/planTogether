/* ==================================================
   EVENT QUERY BUILDER TESTS

   Tests:
   - status filters
   - basic event filters
   - date filters
   - combined query filters
   - creator include builder
   - active participant include builder
   - participant count attribute builder

   Ensures:
   - Sequelize where conditions are built correctly
   - date overlap logic is applied
   - creator filtering is handled through includes
   - active participant includes exclude soft-deleted memberships
   - participant count attributes use COUNT DISTINCT
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
    countActiveParticipantsByEventIds
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

            expect(whereConditions[Op.and][0].endDateTime[Op.gte]).toBeInstanceOf(Date);
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
