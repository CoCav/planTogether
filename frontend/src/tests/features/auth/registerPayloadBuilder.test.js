import { describe, expect, it } from "vitest";

import { buildRegisterFormData } from "../../../features/auth/registerPayloadBuilder";

/* ==================================================
   REGISTER FORM DATA BUILDER TESTS
   Tests register multipart FormData creation

   Handles:
   - register form data creation
   - optional avatar payload
   - form data value mapping
================================================== */

describe("buildRegisterFormData", () => {

    /* =============================
       FORM DATA CREATION
    ============================= */

    it("builds register form data payload", () => {
        const formData = buildRegisterFormData({
            name: "John",
            email: "john@example.com",
            password: "Password1"
        });

        expect(formData).toBeInstanceOf(FormData);

        expect(formData.get("name")).toBe("John");
        expect(formData.get("email")).toBe("john@example.com");
        expect(formData.get("password")).toBe("Password1");
    });

    it("includes avatar file when avatar is provided", () => {
        const avatar = new File(
            ["avatar"],
            "avatar.png",
            {
                type: "image/png"
            }
        );

        const formData = buildRegisterFormData({
            name: "John",
            email: "john@example.com",
            password: "Password1",
            avatar
        });

        expect(formData.get("avatar")).toBe(avatar);
    });

    it("does not include avatar when avatar is missing", () => {
        const formData = buildRegisterFormData({
            name: "John",
            email: "john@example.com",
            password: "Password1"
        });

        expect(formData.get("avatar")).toBeNull();
    });

    it("does not include avatar when avatar is null", () => {
        const formData = buildRegisterFormData({
            name: "John",
            email: "john@example.com",
            password: "Password1",
            avatar: null
        });

        expect(formData.get("avatar")).toBeNull();
    });
});
