import { describe, expect, it } from "vitest";

import {
    PASSWORD_MESSAGES,
    PASSWORD_MIN_LENGTH,
    PASSWORD_REQUIREMENTS,
    PASSWORD_REQUIREMENT_LABELS
} from "../../../features/shared/passwordPolicy";

/* ==================================================
   PASSWORD POLICY TESTS
   Tests shared password policy constants

   Handles:
   - minimum password length
   - password regex rules
   - validation messages
   - password requirement labels
================================================== */

describe("passwordPolicy", () => {

    /* =============================
       PASSWORD LENGTH
    ============================= */

    it("exposes the minimum password length", () => {
        expect(PASSWORD_MIN_LENGTH).toBe(8);
    });


    /* =============================
       PASSWORD REQUIREMENTS
    ============================= */

    it("exposes password minimum length requirement", () => {
        expect(PASSWORD_REQUIREMENTS.minLength).toBe(8);
    });

    it("validates numeric password requirement", () => {
        expect(PASSWORD_REQUIREMENTS.hasNumber.test("Password1")).toBe(true);

        expect(PASSWORD_REQUIREMENTS.hasNumber.test("Password")).toBe(false);
    });

    it("validates uppercase password requirement", () => {
        expect(PASSWORD_REQUIREMENTS.hasUppercase.test("Password")).toBe(true);

        expect(PASSWORD_REQUIREMENTS.hasUppercase.test("password")).toBe(false);
    });

    it("validates lowercase password requirement", () => {
        expect(PASSWORD_REQUIREMENTS.hasLowercase.test("password")).toBe(true);

        expect(PASSWORD_REQUIREMENTS.hasLowercase.test("PASSWORD")).toBe(false);
    });


    /* =============================
       PASSWORD MESSAGES
    ============================= */

    it("exposes shared password validation messages", () => {
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


    /* =============================
       PASSWORD REQUIREMENT LABELS
    ============================= */

    it("exposes password requirement display labels", () => {
        expect(PASSWORD_REQUIREMENT_LABELS).toEqual({
            minLength: "8 characters",
            uppercase: "1 uppercase",
            lowercase: "1 lowercase",
            number: "1 number"
        });
    });
});
