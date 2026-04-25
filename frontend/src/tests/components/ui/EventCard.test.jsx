import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCard from "../../../components/ui/EventCard";

// ----------------------
// Mocks
// ----------------------

vi.mock("../../utils/format", () => ({
    formatEventDateRange: () => "Apr 24",
    formatTime: () => "10:00",
    formatCount: (count) => `${count} participants`
}));

// ----------------------
// Helpers
// ----------------------

const baseEvent = {
    id: 1,
    title: "Test Event",
    description: "Test description",
    startDateTime: "2026-04-24T10:00:00Z",
    endDateTime: "2026-04-24T12:00:00Z",
    participantCount: 3,
    mode: "online",
    creatorName: "Alice",
    status: "upcoming"
};

function renderCard(props = {}) {
    return render(
        <MemoryRouter>
            <EventCard
                event={baseEvent}
                user={{ id: 1 }}
                {...props}
            />
        </MemoryRouter>
    );
}

// ----------------------
// Tests
// ----------------------

describe("EventCard", () => {

    it("should display event information", () => {
        renderCard();

        expect(screen.getByText("Test Event")).toBeInTheDocument();
        expect(screen.getByText("Test description")).toBeInTheDocument();
        expect(screen.getByText(/3 participants/i)).toBeInTheDocument();
    });

    it("should show 'Ended' when event is past", () => {
        renderCard({
            event: { ...baseEvent, status: "past" }
        });

        expect(screen.getByText(/ended/i)).toBeInTheDocument();
    });

    it("should show join button for non-member", () => {
        renderCard({
            role: null
        });

        expect(screen.getByText(/join the event/i)).toBeInTheDocument();
    });

    it("should show leave button for participant", () => {
        renderCard({
            role: "participant"
        });

        expect(screen.getByText(/leave the event/i)).toBeInTheDocument();
    });

    it("should NOT show leave button for organizer", () => {
        renderCard({
            role: "organizer"
        });

        expect(screen.queryByText(/leave the event/i)).not.toBeInTheDocument();
    });

    it("should show login message when user is not authenticated", () => {
        render(
            <MemoryRouter>
                <EventCard event={baseEvent} user={null} />
            </MemoryRouter>
        );

        expect(screen.getByText(/login to join/i)).toBeInTheDocument();
    });

    it("should NOT show join or leave buttons when event is past", () => {
        renderCard({
            event: { ...baseEvent, status: "past" },
            role: "participant"
        });

        expect(screen.queryByText(/join/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/leave/i)).not.toBeInTheDocument();
    });

    it("should call onJoin when clicking join", () => {
        const onJoin = vi.fn();

        renderCard({
            role: null,
            onJoin
        });

        fireEvent.click(screen.getByText(/join the event/i));

        expect(onJoin).toHaveBeenCalledWith(1);
    });

    it("should call onLeave when clicking leave", () => {
        const onLeave = vi.fn();

        renderCard({
            role: "participant",
            onLeave
        });

        fireEvent.click(screen.getByText(/leave the event/i));

        expect(onLeave).toHaveBeenCalledWith(1);
    });
});