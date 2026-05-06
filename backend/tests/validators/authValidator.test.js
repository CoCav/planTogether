/* ==================================================
   AUTH VALIDATOR TESTS

   Tests:
   - registration validation
   - login validation

   Ensures:
   - invalid auth payloads are rejected early
   - registration password security rules are enforced
   - login credentials are validated before controller logic
================================================== */

const { validationResult } = require("express-validator");

const { registerValidator, loginValidator } = require("../../src/validators/authValidator");

// Run express-validator rules against a mocked request body
const runValidation = async (validators, body) => {
    const req = { body };

    for (let validator of validators) {
        await validator.run(req);
    }

    return validationResult(req);
};

describe("authValidator", () => {
    describe("registerValidator", () => {
        it("should pass with valid data", async () => {
            const result = await runValidation(registerValidator, {
                name: "John",
                email: "john@test.com",
                password: "Password1"
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if name is missing", async () => {
            const result = await runValidation(registerValidator, {
                email: "john@test.com",
                password: "Password1"
            });

            expect(result.array()[0].msg).toMatch(/name is required/i);
        });

        it("should fail with invalid email", async () => {
            const result = await runValidation(registerValidator, {
                name: "John",
                email: "bad-email",
                password: "Password1"
            });

            expect(result.array()[0].msg).toMatch(/invalid email/i);
        });

        it("should fail with weak password", async () => {
            const result = await runValidation(registerValidator, {
                name: "John",
                email: "john@test.com",
                password: "abc"
            });

            expect(result.isEmpty()).toBe(false);
        });
    });

    describe("loginValidator", () => {
        it("should pass with valid data", async () => {
            const result = await runValidation(loginValidator, {
                email: "john@test.com",
                password: "123456"
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if password is missing", async () => {
            const result = await runValidation(loginValidator, {
                email: "john@test.com"
            });

            expect(result.array()[0].msg).toMatch(/password is required/i);
        });
    });
});
