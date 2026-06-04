import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import LoginForm from "../../../components/auth/LoginForm";

/* ==================================================
   LOGIN FORM TESTS
   Tests authentication login form rendering

   Handles:
   - email field rendering
   - password field rendering
   - remember me state
   - password visibility toggle
   - form submission
   - register navigation link
   - registration redirect state forwarding
   - validation error display
   - accessible form field descriptions
================================================== */

describe("LoginForm", () => {

    /* =============================
       TEST DATA
    ============================= */

    const defaultProps = {
        values: {
            email: "",
            password: ""
        },

        fieldErrors: {},

        submitLabel: "Login",
        isSubmitting: false,

        showPassword: false,
        rememberMe: false,

        onFieldChange: vi.fn(),
        onRememberMeChange: vi.fn(),
        onTogglePassword: vi.fn(),

        onSubmit: vi.fn((event) => event.preventDefault())
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderComponent = (props = {}) => {
        return render(
            <MemoryRouter>
                <LoginForm
                    {...defaultProps}
                    {...props}
                    values={{
                        ...defaultProps.values,
                        ...(props.values || {})
                    }}
                    fieldErrors={{
                        ...defaultProps.fieldErrors,
                        ...(props.fieldErrors || {})
                    }}
                />
            </MemoryRouter>
        );
    };

    /* =============================
       FORM FIELDS
    ============================= */

    it("renders login form fields", () => {
        renderComponent();

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });

    it("renders email autocomplete attributes", () => {
        renderComponent();

        expect(screen.getByLabelText(/email/i)).toHaveAttribute("autocomplete", "email");
    });

    it("renders password autocomplete attributes", () => {
        renderComponent();

        expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("autocomplete", "current-password");
    });

    it("calls onFieldChange when editing email", () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: {
                name: "email",
                value: "john@example.com"
            }
        });

        expect(defaultProps.onFieldChange).toHaveBeenCalledTimes(1);
    });

    it("calls onFieldChange when editing password", () => {
        const onFieldChange = vi.fn();

        renderComponent({
            onFieldChange
        });

        fireEvent.change(screen.getByLabelText(/^password$/i), {
            target: {
                name: "password",
                value: "Password123"
            }
        });

        expect(onFieldChange).toHaveBeenCalledTimes(1);
    });

    /* =============================
       PASSWORD VISIBILITY
    ============================= */

    it("renders hidden password input by default", () => {
        renderComponent();

        expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("type", "password");
    });

    it("renders visible password input when enabled", () => {
        renderComponent({
            showPassword: true
        });

        expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("type", "text");
    });

    it("calls onTogglePassword when clicking password toggle", () => {
        renderComponent();

        fireEvent.click(screen.getByRole("button", { name: /show password/i }));

        expect(defaultProps.onTogglePassword).toHaveBeenCalledTimes(1);
    });

    /* =============================
       REMEMBER ME
    ============================= */

    it("renders remember me checkbox state", () => {
        renderComponent({
            rememberMe: true
        });

        expect(screen.getByLabelText(/remember me/i)).toBeChecked();
    });

    it("calls onRememberMeChange when toggling remember me", () => {
        renderComponent();

        fireEvent.click(screen.getByLabelText(/remember me/i));

        expect(defaultProps.onRememberMeChange).toHaveBeenCalledTimes(1);
    });

    /* =============================
       FORM ACTIONS
    ============================= */

    it("renders custom submit label", () => {
        renderComponent({
            submitLabel: "Sign In"
        });

        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("calls onSubmit when submitting the form", () => {
        renderComponent();

        fireEvent.submit(screen.getByRole("button", { name: /login/i }).closest("form"));

        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    });

    it("disables submit button while submitting", () => {
        renderComponent({
            isSubmitting: true
        });

        expect(screen.getByRole("button", { busy: true })).toBeDisabled();
    });

    /* =============================
       REGISTER NAVIGATION
    ============================= */

    it("renders register navigation link", () => {
        renderComponent();

        expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute("href", "/register");
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("renders validation errors", () => {
        renderComponent({
            fieldErrors: {
                email: "Email is required",
                password: "Password is required"
            }
        });

        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("associates email field with validation description", () => {
        renderComponent({
            fieldErrors: {
                email: "Email is required"
            }
        });

        expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-describedby", "email-error");
    });
});
