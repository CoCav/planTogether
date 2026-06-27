import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import DeleteAccountSection from "../../../components/users/DeleteAccountSection";

/* ==================================================
   DELETE ACCOUNT SECTION TESTS
   Tests destructive account deletion section rendering

   Handles:
   - section heading and description rendering
   - deletion warning copy
   - delete account action callback
   - disabled delete state while submitting
   - accessible section heading association
   - accessible warning association
   - decorative trash icon
================================================== */

describe("DeleteAccountSection", () => {

    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        isDeleting: false,
        onDeleteAccount: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderDeleteAccountSection = (props = {}) => {
        return render(
            <DeleteAccountSection
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       SECTION CONTENT
    ============================= */

    it("should render delete account heading and description", () => {
        renderDeleteAccountSection();

        expect(screen.getByRole("heading", {
            name: "Delete Account"
        })).toBeInTheDocument();

        expect(screen.getByText(
            "Permanently delete your account and associated data."
        )).toBeInTheDocument();
    });

    it("should render destructive deletion warning", () => {
        renderDeleteAccountSection();

        expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();

        expect(screen.getByText(/you must transfer ownership of your active or upcoming events/i)).toBeInTheDocument();
    });

    it("should associate delete action with deletion warning", () => {
        renderDeleteAccountSection();

        const button = screen.getByRole("button", {
            name: "Delete Account"
        });

        const warning = screen.getByText(/this action cannot be undone/i);

        expect(button).toHaveAttribute("aria-describedby", warning.id);
    });

    it("should associate section with its heading", () => {
        renderDeleteAccountSection();

        const heading = screen.getByRole("heading", {
            name: "Delete Account"
        });

        const section = heading.closest("section");

        expect(section).toHaveAttribute("aria-labelledby", heading.id);
    });

    /* =============================
       DELETE ACTION
    ============================= */

    it("should call onDeleteAccount when clicking delete account", () => {
        const onDeleteAccount = vi.fn();

        renderDeleteAccountSection({
            onDeleteAccount
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Delete Account"
        }));

        expect(onDeleteAccount).toHaveBeenCalledTimes(1);
    });

    it("should disable delete account action while deleting", () => {
        renderDeleteAccountSection({
            isDeleting: true
        });

        const button = screen.getByRole("button", {
            name: "Deleting account..."
        });

        expect(button).toBeDisabled();
    });

    it("should not call onDeleteAccount while delete action is disabled", () => {
        const onDeleteAccount = vi.fn();

        renderDeleteAccountSection({
            isDeleting: true,
            onDeleteAccount
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Deleting account..."
        }));

        expect(onDeleteAccount).not.toHaveBeenCalled();
    });

    it("should hide decorative trash icon from assistive technologies", () => {
        renderDeleteAccountSection();

        const icon = document.querySelector(".danger-zone svg[aria-hidden='true']");

        expect(icon).toBeInTheDocument();
    });
});
