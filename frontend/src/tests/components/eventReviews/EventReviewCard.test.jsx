import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventReviewCard from "../../../components/eventReviews/EventReviewCard";

/* ==================================================
   EVENT REVIEW CARD TESTS
   Tests event review card rendering and owner actions

   Handles:
   - reviewer information rendering
   - reviewer avatar rendering
   - review date rendering
   - review rating rendering
   - review comment rendering
   - owner action visibility
   - review edit mode
   - review update loading state
   - review delete loading state
   - review update callback forwarding
   - review delete callback forwarding

   Notes:
   - review display data is mocked
   - review actions are tested separately
   - rating rendering uses EventReviewRating in read-only mode
================================================== */

vi.mock("../../../utils/uploadedFiles", () => ({
    getAvatar: vi.fn((avatar) => avatar || "avatar_user_per_default.png")
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
    default: ({ name }) => (
        <img alt={`${name} avatar`} />
    )
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

    const baseProps = {
        review: { id: 1 },
        currentUserId: null,
        updatingReviewId: null,
        deletingReviewId: null,
        onEdit: vi.fn(),
        onDelete: vi.fn()
    };

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

    it("should render avatar", () => {
        renderCard();

        expect(screen.getByAltText("John Doe avatar")).toBeInTheDocument();
    });

    it("should render rating (read only)", () => {
        renderCard();

        expect(screen.getByRole("img", { name: /4 out of 5 stars/i })).toBeInTheDocument();
    });

    /* =========================
       PERMISSIONS
    ========================= */

    it("should show actions for owner", () => {
        renderCard({ currentUserId: 1 });

        expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    });

    it("should hide actions for non-owner", () => {
        renderCard({ currentUserId: 2 });

        expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
    });

    /* =========================
       EDIT MODE
    ========================= */

    it("should open edit mode", () => {
        renderCard({ currentUserId: 1 });

        fireEvent.click(screen.getByRole("button", { name: /edit/i }));

        expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    it("should cancel edit mode", () => {
        renderCard({ currentUserId: 1 });

        fireEvent.click(screen.getByRole("button", { name: /edit/i }));
        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

        expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument();
    });

    it("should call onEdit and close edit mode", () => {
        const onEdit = vi.fn().mockResolvedValue(true);

        renderCard({
            currentUserId: 1,
            onEdit
        });

        fireEvent.click(screen.getByRole("button", { name: /edit/i }));
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

    it("should call onDelete with id", () => {
        const onDelete = vi.fn();

        renderCard({
            currentUserId: 1,
            onDelete
        });

        fireEvent.click(screen.getByRole("button", { name: /delete/i }));

        expect(onDelete).toHaveBeenCalledWith(1);
    });

    it("should show deleting state", () => {
        renderCard({
            currentUserId: 1,
            deletingReviewId: 1
        });

        expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
    });

    /* =========================
       UPDATING STATE
    ========================= */

    it("should show saving state when updating", () => {
        renderCard({
            currentUserId: 1,
            updatingReviewId: 1
        });

        fireEvent.click(screen.getByRole("button", { name: /edit/i }));

        expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
});
