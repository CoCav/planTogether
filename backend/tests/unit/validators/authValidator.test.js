const {
    registerValidator,
    loginValidator
} = require("../../../src/validators/authValidator");

const {
    runValidation,
    getValidationMessages
} = require("../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Auth Validator Unit Tests

   Tests authentication request validation.

   Responsibilities
   - Test registration payload validation
   - Test login payload validation
   - Test email sanitization
   - Test password policy enforcement

   Notes
   - Password rules are shared through passwordPolicy.
   - Profile and password update validation belong to user validators.
=========================================================================== */

describe("auth validator", () => {

    /* =============================
       REGISTRATION SUCCESS
    ============================= */

    describe("registerValidator success", () => {
        it("accepts a valid registration payload", async () => {
            const { errors } = await runValidation(
                registerValidator,
                {
                    body: {
                        name: "Jane Doe",
                        email: "jane@example.com",
                        password: "Password123"
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });

        it("trims the name and normalizes the email", async () => {
            const { errors, req } = await runValidation(
                registerValidator,
                {
                    body: {
                        name: "  Jane Doe  ",
                        email: "  JANE@EXAMPLE.COM  ",
                        password: "Password123"
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.body.name).toBe("Jane Doe");
            expect(req.body.email).toBe("jane@example.com");
        });
    });

    /* =============================
       REGISTRATION VALIDATION
    ============================= */

    describe("registerValidator validation", () => {
        it.each([
            ["missing", undefined],
            ["empty", ""],
            ["whitespace-only", "   "]
        ])("rejects a %s name", async (_, name) => {
            const body = {
                email: "jane@example.com",
                password: "Password123"
            };

            if (name !== undefined) {
                body.name = name;
            }

            const { errors } = await runValidation(
                registerValidator,
                { body }
            );

            expect(getValidationMessages(errors)).toContain("Name is required");
        });

        it.each([
            ["missing", undefined],
            ["empty", ""],
            ["whitespace-only", "   "]
        ])("rejects a %s email", async (_, email) => {
            const body = {
                name: "Jane Doe",
                password: "Password123"
            };

            if (email !== undefined) {
                body.email = email;
            }

            const { errors } = await runValidation(
                registerValidator,
                { body }
            );

            expect(getValidationMessages(errors)).toContain("Email is required");
        });

        it("rejects an invalid email", async () => {
            const { errors } = await runValidation(
                registerValidator,
                {
                    body: {
                        name: "Jane Doe",
                        email: "not-an-email",
                        password: "Password123"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Invalid email");
        });

        it.each([
            [
                "too short",
                "Pass1",
                "Password must be at least 8 characters long"
            ],
            [
                "without a number",
                "Password",
                "Password must contain a number"
            ],
            [
                "without an uppercase letter",
                "password123",
                "Password must contain an uppercase letter"
            ],
            [
                "without a lowercase letter",
                "PASSWORD123",
                "Password must contain a lowercase letter"
            ]
        ])(
            "rejects a password %s",
            async (_, password, expectedMessage) => {
                const { errors } = await runValidation(
                    registerValidator,
                    {
                        body: {
                            name: "Jane Doe",
                            email: "jane@example.com",
                            password
                        }
                    }
                );

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );
    });

    /* =============================
       LOGIN SUCCESS
    ============================= */

    describe("loginValidator success", () => {
        it("accepts a valid login payload", async () => {
            const { errors } = await runValidation(
                loginValidator,
                {
                    body: {
                        email: "jane@example.com",
                        password: "Password123"
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });

        it("trims and normalizes the login email", async () => {
            const { errors, req } = await runValidation(
                loginValidator,
                {
                    body: {
                        email: "  JANE@EXAMPLE.COM  ",
                        password: "Password123"
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.body.email).toBe("jane@example.com");
        });
    });

    /* =============================
       LOGIN VALIDATION
    ============================= */

    describe("loginValidator validation", () => {
        it.each([
            ["missing", undefined],
            ["empty", ""],
            ["whitespace-only", "   "]
        ])("rejects a %s email", async (_, email) => {
            const body = {
                password: "Password123"
            };

            if (email !== undefined) {
                body.email = email;
            }

            const { errors } = await runValidation(
                loginValidator,
                { body }
            );

            expect(getValidationMessages(errors)).toContain("Email is required");
        });

        it("rejects an invalid email", async () => {
            const { errors } = await runValidation(
                loginValidator,
                {
                    body: {
                        email: "not-an-email",
                        password: "Password123"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Invalid email");
        });

        it.each([
            ["missing", undefined],
            ["empty", ""]
        ])("rejects a %s password", async (_, password) => {
            const body = {
                email: "jane@example.com"
            };

            if (password !== undefined) {
                body.password = password;
            }

            const { errors } = await runValidation(
                loginValidator,
                { body }
            );

            expect(getValidationMessages(errors)).toContain("Password is required");
        });
    });
});
