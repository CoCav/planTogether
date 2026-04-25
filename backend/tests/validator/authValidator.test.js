const { validationResult } = require("express-validator");

const { registerValidator, loginValidator, updateProfileValidator, changePasswordValidator } = require("../../src/validators/authValidator");

/**
 * Auth Validator
 *
 * These tests verify express-validator rules for:
 * - user registration
 * - login
 * - profile update
 * - password change
 *
 * The goal is to ensure validation rules behave correctly
 * before reaching controllers and services.
*/

// Helper to simulate Express request validation
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

        it("should fail if password missing", async () => {
            const result = await runValidation(loginValidator, {
                email: "john@test.com"
            });

            expect(result.array()[0].msg).toMatch(/password is required/i);
        });
    });

    describe("updateProfileValidator", () => {
        it("should pass with valid optional fields", async () => {
            const result = await runValidation(updateProfileValidator, {
                name: "John",
                email: "john@test.com"
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if name too short", async () => {
            const result = await runValidation(updateProfileValidator, {
                name: "A"
            });

            expect(result.array()[0].msg).toMatch(/at least 2 characters/i);
        });
    });

    describe("changePasswordValidator", () => {
        it("should pass with valid data", async () => {
            const result = await runValidation(changePasswordValidator, {
                currentPassword: "oldPass1",
                newPassword: "NewPass1"
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if currentPassword missing", async () => {
            const result = await runValidation(changePasswordValidator, {
                newPassword: "NewPass1"
            });

            expect(result.array()[0].msg).toMatch(/current password is required/i);
        });

        it("should fail if newPassword is weak", async () => {
            const result = await runValidation(changePasswordValidator, {
                currentPassword: "oldPass1",
                newPassword: "abc"
            });

            expect(result.isEmpty()).toBe(false);
        });
    });
});