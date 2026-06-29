/* ==================================================
   EVENT LIKE VALIDATOR TESTS

   Tests:
   - eventId param validation for like actions

   Ensures:
   - eventId is a valid positive integer
   - invalid eventId params are rejected
================================================== */

const { eventIdParamValidator } = require("../../../src/validators/eventLikeValidator");

const { runValidation } = require("../../helpers/validation/validationHelper");

describe("eventLikeValidator", () => {

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

        it("should fail if eventId is lower than 1", async () => {
            const result = await runValidation(eventIdParamValidator, {
                params: {
                    eventId: "0"
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
});
