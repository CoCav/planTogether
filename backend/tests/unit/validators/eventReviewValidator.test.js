/* ==================================================
   EVENT REVIEW VALIDATOR TESTS

   Tests:
   - eventId param validation
   - reviewId param validation
   - review creation validation
   - review update validation
   - review query validation with sorting and pagination
   - review rating validation
   - review comment validation

   Ensures:
   - route params are valid positive integers
   - review creation and update require valid rating and comment
   - review listing query params support sorting and pagination
   - invalid review listing query params are rejected
   - review rating is required and between 1 and 5
   - review comments stay within allowed length
================================================== */

const {
    eventIdParamValidator,
    reviewIdParamValidator,
    getEventReviewsValidator,
    createReviewValidator,
    updateReviewValidator
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
       REVIEW QUERY VALIDATION
    ============================= */

    describe("getEventReviewsValidator", () => {
        it("should pass with valid query params", async () => {
            const result = await runValidation(getEventReviewsValidator, {
                query: {
                    page: "1",
                    pageSize: "10",
                    sortBy: "createdAt",
                    order: "desc"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should pass when query params are omitted", async () => {
            const result = await runValidation(getEventReviewsValidator, {
                query: {}
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail with invalid sortBy", async () => {
            const result = await runValidation(getEventReviewsValidator, {
                query: {
                    sortBy: "invalid"
                }
            });

            expect(result.array()[0].msg).toMatch(/invalid sort field/i);
        });

        it("should fail with invalid page", async () => {
            const result = await runValidation(getEventReviewsValidator, {
                query: {
                    page: "0"
                }
            });

            expect(result.array()[0].msg).toMatch(/page must be a positive integer/i);
        });

        it("should fail with invalid pageSize", async () => {
            const result = await runValidation(getEventReviewsValidator, {
                query: {
                    pageSize: "101"
                }
            });

            expect(result.array()[0].msg).toMatch(/page size must be between 1 and 100/i);
        });

        it("should fail with invalid order", async () => {
            const result = await runValidation(getEventReviewsValidator, {
                query: {
                    order: "newest"
                }
            });

            expect(result.array()[0].msg).toMatch(/order must be asc or desc/i);
        });
    });

    /* =============================
       REVIEW CREATION VALIDATION
    ============================= */

    describe("createReviewValidator", () => {
        it("should pass with a valid rating and comment", async () => {
            const result = await runValidation(createReviewValidator, {
                body: {
                    rating: 5,
                    comment: "Great event!"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        /* =============================
           RATING VALIDATION
        ============================= */

        it("should fail if rating is missing", async () => {
            const result = await runValidation(createReviewValidator, {
                body: {
                    comment: "Great event!"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Rating is required"
                    })
                ])
            );
        });

        it("should fail if rating is lower than 1", async () => {
            const result = await runValidation(createReviewValidator, {
                body: {
                    rating: 0,
                    comment: "Great event!"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Rating must be an integer between 1 and 5"
                    })
                ])
            );
        });

        it("should fail if rating is higher than 5", async () => {
            const result = await runValidation(createReviewValidator, {
                body: {
                    rating: 6,
                    comment: "Great event!"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Rating must be an integer between 1 and 5"
                    })
                ])
            );
        });

        it("should fail if rating is not an integer", async () => {
            const result = await runValidation(createReviewValidator, {
                body: {
                    rating: "bad",
                    comment: "Great event!"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Rating must be an integer between 1 and 5"
                    })
                ])
            );
        });

        /* =============================
           COMMENT VALIDATION
        ============================= */

        it("should fail if comment is missing", async () => {
            const result = await runValidation(createReviewValidator, {
                body: {
                    rating: 5
                }
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
                    rating: 5,
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
                    rating: 5,
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

    /* =============================
       REVIEW UPDATE VALIDATION
    ============================= */

    describe("updateReviewValidator", () => {
        it("should pass with a valid rating and comment", async () => {
            const result = await runValidation(updateReviewValidator, {
                body: {
                    rating: 4,
                    comment: "Updated review comment"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if rating is missing", async () => {
            const result = await runValidation(updateReviewValidator, {
                body: {
                    comment: "Updated review comment"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Rating is required"
                    })
                ])
            );
        });

        it("should fail if rating is outside allowed range", async () => {
            const result = await runValidation(updateReviewValidator, {
                body: {
                    rating: 6,
                    comment: "Updated review comment"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Rating must be an integer between 1 and 5"
                    })
                ])
            );
        });

        it("should fail if comment is missing", async () => {
            const result = await runValidation(updateReviewValidator, {
                body: {
                    rating: 4
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Comment is required"
                    })
                ])
            );
        });

        it("should fail if comment length is invalid", async () => {
            const result = await runValidation(updateReviewValidator, {
                body: {
                    rating: 4,
                    comment: "Bad"
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
