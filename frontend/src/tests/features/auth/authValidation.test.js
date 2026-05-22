import { describe, expect, it } from "vitest";

import { validateLoginForm, validateRegisterForm } from "../../../features/auth/authValidation";

import { PASSWORD_MESSAGES } from "../../../features/shared/security/passwordPolicy";

import { createMockImageFile, createMockInvalidFile, createMockOversizedFile } from "../../helpers/mocks/mockFile";

/* ==================================================
   AUTH VALIDATION TESTS
   Tests frontend auth form validation helpers

   Handles:
   - register form validation
   - login form validation
   - password policy validation
   - avatar upload validation

   Notes:
   - uses reusable upload file mock helpers
================================================== */

describe("authValidation", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const validAvatar = createMockImageFile({
        name: "avatar.png"
    });

    const invalidAvatar = createMockInvalidFile({
        name: "avatar.txt"
    });

    const largeAvatar = createMockOversizedFile({
        name: "large.png",
        sizeInMb: 3
    });

    /* =============================
       REGISTER
    ============================= */

    it("should validate required register fields", () => {
        const errors = validateRegisterForm({
            name: "",
            email: "",
            password: "",
            avatar: null
        });

        expect(errors.name).toBe("Name is required");
        expect(errors.email).toBe("Email is required");
        expect(errors.password).toBe("Password is required");
    });

    it("should validate register email format", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "invalid",
            password: "Password123",
            avatar: null
        });

        expect(errors.email).toBe("Invalid email");
    });

    it("should validate register password rules", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "john@test.com",
            password: "abc",
            avatar: null
        });

        expect(errors.password).toEqual([
            PASSWORD_MESSAGES.minLength,
            PASSWORD_MESSAGES.number,
            PASSWORD_MESSAGES.uppercase
        ]);
    });

    it("should validate register avatar type", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "john@test.com",
            password: "Password123",
            avatar: invalidAvatar
        });

        expect(errors.avatar).toBe("Avatar must be an image file");
    });

    it("should validate register avatar size", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "john@test.com",
            password: "Password123",
            avatar: largeAvatar
        });

        expect(errors.avatar).toBe("Avatar must be less than 2MB");
    });

    it("should return no register errors for valid data", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "john@test.com",
            password: "Password123",
            avatar: validAvatar
        });

        expect(errors).toEqual({});
    });

    /* =============================
       LOGIN
    ============================= */

    it("should validate required login fields", () => {
        const errors = validateLoginForm({
            email: "",
            password: ""
        });

        expect(errors.email).toBe("Email is required");
        expect(errors.password).toBe("Password is required");
    });

    it("should validate login email format", () => {
        const errors = validateLoginForm({
            email: "invalid",
            password: "Password123"
        });

        expect(errors.email).toBe("Invalid email");
    });

    it("should return no login errors for valid data", () => {
        const errors = validateLoginForm({
            email: "john@test.com",
            password: "Password123"
        });

        expect(errors).toEqual({});
    });
});
