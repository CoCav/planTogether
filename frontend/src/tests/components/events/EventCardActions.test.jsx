import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventCardActions from "../../../components/events/EventCardActions";

import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

/* ==================================================
   EVENT CARD ACTIONS TESTS
   Tests event preview action rendering

   Handles:
   - past event status display
   - ended status badge
   - event full action state
   - registration closed action state
   - guest login prompt
   - join callback
   - leave callback
   - accessible guest prompt

   Notes:
   - focuses on action visibility and callbacks
   - uses reusable render helper
================================================== */

describe("EventCardActions", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const baseProps = {
        eventId: 1,
        status: EVENT_STATUS.UPCOMING,
        isPast: false,
        canLeave: false,
        showJoinButton: false,
        showEventFullButton: false,
        showRegistrationClosedButton: false,
        showLoginPrompt: false,
        onJoin: vi.fn(),
        onLeave: vi.fn()
    };

    const renderEventCardActions = (props = {}) => {
        return render(
            <EventCardActions
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       PAST EVENT STATE
    ============================= */

    it("should display ended status badge for past events", () => {
        renderEventCardActions({
            isPast: true,
            status: EVENT_STATUS.PAST
        });

        expect(screen.getByText("Ended")).toHaveClass("badge-past");
    });

    /* =============================
       EVENT FULL STATE
    ============================= */

    it("should display event full state", () => {
        renderEventCardActions({
            showEventFullButton: true
        });

        expect(screen.getByRole("button", { name: "Event full" })).toBeDisabled();
    });

    /* =============================
       REGISTRATION CLOSED STATE
    ============================= */

    it("should display registration closed state", () => {
        renderEventCardActions({
            showRegistrationClosedButton: true
        });

        expect(screen.getByRole("button", { name: "Registration closed" })).toBeDisabled();
    });

    /* =============================
       GUEST STATE
    ============================= */

    it("should display login prompt for guest users", () => {
        renderEventCardActions({
            showLoginPrompt: true
        });

        expect(screen.getByText("🔐 Login to join")).toBeInTheDocument();
    });

    it("should display accessible guest login prompt", () => {
        renderEventCardActions({
            showLoginPrompt: true
        });

        expect(screen.getByText(/login to join/i)).toBeInTheDocument();
    });

    /* =============================
       JOIN ACTION
    ============================= */

    it("should call onJoin with event id", () => {
        const onJoin = vi.fn();

        renderEventCardActions({
            showJoinButton: true,
            onJoin
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Join the event"
        }));

        expect(onJoin).toHaveBeenCalledWith(1);
    });

    /* =============================
       LEAVE ACTION
    ============================= */

    it("should call onLeave with event id", () => {
        const onLeave = vi.fn();

        renderEventCardActions({
            canLeave: true,
            onLeave
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Leave the event"
        }));

        expect(onLeave).toHaveBeenCalledWith(1);
    });
});
