/* ==================================================
   EVENT QUERY FILTERS UTILITY TESTS

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

const { applyStatusFilter, applyDateFilters, applyBasicEventFilters, applyEventQueryFilters, buildCreatorInclude } = require("../../src/utils/eventQueryFilters");

const { Op } = require("sequelize");

describe("applyStatusFilter", () => {
    it("should not modify conditions if status is missing", () => {
        const where = {};

        applyStatusFilter(where);

        expect(where).toEqual({});
    });

    it("should initialize Op.and if not present", () => {
        const where = {};

        applyStatusFilter(where, "upcoming");

        expect(where[Op.and]).toBeDefined();
    });

    it("should add upcoming condition", () => {
        const where = {};

        applyStatusFilter(where, "upcoming");

        expect(where[Op.and][0].endDateTime[Op.gte]).toBeInstanceOf(Date);
    });

    it("should add past condition", () => {
        const where = {};

        applyStatusFilter(where, "past");

        expect(where[Op.and][0].endDateTime[Op.lt]).toBeInstanceOf(Date);
    });

    it("should append condition if Op.and already exists", () => {
        const where = {
            [Op.and]: [{ test: true }]
        };

        applyStatusFilter(where, "upcoming");

        expect(where[Op.and].length).toBe(2);
    });
});

describe("applyBasicEventFilters", () => {
    it("should apply creatorId filter", () => {
        const where = {};

        applyBasicEventFilters(where, {
            creatorId: "5"
        });

        expect(where.creatorId).toBe(5);
    });

    it("should apply mode filter", () => {
        const where = {};

        applyBasicEventFilters(where, {
            mode: " online "
        });

        expect(where.mode).toBe("online");
    });

    it("should apply search filter", () => {
        const where = {};

        applyBasicEventFilters(where, {
            search: "hello"
        });

        expect(where[Op.or]).toHaveLength(2);
    });
});

describe("applyDateFilters", () => {
    it("should apply date overlap filter", () => {
        const where = {};

        applyDateFilters(where, {
            date: "2026-04-24"
        });

        expect(where[Op.and]).toHaveLength(2);
    });

    it("should apply startDate only", () => {
        const where = {};

        applyDateFilters(where, {
            startDate: "2026-04-24"
        });

        expect(where[Op.and]).toHaveLength(1);
    });

    it("should apply endDate only", () => {
        const where = {};

        applyDateFilters(where, {
            endDate: "2026-04-24"
        });

        expect(where[Op.and]).toHaveLength(1);
    });
});

describe("applyEventQueryFilters", () => {
    it("should apply all filters together", () => {
        const where = {};

        applyEventQueryFilters(where, {
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

        applyEventQueryFilters(
            where,
            { status: "upcoming" },
            { includeStatus: false }
        );

        expect(where[Op.and]).toBeUndefined();
    });

    it("should return the same object", () => {
        const where = {};

        const result = applyEventQueryFilters(where, {});

        expect(result).toBe(where);
    });
});

describe("buildCreatorInclude", () => {
    const User = {
        name: "UserModel"
    };

    it("should build creator include without filter", () => {
        expect(buildCreatorInclude(User)).toEqual({
            model: User,
            as: "creator",
            attributes: ["id", "name"]
        });
    });

    it("should build creator include with name filter", () => {
        expect(buildCreatorInclude(User, "john")).toEqual({
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
