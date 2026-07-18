const {
    getPaginationOptions,
    getTotalCount,
    getTotalPages
} = require("../../../src/utils/pagination");

/* ==========================================================================
   Pagination Utility Unit Tests

   Tests pagination, sorting and count helpers.

   Responsibilities
   - Test default pagination values
   - Test page and page size normalization
   - Test maximum page size enforcement
   - Test sort field allowlists
   - Test sort order normalization
   - Test grouped count normalization
   - Test total page calculation

   Notes
   - Page size is capped at 100.
   - Unsupported sort fields fall back to the configured default.
=========================================================================== */

describe("pagination utility", () => {
    const allowedSortFields = [
        "createdAt",
        "title"
    ];

    /* =============================
       PAGINATION OPTIONS
    ============================= */

    describe("getPaginationOptions", () => {
        it("returns default pagination and sorting values", () => {
            const result = getPaginationOptions({}, allowedSortFields);

            expect(result).toEqual({
                page: 1,
                pageSize: 10,
                limit: 10,
                offset: 0,
                orderField: "createdAt",
                orderDirection: "DESC"
            });
        });

        it("parses page and page size values", () => {
            const result = getPaginationOptions({
                page: "2",
                pageSize: "20"
            },
                allowedSortFields
            );

            expect(result).toMatchObject({
                page: 2,
                pageSize: 20,
                limit: 20,
                offset: 20
            });
        });

        it("caps page size at the configured maximum", () => {
            const result = getPaginationOptions({
                pageSize: "500"
            },
                allowedSortFields
            );

            expect(result.pageSize).toBe(100);
            expect(result.limit).toBe(100);
        });

        it("falls back to default pagination values for invalid numbers", () => {
            const result = getPaginationOptions({
                page: "invalid",
                pageSize: "invalid"
            },
                allowedSortFields
            );

            expect(result).toMatchObject({
                page: 1,
                pageSize: 10,
                limit: 10,
                offset: 0
            });
        });

        it("normalizes pages below one to the first page", () => {
            const result = getPaginationOptions({
                page: "-5"
            },
                allowedSortFields
            );

            expect(result.page).toBe(1);
            expect(result.offset).toBe(0);
        });

        it("uses an allowed sort field", () => {
            const result = getPaginationOptions({
                sortBy: "title"
            },
                allowedSortFields
            );

            expect(result.orderField).toBe("title");
        });

        it("falls back to the default sort field when unsupported", () => {
            const result = getPaginationOptions({
                sortBy: "invalidField"
            },
                allowedSortFields
            );

            expect(result.orderField).toBe("createdAt");
        });

        it("uses a custom default sort field and order", () => {
            const result = getPaginationOptions({},
                ["startDateTime"],
                "startDateTime",
                "ASC"
            );

            expect(result.orderField).toBe("startDateTime");
            expect(result.orderDirection).toBe("ASC");
        });

        it("normalizes ascending sort order", () => {
            const result = getPaginationOptions({
                order: "ASC"
            },
                allowedSortFields
            );

            expect(result.orderDirection).toBe("ASC");
        });

        it.each([
            "desc",
            "DESC",
            "invalid",
            ""
        ])(
            "normalizes %s to descending order", (order) => {
                const result = getPaginationOptions({ order }, allowedSortFields);

                expect(result.orderDirection).toBe("DESC");
            }
        );
    });

    /* =============================
       TOTAL COUNT
    ============================= */

    describe("getTotalCount", () => {
        it("returns a numeric count unchanged", () => {
            expect(getTotalCount(5)).toBe(5);
        });

        it("returns the length of a grouped count array", () => {
            expect(getTotalCount([
                { count: 1 },
                { count: 1 },
                { count: 1 }
            ])).toBe(3);
        });

        it("returns zero for an empty grouped count array", () => {
            expect(getTotalCount([])).toBe(0);
        });
    });

    /* =============================
       TOTAL PAGES
    ============================= */

    describe("getTotalPages", () => {
        it("rounds partial pages upward", () => {
            expect(getTotalPages(5, 2)).toBe(3);
        });

        it("returns the exact page count when evenly divisible", () => {
            expect(getTotalPages(20, 10)).toBe(2);
        });

        it("returns zero when there are no items", () => {
            expect(getTotalPages(0, 10)).toBe(0);
        });
    });
});
