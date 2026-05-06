/* ==================================================
   EVENT QUERY BUILDER TESTS

   Tests:
   - status filters
   - date filters
   - basic event filters
   - combined query filters
   - creator include builder

   Ensures:
   - Sequelize where conditions are built correctly
   - date overlap logic is applied
   - creator filtering is handled through includes
================================================== */

const { applyEventStatusFilter, applyEventDateFilters, applyEventBasicFilters, buildEventWhereConditions, buildEventCreatorInclude } = require("../../../src/utils/eventQueryBuilder");

const { Op } = require("sequelize");

describe("applyEventStatusFilter", () => {
    it("should not modify conditions if status is missing", () => {
        const where = {};

        applyEventStatusFilter(where);

        expect(where).toEqual({});
    });

    it("should initialize Op.and if not present", () => {
        const where = {};

        applyEventStatusFilter(where, "upcoming");

        expect(where[Op.and]).toBeDefined();
    });

    it("should add upcoming condition", () => {
        const where = {};

        applyEventStatusFilter(where, "upcoming");

        expect(where[Op.and][0].endDateTime[Op.gte]).toBeInstanceOf(Date);
    });

    it("should add past condition", () => {
        const where = {};

        applyEventStatusFilter(where, "past");

        expect(where[Op.and][0].endDateTime[Op.lt]).toBeInstanceOf(Date);
    });

    it("should append condition if Op.and already exists", () => {
        const where = {
            [Op.and]: [{ test: true }]
        };

        applyEventStatusFilter(where, "upcoming");

        expect(where[Op.and].length).toBe(2);
    });
});

describe("applyEventBasicFilters", () => {
    it("should apply creatorId filter", () => {
        const where = {};

        applyEventBasicFilters(where, {
            creatorId: "5"
        });

        expect(where.creatorId).toBe(5);
    });

    it("should apply mode filter", () => {
        const where = {};

        applyEventBasicFilters(where, {
            mode: " online "
        });

        expect(where.mode).toBe("online");
    });

    it("should apply search filter", () => {
        const where = {};

        applyEventBasicFilters(where, {
            search: "hello"
        });

        expect(where[Op.or]).toHaveLength(2);
    });
});

describe("applyEventDateFilters", () => {
    it("should apply date overlap filter", () => {
        const where = {};

        applyEventDateFilters(where, {
            date: "2026-04-24"
        });

        expect(where[Op.and]).toHaveLength(2);
    });

    it("should apply startDate only", () => {
        const where = {};

        applyEventDateFilters(where, {
            startDate: "2026-04-24"
        });

        expect(where[Op.and]).toHaveLength(1);
    });

    it("should apply endDate only", () => {
        const where = {};

        applyEventDateFilters(where, {
            endDate: "2026-04-24"
        });

        expect(where[Op.and]).toHaveLength(1);
    });
});

describe("buildEventWhereConditions", () => {
    it("should apply all filters together", () => {
        const where = {};

        buildEventWhereConditions(where, {
            status: "upcoming",
            search: "music",
            mode: "online",
            creatorId: "5"
        });

        expect(where[Op.and]).toBeDefined();
        expect(where[Op.or]).toBeDefined();
        expect(where.mode).toBe("online");
        expect(where.creatorId).toBe(5);
    });

    it("should skip status when includeStatus is false", () => {
        const where = {};

        buildEventWhereConditions(
            where,
            { status: "upcoming" },
            { includeStatus: false }
        );

        expect(where[Op.and]).toBeUndefined();
    });

    it("should return the same object", () => {
        const where = {};

        const result = buildEventWhereConditions(where, {});

        expect(result).toBe(where);
    });
});

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
