const { validationResult } = require("express-validator");

const { userIdParamValidator } = require("../../src/validators/userValidator");

/**
 * User Validator
 *
 * These tests verify express-validator rules for:
 * - user ID param validation
 *
 * The goal is to ensure route params are valid
 * before reaching controllers and services.
 */

// Helper to simulate Express request validation
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
