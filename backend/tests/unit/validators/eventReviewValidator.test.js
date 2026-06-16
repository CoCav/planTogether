/* ==================================================
   EVENT REVIEW VALIDATOR TESTS

   Tests:
   - eventId param validation
   - reviewId param validation
   - review creation validation
   - comment length validation

   Ensures:
   - route params are valid positive integers
   - empty review comments are rejected
   - review comments stay within allowed length
================================================== */

const {
    eventIdParamValidator,
    reviewIdParamValidator,
    createReviewValidator
} = require("../../../src/validators/eventReviewValidator");

const { runValidation } = require("../../helpers/validation/validationHelper");

describe("eventReviewValidator", () => {

    /* =============================
       EVENT ID PARAM VALIDATION
    ============================= */

    describe("eventIdParamValidator", () => {
        it("should pass with valid eventId", async () => {
            const result = await runValidation(eventIdParamValidator, {
                params: {
                    eventId: "1"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if eventId is not a positive integer", async () => {
            const result = await runValidation(eventIdParamValidator, {
                params: {
                    eventId: "abc"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Event ID must be a positive integer"
                    })
                ])
            );
        });
    });

    /* =============================
       REVIEW ID PARAM VALIDATION
    ============================= */

    describe("reviewIdParamValidator", () => {
        it("should pass with valid reviewId", async () => {
            const result = await runValidation(reviewIdParamValidator, {
                params: {
                    reviewId: "1"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if reviewId is not a positive integer", async () => {
            const result = await runValidation(reviewIdParamValidator, {
                params: {
                    reviewId: "abc"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Review ID must be a positive integer"
                    })
                ])
            );
        });
    });

    /* =============================
       REVIEW CREATION VALIDATION
    ============================= */

    describe("createReviewValidator", () => {
        it("should pass with a valid comment", async () => {
            const result = await runValidation(createReviewValidator, {
                body: {
                    comment: "Great event!"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if comment is missing", async () => {
            const result = await runValidation(createReviewValidator, {
                body: {}
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Comment is required"
                    })
                ])
            );
        });

        it("should fail if comment is too short", async () => {
            const result = await runValidation(createReviewValidator, {
                body: {
                    comment: "Hey"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Comment must be between 5 and 1000 characters"
                    })
                ])
            );
        });

        it("should fail if comment is too long", async () => {
            const result = await runValidation(createReviewValidator, {
                body: {
                    comment: "a".repeat(1001)
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Comment must be between 5 and 1000 characters"
                    })
                ])
            );
        });
    });
});
