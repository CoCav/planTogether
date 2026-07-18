const {
    createPositiveIntegerParamValidator,
    eventIdParamValidator,
    userIdParamValidator,
    publicUserIdParamValidator,
    reviewIdParamValidator
} = require("../../../../src/validators/shared/paramsValidators");

const {
    runValidation,
    getValidationMessages
} = require("../../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Shared Param Validators Unit Tests

   Tests reusable positive integer parameter validators.

   Responsibilities
   - Test the positive integer validator factory
   - Test event ID validation
   - Test user ID validation
   - Test public user ID validation
   - Test review ID validation
   - Test numeric parameter conversion

   Notes
   - Entity existence is handled by services.
   - These validators only validate parameter shape.
=========================================================================== */

describe("shared param validators", () => {

    /* =============================
       VALIDATOR FACTORY
    ============================= */

    describe("createPositiveIntegerParamValidator", () => {
        it("builds a validator for the requested parameter", async () => {
            const validators = createPositiveIntegerParamValidator("resourceId", "Resource ID must be a positive integer");

            const { errors, req } = await runValidation(validators, {
                params: {
                    resourceId: "12"
                }
            });

            expect(errors).toHaveLength(0);
            expect(req.params.resourceId).toBe(12);
        });

        it("uses the provided validation message", async () => {
            const validators = createPositiveIntegerParamValidator("resourceId", "Resource ID must be a positive integer");

            const { errors } = await runValidation(validators, {
                params: {
                    resourceId: "invalid"
                }
            });

            expect(getValidationMessages(errors)).toContain("Resource ID must be a positive integer");
        });
    });

    /* =============================
       EVENT ID
    ============================= */

    describe("eventIdParamValidator", () => {
        it("accepts and converts a positive event ID", async () => {
            const { errors, req } = await runValidation(eventIdParamValidator, {
                params: {
                    eventId: "5"
                }
            });

            expect(errors).toHaveLength(0);
            expect(req.params.eventId).toBe(5);
        });

        it.each([
            ["zero", "0"],
            ["negative", "-1"],
            ["non-numeric", "abc"],
            ["missing", undefined]
        ])(
            "rejects a %s event ID", async (_, eventId) => {
                const params = {};

                if (eventId !== undefined) {
                    params.eventId = eventId;
                }

                const { errors } = await runValidation(eventIdParamValidator, { params });

                expect(getValidationMessages(errors)).toContain("Event ID must be a positive integer");
            });
    });

    /* =============================
       USER ID
    ============================= */

    describe("userIdParamValidator", () => {
        it("accepts and converts a positive user ID", async () => {
            const { errors, req } = await runValidation(userIdParamValidator, {
                params: {
                    userId: "7"
                }
            });

            expect(errors).toHaveLength(0);
            expect(req.params.userId).toBe(7);
        });

        it("rejects an invalid user ID", async () => {
            const { errors } = await runValidation(userIdParamValidator, {
                params: {
                    userId: "abc"
                }
            });

            expect(getValidationMessages(errors)).toContain("User ID must be a positive integer");
        });
    });

    /* =============================
       PUBLIC USER ID
    ============================= */

    describe("publicUserIdParamValidator", () => {
        it("validates the id route parameter", async () => {
            const { errors, req } = await runValidation(publicUserIdParamValidator, {
                params: {
                    id: "9"
                }
            });

            expect(errors).toHaveLength(0);
            expect(req.params.id).toBe(9);
        });

        it("rejects an invalid public user ID", async () => {
            const { errors } = await runValidation(publicUserIdParamValidator, {
                params: {
                    id: "invalid"
                }
            });

            expect(getValidationMessages(errors)).toContain("User ID must be a positive integer");
        });
    });

    /* =============================
       REVIEW ID
    ============================= */

    describe("reviewIdParamValidator", () => {
        it("accepts and converts a positive review ID", async () => {
            const { errors, req } = await runValidation(reviewIdParamValidator, {
                params: {
                    reviewId: "11"
                }
            });

            expect(errors).toHaveLength(0);
            expect(req.params.reviewId).toBe(11);
        });

        it("rejects an invalid review ID", async () => {
            const { errors } = await runValidation(reviewIdParamValidator, {
                params: {
                    reviewId: "abc"
                }
            });

            expect(getValidationMessages(errors)).toContain("Review ID must be a positive integer");
        });
    });
});
