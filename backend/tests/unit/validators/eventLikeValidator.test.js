const sharedValidators = require("../../../src/validators/shared/paramsValidators");
const eventLikeValidator = require("../../../src/validators/eventLikeValidator");

/* ==========================================================================
   Event Like Validator Unit Tests

   Tests event like validator exports.

   Responsibilities
   - Test shared event ID validator re-export

   Notes
   - Event ID validation behavior is covered by shared param validator tests.
=========================================================================== */

describe("event like validator", () => {
    describe("Validator exports", () => {
        it("re-exports the shared event ID validator", () => {
            expect(eventLikeValidator.eventIdParamValidator).toBe(sharedValidators.eventIdParamValidator);
        });
    });
});
