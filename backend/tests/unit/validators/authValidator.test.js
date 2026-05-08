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

const { registerValidator, loginValidator } = require("../../../src/validators/authValidator");

const { runValidation } = require("../../helpers/validation/validationHelper");

describe("authValidator", () => {

    /* =============================
       REGISTER VALIDATION
    ============================= */

    describe("registerValidator", () => {
        it("should pass with valid registration data", async () => {
            const result = await runValidation(registerValidator, {
                body: {
                    name: "John",
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if name is missing", async () => {
            const result = await runValidation(registerValidator, {
                body: {
                    email: "john@test.com",
                    password: "Password1"
                }
            });

            expect(result.array()[0].msg).toMatch(/name is required/i);
        });

        it("should fail with invalid email", async () => {
            const result = await runValidation(registerValidator, {
                body: {
                    name: "John",
                    email: "bad-email",
                    password: "Password1"
                }
            });

            expect(result.array()[0].msg).toMatch(/invalid email/i);
        });

        it("should fail with weak password", async () => {
            const result = await runValidation(registerValidator, {
                body: {
                    name: "John",
                    email: "john@test.com",
                    password: "abc"
                }
            });

            expect(result.isEmpty()).toBe(false);
        });
    });

    /* =============================
       LOGIN VALIDATION
    ============================= */

    describe("loginValidator", () => {
        it("should pass with valid login data", async () => {
            const result = await runValidation(loginValidator, {
                body: {
                    email: "john@test.com",
                    password: "123456"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if password is missing", async () => {
            const result = await runValidation(loginValidator, {
                body: {
                    email: "john@test.com"
                }
            });

            expect(result.array()[0].msg).toMatch(/password is required/i);
        });
    });
});
