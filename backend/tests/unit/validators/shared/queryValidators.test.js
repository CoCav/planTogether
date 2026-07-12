const {
    statusQueryValidator,
    modeQueryValidator,
    creatorIdQueryValidator,
    creatorQueryValidator,
    searchQueryValidator,
    typeQueryValidator,
    themeQueryValidator,
    locationQueryValidator,
    cityQueryValidator,
    regionQueryValidator,
    countryQueryValidator,
    dateQueryValidator,
    startDateQueryValidator,
    endDateQueryValidator
} = require("../../../../src/validators/shared/queryValidators");

const {
    runValidation,
    getValidationMessages
} = require("../../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Shared Query Validators Unit Tests

   Tests reusable event query validators.

   Responsibilities
   - Test event status validation
   - Test event mode validation
   - Test creator ID validation and conversion
   - Test text query sanitization
   - Test ISO8601 date query validation
   - Test omitted optional query values

   Notes
   - Query validators only validate request format.
   - Event filtering business rules are handled by services.
=========================================================================== */

describe("shared query validators", () => {

    /* =============================
       STATUS QUERY
    ============================= */

    describe("statusQueryValidator", () => {
        it.each([
            "upcoming",
            "ongoing",
            "past"
        ])("accepts the %s event status", async (status) => {
            const { errors } = await runValidation(
                [statusQueryValidator],
                {
                    query: {
                        status
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });

        it("accepts an omitted event status", async () => {
            const { errors } = await runValidation(
                [statusQueryValidator]
            );

            expect(errors).toHaveLength(0);
        });

        it("rejects an unsupported event status", async () => {
            const { errors } = await runValidation(
                [statusQueryValidator],
                {
                    query: {
                        status: "cancelled"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Status must be upcoming, ongoing or past");
        });
    });

    /* =============================
       MODE QUERY
    ============================= */

    describe("modeQueryValidator", () => {
        it.each([
            "online",
            "in_person"
        ])("accepts the %s event mode", async (mode) => {
            const { errors } = await runValidation(
                [modeQueryValidator],
                {
                    query: {
                        mode
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });

        it("accepts an omitted event mode", async () => {
            const { errors } = await runValidation(
                [modeQueryValidator]
            );

            expect(errors).toHaveLength(0);
        });

        it("rejects an unsupported event mode", async () => {
            const { errors } = await runValidation(
                [modeQueryValidator],
                {
                    query: {
                        mode: "hybrid"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Mode must be online or in_person");
        });
    });

    /* =============================
       CREATOR ID QUERY
    ============================= */

    describe("creatorIdQueryValidator", () => {
        it("accepts and converts a positive creator ID", async () => {
            const { errors, req } = await runValidation(
                [creatorIdQueryValidator],
                {
                    query: {
                        creatorId: "12"
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.query.creatorId).toBe(12);
        });

        it("accepts an omitted creator ID", async () => {
            const { errors } = await runValidation(
                [creatorIdQueryValidator]
            );

            expect(errors).toHaveLength(0);
        });

        it.each([
            ["zero", "0"],
            ["negative", "-1"],
            ["non-numeric", "abc"]
        ])("rejects a %s creator ID", async (_, creatorId) => {
            const { errors } = await runValidation(
                [creatorIdQueryValidator],
                {
                    query: {
                        creatorId
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Creator ID must be a positive integer");
        });
    });

    /* =============================
       TEXT QUERIES
    ============================= */

    describe("Text query validators", () => {
        const textQueryScenarios = [
            ["creator", creatorQueryValidator],
            ["search", searchQueryValidator],
            ["type", typeQueryValidator],
            ["theme", themeQueryValidator],
            ["location", locationQueryValidator],
            ["city", cityQueryValidator],
            ["region", regionQueryValidator],
            ["country", countryQueryValidator]
        ];

        it.each(textQueryScenarios)(
            "accepts an omitted %s query",
            async (_, validator) => {
                const { errors } = await runValidation(
                    [validator]
                );

                expect(errors).toHaveLength(0);
            }
        );

        it.each(textQueryScenarios)(
            "trims the %s query",
            async (field, validator) => {
                const { errors, req } = await runValidation(
                    [validator],
                    {
                        query: {
                            [field]: "  Test Value  "
                        }
                    }
                );

                expect(errors).toHaveLength(0);
                expect(req.query[field]).toBe("Test Value");
            }
        );
    });

    /* =============================
       DATE QUERIES
    ============================= */

    describe("Date query validators", () => {
        const dateQueryScenarios = [
            [
                "date",
                dateQueryValidator,
                "Date must be a valid ISO8601 date"
            ],
            [
                "startDate",
                startDateQueryValidator,
                "Start date must be a valid ISO8601 date"
            ],
            [
                "endDate",
                endDateQueryValidator,
                "End date must be a valid ISO8601 date"
            ]
        ];

        it.each(dateQueryScenarios)(
            "accepts an omitted %s query",
            async (_, validator) => {
                const { errors } = await runValidation(
                    [validator]
                );

                expect(errors).toHaveLength(0);
            }
        );

        it.each(dateQueryScenarios)(
            "accepts a valid ISO8601 %s query",
            async (field, validator) => {
                const { errors } = await runValidation(
                    [validator],
                    {
                        query: {
                            [field]: "2026-12-31"
                        }
                    }
                );

                expect(errors).toHaveLength(0);
            }
        );

        it.each(dateQueryScenarios)(
            "rejects an invalid %s query",
            async (field, validator, message) => {
                const { errors } = await runValidation(
                    [validator],
                    {
                        query: {
                            [field]: "not-a-date"
                        }
                    }
                );

                expect(getValidationMessages(errors)).toContain(message);
            }
        );
    });
});
