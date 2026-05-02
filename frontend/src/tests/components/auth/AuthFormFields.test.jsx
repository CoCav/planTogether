import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import AuthFormFields from "../../../components/auth/AuthFormFields";

/* ==================================================
   AUTH FORM FIELDS TESTS
   Tests shared form fields component
================================================== */

describe("AuthFormFields", () => {
    const validAvatar = new File(["avatar"], "avatar.png", {
        type: "image/png"
    });

    const defaultProps = {
        form: {
            name: "John",
            email: "john@test.com",
            avatar: null
        },
        errors: {},
        onChange: vi.fn(),
        onFileChange: vi.fn(),
        onRemoveFile: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();

        globalThis.URL.createObjectURL = vi.fn(() => "blob:avatar-preview");
        globalThis.URL.revokeObjectURL = vi.fn();
    });

    const renderComponent = (props = {}) => {
        return render(
            <AuthFormFields
                {...defaultProps}
                {...props}
                form={{
                    ...defaultProps.form,
                    ...(props.form || {})
                }}
                errors={{
                    ...defaultProps.errors,
                    ...(props.errors || {})
                }}
            />
        );
    };

    it("renders name and email inputs", () => {
        renderComponent();

        expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
    });

    it("renders avatar upload when showAvatar is true", () => {
        renderComponent({ showAvatar: true });

        expect(screen.getByText(/choose file/i)).toBeInTheDocument();
        expect(screen.getByText(/optional.*max 2mb.*jpg.*png.*webp.*gif/i)).toBeInTheDocument();
    });

    it("does not render avatar upload when showAvatar is false", () => {
        renderComponent({ showAvatar: false });

        expect(screen.queryByText(/choose file/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/optional.*max 2mb/i)).not.toBeInTheDocument();
    });

    it("calls onChange when name changes", () => {
        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("Your name"), {
            target: { name: "name", value: "Jane" }
        });

        expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange when email changes", () => {
        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("Your email"), {
            target: { name: "email", value: "jane@test.com" }
        });

        expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    });

    it("calls onFileChange when selecting an avatar", () => {
        renderComponent({ showAvatar: true });

        const fileInput = screen.getByLabelText(/choose file/i);

        fireEvent.change(fileInput, {
            target: { files: [validAvatar] }
        });

        expect(defaultProps.onFileChange).toHaveBeenCalledTimes(1);
    });

    it("shows avatar preview card when avatar is selected", () => {
        renderComponent({
            form: {
                avatar: validAvatar
            }
        });

        expect(URL.createObjectURL).toHaveBeenCalledWith(validAvatar);

        expect(screen.getByAltText("Avatar preview")).toHaveAttribute(
            "src",
            "blob:avatar-preview"
        );

        expect(screen.getByText("avatar.png")).toBeInTheDocument();
        expect(screen.getByText(/kb/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
    });

    it("calls onRemoveFile when clicking remove", () => {
        renderComponent({
            form: {
                avatar: validAvatar
            }
        });

        fireEvent.click(screen.getByRole("button", { name: /remove/i }));

        expect(defaultProps.onRemoveFile).toHaveBeenCalledTimes(1);
    });

    it("displays validation errors", () => {
        renderComponent({
            errors: {
                name: "Name is required",
                email: "Invalid email",
                avatar: "Avatar must be an image file"
            }
        });

        expect(screen.getByText("Name is required")).toBeInTheDocument();
        expect(screen.getByText("Invalid email")).toBeInTheDocument();
        expect(screen.getByText("Avatar must be an image file")).toBeInTheDocument();
    });
});
