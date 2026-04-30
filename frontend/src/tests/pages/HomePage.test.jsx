import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../../pages/HomePage";

/* ==================================================
   HOME PAGE TESTS
   Tests landing page rendering and latest events preview
================================================== */

const mockGetAllEvents = vi.fn();
const mockGetMyEvents = vi.fn();

let mockAuthState = {
    user: null
};

vi.mock("../../context/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../api/eventApi", () => ({
    getAllEvents: (...args) => mockGetAllEvents(...args)
}));

vi.mock("../../api/eventMembershipApi", () => ({
    getMyEvents: (...args) => mockGetMyEvents(...args)
}));

vi.mock("../../features/events/normalizeData", () => ({
    getNormalizedEvents: (response) => response?.data?.events || [],
    getMyEventsWithRole: (response) => response?.data?.events || []
}));

vi.mock("../../components/events/EventCard", () => ({
    default: ({ event, role }) => (
        <div>
            <span>{event.title}</span>
            {role && <span>role: {role}</span>}
        </div>
    )
}));

const renderPage = () =>
    render(
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
    );

describe("HomePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockAuthState = {
            user: null
        };

        mockGetAllEvents.mockResolvedValue({
            data: {
                events: []
            }
        });

        mockGetMyEvents.mockResolvedValue({
            data: {
                events: []
            }
        });
    });

    it("renders hero section and public actions", () => {
        renderPage();

        expect(screen.getByText(/organize, join, and manage events with ease/i)).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /browse events/i })).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    });

    it("displays loading state while events are loading", () => {
        renderPage();

        expect(screen.getByText(/loading events/i)).toBeInTheDocument();
    });

    it("calls events API with latest events params", async () => {
        renderPage();

        await waitFor(() => {
            expect(mockGetAllEvents).toHaveBeenCalledWith({
                page: 1,
                pageSize: 4,
                sortBy: "createdAt",
                order: "desc"
            });
        });
    });

    it("displays events when API returns data", async () => {
        mockGetAllEvents.mockResolvedValue({
            data: {
                events: [
                    { id: 1, title: "Event 1" },
                    { id: 2, title: "Event 2" }
                ]
            }
        });

        renderPage();

        expect(await screen.findByText("Event 1")).toBeInTheDocument();
        expect(screen.getByText("Event 2")).toBeInTheDocument();
    });

    it("displays empty state when no events are returned", async () => {
        renderPage();

        expect(await screen.findByText(/no events yet/i)).toBeInTheDocument();
    });

    it("displays error message when API fails", async () => {
        mockGetAllEvents.mockRejectedValue(new Error("API error"));

        renderPage();

        expect(await screen.findByText(/failed to load events/i)).toBeInTheDocument();
    });

    it("shows create event action when user is authenticated", () => {
        mockAuthState = {
            user: { userId: 1 }
        };

        renderPage();

        expect(screen.getByRole("button", { name: /create event/i })).toBeInTheDocument();

        expect(screen.queryByRole("button", { name: /create account/i })).not.toBeInTheDocument();
    });

    it("loads user memberships and passes role to event cards", async () => {
        mockAuthState = {
            user: { userId: 1 }
        };

        mockGetAllEvents.mockResolvedValue({
            data: {
                events: [{ id: 1, title: "Joined Event" }]
            }
        });

        mockGetMyEvents.mockResolvedValue({
            data: {
                events: [
                    {
                        id: 1,
                        role: "participant"
                    }
                ]
            }
        });

        renderPage();

        expect(await screen.findByText("Joined Event")).toBeInTheDocument();
        expect(screen.getByText(/role: participant/i)).toBeInTheDocument();
    });

    it("does not fetch memberships when user is not authenticated", async () => {
        renderPage();

        await waitFor(() => {
            expect(mockGetAllEvents).toHaveBeenCalled();
        });

        expect(mockGetMyEvents).not.toHaveBeenCalled();
    });
});
