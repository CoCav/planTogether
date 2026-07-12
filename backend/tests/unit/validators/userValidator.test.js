const authenticatedUserValidator = require("../../../src/validators/users/authenticatedUserValidator");
const publicUserValidator = require("../../../src/validators/users/publicUserValidator");

const userValidator = require("../../../src/validators/userValidator");

/* ==========================================================================
   User Validator Unit Tests

   Tests user validator aggregation exports.

   Responsibilities
   - Test authenticated user validator exports
   - Test public user validator exports
   - Test the combined user validator contract

   Notes
   - Individual validation behavior is covered by dedicated user validator tests.
=========================================================================== */

describe("user validator", () => {
    describe("Validator exports", () => {
        it("exposes every authenticated user validator", () => {
            expect(userValidator).toEqual(
                expect.objectContaining(authenticatedUserValidator)
            );
        });

        it("exposes every public user validator", () => {
            expect(userValidator).toEqual(
                expect.objectContaining(publicUserValidator)
            );
        });

        it("contains only the combined user validator exports", () => {
            expect(Object.keys(userValidator).sort()).toEqual(
                [
                    ...Object.keys(authenticatedUserValidator),
                    ...Object.keys(publicUserValidator)
                ].sort()
            );
        });
    });
});
