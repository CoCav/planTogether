import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import UserPasswordForm from "../../../components/users/UserPasswordForm";

/* ==================================================
   USER PASSWORD FORM TESTS
   Tests authenticated user password form rendering
   and interactions

   Handles:
   - password field rendering
   - password requirements rendering
   - password visibility toggles
   - validation error rendering
   - password field interactions
   - accessible field descriptions
   - autocomplete attributes
   - decorative submit icon
   - form submission
   - submit loading state
================================================== */

describe("UserPasswordForm", () => {

    /* =============================
       TEST DATA
    ============================= */

    const defaultValues = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    };

    const defaultFieldErrors = {};

    const defaultShowPasswords = {
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderUserPasswordForm = (props = {}) => {
        const defaultProps = {
            values: {
                ...defaultValues,
                ...(props.values || {})
            },

            fieldErrors: {
                ...defaultFieldErrors,
                ...(props.fieldErrors || {})
            },

            submitLabel: "Update Password",
            isSubmitting: false,

            showPasswords: {
                ...defaultShowPasswords,
                ...(props.showPasswords || {})
            },

            onFieldChange: vi.fn(),
            onSubmit: vi.fn(),
            onTogglePassword: vi.fn()
        };

        return render(
            <UserPasswordForm
                {...defaultProps}
                {...props}
            />
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("renders password fields", () => {
        renderUserPasswordForm();

        expect(screen.getByLabelText("Current password")).toBeInTheDocument();

        expect(screen.getByLabelText("New password")).toBeInTheDocument();

        expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
    });

    it("renders password requirements", () => {
        renderUserPasswordForm();

        expect(screen.getByText("Your password must contain at least:")).toBeInTheDocument();
    });

    it("renders custom submit label", () => {
        renderUserPasswordForm({
            submitLabel: "Save Password"
        });

        expect(screen.getByRole("button", {
            name: "Save Password"
        })).toBeInTheDocument();
    });

    it("renders decorative submit icon", () => {
        renderUserPasswordForm();

        const icon = document.querySelector(".form-actions svg[aria-hidden='true']");

        expect(icon).toBeInTheDocument();
    });

    /* =============================
       FIELD INTERACTIONS
    ============================= */

    it("calls onFieldChange when typing in current password field", async () => {
        const user = userEvent.setup();

        const onFieldChange = vi.fn();

        renderUserPasswordForm({
            onFieldChange
        });

        await user.type(screen.getByLabelText("Current password"), "Password123");

        expect(onFieldChange).toHaveBeenCalled();
    });

    it("calls onFieldChange when typing in new password field", async () => {
        const user = userEvent.setup();

        const onFieldChange = vi.fn();

        renderUserPasswordForm({
            onFieldChange
        });

        await user.type(screen.getByLabelText("New password"), "NewPassword123");

        expect(onFieldChange).toHaveBeenCalled();
    });

    it("calls onFieldChange when typing in confirm password field", async () => {
        const user = userEvent.setup();

        const onFieldChange = vi.fn();

        renderUserPasswordForm({
            onFieldChange
        });

        await user.type(screen.getByLabelText("Confirm new password"), "NewPassword123");

        expect(onFieldChange).toHaveBeenCalled();
    });

    /* =============================
       PASSWORD VISIBILITY
    ============================= */

    it("calls onTogglePassword when toggling password visibility", async () => {
        const user = userEvent.setup();

        const onTogglePassword = vi.fn();

        renderUserPasswordForm({
            onTogglePassword
        });

        await user.click(
            screen.getAllByRole("button", {
                name: "Show password"
            })[0]
        );

        expect(onTogglePassword).toHaveBeenCalledWith("currentPassword");
    });

    it("renders visible password inputs when visibility is enabled", () => {
        renderUserPasswordForm({
            showPasswords: {
                currentPassword: true,
                newPassword: true,
                confirmPassword: true
            }
        });

        const passwordInputs = screen.getAllByDisplayValue("");

        passwordInputs.forEach((input) => {
            expect(input).toHaveAttribute("type", "text");
        });
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("renders password requirements with accessible helper id", () => {
        renderUserPasswordForm();

        expect(screen
            .getByText("Your password must contain at least:")
            .parentElement
        ).toHaveAttribute(
            "id",
            "newPassword-requirements"
        );
    });

    it("renders password fields with autocomplete attributes", () => {
        renderUserPasswordForm();

        expect(screen.getByLabelText("Current password")).toHaveAttribute(
            "autocomplete",
            "current-password"
        );

        expect(screen.getByLabelText("New password")).toHaveAttribute(
            "autocomplete",
            "new-password"
        );

        expect(screen.getByLabelText("Confirm new password")).toHaveAttribute(
            "autocomplete",
            "new-password"
        );
    });

    /* =============================
       VALIDATION FEEDBACK
    ============================= */

    it("renders validation errors", () => {
        renderUserPasswordForm({
            fieldErrors: {
                currentPassword: "Current password is required",
                confirmPassword: "Passwords do not match"
            }
        });

        expect(screen.getByText("Current password is required")).toBeInTheDocument();

        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    it("renders multiple password validation errors", () => {
        renderUserPasswordForm({
            fieldErrors: {
                newPassword: [
                    "Password must contain a number",
                    "Password must contain an uppercase letter"
                ]
            }
        });

        expect(screen.getByText("Password must contain a number")).toBeInTheDocument();
        expect(screen.getByText("Password must contain an uppercase letter")).toBeInTheDocument();
    });

    /* =============================
       SUBMISSION
    ============================= */

    it("calls onSubmit when submitting the form", async () => {
        const user = userEvent.setup();

        const onSubmit = vi.fn((event) => {
            event.preventDefault();
        });

        renderUserPasswordForm({
            onSubmit
        });

        await user.click(screen.getByRole("button", {
            name: "Update Password"
        }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("disables submit button while submitting", () => {
        renderUserPasswordForm({
            isSubmitting: true
        });

        expect(screen.getByRole("button", {
            name: "Loading..."
        })).toBeDisabled();
    });
});
