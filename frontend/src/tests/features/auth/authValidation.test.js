import { describe, expect, it } from "vitest";

import { validateLoginForm, validateRegisterForm } from "../../../features/auth/authValidation";
import { PASSWORD_MESSAGES } from "../../../features/shared/security/passwordPolicy";
import { createMockImageFile, createMockInvalidFile, createMockOversizedFile } from "../../helpers/mocks/mockFile";

/* ==================================================
   AUTH VALIDATION TESTS
   Tests frontend auth form validation helpers
================================================== */

describe("authValidation", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const validAvatar = createMockImageFile({ name: "avatar.png" });
    const invalidAvatar = createMockInvalidFile({ name: "avatar.txt" });
    const largeAvatar = createMockOversizedFile({ name: "large.png", sizeInMb: 3 });

    /* =============================
       REGISTER FORM
    ============================= */

    it("validates required register fields", () => {
        const errors = validateRegisterForm({ name: "", email: "", password: "", avatar: null, confirmPassword: "" });

        expect(errors.name).toBe("Name is required");
        expect(errors.email).toBe("Email is required");
        expect(errors.password).toBe("Password is required");
        expect(errors.confirmPassword).toBe("Please confirm your password");
    });

    it("validates register email format", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "invalid",
            password: "Password123",
            avatar: null,
            confirmPassword: "Password123"
        });

        expect(errors.email).toBe("Invalid email");
    });

    it("validates register password rules", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "john@test.com",
            password: "abc",
            avatar: null,
            confirmPassword: "abc"
        });

        expect(errors.password).toBe(
            `Password must ${PASSWORD_MESSAGES.minLength}, ${PASSWORD_MESSAGES.number}, ${PASSWORD_MESSAGES.uppercase}.`
        );
    });

    it("validates confirmPassword mismatch", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "john@test.com",
            password: "Password123",
            confirmPassword: "Password124",
            avatar: null
        });

        expect(errors.confirmPassword).toBe("Passwords do not match");
    });

    it("validates register avatar type", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "john@test.com",
            password: "Password123",
            avatar: invalidAvatar,
            confirmPassword: "Password123"
        });

        expect(errors.avatar).toBe("Avatar must be an image file");
    });

    it("validates register avatar size", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "john@test.com",
            password: "Password123",
            avatar: largeAvatar,
            confirmPassword: "Password123"
        });

        expect(errors.avatar).toBe("Avatar must be less than 2MB");
    });

    it("passes register validation for valid data", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "john@test.com",
            password: "Password123",
            confirmPassword: "Password123",
            avatar: validAvatar
        });

        expect(errors).toEqual({});
    });

    it("accepts undefined or null avatar", () => {
        const errors = validateRegisterForm({
            name: "John Doe",
            email: "john@test.com",
            password: "Password123",
            confirmPassword: "Password123",
            avatar: null
        });

        expect(errors.avatar).toBeUndefined();
    });

    /* =============================
       LOGIN FORM
    ============================= */

    it("validates required login fields", () => {
        const errors = validateLoginForm({ email: "", password: "" });

        expect(errors.email).toBe("Email is required");
        expect(errors.password).toBe("Password is required");
    });

    it("validates login email format", () => {
        const errors = validateLoginForm({ email: "invalid", password: "Password123" });

        expect(errors.email).toBe("Invalid email");
    });

    it("passes login validation for valid data", () => {
        const errors = validateLoginForm({ email: "john@test.com", password: "Password123" });

        expect(errors).toEqual({});
    });

    it("trims email whitespace for login validation", () => {
        const errors = validateLoginForm({ email: "  john@test.com  ", password: "Password123" });
        expect(errors).toEqual({});
    });
});
