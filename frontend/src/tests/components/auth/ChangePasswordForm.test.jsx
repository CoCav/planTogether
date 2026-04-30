import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ChangePasswordForm from "../../../components/auth/ChangePasswordForm";

/* ==================================================
   CHANGE PASSWORD FORM TESTS
   Tests password update form rendering and actions
================================================== */

const form = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
};

const showPasswords = {
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
};

describe("ChangePasswordForm", () => {
    it("renders password fields", () => {
        render(
            <ChangePasswordForm
                form={form}
                errors={{}}
                showPasswords={showPasswords}
                submitting={false}
                onChange={vi.fn()}
                onSubmit={vi.fn()}
                onTogglePassword={vi.fn()}
            />
        );

        expect(screen.getByPlaceholderText("Current password")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("New password")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Confirm new password")).toBeInTheDocument();
    });

    it("renders password requirements for new password", () => {
        render(
            <ChangePasswordForm
                form={{ ...form, newPassword: "abc" }}
                errors={{}}
                showPasswords={showPasswords}
                submitting={false}
                onChange={vi.fn()}
                onSubmit={vi.fn()}
                onTogglePassword={vi.fn()}
            />
        );

        expect(screen.getByText(/your password must contain/i)).toBeInTheDocument();
    });

    it("calls onTogglePassword with selected field", () => {
        const onTogglePassword = vi.fn();

        render(
            <ChangePasswordForm
                form={form}
                errors={{}}
                showPasswords={showPasswords}
                submitting={false}
                onChange={vi.fn()}
                onSubmit={vi.fn()}
                onTogglePassword={onTogglePassword}
            />
        );

        fireEvent.click(screen.getAllByRole("button", { name: /show/i })[1]);

        expect(onTogglePassword).toHaveBeenCalledWith("newPassword");
    });

    it("calls onSubmit when form is submitted", () => {
        const onSubmit = vi.fn((e) => e.preventDefault());

        render(
            <ChangePasswordForm
                form={form}
                errors={{}}
                showPasswords={showPasswords}
                submitting={false}
                onChange={vi.fn()}
                onSubmit={onSubmit}
                onTogglePassword={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /update password/i }));

        expect(onSubmit).toHaveBeenCalled();
    });

    it("disables submit button while submitting", () => {
        render(
            <ChangePasswordForm
                form={form}
                errors={{}}
                showPasswords={showPasswords}
                submitting
                onChange={vi.fn()}
                onSubmit={vi.fn()}
                onTogglePassword={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
    });
});
