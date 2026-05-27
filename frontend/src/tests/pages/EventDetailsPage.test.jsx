import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import EventDetailsPage from "../../pages/EventDetailsPage";

import { EVENT_ROLES } from "../../features/shared/constants/eventRoles";
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
   - loading and empty states
   - page semantic structure
   - event display data rendering
   - image fallback behavior
   - accessible event image description
   - membership section and ownership transfer integration
   - event action integration
   - event status badge display
   - authenticated and guest states
   - started and past event restrictions

   Notes:
   - mocks API modules
   - mocks authenticated user state
   - mocks extracted event display components
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
    status: EVENT_STATUS.UPCOMING
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
        type,
        theme,
        mode,
        location,
        capacity,
        date,
        time,
        registrationDeadline
    }) => (
        <div data-testid="event-details-summary">
            <span>{type}</span>
            <span>{theme}</span>
            <span>{mode}</span>
            <span>{location}</span>
            {capacity && <span>{capacity}</span>}
            <span>{date}</span>
            <span>{time}</span>
            {registrationDeadline && <span>{registrationDeadline}</span>}
        </div>
    )
}));

vi.mock("../../components/events/EventDetailsActions", () => ({
    default: ({
        eventId,
        isPast,
        canJoin,
        canLeave,
        canEdit,
        canDelete,
        showEventFullButton,
        showRegistrationClosedButton,
        showLoginPrompt,
        onJoin,
        onLeave,
        onEdit,
        onDelete
    }) => (
        <div data-testid="event-details-actions">
            {isPast && <span>Ended</span>}

            {showEventFullButton && (
                <button type="button" disabled>
                    Event full
                </button>
            )}

            {canJoin && (
                <button type="button" onClick={() => onJoin(eventId)}>
                    Join the event
                </button>
            )}

            {showRegistrationClosedButton && (
                <button type="button" disabled>
                    Registration closed
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

            {showLoginPrompt && <span>Login to join this event.</span>}
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

        expect(
            screen.getByText(/loading event details/i)
        ).toBeInTheDocument();
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

    it("should render page heading and event title hierarchy", async () => {
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
        expect(screen.getByText("Meetup")).toBeInTheDocument();
        expect(screen.getByText("Tech")).toBeInTheDocument();
        expect(screen.getByText("In person")).toBeInTheDocument();
        expect(screen.getByText("Montreal")).toBeInTheDocument();
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
        expect(screen.getByText("No description provided.")).toBeInTheDocument();

        const summary = screen.getByTestId("event-details-summary");

        expect(summary).toHaveTextContent("N/A");
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
        expect(screen.getByText("Meetup")).toBeInTheDocument();
        expect(screen.getByText("Tech")).toBeInTheDocument();
        expect(screen.getByText("In person")).toBeInTheDocument();
        expect(screen.getByText("Montreal")).toBeInTheDocument();
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

        expect(
            await screen.findByRole("button", {
                name: /edit event/i
            })
        ).toBeInTheDocument();

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

        expect(
            await screen.findByRole("button", {
                name: /edit event/i
            })
        ).toBeInTheDocument();

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

        await user.click(
            await screen.findByRole("button", {
                name: /edit event/i
            })
        );

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

        await user.click(
            await screen.findByRole("button", {
                name: /delete event/i
            })
        );

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

        await user.click(
            await screen.findByRole("button", {
                name: /delete event/i
            })
        );

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

        await user.click(
            await screen.findByRole("button", {
                name: /delete event/i
            })
        );

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

    it("should show ended state for past event", async () => {
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

        expect(await screen.findByText(/^ended$/i)).toBeInTheDocument();
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

        const fullButton = await screen.findByRole("button", {
            name: /event full/i
        });

        expect(fullButton).toBeDisabled();

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

    /* =============================
       AUTH STATE
    ============================= */

    it("should show login prompt for guest on active event", async () => {
        mockAuthState = {
            user: null,
            loading: false
        };

        renderPage();

        expect(await screen.findByText(/login to join this event/i)).toBeInTheDocument();
    });

    it("should not show login prompt for authenticated user", async () => {
        renderPage();

        await screen.findByText("Test Event");

        expect(screen.queryByText(/login to join this event/i)).not.toBeInTheDocument();
    });
});
