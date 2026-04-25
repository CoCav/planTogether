const { applyStatusFilter } = require("../../src/utils/eventQuery");
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
        expect(Array.isArray(where[Op.and])).toBe(true);
    });

    it("should add upcoming condition", () => {
        const where = {};

        applyStatusFilter(where, "upcoming");

        const condition = where[Op.and][0];

        expect(condition).toHaveProperty("endDateTime");
        expect(condition.endDateTime[Op.gte]).toBeDefined();
        expect(condition.endDateTime[Op.gte]).toBeInstanceOf(Date);
    });

    it("should add past condition", () => {
        const where = {};

        applyStatusFilter(where, "past");

        const condition = where[Op.and][0];

        expect(condition).toHaveProperty("endDateTime");
        expect(condition.endDateTime[Op.lt]).toBeDefined();
        expect(condition.endDateTime[Op.lt]).toBeInstanceOf(Date);
    });

    it("should append condition if Op.and already exists", () => {
        const where = {
            [Op.and]: [{ existing: true }]
        };

        applyStatusFilter(where, "upcoming");

        expect(where[Op.and].length).toBe(2);
    });

    it("should ignore invalid status", () => {
        const where = {};

        applyStatusFilter(where, "invalid");

        expect(where).toEqual({});
    });
});