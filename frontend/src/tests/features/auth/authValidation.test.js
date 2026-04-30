import { describe, expect, it } from "vitest";
import { validateChangePasswordForm, validateLoginForm, validateProfileForm, validateRegisterForm } from "../../../features/auth/authValidation";

/* ==================================================
   AUTH VALIDATION TESTS
   Tests frontend validation helpers for auth forms
================================================== */

describe("authValidation", () => {
    it("validates required register fields", () => {
        const errors = validateRegisterForm({
            name: "",
            email: "",
            password: ""
        });

        expect(errors.name).toBe("Name is required");
        expect(errors.email).toBe("Email is required");
        expect(errors.password).toBe("Password is required");
    });

    it("validates register email format", () => {
        const errors = validateRegisterForm({
            name: "John",
            email: "invalid",
            password: "Password1"
        });

        expect(errors.email).toBe("Invalid email");
    });

    it("validates register password rules", () => {
        const errors = validateRegisterForm({
            name: "John",
            email: "john@test.com",
            password: "abc"
        });

        expect(errors.password).toEqual([
            "At least 6 characters",
            "At least 1 number",
            "At least 1 uppercase letter"
        ]);
    });

    it("returns no register errors for valid data", () => {
        const errors = validateRegisterForm({
            name: "John",
            email: "john@test.com",
            password: "Password1"
        });

        expect(errors).toEqual({});
    });

    it("validates required login fields", () => {
        const errors = validateLoginForm({
            email: "",
            password: ""
        });

        expect(errors.email).toBe("Email is required");
        expect(errors.password).toBe("Password is required");
    });

    it("validates login email format", () => {
        const errors = validateLoginForm({
            email: "invalid",
            password: "Password1"
        });

        expect(errors.email).toBe("Invalid email");
    });

    it("returns no login errors for valid data", () => {
        const errors = validateLoginForm({
            email: "john@test.com",
            password: "Password1"
        });

        expect(errors).toEqual({});
    });

    it("validates required profile fields", () => {
        const errors = validateProfileForm({
            name: "",
            email: ""
        });

        expect(errors.name).toBe("Name is required");
        expect(errors.email).toBe("Email is required");
    });

    it("validates minimum profile name length", () => {
        const errors = validateProfileForm({
            name: "J",
            email: "john@test.com"
        });

        expect(errors.name).toBe("Name must be at least 2 characters long");
    });

    it("validates profile email format", () => {
        const errors = validateProfileForm({
            name: "John",
            email: "invalid"
        });

        expect(errors.email).toBe("Invalid email");
    });

    it("returns no profile errors for valid data", () => {
        const errors = validateProfileForm({
            name: "John",
            email: "john@test.com"
        });

        expect(errors).toEqual({});
    });

    it("validates change password required fields", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });

        expect(errors.currentPassword).toBe("Current password is required");
        expect(errors.newPassword).toBe("New password is required");
        expect(errors.confirmPassword).toBe("Confirm password is required");
    });

    it("validates new password rules", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "OldPassword1",
            newPassword: "abc",
            confirmPassword: "abc"
        });

        expect(errors.newPassword).toEqual([
            "At least 6 characters",
            "At least 1 number",
            "At least 1 uppercase letter"
        ]);
    });

    it("validates that new password is different from current password", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "Password1",
            newPassword: "Password1",
            confirmPassword: "Password1"
        });

        expect(errors.newPassword).toContain("New password must be different from current password");
    });

    it("validates password confirmation mismatch", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "OldPassword1",
            newPassword: "NewPassword1",
            confirmPassword: "DifferentPassword1"
        });

        expect(errors.confirmPassword).toBe("Passwords do not match. Please check again.");
    });

    it("returns no change password errors for valid data", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "OldPassword1",
            newPassword: "NewPassword1",
            confirmPassword: "NewPassword1"
        });

        expect(errors).toEqual({});
    });
});
