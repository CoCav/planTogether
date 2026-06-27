import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventReviewCard from "../../../components/eventReviews/EventReviewCard";

/* ==================================================
   EVENT REVIEW CARD TESTS
   Tests event review card rendering and interactions

   Handles:
   - reviewer information rendering
   - avatar rendering
   - date rendering
   - read-only rating rendering
   - comment rendering
   - accessible list item semantics
   - owner permissions and actions visibility
   - edit mode toggle
   - edit submission flow
   - delete callback
   - update loading state
   - delete loading state

   Notes:
   - display data is mocked via getEventReviewDisplayData
   - actions menu is integration-tested only
================================================== */

vi.mock("../../../utils/uploadedFiles", () => ({
    getAvatar: vi.fn((avatar) => avatar || "avatar.png")
}));

vi.mock("../../../features/eventReviews/eventReviewDisplayData", () => ({
    getEventReviewDisplayData: vi.fn(({ currentUserId }) => ({
        id: 1,
        reviewerName: "John Doe",
        reviewerAvatar: "/avatar.png",
        rating: 4,
        comment: "Great event!",
        date: "15 Jun 2026",
        isOwner: currentUserId === 1
    }))
}));

vi.mock("../../../components/users/UserAvatar", () => ({
    default: ({ name }) => <img alt={`${name} avatar`} />
}));

vi.mock("../../../components/eventReviews/EventReviewForm", () => ({
    default: ({ onSubmit, onCancel, submitLabel, isSubmitting }) => (
        <div>
            <button onClick={() => onSubmit({
                rating: 5,
                comment: "Updated comment"
            })}>
                {submitLabel}
            </button>

            <button onClick={onCancel}>Cancel</button>

            {isSubmitting && <span>Saving...</span>}
        </div>
    )
}));

describe("EventReviewCard", () => {

    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        review: { id: 1 },
        currentUserId: null,
        updatingReviewId: null,
        deletingReviewId: null,
        onEdit: vi.fn(),
        onDelete: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderCard = (props = {}) =>
        render(<EventReviewCard {...baseProps} {...props} />);

    /* =========================
       DISPLAY
    ========================= */

    it("should render review content", () => {
        renderCard();

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("15 Jun 2026")).toBeInTheDocument();
        expect(screen.getByText("Great event!")).toBeInTheDocument();
    });

    it("should render review card as a list item", () => {
        renderCard();

        expect(screen.getByRole("listitem")).toBeInTheDocument();
    });

    it("should render avatar", () => {
        renderCard();

        expect(screen.getByAltText("John Doe avatar")).toBeInTheDocument();
    });

    /* =========================
       PERMISSIONS
    ========================= */

    it("should show actions menu for owner", () => {
        renderCard({ currentUserId: 1 });

        expect(screen.getByRole("button", { name: /manage/i }))
            .toBeInTheDocument();
    });

    it("should hide actions menu for non-owner", () => {
        renderCard({ currentUserId: 2 });

        expect(screen.queryByRole("button", { name: /manage/i })).not.toBeInTheDocument();
    });

    /* =========================
       EDIT MODE
    ========================= */

    it("should open edit mode from menu", () => {
        renderCard({ currentUserId: 1 });

        fireEvent.click(screen.getByRole("button", { name: /manage/i }));

        fireEvent.click(screen.getByText(/edit/i));

        expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    it("should cancel edit mode", () => {
        renderCard({ currentUserId: 1 });

        fireEvent.click(screen.getByRole("button", { name: /manage/i }));
        fireEvent.click(screen.getByText(/edit/i));

        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

        expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument();
    });

    it("should call onEdit with updated data", () => {
        const onEdit = vi.fn().mockResolvedValue(true);

        renderCard({
            currentUserId: 1,
            onEdit
        });

        fireEvent.click(screen.getByRole("button", { name: /manage/i }));
        fireEvent.click(screen.getByText(/edit/i));
        fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

        expect(onEdit).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                rating: 5,
                comment: "Updated comment"
            })
        );
    });

    /* =========================
       DELETE
    ========================= */

    it("should call onDelete from menu", () => {
        const onDelete = vi.fn();

        renderCard({
            currentUserId: 1,
            onDelete
        });

        fireEvent.click(screen.getByRole("button", { name: /manage/i }));
        fireEvent.click(screen.getByText(/delete/i));

        expect(onDelete).toHaveBeenCalledWith(1);
    });

    it("should show deleting state", () => {
        renderCard({
            currentUserId: 1,
            deletingReviewId: 1
        });

        expect(screen.getByRole("button", { name: /manage/i })).toBeDisabled();
    });

    /* =========================
       UPDATING STATE
    ========================= */

    it("should show saving state", () => {
        renderCard({
            currentUserId: 1,
            updatingReviewId: 1
        });

        fireEvent.click(screen.getByRole("button", { name: /manage/i }));
        fireEvent.click(screen.getByText(/edit/i));

        expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
});
