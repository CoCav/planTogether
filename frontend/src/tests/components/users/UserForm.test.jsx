import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import UserForm from "../../../components/users/UserForm";

/* ==================================================
   USER FORM TESTS
   Tests shared user form rendering and interactions

   Handles:
   - avatar upload rendering
   - user field rendering
   - accessible field descriptions
   - avatar file selection
   - avatar removal
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

    it("renders avatar upload by default", () => {
        renderUserForm();

        expect(screen.getByText("Drag & drop an avatar here")).toBeInTheDocument();
        expect(screen.getByLabelText("Avatar (optional)")).toBeInTheDocument();
    });

    it("hides avatar upload when showAvatar is false", () => {
        renderUserForm({
            showAvatar: false
        });

        expect(screen.queryByText("Drag & drop an avatar here")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Avatar (optional)")).not.toBeInTheDocument();
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
       AVATAR INTERACTIONS
    ============================= */

    it("calls onAvatarChange when selecting an avatar file", async () => {
        const user = userEvent.setup();
        const onAvatarChange = vi.fn();

        const file = new File(["avatar"], "avatar.png", {
            type: "image/png"
        });

        renderUserForm({
            onAvatarChange
        });

        await user.upload(screen.getByLabelText("Avatar (optional)"), file);

        expect(onAvatarChange).toHaveBeenCalled();
    });

    it("applies drag active class while dragging over avatar upload", () => {
        renderUserForm();

        const uploadArea = screen.getByLabelText("Avatar upload area");

        fireEvent.dragEnter(uploadArea);

        expect(uploadArea).toHaveClass("drag-active");

        fireEvent.dragLeave(uploadArea);

        expect(uploadArea).not.toHaveClass("drag-active");
    });

    it("calls onAvatarChange when dropping an avatar file", () => {
        const onAvatarChange = vi.fn();

        const file = new File(["avatar"], "avatar.png", {
            type: "image/png"
        });

        renderUserForm({
            onAvatarChange
        });

        fireEvent.drop(screen.getByLabelText("Avatar upload area"), {
            dataTransfer: {
                files: [file]
            }
        });

        expect(onAvatarChange).toHaveBeenCalled();
    });

    it("displays selected avatar preview", () => {
        const avatar = new File(["avatar"], "avatar.png", {
            type: "image/png"
        });

        renderUserForm({
            values: {
                avatar
            }
        });

        expect(screen.getByAltText("Avatar preview")).toBeInTheDocument();
        expect(screen.getByText("avatar.png")).toBeInTheDocument();
    });

    it("displays existing avatar preview", () => {
        renderUserForm({
            values: {
                currentAvatar: "/uploads/users/avatar.png"
            }
        });

        expect(screen.getByAltText("Avatar preview")).toBeInTheDocument();
        expect(screen.getByText("Existing avatar")).toBeInTheDocument();
        expect(screen.getByText("Uploaded previously")).toBeInTheDocument();
    });

    it("calls onRemoveAvatar when removing an avatar", async () => {
        const user = userEvent.setup();
        const onRemoveAvatar = vi.fn();

        renderUserForm({
            values: {
                currentAvatar: "/uploads/users/avatar.png"
            },
            onRemoveAvatar
        });

        await user.click(screen.getByRole("button", {
            name: "Remove avatar"
        }));

        expect(onRemoveAvatar).toHaveBeenCalledTimes(1);
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
