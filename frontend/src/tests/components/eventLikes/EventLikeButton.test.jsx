import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventLikeButton from "../../../components/eventLikes/EventLikeButton";

/* ==================================================
   EVENT LIKE BUTTON TESTS
   Tests event like button rendering

   Handles:
   - liked and unliked display
   - like count display
   - guest display
   - disabled state
   - toggle callback
   - accessible labels
   - accessible pressed state

   Notes:
   - business logic is tested in useEventLike
   - focuses on rendering and user interactions
================================================== */

describe("EventLikeButton", () => {

    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        liked: false,
        likesCount: 0,
        disabled: false,
        interactive: true,
        onToggle: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventLikeButton = (props = {}) => {
        return render(
            <EventLikeButton
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       DISPLAY
    ============================= */

    it("should render like count", () => {
        renderEventLikeButton({
            likesCount: 5
        });

        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should render unliked button", () => {
        renderEventLikeButton({
            liked: false,
            likesCount: 2
        });

        expect(screen.getByRole("button", {
            name: /like event\. 2 likes/i
        })).toBeInTheDocument();
    });

    it("should render liked button", () => {
        renderEventLikeButton({
            liked: true,
            likesCount: 3
        });

        expect(screen.getByRole("button", {
            name: /unlike event\. 3 likes/i
        })).toBeInTheDocument();
    });

    it("should render guest display when not interactive", () => {
        renderEventLikeButton({
            interactive: false,
            likesCount: 4
        });

        expect(screen.queryByRole("button")).not.toBeInTheDocument();

        expect(screen.getByLabelText("4 likes")).toBeInTheDocument();
    });

    /* =============================
       CALLBACKS
    ============================= */

    it("should call onToggle when clicked", () => {
        const onToggle = vi.fn();

        renderEventLikeButton({
            likesCount: 1,
            onToggle
        });

        fireEvent.click(screen.getByRole("button", {
            name: /like event\. 1 likes/i
        }));

        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    /* =============================
       STATE
    ============================= */

    it("should disable button when disabled", () => {
        renderEventLikeButton({
            disabled: true
        });

        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should expose unliked pressed state", () => {
        renderEventLikeButton({
            liked: false
        });

        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    });

    it("should expose liked pressed state", () => {
        renderEventLikeButton({
            liked: true
        });

        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    });
});
