import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventDetailsActions from "../../../components/events/EventDetailsActions";

import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

/* ==================================================
   EVENT DETAILS ACTIONS TESTS
   Tests single event contextual action rendering

   Handles:
   - past event status display
   - ended status badge
   - availability disabled states
   - guest login prompt
   - join callback
   - leave callback
   - edit callback
   - delete callback
   - default empty action state

   Notes:
   - focuses on action visibility and callbacks
   - past events display status instead of interactive actions
================================================== */

describe("EventDetailsActions", () => {
    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        eventId: 1,
        status: EVENT_STATUS.UPCOMING,
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

    it("should display ended status badge for past events", () => {
        renderEventDetailsActions({
            isPast: true,
            status: EVENT_STATUS.PAST
        });

        expect(screen.getByText("Ended")).toHaveClass("badge-past");
    });

    it("should hide interactive actions for past events", () => {
        renderEventDetailsActions({
            isPast: true,
            status: EVENT_STATUS.PAST,
            canJoin: true,
            canLeave: true,
            canEdit: true,
            canDelete: true,
            showEventFullButton: true,
            showRegistrationClosedButton: true,
            showLoginPrompt: true
        });

        expect(screen.getByText("Ended")).toHaveClass("badge-past");

        expect(screen.queryByRole("button", {
            name: /join the event/i
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /leave the event/i
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /edit event/i
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /delete event/i
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /event full/i
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /registration closed/i
        })).not.toBeInTheDocument();

        expect(screen.queryByText(/login to join/i)).not.toBeInTheDocument();
    });

    /* =============================
       EVENT FULL STATE
    ============================= */

    it("should display event full state", () => {
        renderEventDetailsActions({
            showEventFullButton: true
        });

        expect(screen.getByRole("button", {
            name: /event full/i
        })).toBeDisabled();
    });

    /* =============================
       REGISTRATION CLOSED STATE
    ============================= */

    it("should display registration closed state", () => {
        renderEventDetailsActions({
            showRegistrationClosedButton: true
        });

        expect(screen.getByRole("button", {
            name: /registration closed/i
        })).toBeDisabled();
    });

    /* =============================
       GUEST STATE
    ============================= */

    it("should display login prompt for guest users", () => {
        renderEventDetailsActions({
            showLoginPrompt: true
        });

        expect(screen.getByText(/login to join this event/i)).toBeInTheDocument();
    });

    /* =============================
       JOIN ACTION
    ============================= */

    it("should call onJoin with event id", () => {
        const onJoin = vi.fn();

        renderEventDetailsActions({
            canJoin: true,
            onJoin
        });

        fireEvent.click(screen.getByRole("button", {
            name: /join the event/i
        }));

        expect(onJoin).toHaveBeenCalledWith(1);
    });

    /* =============================
       LEAVE ACTION
    ============================= */

    it("should call onLeave with event id", () => {
        const onLeave = vi.fn();

        renderEventDetailsActions({
            canLeave: true,
            onLeave
        });

        fireEvent.click(screen.getByRole("button", {
            name: /leave the event/i
        }));

        expect(onLeave).toHaveBeenCalledWith(1);
    });

    /* =============================
       EDIT ACTION
    ============================= */

    it("should call onEdit when clicking edit event", () => {
        const onEdit = vi.fn();

        renderEventDetailsActions({
            canEdit: true,
            onEdit
        });

        fireEvent.click(screen.getByRole("button", {
            name: /edit event/i
        }));

        expect(onEdit).toHaveBeenCalled();
    });

    /* =============================
       DELETE ACTION
    ============================= */

    it("should call onDelete when clicking delete event", () => {
        const onDelete = vi.fn();

        renderEventDetailsActions({
            canDelete: true,
            onDelete
        });

        fireEvent.click(screen.getByRole("button", {
            name: /delete event/i
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
