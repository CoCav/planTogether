/* ==================================================
   USER VALIDATOR TESTS

   Tests:
   - valid user ID param
   - non-integer user ID rejection
   - negative user ID rejection
   - float user ID rejection
   - zero user ID rejection

   Ensures:
   - public user routes only receive valid positive integer IDs
   - invalid route params are rejected before controller logic
================================================== */

const { validationResult } = require("express-validator");

const { userIdParamValidator } = require("../../src/validators/userValidator");

// Run express-validator rules against mocked request params
const runValidation = async (validators, params) => {
    const req = { params };

    for (let validator of validators) {
        await validator.run(req);
    }

    return validationResult(req);
};

describe("userValidator", () => {
    describe("userIdParamValidator", () => {
        it("should pass with valid user ID", async () => {
            const result = await runValidation(userIdParamValidator, {
                id: "5"
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail with non-integer ID", async () => {
            const result = await runValidation(userIdParamValidator, {
                id: "abc"
            });

            expect(result.array()[0].msg).toMatch(/user id must be a positive integer/i);
        });

        it("should fail with negative ID", async () => {
            const result = await runValidation(userIdParamValidator, {
                id: "-3"
            });

            expect(result.array()[0].msg).toMatch(/user id must be a positive integer/i);
        });

        it("should fail with float ID", async () => {
            const result = await runValidation(userIdParamValidator, {
                id: "1.5"
            });

            expect(result.array()[0].msg).toMatch(/user id must be a positive integer/i);
        });

        it("should fail with zero as ID", async () => {
            const result = await runValidation(userIdParamValidator, {
                id: "0"
            });

            expect(result.array()[0].msg).toMatch(/user id must be a positive integer/i);
        });
    });
});
