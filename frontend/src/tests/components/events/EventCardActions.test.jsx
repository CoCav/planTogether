import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventCardActions from "../../../components/events/EventCardActions";

/* ==================================================
   EVENT CARD ACTIONS TESTS
   Tests event preview action rendering

   Handles:
   - join action visibility
   - leave action visibility
   - guest login prompt
   - join callback
   - leave callback

   Notes:
   - focuses on action visibility and callbacks
   - event statuses and business states are tested in EventCard
================================================== */

describe("EventCardActions", () => {
    const baseProps = {
        eventId: 1,
        canLeave: false,
        showJoinButton: false,
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

    it("should display login prompt for guest users", () => {
        renderEventCardActions({
            showLoginPrompt: true
        });

        expect(screen.getByText(/login to join/i)).toBeInTheDocument();
    });

    it("should display join action when allowed", () => {
        renderEventCardActions({
            showJoinButton: true
        });

        expect(screen.getByRole("button", {
            name: /join the event/i
        })).toBeInTheDocument();
    });

    it("should display leave action when allowed", () => {
        renderEventCardActions({
            canLeave: true
        });

        expect(screen.getByRole("button", {
            name: /leave the event/i
        })).toBeInTheDocument();
    });

    it("should call onJoin with event id", () => {
        const onJoin = vi.fn();

        renderEventCardActions({
            showJoinButton: true,
            onJoin
        });

        fireEvent.click(screen.getByRole("button", {
            name: /join the event/i
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
            name: /leave the event/i
        }));

        expect(onLeave).toHaveBeenCalledWith(1);
    });
});
