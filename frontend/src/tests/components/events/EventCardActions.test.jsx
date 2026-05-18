import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import EventCardActions from "../../../components/events/EventCardActions";

/* ==================================================
   EVENT CARD ACTIONS TESTS
   Tests event preview action rendering

   Handles:
   - past event status display
   - event full action state
   - registration closed action state
   - guest login prompt
   - join callback
   - leave callback

   Notes:
   - focuses on action visibility and callbacks
   - uses reusable render helper
================================================== */

describe("EventCardActions", () => {

    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        eventId: 1,
        user: {
            userId: 42
        },
        isPast: false,
        isEventFull: false,
        isRegistrationClosed: false,
        canLeave: false,
        showJoinButton: false,
        onJoin: vi.fn(),
        onLeave: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

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

    it("should display ended status for past events", () => {
        renderEventCardActions({
            isPast: true
        });

        expect(screen.getByText("Ended")).toBeInTheDocument();
    });

    /* =============================
       EVENT FULL STATE
    ============================= */

    it("should display event full state", () => {
        renderEventCardActions({
            isEventFull: true
        });

        expect(
            screen.getByRole("button", {
                name: "Event full"
            })
        ).toBeDisabled();
    });

    /* =============================
       REGISTRATION CLOSED STATE
    ============================= */

    it("should display registration closed state", () => {
        renderEventCardActions({
            isRegistrationClosed: true
        });

        expect(
            screen.getByRole("button", {
                name: "Registration closed"
            })
        ).toBeDisabled();
    });

    /* =============================
       GUEST STATE
    ============================= */

    it("should display login prompt for guest users", () => {
        renderEventCardActions({
            user: null
        });

        expect(screen.getByText("🔐 Login to join")).toBeInTheDocument();
    });

    /* =============================
       ACTION CALLBACKS
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
