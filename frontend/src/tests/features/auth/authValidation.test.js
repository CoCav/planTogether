import { describe, it, expect } from "vitest";
import { validateRegisterForm, validateLoginForm, validateProfileForm, validateChangePasswordForm } from "../../../features/auth/authValidation";

describe("authValidation", () => {
    it("should validate required register fields", () => {
        const errors = validateRegisterForm({
            name: "",
            email: "",
            password: ""
        });

        expect(errors.name).toBe("Name is required");
        expect(errors.email).toBe("Email is required");
        expect(errors.password).toBe("Password is required");
    });

    it("should validate register email format", () => {
        const errors = validateRegisterForm({
            name: "John",
            email: "invalid",
            password: "Password1"
        });

        expect(errors.email).toBe("Invalid email");
    });

    it("should validate register password rules", () => {
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

    it("should return no register errors for valid data", () => {
        const errors = validateRegisterForm({
            name: "John",
            email: "john@test.com",
            password: "Password1"
        });

        expect(errors).toEqual({});
    });

    it("should validate login fields", () => {
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
            password: "Password1"
        });

        expect(errors.email).toBe("Invalid email");
    });

    it("should return no login errors for valid data", () => {
        const errors = validateLoginForm({
            email: "john@test.com",
            password: "Password1"
        });

        expect(errors).toEqual({});
    });

    it("should validate required profile fields", () => {
        const errors = validateProfileForm({
            name: "",
            email: ""
        });

        expect(errors.name).toBe("Name is required");
        expect(errors.email).toBe("Email is required");
    });

    it("should validate minimum profile name length", () => {
        const errors = validateProfileForm({
            name: "J",
            email: "john@test.com"
        });

        expect(errors.name).toBe("Name must be at least 2 characters long");
    });

    it("should validate profile email format", () => {
        const errors = validateProfileForm({
            name: "John",
            email: "invalid"
        });

        expect(errors.email).toBe("Invalid email");
    });

    it("should return no profile errors for valid data", () => {
        const errors = validateProfileForm({
            name: "John",
            email: "john@test.com"
        });

        expect(errors).toEqual({});
    });

    it("should validate change password required fields", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "",
            newPassword: ""
        });

        expect(errors.currentPassword).toBe("Current password is required");
        expect(errors.newPassword).toBe("New password is required");
    });

    it("should validate new password rules", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "OldPassword1",
            newPassword: "abc"
        });

        expect(errors.newPassword).toEqual([
            "At least 6 characters",
            "At least 1 number",
            "At least 1 uppercase letter"
        ]);
    });

    it("should return no change password errors for valid data", () => {
        const errors = validateChangePasswordForm({
            currentPassword: "OldPassword1",
            newPassword: "NewPassword1"
        });

        expect(errors).toEqual({});
    });
});