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
   Tests event preview rendering, badges and actions

   Handles:
   - event information rendering
   - event image rendering and fallback
   - event badge rendering
   - membership action visibility
   - event like toggle rendering
   - like count display
   - completed event review summary
   - event full and registration closed states
   - join and leave callbacks
   - public profile navigation
   - accessible links, labels and images

   Notes:
   - uses reusable event render helper
   - mocks formatter utilities
   - mocks uploaded file utilities
   - completed events display review summary instead of membership actions
   - event like behavior is delegated to EventLikeToggle
================================================== */

vi.mock("../../../utils/formatters", () => ({
    formatEventDateRange: () => "Apr 24",
    formatTime: () => "10:00",
    formatCount: (count, singular) => `${count} ${count === 1 ? singular : `${singular}s`}`
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
        registrationDeadline: null,
        likesCount: 4,
        isLikedByCurrentUser: false,
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
                    toast={props.toast}
                    onLikeChange={props.onLikeChange}
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

    it("should expose generic event image alt text when title is missing", () => {
        renderCard({
            event: {
                title: ""
            }
        });

        expect(screen.getByAltText("Event cover for No title provided.")).toBeInTheDocument();
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

        expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    it("should expose event labels group", () => {
        renderCard();

        expect(screen.getByLabelText(/event labels/i)).toBeInTheDocument();
    });

    it("should hide inline organizer badge when current user is organizer", () => {
        renderCard({
            role: EVENT_ROLES.ORGANIZER
        });

        expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    });

    it("should display current user role badge", () => {
        renderCard({
            role: EVENT_ROLES.PARTICIPANT
        });

        expect(screen.getByText("Participant")).toBeInTheDocument();
    });

    it("should display status badge for upcoming event", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.UPCOMING
            }
        });

        expect(screen.getByText("Upcoming")).toHaveClass("badge-label");
    });

    it("should display status badge for ongoing event", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.ONGOING
            }
        });

        expect(screen.getByText("Ongoing")).toHaveClass("badge-label");
    });

    it("should link organizer badge to the public user profile", () => {
        renderCard({
            role: null,
            event: {
                creatorId: 42,
                creatorName: "Alice"
            }
        });

        expect(screen.getByRole("link", {
            name: /alice/i
        })).toHaveAttribute("href", "/users/42");
    });

    it("should render organizer badge without profile link when creator id is missing", () => {
        renderCard({
            role: null,
            event: {
                creatorId: null,
                creatorName: "Alice"
            }
        });

        expect(screen.getByText("Alice")).toBeInTheDocument();

        expect(screen.queryByRole("link", {
            name: /alice/i
        })).not.toBeInTheDocument();
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
       PAST EVENT STATE
    ============================= */

    it("should display ended status badge when event is past", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.PAST
            }
        });

        expect(screen.getByText("Ended")).toHaveClass("badge-label");
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

    it("should display review summary when event is past and has reviews", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.PAST,
                reviewCount: 2,
                averageRating: 4.5
            }
        });

        expect(screen.getByLabelText("Event review summary")).toHaveTextContent("4.5 ★ (2 reviews)");
    });

    it("should display empty review summary when past event has no reviews", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.PAST,
                reviewCount: 0,
                averageRating: null
            }
        });

        expect(screen.getByLabelText("Event review summary")).toHaveTextContent("No reviews yet");
    });

    it("should not display review summary when event is not past", () => {
        renderCard({
            event: {
                status: EVENT_STATUS.UPCOMING,
                reviewCount: 2,
                averageRating: 4.5
            }
        });

        expect(screen.queryByLabelText("Event review summary")).not.toBeInTheDocument();
    });

    /* =============================
       EVENT FULL STATE
    ============================= */

    it("should display event full badge when event has reached participant limit", () => {
        renderCard({
            event: {
                maxParticipants: 3,
                participantCount: 3
            }
        });

        expect(screen.getByText("Event full")).toHaveClass("badge-label");
        expect(screen.getByText("3 / 3").closest("li")).toHaveClass("text-danger");
    });

    it("should show leave action and full badge for participants already in a full event", () => {
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

        expect(screen.getByText("Event full")).toHaveClass("badge-label");
    });

    /* =============================
       REGISTRATION CLOSED STATE
    ============================= */

    it("should display registration closed badge when registration deadline has passed", () => {
        renderCard({
            event: {
                registrationDeadline: "2000-01-01T00:00:00.000Z"
            }
        });

        expect(screen.getByText("Registration closed")).toHaveClass("badge-label");
    });

    /* =============================
       EVENT LIKES
    ============================= */

    it("should display event like count", () => {
        renderCard({
            event: {
                likesCount: 7,
                isLikedByCurrentUser: false
            }
        });

        expect(screen.getByRole("button", {
            name: /like event\. 7 likes/i
        })).toBeInTheDocument();
    });

    it("should display liked event state", () => {
        renderCard({
            event: {
                likesCount: 8,
                isLikedByCurrentUser: true
            }
        });

        expect(screen.getByRole("button", {
            name: /unlike event\. 8 likes/i
        })).toBeInTheDocument();
    });

    it("should forward like change handler to like toggle", () => {
        const onLikeChange = vi.fn();

        renderCard({
            onLikeChange
        });

        expect(screen.getByRole("button", {
            name: /like event\. 4 likes/i
        })).toBeInTheDocument();
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

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should expose accessible image link label", () => {
        renderCard();

        expect(screen.getByRole("link", {
            name: /view details for test event/i
        })).toBeInTheDocument();
    });

    it("should expose accessible event details list", () => {
        renderCard();

        expect(screen.getByLabelText(/event details/i)).toBeInTheDocument();
    });

    it("should expose accessible event cover image", () => {
        renderCard();

        expect(screen.getByAltText("Event cover for Test Event")).toBeInTheDocument();
    });
});
