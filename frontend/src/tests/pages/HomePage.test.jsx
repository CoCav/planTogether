import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import HomePage from "../../pages/HomePage";

import { EVENT_ROLES } from "../../features/shared/constants/eventRoles";

/* ==================================================
   HOME PAGE TESTS
   Tests homepage rendering and latest events preview

   Handles:
   - hero section rendering
   - feature section rendering
   - guest and authenticated actions
   - latest events loading state
   - latest events empty state
   - latest events rendering
   - event role forwarding
   - membership action integration
   - accessible homepage sections

   Notes:
   - mocks authenticated user state
   - mocks home events hook
   - mocks membership actions hook
   - mocks EventCard for page-level behavior focus
   - uses MemoryRouter for navigation links
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockLoadData = vi.fn();
const mockGetCurrentUserRoleByEvent = vi.fn();

const mockHandleJoinEvent = vi.fn();
const mockHandleLeaveEvent = vi.fn();

let mockAuthState = {
    user: null
};

let mockHomeEventsState = {
    events: [],
    isLoading: false,
    loadData: mockLoadData,
    getCurrentUserRoleByEvent: mockGetCurrentUserRoleByEvent
};

/* =============================
   MOCKS
============================= */

vi.mock("../../features/auth/hooks/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../features/events/hooks/useHomeEvents", () => ({
    default: () => mockHomeEventsState
}));

vi.mock("../../features/eventMemberships/hooks/useMembershipActions", () => ({
    default: () => ({
        handleJoinEvent: mockHandleJoinEvent,
        handleLeaveEvent: mockHandleLeaveEvent
    })
}));

vi.mock("../../components/events/EventCard", () => ({
    default: ({ event, role, onJoin, onLeave }) => (
        <article>
            <h3>{event.title}</h3>

            <span data-testid={`event-role-${event.id}`}>
                {role || "none"}
            </span>

            <button type="button" onClick={() => onJoin(event.id)}>
                Join
            </button>

            <button type="button" onClick={() => onLeave(event.id)}>
                Leave
            </button>
        </article>
    )
}));

/* =============================
   TEST HELPERS
============================= */

const renderPage = () =>
    render(
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
    );

describe("HomePage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        mockAuthState = {
            user: null
        };

        mockHomeEventsState = {
            events: [],
            isLoading: false,
            loadData: mockLoadData,
            getCurrentUserRoleByEvent: mockGetCurrentUserRoleByEvent
        };

        mockGetCurrentUserRoleByEvent.mockReturnValue(null);
    });

    /* =============================
       HERO SECTION
    ============================= */

    it("renders hero section and guest actions", () => {
        renderPage();

        expect(screen.getByText("Plan events together")).toBeInTheDocument();

        expect(screen.getByRole("heading", {
            level: 1,
            name: "Organize, join, and manage events with ease"
        })).toBeInTheDocument();

        expect(screen.getByText(/PlanTogether helps you create events/i)).toBeInTheDocument();

        expect(screen.getByRole("link", {
            name: "Browse Events"
        })).toHaveAttribute("href", "/events");

        expect(screen.getByRole("link", {
            name: "Create Account"
        })).toHaveAttribute("href", "/register");
    });

    it("renders authenticated create event action", () => {
        mockAuthState = {
            user: {
                userId: 1
            }
        };

        renderPage();

        expect(screen.getByRole("link", {
            name: "Create Event"
        })).toHaveAttribute("href", "/events/create");

        expect(screen.queryByRole("link", {
            name: "Create Account"
        })).not.toBeInTheDocument();
    });

    /* =============================
       FEATURES SECTION
    ============================= */

    it("renders feature cards", () => {
        renderPage();

        expect(screen.getByRole("heading", {
            level: 2,
            name: "Why PlanTogether?"
        })).toBeInTheDocument();

        expect(screen.getByText("Create and manage events")).toBeInTheDocument();
        expect(screen.getByText("Join communities easily")).toBeInTheDocument();
        expect(screen.getByText("Role-based collaboration")).toBeInTheDocument();
        expect(screen.getByText("Smart filtering")).toBeInTheDocument();
    });

    /* =============================
       DATA LOADING
    ============================= */

    it("loads home events on mount", () => {
        renderPage();

        expect(mockLoadData).toHaveBeenCalledTimes(1);
    });

    it("displays loading state while events are loading", () => {
        mockHomeEventsState = {
            ...mockHomeEventsState,
            isLoading: true
        };

        renderPage();

        expect(screen.getByText("Loading events...")).toBeInTheDocument();
    });

    /* =============================
       LATEST EVENTS
    ============================= */

    it("renders latest events section", () => {
        renderPage();

        expect(screen.getByRole("heading", {
            level: 2,
            name: "Latest Events"
        })).toBeInTheDocument();

        expect(screen.getByText("Discover the most recently created events on PlanTogether.")).toBeInTheDocument();
    });

    it("displays empty state when no events are returned", () => {
        renderPage();

        expect(screen.getByText("No events yet.")).toBeInTheDocument();
    });

    it("displays latest events when available", () => {
        mockHomeEventsState = {
            ...mockHomeEventsState,
            events: [
                {
                    id: 1,
                    title: "React Meetup"
                },
                {
                    id: 2,
                    title: "Design Workshop"
                }
            ]
        };

        renderPage();

        expect(screen.getByText("React Meetup")).toBeInTheDocument();
        expect(screen.getByText("Design Workshop")).toBeInTheDocument();
    });

    it("passes current user role to event cards", () => {
        mockHomeEventsState = {
            ...mockHomeEventsState,
            events: [
                {
                    id: 1,
                    title: "Joined Event"
                }
            ]
        };

        mockGetCurrentUserRoleByEvent.mockReturnValue(EVENT_ROLES.PARTICIPANT);

        renderPage();

        expect(mockGetCurrentUserRoleByEvent).toHaveBeenCalledWith(1);

        expect(screen.getByTestId("event-role-1")).toHaveTextContent(EVENT_ROLES.PARTICIPANT);
    });

    /* =============================
       MEMBERSHIP ACTIONS
    ============================= */

    it("passes join and leave actions to event cards", async () => {
        mockHomeEventsState = {
            ...mockHomeEventsState,
            events: [
                {
                    id: 1,
                    title: "Action Event"
                }
            ]
        };

        renderPage();

        screen.getByRole("button", { name: "Join" }).click();
        screen.getByRole("button", { name: "Leave" }).click();

        expect(mockHandleJoinEvent).toHaveBeenCalledWith(1);
        expect(mockHandleLeaveEvent).toHaveBeenCalledWith(1);
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("renders accessible homepage sections", () => {
        renderPage();

        expect(screen.getByLabelText("Organize, join, and manage events with ease")).toHaveClass("home-hero");

        expect(screen.getByLabelText("Why PlanTogether?")).toHaveClass("home-section");

        expect(screen.getByLabelText("Latest Events")).toHaveClass("home-section");
    });
});
