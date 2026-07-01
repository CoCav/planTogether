import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventDetailsActions from "../../../components/events/EventDetailsActions";

/* ==================================================
   EVENT DETAILS ACTIONS TESTS
   Tests single event contextual action rendering

   Handles:
   - join action visibility and callback
   - leave action visibility and callback
   - edit action visibility and callback
   - delete action visibility and callback
   - event like toggle rendering
   - default empty action state
   - decorative action icons

   Notes:
   - focuses on action visibility and callbacks
   - event statuses and business states are tested in EventDetailsPage
   - event like behavior is delegated to EventLikeToggle
================================================== */

describe("EventDetailsActions", () => {
    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        eventId: 1,

        user: {
            userId: 10
        },

        canJoin: false,
        canLeave: false,
        canEdit: false,
        canDelete: false,

        liked: false,
        likesCount: 0,
        toast: {
            info: vi.fn(),
            success: vi.fn(),
            danger: vi.fn()
        },
        onLikeChange: vi.fn(),

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
       JOIN ACTION
    ============================= */

    it("should display join action when allowed", () => {
        renderEventDetailsActions({
            canJoin: true
        });

        expect(screen.getByRole("button", {
            name: /join the event/i
        })).toBeInTheDocument();
    });

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

    it("should display leave action when allowed", () => {
        renderEventDetailsActions({
            canLeave: true
        });

        expect(screen.getByRole("button", {
            name: /leave the event/i
        })).toBeInTheDocument();
    });

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

    it("should display edit action when allowed", () => {
        renderEventDetailsActions({
            canEdit: true
        });

        expect(screen.getByRole("button", {
            name: /edit event/i
        })).toBeInTheDocument();
    });

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

    it("should display delete action when allowed", () => {
        renderEventDetailsActions({
            canDelete: true
        });

        expect(screen.getByRole("button", {
            name: /delete event/i
        })).toBeInTheDocument();
    });

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
       LIKE ACTION
    ============================= */

    it("should display event like action", () => {
        renderEventDetailsActions({
            likesCount: 4
        });

        expect(screen.getByRole("button", {
            name: /like event\. 4 likes/i
        })).toBeInTheDocument();
    });

    it("should display liked event state", () => {
        renderEventDetailsActions({
            liked: true,
            likesCount: 5
        });

        expect(screen.getByRole("button", {
            name: /unlike event\. 5 likes/i
        })).toBeInTheDocument();
    });

    /* =============================
       DEFAULT STATE
    ============================= */

    it("should not display membership or management actions by default", () => {
        renderEventDetailsActions();

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

        expect(screen.getByRole("button", {
            name: /like event\. 0 likes/i
        })).toBeInTheDocument();
    });
});
