import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PasswordField from "../../../components/users/PasswordField";

/* ==================================================
   PASSWORD FIELD TESTS
   Tests password input rendering and visibility toggle

   Handles:
   - password input rendering
   - password visibility state
   - accessible toggle state
   - single error display
   - multiple error display
   - helper content rendering
================================================== */

describe("PasswordField", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderPasswordField = (props = {}) => {
        const defaultProps = {
            id: "password",
            label: "Password",
            name: "password",
            value: "",
            placeholder: "Create a password",
            error: undefined,
            visible: false,
            autoComplete: "new-password",
            onChange: vi.fn(),
            onToggle: vi.fn()
        };

        return render(
            <PasswordField {...defaultProps} {...props}>
                {props.children}
            </PasswordField>
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("renders password input with label", () => {
        renderPasswordField();

        expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
        expect(screen.getByLabelText("Password")).toHaveAttribute("placeholder", "Create a password");
        expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password");
    });

    it("renders text input when password is visible", () => {
        renderPasswordField({
            visible: true
        });

        expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    });

    it("renders helper content", () => {
        renderPasswordField({
            children: <p>Password help</p>
        });

        expect(screen.getByText("Password help")).toBeInTheDocument();
    });

    /* =============================
       INPUT INTERACTIONS
    ============================= */

    it("calls onChange when typing in the password input", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        renderPasswordField({
            onChange
        });

        await user.type(screen.getByLabelText("Password"), "abc");

        expect(onChange).toHaveBeenCalled();
    });

    /* =============================
       TOGGLE
    ============================= */

    it("renders accessible show toggle when password is hidden", () => {
        renderPasswordField();

        const toggle = screen.getByRole("button", {
            name: "Show password"
        });

        expect(toggle).toHaveTextContent("Show");
        expect(toggle).toHaveAttribute("aria-pressed", "false");
    });

    it("renders accessible hide toggle when password is visible", () => {
        renderPasswordField({
            visible: true
        });

        const toggle = screen.getByRole("button", {
            name: "Hide password"
        });

        expect(toggle).toHaveTextContent("Hide");
        expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    it("calls onToggle when clicking the toggle button", async () => {
        const user = userEvent.setup();
        const onToggle = vi.fn();

        renderPasswordField({
            onToggle
        });

        await user.click(screen.getByRole("button", {
            name: "Show password"
        }));

        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    /* =============================
       ERRORS
    ============================= */

    it("renders a single field error", () => {
        renderPasswordField({
            error: "Password is required"
        });

        expect(screen.getByText("Password is required")).toBeInTheDocument();
    });

    it("renders multiple password errors as a list", () => {
        renderPasswordField({
            error: [
                "Password must contain a number",
                "Password must contain an uppercase letter"
            ]
        });

        expect(screen.getByRole("list")).toHaveClass("password-field-error-list");
        expect(screen.getByText("Password must contain a number")).toHaveClass("password-field-error");
        expect(screen.getByText("Password must contain an uppercase letter")).toHaveClass("password-field-error");
    });

    it("connects the input to multiple errors with aria-describedby", () => {
        renderPasswordField({
            error: ["Password must contain a number"]
        });

        expect(screen.getByLabelText("Password")).toHaveAttribute(
            "aria-describedby",
            screen.getByRole("list").id
        );
    });
});
