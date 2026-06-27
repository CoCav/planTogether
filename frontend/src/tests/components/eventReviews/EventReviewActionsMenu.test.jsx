import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventReviewActionsMenu from "../../../components/eventReviews/EventReviewActionsMenu";

/* ==================================================
   EVENT REVIEW ACTIONS MENU TESTS
   Tests review action rendering and callbacks

   Handles:
   - hidden review actions
   - manage trigger rendering
   - accessible menu trigger attributes
   - dropdown open and close behavior
   - accessible menu relationship ids
   - edit and delete action rendering
   - edit callback
   - delete callback
   - edit loading state
   - delete loading state

   Notes:
   - review ownership is resolved by EventReviewCard
   - action handlers are delegated to the parent component
================================================== */

describe("EventReviewActionsMenu", () => {

    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        canManage: true,
        isEditing: false,
        isDeleting: false,
        onEdit: vi.fn(),
        onDelete: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventReviewActions = (props = {}) => {
        return render(
            <EventReviewActionsMenu
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       VISIBILITY
    ============================= */

    it("should not render when user cannot manage review actions", () => {
        renderEventReviewActions({
            canManage: false
        });

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should render Manage button when user can manage", () => {
        renderEventReviewActions();

        expect(screen.getByRole("button", { name: /manage/i })).toBeInTheDocument();
    });

    /* =============================
       DROPDOWN BEHAVIOUR
    ============================= */

    it("should open dropdown on click", () => {
        renderEventReviewActions();

        fireEvent.click(screen.getByRole("button", { name: /manage/i }));

        expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should associate trigger with dropdown when menu is open", () => {
        renderEventReviewActions();

        const trigger = screen.getByRole("button", { name: /manage/i });

        expect(trigger).not.toHaveAttribute("aria-controls");

        fireEvent.click(trigger);

        const menu = screen.getByRole("menu");

        expect(trigger).toHaveAttribute("aria-controls", menu.id);
    });

    it("should render edit and delete actions when opened", () => {
        renderEventReviewActions();

        fireEvent.click(screen.getByRole("button", { name: /manage/i }));

        expect(screen.getByRole("menuitem", { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /delete/i })).toBeInTheDocument();
    });

    /* =============================
       CALLBACKS
    ============================= */

    it("should call onEdit callback", () => {
        const onEdit = vi.fn();

        renderEventReviewActions({ onEdit });

        fireEvent.click(screen.getByRole("button", { name: /manage/i }));

        fireEvent.click(screen.getByRole("menuitem", { name: /edit/i }));

        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("should close dropdown after clicking edit action", () => {
        renderEventReviewActions();

        fireEvent.click(screen.getByRole("button", { name: /manage/i }));
        fireEvent.click(screen.getByRole("menuitem", {
            name: /edit/i
        }));

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should call onDelete callback", () => {
        const onDelete = vi.fn();

        renderEventReviewActions({ onDelete });

        fireEvent.click(screen.getByRole("button", { name: /manage/i }));
        fireEvent.click(screen.getByRole("menuitem", {
            name: /delete/i
        }));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("should disable actions while editing", () => {
        renderEventReviewActions({
            isEditing: true
        });

        expect(screen.getByRole("button", { name: /manage/i })).toBeDisabled();
    });

    it("should disable trigger when deleting", () => {
        renderEventReviewActions({
            isDeleting: true
        });

        expect(screen.getByRole("button", { name: /manage/i })).toBeDisabled();
    });
});
