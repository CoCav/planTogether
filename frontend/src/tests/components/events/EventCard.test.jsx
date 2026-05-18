import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCard from "../../../components/events/EventCard";

import { EVENT_ROLES } from "../../../features/shared/eventRoles";
import { EVENT_STATUS } from "../../../features/shared/eventStatus";
import { EVENT_MODES } from "../../../features/shared/eventModes";

import { createEvent } from "../../factories/events/eventFactory";

/* ==================================================
   EVENT CARD TESTS
   Tests event preview rendering, permissions and actions

   Handles:
   - event information rendering
   - event image rendering and fallback
   - event type badge display
   - fallback description display
   - join and leave action visibility
   - guest login prompt
   - past event state
   - participant limit state
   - join and leave callbacks

   Notes:
   - uses reusable event render helper
   - mocks formatter utilities
   - mocks uploaded file utilities
================================================== */

vi.mock("../../../utils/formatters", () => ({
    formatEventDateRange: () => "Apr 24",
    formatTime: () => "10:00",
    formatCount: (count) => `${count} participants`
}));

vi.mock("../../../utils/uploadedFiles", () => ({
    getEventImage: vi.fn((image) => image || "event_image_per_default.jpg"),
    defaultEventImage: "event_image_per_default.jpg"
}));

const baseEvent = createEvent({
    description: "Test description",
    participantCount: 3,
    mode: EVENT_MODES.ONLINE,
    creatorName: "Alice",
    image: "/uploads/events/event-test.png",
    maxParticipants: null,
    registrationDeadline: null
});

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

    /* =============================
       EVENT INFORMATION
    ============================= */

    it("displays event information", () => {
        renderCard();

        expect(screen.getByText("Test Event")).toBeInTheDocument();
        expect(screen.getByText("Test description")).toBeInTheDocument();
        expect(screen.getByText(/3 participants/i)).toBeInTheDocument();
        expect(screen.getByText(/online/i)).toBeInTheDocument();
    });

    it("displays event type badge when event has a type", () => {
        renderCard({
            event: {
                type: "workshop"
            }
        });

        expect(screen.getByText("workshop")).toHaveClass("event-type-badge");
    });

    it("displays fallback description when event has no description", () => {
        renderCard({
            event: {
                description: ""
            }
        });

        expect(screen.getByText("No description provided.")).toBeInTheDocument();
    });

    /* =============================
       EVENT IMAGE
    ============================= */

    it("displays event image", () => {
        renderCard();

        const image = screen.getByAltText("Event cover for Test Event");

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

        const image = screen.getByAltText("Event cover for Test Event");

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "event_image_per_default.jpg");
    });

    it("falls back to default event image when image fails to load", () => {
        renderCard({
            event: {
                ...baseEvent,
                image: "/uploads/events/missing.png"
            }
        });

        const image = screen.getByAltText("Event cover for Test Event");

        fireEvent.error(image);

        expect(image.src).toContain("event_image_per_default.jpg");
    });

    /* =============================
       JOIN EVENT
    ============================= */

    it("shows join button for authenticated non-member", () => {
        renderCard({
            role: null
        });

        expect(screen.getByRole("button", { name: /join the event/i })).toBeInTheDocument();
    });

    it("does not show join button for organizer", () => {
        renderCard({
            role: EVENT_ROLES.ORGANIZER
        });

        expect(screen.queryByRole("button", { name: /join the event/i })).not.toBeInTheDocument();
    });

    it("does not show join button for co-organizer", () => {
        renderCard({
            role: EVENT_ROLES.CO_ORGANIZER
        });

        expect(screen.queryByRole("button", { name: /join the event/i })).not.toBeInTheDocument();
    });

    /* =============================
       LEAVE EVENT
    ============================= */

    it("shows leave button for participant", () => {
        renderCard({
            role: EVENT_ROLES.PARTICIPANT
        });

        expect(screen.getByRole("button", { name: /leave the event/i })).toBeInTheDocument();
    });

    it("does not show leave button for organizer", () => {
        renderCard({
            role: EVENT_ROLES.ORGANIZER
        });

        expect(screen.queryByRole("button", { name: /leave the event/i })).not.toBeInTheDocument();
    });

    /* =============================
       GUEST STATE
    ============================= */

    it("shows login message when user is not authenticated", () => {
        renderCard({
            user: null,
            role: null
        });

        expect(screen.getByText(/login to join/i)).toBeInTheDocument();
    });

    /* =============================
       PAST EVENT STATE
    ============================= */

    it("shows ended label when event is past", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.PAST
            }
        });

        expect(screen.getByText(/ended/i)).toBeInTheDocument();
    });

    it("does not show join or leave buttons when event is past", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.PAST
            },
            role: EVENT_ROLES.PARTICIPANT
        });

        expect(screen.queryByRole("button", { name: /join the event/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /leave the event/i })).not.toBeInTheDocument();
    });

    /* =============================
       ACTION CALLBACKS
    ============================= */

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
            role: EVENT_ROLES.PARTICIPANT,
            onLeave
        });

        fireEvent.click(screen.getByRole("button", { name: /leave the event/i }));

        expect(onLeave).toHaveBeenCalledWith(1);
    });

    /* =============================
       EVENT FULL STATE
    ============================= */

    it("shows full state when event has reached participant limit", () => {
        renderCard({
            event: {
                maxParticipants: 3,
                participantCount: 3
            }
        });

        expect(screen.getByRole("button", { name: /event full/i })).toBeDisabled();
        expect(screen.getByText("3 / 3").closest("li")).toHaveClass("text-danger");
    });

    it("shows leave action without full state for participants already in the event", () => {
        renderCard({
            role: EVENT_ROLES.PARTICIPANT,
            event: {
                maxParticipants: 3,
                participantCount: 3
            }
        });

        expect(
            screen.getByRole("button", {
                name: /leave the event/i
            })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("button", {
                name: /event full/i
            })
        ).not.toBeInTheDocument();
    });
});
