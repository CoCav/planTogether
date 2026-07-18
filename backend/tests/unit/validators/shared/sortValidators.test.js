const {
    orderQueryValidator,
    createSortByValidator
} = require("../../../../src/validators/shared/sortValidators");

const {
    runValidation,
    getValidationMessages
} = require("../../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Shared Sort Validators Unit Tests

   Tests reusable sorting query validators.

   Responsibilities
   - Test sort order validation
   - Test sort order normalization
   - Test sort field validator creation
   - Test custom sort field messages

   Notes
   - Sort orders are normalized to lowercase.
   - Allowed sort fields remain route-specific.
=========================================================================== */

describe("shared sort validators", () => {

    /* =============================
       SORT ORDER
    ============================= */

    describe("orderQueryValidator", () => {
        it("accepts an omitted sort order", async () => {
            const { errors } = await runValidation([orderQueryValidator]);

            expect(errors).toHaveLength(0);
        });

        it.each([
            ["ascending", "asc"],
            ["descending", "desc"]
        ])(
            "accepts the %s sort order", async (_, order) => {
                const { errors, req } = await runValidation(
                    [orderQueryValidator],
                    {
                        query: {
                            order
                        }
                    }
                );

                expect(errors).toHaveLength(0);
                expect(req.query.order).toBe(order);
            }
        );

        it("normalizes the sort order to lowercase", async () => {
            const { errors, req } = await runValidation(
                [orderQueryValidator],
                {
                    query: {
                        order: "DESC"
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.query.order).toBe("desc");
        });

        it("rejects an unsupported sort order", async () => {
            const { errors } = await runValidation(
                [orderQueryValidator],
                {
                    query: {
                        order: "random"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Order must be asc or desc");
        });
    });

    /* =============================
       SORT FIELD
    ============================= */

    describe("createSortByValidator", () => {
        const allowedFields = [
            "title",
            "createdAt"
        ];

        it("accepts an omitted sort field", async () => {
            const validator = createSortByValidator(allowedFields);

            const { errors } = await runValidation([validator]);

            expect(errors).toHaveLength(0);
        });

        it.each(allowedFields)("accepts the %s sort field", async (sortBy) => {
            const validator = createSortByValidator(allowedFields);

            const { errors } = await runValidation(
                [validator],
                {
                    query: {
                        sortBy
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });

        it("rejects an unsupported sort field with the default message", async () => {
            const validator = createSortByValidator(allowedFields);

            const { errors } = await runValidation(
                [validator],
                {
                    query: {
                        sortBy: "invalid"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Invalid sort field");
        });

        it("uses a custom sort field validation message", async () => {
            const validator = createSortByValidator(allowedFields, "Sort field is not supported");

            const { errors } = await runValidation(
                [validator],
                {
                    query: {
                        sortBy: "invalid"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Sort field is not supported");
        });
    });
});
