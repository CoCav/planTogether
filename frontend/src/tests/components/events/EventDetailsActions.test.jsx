import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EventDetailsActions from "../../../components/events/EventDetailsActions";

/* ==================================================
   EVENT DETAILS ACTIONS TESTS
   Tests single event action rendering

   Handles:
   - past event status display
   - event full action state
   - registration closed action state
   - guest login prompt
   - join callback
   - leave callback
   - edit callback
   - delete callback

   Notes:
   - focuses on action visibility and callbacks
   - uses reusable render helper
================================================== */

describe("EventDetailsActions", () => {

    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        eventId: 1,

        isPast: false,

        canJoin: false,
        canLeave: false,
        canEdit: false,
        canDelete: false,

        showEventFullButton: false,
        showRegistrationClosedButton: false,
        showLoginPrompt: false,

        onJoin: vi.fn(),
        onLeave: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventDetailsActions = (props = {}) => {
        return render(
            <EventDetailsActions
                {...baseProps}
                {...props}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       PAST EVENT STATE
    ============================= */

    it("should display ended status for past events", () => {
        renderEventDetailsActions({
            isPast: true
        });

        expect(screen.getByText("Ended")).toBeInTheDocument();
    });

    it("should hide interactive actions for past events", () => {
        renderEventDetailsActions({
            isPast: true,
            canJoin: true,
            canLeave: true,
            canEdit: true,
            canDelete: true,
            showEventFullButton: true,
            showRegistrationClosedButton: true,
            showLoginPrompt: true
        });

        expect(screen.getByText("Ended")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Join the event" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Leave the event" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Edit Event" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Delete Event" })).not.toBeInTheDocument();
    });

    /* =============================
       EVENT FULL STATE
    ============================= */

    it("should display event full state", () => {
        renderEventDetailsActions({
            showEventFullButton: true
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
        renderEventDetailsActions({
            showRegistrationClosedButton: true
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
        renderEventDetailsActions({
            showLoginPrompt: true
        });

        expect(screen.getByText("🔐 Login to join this event.")).toBeInTheDocument();
    });

    /* =============================
       ACTION CALLBACKS
    ============================= */

    it("should call onJoin with event id", () => {
        const onJoin = vi.fn();

        renderEventDetailsActions({
            canJoin: true,
            onJoin
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Join the event"
        }));

        expect(onJoin).toHaveBeenCalledWith(1);
    });

    it("should call onLeave with event id", () => {
        const onLeave = vi.fn();

        renderEventDetailsActions({
            canLeave: true,
            onLeave
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Leave the event"
        }));

        expect(onLeave).toHaveBeenCalledWith(1);
    });

    it("should call onEdit", () => {
        const onEdit = vi.fn();

        renderEventDetailsActions({
            canEdit: true,
            onEdit
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Edit Event"
        }));

        expect(onEdit).toHaveBeenCalled();
    });

    it("should call onDelete", () => {
        const onDelete = vi.fn();

        renderEventDetailsActions({
            canDelete: true,
            onDelete
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Delete Event"
        }));

        expect(onDelete).toHaveBeenCalled();
    });

    /* =============================
       DEFAULT STATE
    ============================= */

    it("should not display actions by default", () => {
        renderEventDetailsActions();

        expect(screen.queryByRole("button")).not.toBeInTheDocument();

        expect(screen.queryByText("Ended")).not.toBeInTheDocument();

        expect(screen.queryByText(/login to join/i)).not.toBeInTheDocument();
    });
});
