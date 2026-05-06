/* ==================================================
   PAGINATION UTILITY TESTS

   Tests:
   - default pagination values
   - page and pageSize parsing
   - maximum page size limit
   - invalid number fallback
   - sort field allowlist
   - order direction normalization

   Ensures:
   - pagination values are safe and predictable
   - invalid query values fallback correctly
   - sorting only accepts allowed fields
================================================== */

const { getPaginationOptions } = require("../../../src/utils/pagination");

describe("getPaginationOptions", () => {
    const allowedFields = ["createdAt", "title"];

    it("should return default values when no query is provided", () => {
        const result = getPaginationOptions({}, allowedFields);

        expect(result).toEqual({
            page: 1,
            pageSize: 10,
            limit: 10,
            offset: 0,
            orderField: "createdAt",
            orderDirection: "DESC"
        });
    });

    it("should parse page and pageSize correctly", () => {
        const result = getPaginationOptions(
            { page: "2", pageSize: "20" },
            allowedFields
        );

        expect(result.page).toBe(2);
        expect(result.limit).toBe(20);
        expect(result.offset).toBe(20);
    });

    it("should enforce maximum pageSize of 100", () => {
        const result = getPaginationOptions(
            { pageSize: "500" },
            allowedFields
        );

        expect(result.limit).toBe(100);
    });

    it("should fallback to default values when invalid numbers are provided", () => {
        const result = getPaginationOptions(
            { page: "abc", pageSize: "xyz" },
            allowedFields
        );

        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
    });

    it("should not allow page less than 1", () => {
        const result = getPaginationOptions(
            { page: "-5" },
            allowedFields
        );

        expect(result.page).toBe(1);
    });

    it("should use allowed sort field", () => {
        const result = getPaginationOptions(
            { sortBy: "title" },
            allowedFields
        );

        expect(result.orderField).toBe("title");
    });

    it("should fallback to default sort field when not allowed", () => {
        const result = getPaginationOptions(
            { sortBy: "invalidField" },
            allowedFields
        );

        expect(result.orderField).toBe("createdAt");
    });

    it("should handle ascending order", () => {
        const result = getPaginationOptions(
            { order: "asc" },
            allowedFields
        );

        expect(result.orderDirection).toBe("ASC");
    });

    it("should default to DESC for invalid order", () => {
        const result = getPaginationOptions(
            { order: "invalid" },
            allowedFields
        );

        expect(result.orderDirection).toBe("DESC");
    });
});
