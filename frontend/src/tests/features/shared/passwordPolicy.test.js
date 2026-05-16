import { describe, expect, it } from "vitest";

import { PASSWORD_MESSAGES, PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENTS } from "../../../features/shared/passwordPolicy";

/* ==================================================
   PASSWORD POLICY TESTS
   Tests shared password policy constants

   Handles:
   - minimum password length
   - password regex rules
   - validation messages
================================================== */

describe("passwordPolicy", () => {

    /* =============================
       PASSWORD LENGTH
    ============================= */

    it("should expose the minimum password length", () => {
        expect(PASSWORD_MIN_LENGTH).toBe(8);
    });

    /* =============================
       PASSWORD REQUIREMENTS
    ============================= */

    it("should validate numeric password requirement", () => {
        expect(PASSWORD_REQUIREMENTS.hasNumber.test("Password1")).toBe(true);
        expect(PASSWORD_REQUIREMENTS.hasNumber.test("Password")).toBe(false);
    });

    it("should validate uppercase password requirement", () => {
        expect(PASSWORD_REQUIREMENTS.hasUppercase.test("Password")).toBe(true);
        expect(PASSWORD_REQUIREMENTS.hasUppercase.test("password")).toBe(false);
    });

    it("should validate lowercase password requirement", () => {
        expect(PASSWORD_REQUIREMENTS.hasLowercase.test("password")).toBe(true);
        expect(PASSWORD_REQUIREMENTS.hasLowercase.test("PASSWORD")).toBe(false);
    });

    /* =============================
       PASSWORD MESSAGES
    ============================= */

    it("should expose frontend password validation messages", () => {
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
