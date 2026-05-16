import { describe, expect, it } from "vitest";

import { validateChangePasswordForm, validateProfileForm } from "../../../features/users/userValidation";

import { PASSWORD_MESSAGES } from "../../../features/shared/passwordPolicy";

/* ==================================================
   USER VALIDATION TESTS
   Tests frontend current user form validation helpers

   Handles:
   - profile form validation
   - avatar validation
   - password change validation
   - shared password policy messages
================================================== */

describe("userValidation", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const validAvatar = new File(
        ["avatar"],
        "avatar.png",
        { type: "image/png" }
    );

    const invalidAvatar = new File(
        ["avatar"],
        "avatar.txt",
        { type: "text/plain" }
    );

    const largeAvatar = new File(
        [new Uint8Array(2 * 1024 * 1024 + 1)],
        "large.png",
        { type: "image/png" }
    );

    /* =============================
       PROFILE
    ============================= */

    it("should validate required profile fields when provided empty", () => {
        const errors = validateProfileForm({
            name: "",
            email: "",
            avatar: null
        });

        expect(errors.name).toBe("Name is required");
        expect(errors.email).toBe("Email is required");
    });

    it("should validate minimum profile name length", () => {
        const errors = validateProfileForm({
            name: "J",
            email: "john@test.com",
            avatar: null
        });

        expect(errors.name).toBe("Name must be at least 2 characters long");
    });

    it("should validate profile email format", () => {
        const errors = validateProfileForm({
            name: "John Doe",
            email: "invalid",
            avatar: null
        });

        expect(errors.email).toBe("Invalid email");
    });

    it("should allow partial profile update when fields are omitted", () => {
        const errors = validateProfileForm({
            avatar: null
        });

        expect(errors).toEqual({});
    });

    it("should validate profile avatar type", () => {
        const errors = validateProfileForm({
            name: "John Doe",
            email: "john@test.com",
            avatar: invalidAvatar
        });

        expect(errors.avatar).toBe("Avatar must be an image file");
    });

    it("should validate profile avatar size", () => {
        const errors = validateProfileForm({
            name: "John Doe",
            email: "john@test.com",
            avatar: largeAvatar
        });

        expect(errors.avatar).toBe("Avatar must be less than 2MB");
    });

    it("should return no profile errors for valid data", () => {
        const errors = validateProfileForm({
            name: "John Doe",
            email: "john@test.com",
            avatar: validAvatar
        });

        expect(errors).toEqual({});
    });

    /* =============================
       PASSWORD
    ============================= */

    it("should validate password required fields", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });

        expect(errors.currentPassword).toBe("Current password is required");
        expect(errors.newPassword).toBe("New password is required");
        expect(errors.confirmPassword).toBe("Confirm password is required");
    });

    it("should validate new password rules", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "OldPassword123",
            newPassword: "abc",
            confirmPassword: "abc"
        });

        expect(errors.newPassword).toEqual([
            PASSWORD_MESSAGES.newPasswordMinLength,
            PASSWORD_MESSAGES.newPasswordNumber,
            PASSWORD_MESSAGES.newPasswordUppercase
        ]);
    });

    it("should validate that new password is different from current password", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "Password123",
            newPassword: "Password123",
            confirmPassword: "Password123"
        });

        expect(errors.newPassword).toContain(
            "New password must be different from current password"
        );
    });

    it("should validate password confirmation mismatch", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "OldPassword123",
            newPassword: "NewPassword123",
            confirmPassword: "DifferentPassword123"
        });

        expect(errors.confirmPassword).toBe(
            "Passwords do not match. Please check again."
        );
    });

    it("should return no password errors for valid data", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "OldPassword123",
            newPassword: "NewPassword123",
            confirmPassword: "NewPassword123"
        });

        expect(errors).toEqual({});
    });
});
