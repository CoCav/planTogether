import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCard from "../../../components/events/EventCard";

/* ==================================================
   EVENT CARD TESTS
   Tests event preview rendering, permissions and actions
================================================== */

vi.mock("../../../utils/format", () => ({
    formatEventDateRange: () => "Apr 24",
    formatTime: () => "10:00",
    formatCount: (count) => `${count} participants`
}));

vi.mock("../../../utils/getUploadedFile.js", () => ({
    getEventImage: vi.fn((image) => image || "event_image_per_default.jpg"),
    defaultEventImage: "event_image_per_default.jpg"
}));

const baseEvent = {
    id: 1,
    title: "Test Event",
    description: "Test description",
    startDateTime: "2026-04-24T10:00:00Z",
    endDateTime: "2026-04-24T12:00:00Z",
    participantCount: 3,
    mode: "online",
    creatorName: "Alice",
    status: "upcoming",
    image: "/uploads/events/event-test.png"
};

const renderCard = (props = {}) =>
    render(
        <MemoryRouter>
            <EventCard
                event={{
                    ...baseEvent,
                    ...(props.event || {})
                }}
                user={props.user === undefined ? { userId: 1 } : props.user}
                role={props.role}
                onJoin={props.onJoin}
                onLeave={props.onLeave}
            />
        </MemoryRouter>
    );

describe("EventCard", () => {
    it("displays event information", () => {
        renderCard();

        expect(screen.getByText("Test Event")).toBeInTheDocument();
        expect(screen.getByText("Test description")).toBeInTheDocument();
        expect(screen.getByText(/3 participants/i)).toBeInTheDocument();
        expect(screen.getByText(/online/i)).toBeInTheDocument();
    });

    it("displays event image", () => {
        renderCard();

        const image = screen.getByAltText("Test Event");

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "/uploads/events/event-test.png");
        expect(image).toHaveClass("event-card-image");
    });

    it("displays default event image when event has no image", () => {
        renderCard({
            event: {
                image: null
            }
        });

        const image = screen.getByAltText("Test Event");

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "event_image_per_default.jpg");
    });

    it("shows ended label when event is past", () => {
        renderCard({
            event: {
                status: "past"
            }
        });

        expect(screen.getByText(/ended/i)).toBeInTheDocument();
    });

    it("falls back to default event image when image fails to load", () => {
        renderCard({
            event: {
                ...baseEvent,
                image: "/uploads/events/missing.png"
            }
        });

        const image = screen.getByAltText("Test Event");

        fireEvent.error(image);

        expect(image.src).toContain("event_image_per_default.jpg");
    });

    it("shows join button for authenticated non-member", () => {
        renderCard({
            role: null
        });

        expect(screen.getByRole("button", { name: /join the event/i })).toBeInTheDocument();
    });

    it("does not show join button for organizer", () => {
        renderCard({
            role: "organizer"
        });

        expect(screen.queryByRole("button", { name: /join the event/i })).not.toBeInTheDocument();
    });

    it("does not show join button for co-organizer", () => {
        renderCard({
            role: "co_organizer"
        });

        expect(screen.queryByRole("button", { name: /join the event/i })).not.toBeInTheDocument();
    });

    it("shows leave button for participant", () => {
        renderCard({
            role: "participant"
        });

        expect(screen.getByRole("button", { name: /leave the event/i })).toBeInTheDocument();
    });

    it("does not show leave button for organizer", () => {
        renderCard({
            role: "organizer"
        });

        expect(screen.queryByRole("button", { name: /leave the event/i })).not.toBeInTheDocument();
    });

    it("shows login message when user is not authenticated", () => {
        renderCard({
            user: null,
            role: null
        });

        expect(screen.getByText(/login to join/i)).toBeInTheDocument();
    });

    it("does not show join or leave buttons when event is past", () => {
        renderCard({
            event: {
                status: "past"
            },
            role: "participant"
        });

        expect(screen.queryByRole("button", { name: /join the event/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /leave the event/i })).not.toBeInTheDocument();
    });

    it("calls onJoin when clicking join", () => {
        const onJoin = vi.fn();

        renderCard({
            role: null,
            onJoin
        });

        fireEvent.click(screen.getByRole("button", { name: /join the event/i }));

        expect(onJoin).toHaveBeenCalledWith(1);
    });

    it("calls onLeave when clicking leave", () => {
        const onLeave = vi.fn();

        renderCard({
            role: "participant",
            onLeave
        });

        fireEvent.click(screen.getByRole("button", { name: /leave the event/i }));

        expect(onLeave).toHaveBeenCalledWith(1);
    });

    it("shows full state when event has reached participant limit", () => {
        renderCard({
            event: {
                maxParticipants: 3,
                participantCount: 3
            }
        });

        expect(screen.getByRole("button", { name: /event full/i })).toBeDisabled();
        expect(screen.getByText("👥 3 / 3")).toHaveClass("text-danger");
    });

    it("shows full state without hiding participant leave action", () => {
        renderCard({
            role: "participant",
            event: {
                maxParticipants: 3,
                participantCount: 3
            }
        });

        expect(screen.getByRole("button", { name: /event full/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /leave the event/i })).toBeInTheDocument();
    });
});
