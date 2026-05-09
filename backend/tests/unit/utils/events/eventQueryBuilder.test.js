/* ==================================================
   EVENT QUERY BUILDER TESTS

   Tests:
   - status filters
   - basic event filters
   - date filters
   - combined query filters
   - creator include builder

   Ensures:
   - Sequelize where conditions are built correctly
   - date overlap logic is applied
   - creator filtering is handled through includes
   - shared event status constants are used for expected statuses
================================================== */

const { Op } = require("sequelize");

const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");

const {
    applyEventStatusFilter,
    applyEventBasicFilters,
    applyEventDateFilters,
    buildEventWhereConditions,
    buildEventCreatorInclude
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
                mode: " online "
            });

            expect(whereConditions.mode).toBe("online");
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
                mode: "online",
                creatorId: "5"
            });

            expect(whereConditions[Op.and]).toBeDefined();
            expect(whereConditions[Op.or]).toBeDefined();
            expect(whereConditions.mode).toBe("online");
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
});
