import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../../pages/HomePage";

// ----------------------
// Mocks
// ----------------------

const mockGetAllEvents = vi.fn();
const mockGetMyEvents = vi.fn();

let mockAuthState = {
    user: null
};

// Auth mock (dynamic)
vi.mock("../../context/useAuth", () => ({
    useAuth: () => mockAuthState
}));

// API mocks
vi.mock("../../api/eventApi", () => ({
    getAllEvents: (...args) => mockGetAllEvents(...args)
}));

vi.mock("../../api/eventMembershipApi", () => ({
    getMyEvents: (...args) => mockGetMyEvents(...args)
}));

// Normalize mock
vi.mock("../../features/events/normalizeData", () => ({
    getNormalizedEvents: (res) => res?.data?.events || [],
    getMyEventsWithRole: (res) => res?.data?.events || []
}));

// UI mocks
vi.mock("../../components/ui/EventCard", () => ({
    default: ({ event, role }) => (
        <div>
            <span>{event.title}</span>
            {role && <span>role: {role}</span>}
        </div>
    )
}));

vi.mock("../../components/ui/LoadingState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/EmptyState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/Card", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/Button", () => ({
    default: ({ children }) => <button>{children}</button>
}));

vi.mock("../../components/ui/Alert", () => ({
    default: ({ children }) => <div>{children}</div>
}));

// ----------------------
// Helper
// ----------------------

function renderPage() {
    return render(
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
    );
}

// ----------------------
// Tests
// ----------------------

describe("HomePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthState = { user: null };
    });

    it("should render hero section and main actions", () => {
        mockGetAllEvents.mockResolvedValue({ data: { events: [] } });

        renderPage();

        expect(screen.getByText(/organize, join, and manage events/i)).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /browse events/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    });

    it("should display loading state", () => {
        mockGetAllEvents.mockResolvedValue({ data: { events: [] } });

        renderPage();

        expect(screen.getByText(/loading events/i)).toBeInTheDocument();
    });

    it("should display events when API returns data", async () => {
        mockGetAllEvents.mockResolvedValue({
            data: {
                events: [
                    { id: 1, title: "Event 1" },
                    { id: 2, title: "Event 2" }
                ]
            }
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Event 1")).toBeInTheDocument();
            expect(screen.getByText("Event 2")).toBeInTheDocument();
        });
    });

    it("should display empty state when no events", async () => {
        mockGetAllEvents.mockResolvedValue({
            data: { events: [] }
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/no events yet/i)).toBeInTheDocument();
        });
    });

    it("should display error message when API fails", async () => {
        mockGetAllEvents.mockRejectedValue(new Error("API error"));

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/failed to load events/i)).toBeInTheDocument();
        });
    });

    it("should show create event action when user is authenticated", () => {
        mockAuthState = {
            user: { id: 1 }
        };

        mockGetAllEvents.mockResolvedValue({ data: { events: [] } });
        mockGetMyEvents.mockResolvedValue({ data: { events: [] } });

        renderPage();

        expect(screen.getByRole("button", { name: /create event/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /create account/i })).not.toBeInTheDocument();
    });

    it("should load user memberships and pass role to event cards", async () => {
        mockAuthState = {
            user: { id: 1 }
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

    it("should display only the first 4 events", async () => {
        mockGetAllEvents.mockResolvedValue({
            data: {
                events: [
                    { id: 1, title: "Event 1" },
                    { id: 2, title: "Event 2" },
                    { id: 3, title: "Event 3" },
                    { id: 4, title: "Event 4" },
                    { id: 5, title: "Event 5" }
                ]
            }
        });

        renderPage();

        expect(await screen.findByText("Event 1")).toBeInTheDocument();
        expect(screen.getByText("Event 4")).toBeInTheDocument();
        expect(screen.queryByText("Event 5")).not.toBeInTheDocument();
    });
});