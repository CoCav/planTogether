import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventsPage from "../../pages/EventsPage";

// ----------------------
// Mocks
// ----------------------

const mockGetAllEvents = vi.fn();
const mockGetFilteredEvents = vi.fn();
const mockGetMyEvents = vi.fn();

// API mocks
vi.mock("../../api/eventApi", () => ({
    getAllEvents: (...args) => mockGetAllEvents(...args),
    getFilteredEvents: (...args) => mockGetFilteredEvents(...args)
}));

vi.mock("../../api/eventMembershipApi", () => ({
    getMyEvents: () => mockGetMyEvents()
}));

// Auth mock
vi.mock("../../context/useAuth", () => ({
    useAuth: () => ({
        user: { id: 1 }
    })
}));

// Normalize mock
vi.mock("../../features/events/normalizeData.js", () => ({
    getNormalizedEvents: (response) => response?.data?.events || [],
    getMyEventsWithRole: () => []
}));

// UI mocks
vi.mock("../../components/ui/EventCard", () => ({
    default: ({ event }) => <div>{event.title}</div>
}));

vi.mock("../../components/ui/LoadingState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/EmptyState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

// ----------------------
// Helper
// ----------------------

function renderPage() {
    return render(
        <MemoryRouter>
            <EventsPage />
        </MemoryRouter>
    );
}

// ----------------------
// Tests
// ----------------------

describe("EventsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should display loading state initially", async () => {
        const mockResponse = {
            data: {
                events: [],
                page: 1,
                pageSize: 4,
                totalPages: 1,
                totalEvents: 0
            }
        };

        mockGetAllEvents.mockResolvedValue(mockResponse);
        mockGetFilteredEvents.mockResolvedValue(mockResponse);
        mockGetMyEvents.mockResolvedValue({ data: [] });

        renderPage();

        expect(screen.getByText(/loading events/i)).toBeInTheDocument();
    });

    it("should display events when API returns data", async () => {
        const mockResponse = {
            data: {
                events: [
                    { id: 1, title: "Event 1" },
                    { id: 2, title: "Event 2" }
                ],
                page: 1,
                pageSize: 4,
                totalPages: 1,
                totalEvents: 2
            }
        };

        mockGetAllEvents.mockResolvedValue(mockResponse);
        mockGetFilteredEvents.mockResolvedValue(mockResponse);
        mockGetMyEvents.mockResolvedValue({ data: [] });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Event 1")).toBeInTheDocument();
            expect(screen.getByText("Event 2")).toBeInTheDocument();
        });
    });

    it("should display empty state when no events", async () => {
        const mockResponse = {
            data: {
                events: [],
                page: 1,
                pageSize: 4,
                totalPages: 1,
                totalEvents: 0
            }
        };

        mockGetAllEvents.mockResolvedValue(mockResponse);
        mockGetFilteredEvents.mockResolvedValue(mockResponse);
        mockGetMyEvents.mockResolvedValue({ data: [] });

        renderPage();

        await waitFor(() => { expect(screen.getByText(/no events found/i)).toBeInTheDocument() });
    });

    it("should call events API on load", async () => {
        const mockResponse = {
            data: {
                events: [],
                page: 1,
                pageSize: 4,
                totalPages: 1,
                totalEvents: 0
            }
        };

        mockGetAllEvents.mockResolvedValue(mockResponse);
        mockGetFilteredEvents.mockResolvedValue(mockResponse);
        mockGetMyEvents.mockResolvedValue({ data: [] });

        renderPage();

        await waitFor(() => { expect(mockGetAllEvents.mock.calls.length + mockGetFilteredEvents.mock.calls.length).toBeGreaterThan(0) });
    });
});