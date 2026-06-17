import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventReviewCard from "../../../components/eventReviews/EventReviewCard";

/* ==================================================
   EVENT REVIEW CARD TESTS
   Tests event review rendering and actions

   Handles:
   - reviewer information rendering
   - review comment rendering
   - review date rendering
   - delete action visibility
   - delete loading state
   - avatar rendering

   Notes:
   - review display data is mocked
   - review actions are tested separately
================================================== */

vi.mock("../../../utils/uploadedFiles", () => ({
    getAvatar: vi.fn((avatar) => avatar || "avatar_user_per_default.png")
}));

vi.mock("../../../features/eventReviews/eventReviewDisplayData", () => ({
    getEventReviewDisplayData: vi.fn(({ currentUserId }) => ({
        id: 1,
        reviewerName: "John Doe",
        reviewerAvatar: "/uploads/avatar.png",
        comment: "Great event!",
        date: "15 Jun 2026",
        isOwner: currentUserId === 1
    }))
}));

describe("EventReviewCard", () => {

    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        review: {
            id: 1
        },
        currentUserId: null,
        deletingReviewId: null,
        onDelete: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventReviewCard = (props = {}) => {
        return render(
            <EventReviewCard
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       DISPLAY
    ============================= */

    it("should display reviewer information", () => {
        renderEventReviewCard();

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("15 Jun 2026")).toBeInTheDocument();
    });

    it("should display review comment", () => {
        renderEventReviewCard();

        expect(screen.getByText("Great event!")).toBeInTheDocument();
    });

    it("should display reviewer avatar", () => {
        renderEventReviewCard();

        expect(
            screen.getByAltText("John Doe avatar")
        ).toBeInTheDocument();
    });

    /* =============================
       ACTIONS
    ============================= */

    it("should display delete action for review owner", () => {
        renderEventReviewCard({
            currentUserId: 1
        });

        expect(screen.getByRole("button", {
            name: /delete/i
        })).toBeInTheDocument();
    });

    it("should not display delete action for non-owner", () => {
        renderEventReviewCard({
            currentUserId: 2
        });

        expect(screen.queryByRole("button", {
            name: /delete/i
        })).not.toBeInTheDocument();
    });

    it("should display deleting state", () => {
        renderEventReviewCard({
            currentUserId: 1,
            deletingReviewId: 1
        });

        expect(screen.getByRole("button", {
            name: /deleting/i
        })).toBeDisabled();
    });

    it("should call onDelete when owner clicks delete", () => {
        const onDelete = vi.fn();

        renderEventReviewCard({
            currentUserId: 1,
            onDelete
        });

        fireEvent.click(screen.getByRole("button", {
            name: /delete/i
        }));

        expect(onDelete).toHaveBeenCalledWith(1);
    });
});
