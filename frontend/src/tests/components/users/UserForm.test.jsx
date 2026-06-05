import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import UserForm from "../../../components/users/UserForm";

/* ==================================================
   USER FORM TESTS
   Tests shared user form rendering and interactions

   Handles:
   - shared avatar upload field rendering
   - user field rendering
   - accessible field descriptions
   - optional avatar visibility
   - custom form content rendering
   - form footer rendering
   - form submission
================================================== */

describe("UserForm", () => {

    /* =============================
       TEST DATA
    ============================= */

    const defaultValues = {
        name: "",
        email: "",
        avatar: null,
        currentAvatar: null
    };

    const defaultFieldErrors = {};

    /* =============================
       TEST HELPERS
    ============================= */

    const renderUserForm = (props = {}) => {
        const defaultProps = {
            values: {
                ...defaultValues,
                ...(props.values || {})
            },
            fieldErrors: {
                ...defaultFieldErrors,
                ...(props.fieldErrors || {})
            },
            submitLabel: "Save",
            isSubmitting: false,
            showAvatar: true,
            onFieldChange: vi.fn(),
            onAvatarChange: vi.fn(),
            onRemoveAvatar: vi.fn(),
            onSubmit: vi.fn(),
            formFooter: null
        };

        return render(
            <UserForm {...defaultProps} {...props}>
                {props.children}
            </UserForm>
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("renders user fields", () => {
        renderUserForm();

        expect(screen.getByLabelText("Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("renders custom children inside the form grid", () => {
        renderUserForm({
            children: <div data-testid="custom-field">Custom field</div>
        });

        expect(screen.getByTestId("custom-field")).toBeInTheDocument();
    });

    it("renders form footer", () => {
        renderUserForm({
            formFooter: <p>Already have an account?</p>
        });

        expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    });

    /* =============================
       FIELD INTERACTIONS
    ============================= */

    it("calls onFieldChange when typing in name field", async () => {
        const user = userEvent.setup();
        const onFieldChange = vi.fn();

        renderUserForm({
            onFieldChange
        });

        await user.type(screen.getByLabelText("Name"), "John");

        expect(onFieldChange).toHaveBeenCalled();
    });

    it("calls onFieldChange when typing in email field", async () => {
        const user = userEvent.setup();
        const onFieldChange = vi.fn();

        renderUserForm({
            onFieldChange
        });

        await user.type(screen.getByLabelText("Email"), "john@example.com");

        expect(onFieldChange).toHaveBeenCalled();
    });

    /* =============================
       AVATAR UPLOAD
    ============================= */

    it("renders shared avatar upload field", () => {
        renderUserForm();

        expect(screen.getByText("Drag & drop an avatar here")).toBeInTheDocument();
        expect(screen.getByLabelText("Avatar upload area")).toBeInTheDocument();
    });

    it("hides avatar upload when showAvatar is false", () => {
        renderUserForm({
            showAvatar: false
        });

        expect(screen.queryByText("Drag & drop an avatar here")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Avatar upload area")).not.toBeInTheDocument();
    });

    /* =============================
       VALIDATION FEEDBACK
    ============================= */

    it("renders field validation errors", () => {
        renderUserForm({
            fieldErrors: {
                name: "Name is required",
                email: "Email is required"
            }
        });

        expect(screen.getByText("Name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
    });

    /* =============================
       SUBMISSION
    ============================= */

    it("calls onSubmit when submitting the form", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn((event) => event.preventDefault());

        renderUserForm({
            onSubmit
        });

        await user.click(screen.getByRole("button", {
            name: "Save"
        }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("disables submit button while submitting", () => {
        renderUserForm({
            isSubmitting: true
        });

        expect(screen.getByRole("button", {
            name: "Loading..."
        })).toBeDisabled();
    });
});
