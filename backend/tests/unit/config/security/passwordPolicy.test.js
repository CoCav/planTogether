/* ==================================================
   PASSWORD POLICY TESTS

   Tests:
   - password minimum length
   - password requirement patterns
   - reusable password messages

   Ensures:
   - password policy remains centralized and consistent
   - validation messages stay aligned with requirements
================================================== */

const { PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENTS, PASSWORD_MESSAGES } = require("../../../../src/config/security/passwordPolicy");

describe("passwordPolicy config", () => {

    /* =============================
       PASSWORD LENGTH
    ============================= */

    it("should expose the correct password minimum length", () => {
        expect(PASSWORD_MIN_LENGTH).toBe(8);
    });

    /* =============================
       PASSWORD REQUIREMENTS
    ============================= */

    it("should expose valid password requirement patterns", () => {
        expect(PASSWORD_REQUIREMENTS.minLength).toBe(8);

        expect(PASSWORD_REQUIREMENTS.hasNumber.test("abc1")).toBe(true);
        expect(PASSWORD_REQUIREMENTS.hasUppercase.test("Abc")).toBe(true);
        expect(PASSWORD_REQUIREMENTS.hasLowercase.test("aBC")).toBe(true);
    });

    /* =============================
       PASSWORD MESSAGES
    ============================= */

    it("should expose reusable password validation messages", () => {
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
