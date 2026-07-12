const {
    pageQueryValidator,
    pageSizeQueryValidator
} = require("../../../../src/validators/shared/paginationValidators");

const {
    runValidation,
    getValidationMessages
} = require("../../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Shared Pagination Validators Unit Tests

   Tests reusable pagination query validators.

   Responsibilities
   - Test page query validation
   - Test page size query validation
   - Test integer conversion
   - Test pagination limits

   Notes
   - Pagination values are converted to integers.
=========================================================================== */

describe("shared pagination validators", () => {

    /* =============================
       PAGE
    ============================= */

    describe("pageQueryValidator", () => {
        it("accepts and converts a valid page number", async () => {
            const { errors, req } = await runValidation(
                [pageQueryValidator],
                {
                    query: {
                        page: "3"
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.query.page).toBe(3);
        });

        it("accepts an omitted page", async () => {
            const { errors } = await runValidation(
                [pageQueryValidator]
            );

            expect(errors).toHaveLength(0);
        });

        it.each([
            ["zero", "0"],
            ["negative", "-1"],
            ["non numeric", "abc"]
        ])("rejects %s page values", async (_, page) => {
            const { errors } = await runValidation(
                [pageQueryValidator],
                {
                    query: {
                        page
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Page must be a positive integer");
        });
    });

    /* =============================
       PAGE SIZE
    ============================= */

    describe("pageSizeQueryValidator", () => {
        it("accepts and converts a valid page size", async () => {
            const { errors, req } = await runValidation(
                [pageSizeQueryValidator],
                {
                    query: {
                        pageSize: "25"
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.query.pageSize).toBe(25);
        });

        it("accepts an omitted page size", async () => {
            const { errors } = await runValidation(
                [pageSizeQueryValidator]
            );

            expect(errors).toHaveLength(0);
        });

        it.each([
            ["zero", "0"],
            ["negative", "-5"],
            ["greater than max", "101"],
            ["non numeric", "abc"]
        ])("rejects %s page size values", async (_, pageSize) => {
            const { errors } = await runValidation(
                [pageSizeQueryValidator],
                {
                    query: {
                        pageSize
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Page size must be between 1 and 100");
        });
    });
});
