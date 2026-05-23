import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventCard from "../../../components/events/EventCard";

import { EVENT_MODES } from "../../../features/shared/constants/eventModes";
import { EVENT_ROLES } from "../../../features/shared/constants/eventRoles";
import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

import { createEvent } from "../../factories/events/eventFactory";

/* ==================================================
   EVENT CARD TESTS
   Tests event preview rendering, permissions and actions

   Handles:
   - event information rendering
   - event image rendering and fallback
   - role and type badge display
   - fallback display values
   - join and leave action visibility
   - guest login prompt
   - past event state
   - participant limit state
   - join and leave callbacks
   - accessible image links
   - accessible event labels
   - accessible ended status
   - decorative icon accessibility

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

describe("EventCard", () => {

    /* =============================
       TEST DATA
    ============================= */

    const baseEvent = createEvent({
        description: "Test description",
        participantCount: 3,
        mode: EVENT_MODES.ONLINE,
        creatorName: "Alice",
        image: "/uploads/events/event-test.png",
        maxParticipants: null,
        registrationDeadline: null
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const renderCard = (props = {}) => {
        return render(
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
    };

    /* =============================
       EVENT INFORMATION
    ============================= */

    it("should display event information", () => {
        renderCard();

        expect(screen.getByText("Test Event")).toBeInTheDocument();
        expect(screen.getByText("Test description")).toBeInTheDocument();
        expect(screen.getByText("3 participants")).toBeInTheDocument();
        expect(screen.getByText("Apr 24")).toBeInTheDocument();
        expect(screen.getByText("10:00 → 10:00")).toBeInTheDocument();
        expect(screen.getByText("Online")).toBeInTheDocument();
    });

    it("should display event type badge when event has a type", () => {
        renderCard({
            event: {
                type: "workshop"
            }
        });

        expect(screen.getByText("workshop")).toHaveClass("event-card-type-badge");
    });

    it("should display fallback title when event has no title", () => {
        renderCard({
            event: {
                title: ""
            }
        });

        expect(screen.getByText("No title provided.")).toBeInTheDocument();
    });

    it("should display fallback description when event has no description", () => {
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

    it("should display event image", () => {
        renderCard();

        const image = screen.getByAltText("Event cover for Test Event");

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "/uploads/events/event-test.png");
        expect(image).toHaveClass("event-card-image");
    });

    it("should expose accessible image link label", () => {
        renderCard();

        expect(screen.getByRole("link", {
            name: /view details for test event/i
        })).toBeInTheDocument();
    });

    it("should display default event image when event has no image", () => {
        renderCard({
            event: {
                image: null
            }
        });

        const image = screen.getByAltText("Event cover for Test Event");

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "event_image_per_default.jpg");
    });

    it("should fall back to default event image when image fails to load", () => {
        renderCard({
            event: {
                image: "/uploads/events/missing.png"
            }
        });

        const image = screen.getByAltText("Event cover for Test Event");

        fireEvent.error(image);

        expect(image.src).toContain("event_image_per_default.jpg");
    });

    /* =============================
       ROLE / BADGES
    ============================= */

    it("should display organizer badge when current user is not organizer", () => {
        renderCard({
            role: null
        });

        expect(screen.getByText("👑 Alice")).toBeInTheDocument();
    });

    it("should expose event labels group", () => {
        renderCard();

        expect(screen.getByLabelText(/event labels/i)).toBeInTheDocument();
    });

    it("should hide inline organizer badge when current user is organizer", () => {
        renderCard({
            role: EVENT_ROLES.ORGANIZER
        });

        expect(screen.queryByText("👑 Alice")).not.toBeInTheDocument();
    });

    it("should display current user role badge", () => {
        renderCard({
            role: EVENT_ROLES.PARTICIPANT
        });

        expect(screen.getByText("👤 Participant")).toBeInTheDocument();
    });

    /* =============================
       JOIN EVENT
    ============================= */

    it("should show join button for authenticated non-member", () => {
        renderCard({
            role: null
        });

        expect(screen.getByRole("button", {
            name: /join the event/i
        })).toBeInTheDocument();
    });

    it("should not show join button for organizer", () => {
        renderCard({
            role: EVENT_ROLES.ORGANIZER
        });

        expect(screen.queryByRole("button", {
            name: /join the event/i
        })).not.toBeInTheDocument();
    });

    it("should not show join button for co-organizer", () => {
        renderCard({
            role: EVENT_ROLES.CO_ORGANIZER
        });

        expect(screen.queryByRole("button", {
            name: /join the event/i
        })).not.toBeInTheDocument();
    });

    /* =============================
       LEAVE EVENT
    ============================= */

    it("should show leave button for participant", () => {
        renderCard({
            role: EVENT_ROLES.PARTICIPANT
        });

        expect(screen.getByRole("button", {
            name: /leave the event/i
        })).toBeInTheDocument();
    });

    it("should not show leave button for organizer", () => {
        renderCard({
            role: EVENT_ROLES.ORGANIZER
        });

        expect(screen.queryByRole("button", {
            name: /leave the event/i
        })).not.toBeInTheDocument();
    });

    /* =============================
       GUEST STATE
    ============================= */

    it("should show login message when user is not authenticated", () => {
        renderCard({
            user: null,
            role: null
        });

        expect(screen.getByText(/login to join/i)).toBeInTheDocument();
    });

    /* =============================
       PAST EVENT STATE
    ============================= */

    it("should show ended label when event is past", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.PAST
            }
        });

        expect(screen.getByText(/ended/i)).toBeInTheDocument();
    });

    it("should expose accessible ended status label", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.PAST
            }
        });

        expect(screen.getByLabelText(/event ended/i)).toBeInTheDocument();
    });

    it("should not show join or leave buttons when event is past", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.PAST
            },
            role: EVENT_ROLES.PARTICIPANT
        });

        expect(screen.queryByRole("button", {
            name: /join the event/i
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /leave the event/i
        })).not.toBeInTheDocument();
    });

    /* =============================
       EVENT FULL STATE
    ============================= */

    it("should show full state when event has reached participant limit", () => {
        renderCard({
            event: {
                maxParticipants: 3,
                participantCount: 3
            }
        });

        expect(screen.getByRole("button", {
            name: /event full/i
        })).toBeDisabled();

        expect(screen.getByText("3 / 3").closest("li")).toHaveClass("text-danger");
    });

    it("should show leave action without full state for participants already in the event", () => {
        renderCard({
            role: EVENT_ROLES.PARTICIPANT,
            event: {
                maxParticipants: 3,
                participantCount: 3
            }
        });

        expect(screen.getByRole("button", {
            name: /leave the event/i
        })).toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /event full/i
        })).not.toBeInTheDocument();
    });

    /* =============================
       ACTION CALLBACKS
    ============================= */

    it("should call onJoin when clicking join", () => {
        const onJoin = vi.fn();

        renderCard({
            role: null,
            onJoin
        });

        fireEvent.click(screen.getByRole("button", {
            name: /join the event/i
        }));

        expect(onJoin).toHaveBeenCalledWith(1);
    });

    it("should call onLeave when clicking leave", () => {
        const onLeave = vi.fn();

        renderCard({
            role: EVENT_ROLES.PARTICIPANT,
            onLeave
        });

        fireEvent.click(screen.getByRole("button", {
            name: /leave the event/i
        }));

        expect(onLeave).toHaveBeenCalledWith(1);
    });
});
