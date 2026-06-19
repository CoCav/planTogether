import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import EventDetailsPage from "../../pages/EventDetailsPage";

import { EVENT_STATUS } from "../../features/shared/constants/eventStatus";

import { createEvent } from "../factories/events/eventFactory";
import { createAuthenticatedUser } from "../factories/users/userFactory";
import {
    createOrganizerMember,
    createCoOrganizerMember,
    createParticipantMember
} from "../factories/eventMemberships/membershipPermissionsFactory";

/* ==================================================
   EVENT DETAILS PAGE TESTS
   Tests single event details page orchestration

   Handles:
   - loading states with contextual feedback
   - empty states
   - page semantic structure
   - event display data rendering
   - event category tag rendering
   - image fallback behavior
   - accessible event image description
   - physical event location map display
   - authenticated and public map lookup behavior
   - selected location coordinate map hydration
   - formatted inline location display
   - formatted provider location labels
   - membership section and ownership transfer integration
   - event action integration
   - event status badge display
   - event availability badges
   - authenticated and guest states
   - started and past event restrictions
   - completed event reviews section display
   - active event reviews section hiding
   - event review summary forwarding

   Notes:
   - mocks API modules
   - mocks authenticated user state
   - mocks extracted event display components
   - mocks react-leaflet dependent map component
   - uses MemoryRouter for route context
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockNavigate = vi.fn();

const mockGetEventById = vi.fn();
const mockGetEventMembers = vi.fn();
const mockGetEventStaff = vi.fn();
const mockTransferEventOwnership = vi.fn();
const mockDeleteEvent = vi.fn();

let mockAuthState = {
    user: createAuthenticatedUser(),
    loading: false
};

const mockEvent = createEvent({
    id: 1,
    title: "Test Event",
    description: "Test description",
    image: "/uploads/events/event-test.png",
    maxParticipants: null,
    status: EVENT_STATUS.UPCOMING,

    location: "Agora du Vieux-Port",
    locationLabel: "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada"
});

/* =============================
   MOCKS
============================= */

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ eventId: "1" })
    };
});

vi.mock("../../features/auth/hooks/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../api/events/eventApi", () => ({
    getEventById: (...args) => mockGetEventById(...args),
    deleteEvent: (...args) => mockDeleteEvent(...args)
}));

vi.mock("../../api/eventMemberships/eventMembershipApi", () => ({
    getEventMembers: (...args) => mockGetEventMembers(...args),
    getEventStaff: (...args) => mockGetEventStaff(...args),
    transferEventOwnership: (...args) => mockTransferEventOwnership(...args)
}));

vi.mock("../../features/events/eventNormalizer", () => ({
    getNormalizedEvent: (response) => response.event
}));

vi.mock("../../features/eventMemberships/eventMembershipNormalizer", () => ({
    getNormalizedMembers: (response) => response.members || [],
    getNormalizedEventStaff: (response) => response.eventStaff || []
}));

vi.mock("../../utils/uploadedFiles", () => ({
    getEventImage: (image) => image || "default-event-image.jpg",
    defaultEventImage: "default-event-image.jpg"
}));

vi.mock("../../components/events/EventDetailsSummary", () => ({
    default: ({
        mode,
        location,
        capacity,
        date,
        time,
        registrationDeadline
    }) => (
        <div data-testid="event-details-summary">
            <span>{mode}</span>

            {location && (
                <span>{location}</span>
            )}

            {capacity && (
                <span>{capacity}</span>
            )}

            <span>{date}</span>
            <span>{time}</span>

            {registrationDeadline && (
                <span>{registrationDeadline}</span>
            )}
        </div>
    )
}));

vi.mock("../../components/events/EventLocationMap", () => ({
    default: ({ location, selectedLocation, isPublic }) => (
        <div data-testid="event-location-map">
            Event map for {location}

            <span>
                {isPublic ? "Public map lookup" : "Authenticated map lookup"}
            </span>

            {selectedLocation && (
                <span>
                    Selected: {selectedLocation.label}
                </span>
            )}
        </div>
    )
}));

vi.mock("../../components/events/EventDetailsActions", () => ({
    default: ({
        eventId,
        canJoin,
        canLeave,
        canEdit,
        canDelete,
        onJoin,
        onLeave,
        onEdit,
        onDelete
    }) => (
        <div data-testid="event-details-actions">
            {canJoin && (
                <button type="button" onClick={() => onJoin(eventId)}>
                    Join the event
                </button>
            )}

            {canLeave && (
                <button type="button" onClick={() => onLeave(eventId)}>
                    Leave the event
                </button>
            )}

            {canEdit && (
                <button type="button" onClick={onEdit}>
                    Edit Event
                </button>
            )}

            {canDelete && (
                <button type="button" onClick={onDelete}>
                    Delete Event
                </button>
            )}
        </div>
    )
}));

vi.mock("../../components/eventMemberships/EventStaffSection", () => ({
    default: ({
        staff,
        staffCount,
        canTransferOwnership,
        onTransferOwnership
    }) => (
        <section data-testid="event-staff-section">
            <span>Staff count: {staffCount}</span>

            {staff.map((person) => (
                <div key={person.id}>
                    <span>{person.name}</span>

                    {canTransferOwnership?.(person) && (
                        <button
                            type="button"
                            onClick={() => onTransferOwnership(person.id)}
                        >
                            Transfer ownership to {person.name}
                        </button>
                    )}
                </div>
            ))}
        </section>
    )
}));

vi.mock("../../components/eventMemberships/EventParticipantsSection", () => ({
    default: ({
        user,
        isPast,
        participants,
        participantCount,
        canTransferOwnership,
        onTransferOwnership
    }) => (
        <section data-testid="event-participants-section">
            <span>Participant count: {participantCount}</span>
            <span>{isPast ? "Past event" : "Active event"}</span>
            <span>{user ? "Authenticated" : "Guest"}</span>

            {participants.map((person) => (
                <div key={person.id}>
                    <span>{person.name}</span>

                    {canTransferOwnership?.(person) && (
                        <button
                            type="button"
                            onClick={() => onTransferOwnership(person.id)}
                        >
                            Transfer ownership to {person.name}
                        </button>
                    )}
                </div>
            ))}
        </section>
    )
}));

vi.mock("../../components/eventReviews/EventReviewsSection", () => ({
    default: ({ reviewLabel }) => (
        <section data-testid="event-reviews-section">
            Event Reviews Section

            {reviewLabel && (
                <span>Review summary: {reviewLabel}</span>
            )}
        </section>
    )
}));

/* =============================
   TEST HELPERS
============================= */

const setupApi = ({
    event = mockEvent,
    staff = [],
    members = []
} = {}) => {
    mockGetEventById.mockResolvedValue({ event });
    mockGetEventStaff.mockResolvedValue({ eventStaff: staff });
    mockGetEventMembers.mockResolvedValue({ members });
};

const renderPage = () =>
    render(
        <MemoryRouter>
            <EventDetailsPage />
        </MemoryRouter>
    );

describe("EventDetailsPage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        mockAuthState = {
            user: createAuthenticatedUser(),
            loading: false
        };

        setupApi();
    });

    /* =============================
       LOADING / EMPTY STATES
    ============================= */

    it("should display loading state initially", () => {
        renderPage();

        expect(screen.getByRole("status")).toHaveTextContent(/loading event details/i);

        expect(screen.getByText(/please wait while we load this event/i)).toBeInTheDocument();
    });

    it("should not load data while auth is loading", () => {
        mockAuthState = {
            user: null,
            loading: true
        };

        renderPage();

        expect(mockGetEventById).not.toHaveBeenCalled();
    });

    it("should show empty state when event is not found", async () => {
        setupApi({
            event: null
        });

        renderPage();

        expect(await screen.findByText(/event not found/i)).toBeInTheDocument();
    });

    it("should show empty state when API fails", async () => {
        mockGetEventById.mockRejectedValue(new Error("API error"));
        mockGetEventStaff.mockResolvedValue({ eventStaff: [] });
        mockGetEventMembers.mockResolvedValue({ members: [] });

        renderPage();

        expect(await screen.findByText(/event not found/i)).toBeInTheDocument();
    });

    /* =============================
       PAGE STRUCTURE
    ============================= */

    it("should render accessible heading hierarchy", async () => {
        renderPage();

        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: "Event details"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: "Test Event"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                level: 3,
                name: /about this event/i
            })
        ).toBeInTheDocument();
    });

    it("should render the event categories section", async () => {
        renderPage();

        expect(await screen.findByLabelText(/event categories/i)).toBeInTheDocument();
    });

    it("should render event reviews section for past events", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                status: EVENT_STATUS.PAST
            })
        });

        renderPage();

        expect(await screen.findByTestId("event-reviews-section")).toBeInTheDocument();
    });

    it("should hide event reviews section for upcoming events", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                status: EVENT_STATUS.UPCOMING
            })
        });

        renderPage();

        await screen.findByText("Test Event");

        expect(screen.queryByTestId("event-reviews-section")).not.toBeInTheDocument();
    });

    it("should forward review summary to event reviews section", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                status: EVENT_STATUS.PAST,
                reviewCount: 2,
                averageRating: 4.5
            })
        });

        renderPage();

        expect(await screen.findByText("Review summary: 4.5 ★ (2 reviews)")).toBeInTheDocument();
    });

    /* =============================
       EVENT DISPLAY DATA
    ============================= */

    it("should display event details", async () => {
        setupApi({
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                })
            ],
            members: [
                createParticipantMember({
                    id: 2,
                    name: "Alice"
                })
            ]
        });

        renderPage();

        expect(await screen.findByText("Test Event")).toBeInTheDocument();
        expect(screen.getByText("Test description")).toBeInTheDocument();

        expect(screen.getByTestId("event-details-summary")).toBeInTheDocument();
        expect(screen.getByText("In person")).toBeInTheDocument();
        expect(screen.getByText(
            "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada"
        )).toBeInTheDocument();
    });

    it("should display event category tags", async () => {
        renderPage();

        expect(await screen.findByLabelText(/event categories/i)).toBeInTheDocument();

        expect(screen.getByText(/type:/i)).toBeInTheDocument();
        expect(screen.getByText(/theme:/i)).toBeInTheDocument();
    });

    it("should use fallback display values when event data is missing", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                description: "",
                type: "",
                theme: "",
                location: ""
            })
        });

        renderPage();

        expect(await screen.findByText("No description provided.")).toBeInTheDocument();

        const summary = screen.getByTestId("event-details-summary");

        expect(summary).toBeInTheDocument();
    });

    it("should display formatted inline location label", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                location: "Agora du Vieux-Port",
                locationLabel:
                    "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada"
            })
        });

        renderPage();

        expect(await screen.findByText(
            "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada"
        )).toBeInTheDocument();
    });

    it("should hide location in summary for online events", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                mode: "online",
                location: null
            })
        });

        renderPage();

        expect(await screen.findByTestId("event-details-summary")).toBeInTheDocument();

        expect(screen.getByText("Online")).toBeInTheDocument();

        expect(screen.queryByText("Montreal")).not.toBeInTheDocument();
    });

    it("should pass formatted display data to EventDetailsSummary", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                participantCount: 3,
                maxParticipants: 10,
                registrationDeadline: "2026-12-19T12:00:00.000Z"
            })
        });

        renderPage();

        expect(await screen.findByTestId("event-details-summary")).toBeInTheDocument();

        expect(screen.getByText("3 / 10")).toBeInTheDocument();
        expect(screen.getByText("In person")).toBeInTheDocument();
        expect(screen.getByText(
            "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada"
        )).toBeInTheDocument();
    });

    it("should display staff and participant data", async () => {
        setupApi({
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                })
            ],
            members: [
                createParticipantMember({
                    id: 2,
                    name: "Alice"
                })
            ]
        });

        renderPage();

        expect(await screen.findByText("John")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    /* =============================
       MEMBERSHIP SECTIONS
    ============================= */

    it("should allow organizer to transfer ownership to a co-organizer from staff section", async () => {
        const user = userEvent.setup();

        setupApi({
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                }),
                createCoOrganizerMember({
                    id: 2,
                    name: "Alice"
                })
            ]
        });

        vi.spyOn(window, "confirm").mockReturnValue(true);
        mockTransferEventOwnership.mockResolvedValue({});

        renderPage();

        await user.click(
            await screen.findByRole("button", {
                name: "Transfer ownership to Alice"
            })
        );

        await waitFor(() => {
            expect(mockTransferEventOwnership).toHaveBeenCalledWith("1", 2);
        });
    });

    it("should allow organizer to transfer ownership to a participant from participants section", async () => {
        const user = userEvent.setup();

        setupApi({
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                })
            ],
            members: [
                createParticipantMember({
                    id: 2,
                    name: "Alice"
                })
            ]
        });

        vi.spyOn(window, "confirm").mockReturnValue(true);
        mockTransferEventOwnership.mockResolvedValue({});

        renderPage();

        await user.click(
            await screen.findByRole("button", {
                name: "Transfer ownership to Alice"
            })
        );

        await waitFor(() => {
            expect(mockTransferEventOwnership).toHaveBeenCalledWith("1", 2);
        });
    });

    /* =============================
       EVENT IMAGE
    ============================= */

    it("should display event image", async () => {
        renderPage();

        const image = await screen.findByAltText("Event cover for Test Event");

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "/uploads/events/event-test.png");
        expect(image).toHaveClass("event-details-image");
    });

    it("should expose accessible event image description", async () => {
        renderPage();

        expect(await screen.findByAltText(
            "Event cover for Test Event"
        )).toBeInTheDocument();
    });

    it("should display default event image when event has no image", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                image: null
            })
        });

        renderPage();

        const image = await screen.findByAltText("Event cover for Test Event");

        expect(image).toHaveAttribute("src", "default-event-image.jpg");
    });

    it("should fall back to default event image when image fails to load", async () => {
        renderPage();

        const image = await screen.findByAltText("Event cover for Test Event");

        fireEvent.error(image);

        expect(image).toHaveAttribute("src", "default-event-image.jpg");
    });

    /* =============================
       EVENT LOCATION MAP
    ============================= */

    it("should display event location map for physical events with location", async () => {
        renderPage();

        expect(await screen.findByText("Test Event")).toBeInTheDocument();

        expect(screen.getByRole("heading", {
            level: 3,
            name: /event location/i
        })).toBeInTheDocument();

        expect(screen.getByText("View this event on the map.")).toBeInTheDocument();

        expect(screen.getByTestId("event-location-map")).toHaveTextContent(
            "Event map for Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada"
        );
    });

    it("should not display event location map for online events", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                mode: "online",
                location: "Montreal"
            })
        });

        renderPage();

        expect(await screen.findByTestId("event-details-summary")).toBeInTheDocument();

        expect(screen.queryByTestId("event-location-map")).not.toBeInTheDocument();

        expect(screen.queryByRole("heading", {
            level: 3,
            name: /event location/i
        })).not.toBeInTheDocument();
    });


    it("should pass selected location coordinates to EventLocationMap", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                location: "Central Park, New York, USA",
                locationLabel: "Central Park, New York, USA",
                latitude: 40.785091,
                longitude: -73.968285
            })
        });

        renderPage();

        expect(await screen.findByTestId("event-location-map")).toBeInTheDocument();

        expect(screen.getByText("Selected: Central Park, New York, USA")).toBeInTheDocument();
    });

    it("should use authenticated map lookup for authenticated users", async () => {
        renderPage();

        expect(await screen.findByTestId("event-location-map")).toHaveTextContent("Authenticated map lookup");
    });

    it("should use public map lookup for guest users", async () => {
        mockAuthState = {
            user: null,
            loading: false
        };

        renderPage();

        expect(await screen.findByTestId("event-location-map")).toHaveTextContent("Public map lookup");
    });

    /* =============================
       EVENT ACTIONS
    ============================= */

    it("should show edit and delete actions for organizer on active event", async () => {
        setupApi({
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                })
            ]
        });

        renderPage();

        expect(await screen.findByRole("button", {
            name: /edit event/i
        })).toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: /delete event/i
        })).toBeInTheDocument();
    });

    it("should allow edit but hide delete action for started event", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                startDateTime: "2026-01-01T00:00:00.000Z"
            }),
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                })
            ]
        });

        renderPage();

        expect(await screen.findByRole("button", {
            name: /edit event/i
        })).toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /delete event/i
        })).not.toBeInTheDocument();
    });

    it("should navigate to edit page when clicking Edit Event", async () => {
        const user = userEvent.setup();

        setupApi({
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                })
            ]
        });

        renderPage();

        await user.click(await screen.findByRole("button", {
            name: /edit event/i
        }));

        expect(mockNavigate).toHaveBeenCalledWith("/events/1/edit");
    });

    it("should delete event and redirect", async () => {
        const user = userEvent.setup();

        vi.spyOn(window, "confirm").mockReturnValue(true);

        setupApi({
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                })
            ]
        });

        mockDeleteEvent.mockResolvedValue({});

        renderPage();

        await user.click(await screen.findByRole("button", {
            name: /delete event/i
        }));

        await waitFor(() => {
            expect(mockDeleteEvent).toHaveBeenCalledWith("1");
        });

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("should not delete event when deletion is cancelled", async () => {
        const user = userEvent.setup();

        vi.spyOn(window, "confirm").mockReturnValue(false);

        setupApi({
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                })
            ]
        });

        renderPage();

        await user.click(await screen.findByRole("button", {
            name: /delete event/i
        }));

        expect(mockDeleteEvent).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalledWith("/events");
    });

    it("should show error when deleting event fails", async () => {
        const user = userEvent.setup();

        vi.spyOn(window, "confirm").mockReturnValue(true);

        setupApi({
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                })
            ]
        });

        mockDeleteEvent.mockRejectedValue(new Error("API error"));

        renderPage();

        await user.click(await screen.findByRole("button", {
            name: /delete event/i
        }));

        expect(await screen.findByText(/api error/i)).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalledWith("/events");
    });

    it("should show leave action for authenticated participant", async () => {
        setupApi({
            members: [
                createParticipantMember({
                    id: 1,
                    name: "John"
                })
            ]
        });

        renderPage();

        expect(await screen.findByRole("button", { name: /leave the event/i })).toBeInTheDocument();
    });

    /* =============================
       EVENT STATUS
    ============================= */

    it("should display ended status badge for past event", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                status: EVENT_STATUS.PAST
            }),
            staff: [
                createOrganizerMember({
                    id: 1,
                    name: "John"
                })
            ]
        });

        renderPage();

        expect(await screen.findByText("Ended")).toBeInTheDocument();
        expect(screen.queryByText("Upcoming")).not.toBeInTheDocument();
        expect(screen.queryByText("Ongoing")).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /edit event/i
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /delete event/i
        })).not.toBeInTheDocument();
    });

    it("should show full state when event has reached participant limit", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                participantCount: 10,
                maxParticipants: 10
            })
        });

        renderPage();

        expect(await screen.findByText("Event full")).toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: /join the event/i
        })).not.toBeInTheDocument();
    });

    it("should display upcoming status badge", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                status: EVENT_STATUS.UPCOMING
            })
        });

        renderPage();

        expect(await screen.findByText("Upcoming")).toBeInTheDocument();
    });

    it("should display ongoing status badge", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                status: EVENT_STATUS.ONGOING
            })
        });

        renderPage();

        expect(await screen.findByText("Ongoing")).toBeInTheDocument();

    });

    it("should display registration closed badge", async () => {
        setupApi({
            event: createEvent({
                ...mockEvent,
                registrationDeadline: "2020-01-01T00:00:00.000Z"
            })
        });

        renderPage();

        expect(await screen.findByText("Registration closed")).toBeInTheDocument();
    });

    /* =============================
       AUTH STATE
    ============================= */

    it("should show guest participation prompt on active event", async () => {
        mockAuthState = {
            user: null,
            loading: false
        };

        renderPage();

        expect(await screen.findByText(/Login to join events and manage your participation/i)).toBeInTheDocument();
    });

    it("should not show login prompt for authenticated user", async () => {
        renderPage();

        await screen.findByText("Test Event");

        expect(screen.queryByText(/login to join events and manage your participation/i)).not.toBeInTheDocument();
    });
});
