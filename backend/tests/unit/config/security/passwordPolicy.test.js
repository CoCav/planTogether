const {
    PASSWORD_MIN_LENGTH,
    PASSWORD_REQUIREMENTS,
    PASSWORD_MESSAGES
} = require("../../../../src/config/security/passwordPolicy");

/* ==========================================================================
   Password Policy Unit Tests

   Tests shared password policy configuration.

   Responsibilities
   - Test password minimum length
   - Test password requirement patterns
   - Test reusable password validation messages

   Notes
   - Password policy must stay aligned with frontend validation.
=========================================================================== */

describe("passwordPolicy config", () => {

    /* =============================
       PASSWORD LENGTH
    ============================= */

    describe("Password length", () => {
        it("exposes the configured minimum length", () => {
            expect(PASSWORD_MIN_LENGTH).toBe(8);
            expect(PASSWORD_REQUIREMENTS.minLength).toBe(PASSWORD_MIN_LENGTH);
        });
    });

    /* =============================
       PASSWORD REQUIREMENTS
    ============================= */

    describe("Password requirements", () => {
        it("detects numeric characters", () => {
            expect(PASSWORD_REQUIREMENTS.hasNumber.test("abc1")).toBe(true);
            expect(PASSWORD_REQUIREMENTS.hasNumber.test("abc")).toBe(false);
        });

        it("detects uppercase characters", () => {
            expect(PASSWORD_REQUIREMENTS.hasUppercase.test("Abc")).toBe(true);
            expect(PASSWORD_REQUIREMENTS.hasUppercase.test("abc")).toBe(false);
        });

        it("detects lowercase characters", () => {
            expect(PASSWORD_REQUIREMENTS.hasLowercase.test("aBC")).toBe(true);
            expect(PASSWORD_REQUIREMENTS.hasLowercase.test("ABC")).toBe(false);
        });
    });

    /* =============================
       PASSWORD MESSAGES
    ============================= */

    describe("Password messages", () => {
        it("exposes reusable validation messages", () => {
            expect(PASSWORD_MESSAGES).toEqual({
                minLength:
                    "Password must be at least 8 characters long",

                number:
                    "Password must contain a number",

                uppercase:
                    "Password must contain an uppercase letter",

                lowercase:
                    "Password must contain a lowercase letter",

                newPasswordMinLength:
                    "New password must be at least 8 characters long",

                newPasswordNumber:
                    "New password must contain a number",

                newPasswordUppercase:
                    "New password must contain an uppercase letter",

                newPasswordLowercase:
                    "New password must contain a lowercase letter"
            });
        });
    });
});
