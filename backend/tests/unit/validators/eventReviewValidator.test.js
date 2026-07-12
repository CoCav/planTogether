const {
    eventIdParamValidator,
    reviewIdParamValidator,
    getEventReviewsValidator,
    createReviewValidator,
    updateReviewValidator
} = require("../../../src/validators/eventReviewValidator");

const {
    runValidation,
    getValidationMessages
} = require("../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Event Review Validator Unit Tests

   Tests event review request validation.

   Responsibilities
   - Test event and review identifier exports
   - Test review creation payloads
   - Test review update payload reuse
   - Test review listing query validation
   - Test numeric value conversion

   Notes
   - Review permissions are handled by the service layer.
   - Shared parameter and pagination behavior is covered separately.
=========================================================================== */

describe("event review validator", () => {

    /* =============================
       SHARED VALIDATOR EXPORTS
    ============================= */

    describe("Shared validator exports", () => {
        it("re-exports the shared event ID validator", () => {
            expect(Array.isArray(eventIdParamValidator)).toBe(true);
            expect(eventIdParamValidator).toHaveLength(1);
        });

        it("re-exports the shared review ID validator", () => {
            expect(Array.isArray(reviewIdParamValidator)).toBe(true);
            expect(reviewIdParamValidator).toHaveLength(1);
        });
    });

    /* =============================
       REVIEW CREATION
    ============================= */

    describe("createReviewValidator", () => {
        it("accepts a valid review payload", async () => {
            const { errors, req } = await runValidation(
                createReviewValidator,
                {
                    body: {
                        rating: "5",
                        comment: "  Great community event!  "
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.body.rating).toBe(5);
            expect(req.body.comment).toBe("Great community event!");
        });

        it.each([
            ["minimum", "1", 1],
            ["maximum", "5", 5]
        ])(
            "accepts and converts the %s rating",
            async (_, rating, expectedRating) => {
                const { errors, req } = await runValidation(
                    createReviewValidator,
                    {
                        body: {
                            rating,
                            comment: "Valid review comment"
                        }
                    }
                );

                expect(errors).toHaveLength(0);
                expect(req.body.rating).toBe(expectedRating);
            }
        );

        it.each([
            ["missing", undefined],
            ["empty", ""]
        ])("rejects a %s rating", async (_, rating) => {
            const body = {
                comment: "Valid review comment"
            };

            if (rating !== undefined) {
                body.rating = rating;
            }

            const { errors } = await runValidation(
                createReviewValidator,
                { body }
            );

            expect(getValidationMessages(errors)).toContain("Rating is required");
        });

        it.each([
            ["below minimum", "0"],
            ["above maximum", "6"],
            ["decimal", "4.5"],
            ["non-numeric", "invalid"]
        ])("rejects a %s rating", async (_, rating) => {
            const { errors } = await runValidation(
                createReviewValidator,
                {
                    body: {
                        rating,
                        comment: "Valid review comment"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Rating must be an integer between 1 and 5");
        });

        it.each([
            ["missing", undefined],
            ["empty", ""],
            ["whitespace-only", "   "]
        ])("rejects a %s comment", async (_, comment) => {
            const body = {
                rating: "5"
            };

            if (comment !== undefined) {
                body.comment = comment;
            }

            const { errors } = await runValidation(
                createReviewValidator,
                { body }
            );

            expect(getValidationMessages(errors)).toContain("Comment is required");
        });

        it("rejects a comment shorter than 5 characters", async () => {
            const { errors } = await runValidation(
                createReviewValidator,
                {
                    body: {
                        rating: "5",
                        comment: "Good"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Comment must be between 5 and 1000 characters");
        });

        it("rejects a comment longer than 1000 characters", async () => {
            const { errors } = await runValidation(
                createReviewValidator,
                {
                    body: {
                        rating: "5",
                        comment: "A".repeat(1001)
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Comment must be between 5 and 1000 characters");
        });

        it.each([
            ["minimum", "A".repeat(5)],
            ["maximum", "A".repeat(1000)]
        ])("accepts a comment at the %s length", async (_, comment) => {
            const { errors } = await runValidation(
                createReviewValidator,
                {
                    body: {
                        rating: "5",
                        comment
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });
    });

    /* =============================
       REVIEW UPDATE
    ============================= */

    describe("updateReviewValidator", () => {
        it("reuses the review creation validator chain", () => {
            expect(updateReviewValidator).toBe(createReviewValidator);
        });

        it("validates update payloads with the same review rules", async () => {
            const { errors } = await runValidation(
                updateReviewValidator,
                {
                    body: {
                        rating: "3",
                        comment: "Updated review comment"
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });
    });

    /* =============================
       REVIEW LISTING QUERY
    ============================= */

    describe("getEventReviewsValidator", () => {
        it("accepts an empty query", async () => {
            const { errors } = await runValidation(
                getEventReviewsValidator
            );

            expect(errors).toHaveLength(0);
        });

        it.each([
            "createdAt",
            "rating"
        ])("accepts the %s sort field", async (sortBy) => {
            const { errors } = await runValidation(
                getEventReviewsValidator,
                {
                    query: {
                        sortBy
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });

        it("accepts and sanitizes pagination and sort values", async () => {
            const { errors, req } = await runValidation(
                getEventReviewsValidator,
                {
                    query: {
                        sortBy: "rating",
                        page: "2",
                        pageSize: "20",
                        order: "DESC"
                    }
                }
            );

            expect(errors).toHaveLength(0);

            expect(req.query).toMatchObject({
                sortBy: "rating",
                page: 2,
                pageSize: 20,
                order: "desc"
            });
        });

        it.each([
            [
                "sort field",
                { sortBy: "title" },
                "Invalid sort field"
            ],
            [
                "page",
                { page: "0" },
                "Page must be a positive integer"
            ],
            [
                "page size",
                { pageSize: "101" },
                "Page size must be between 1 and 100"
            ],
            [
                "sort order",
                { order: "random" },
                "Order must be asc or desc"
            ]
        ])(
            "rejects an invalid %s",
            async (_, query, expectedMessage) => {
                const { errors } = await runValidation(
                    getEventReviewsValidator,
                    { query }
                );

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );
    });
});
