import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import EventsPage from "../../pages/EventsPage";

const mockGetAllEvents = vi.fn();
const mockGetFilteredEvents = vi.fn();
const mockGetMyEvents = vi.fn();

vi.mock("../../api/eventApi", () => ({
    getAllEvents: (...args) => mockGetAllEvents(...args),
    getFilteredEvents: (...args) => mockGetFilteredEvents(...args)
}));

vi.mock("../../api/eventMembershipApi", () => ({
    getMyEvents: (...args) => mockGetMyEvents(...args)
}));

vi.mock("../../context/useAuth", () => ({
    useAuth: () => ({
        user: { id: 1 }
    })
}));

vi.mock("../../features/events/normalizeData.js", () => ({
    getNormalizedEvents: (response) => response?.data?.events || [],
    getMyEventsWithRole: () => []
}));

vi.mock("../../components/ui/EventCard", () => ({
    default: ({ event }) => <div>{event.title}</div>
}));

vi.mock("../../components/ui/LoadingState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../../components/ui/EmptyState", () => ({
    default: ({ children }) => <div>{children}</div>
}));

const createResponse = ({ events = [], page = 1,  pageSize = 4, totalPages = 1, totalEvents = events.length } = {}) => ({
    data: {
        events,
        page,
        pageSize,
        totalPages,
        totalEvents
    }
});

function renderPage() {
    return render(
        <MemoryRouter>
            <EventsPage />
        </MemoryRouter>
    );
}

describe("EventsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetAllEvents.mockResolvedValue(createResponse());
        mockGetFilteredEvents.mockResolvedValue(createResponse());
        mockGetMyEvents.mockResolvedValue({ data: { events: [] } });
    });

    it("should display loading state initially", () => {
        renderPage();

        expect(screen.getByText(/loading events/i)).toBeInTheDocument();
    });

    it("should display events when API returns data", async () => {
        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [
                    { id: 1, title: "Event 1" },
                    { id: 2, title: "Event 2" }
                ],
                totalEvents: 2
            })
        );

        renderPage();

        expect(await screen.findByText("Event 1")).toBeInTheDocument();
        expect(screen.getByText("Event 2")).toBeInTheDocument();
        expect(screen.getByText("(2)")).toBeInTheDocument();
    });

    it("should display empty state when no events", async () => {
        renderPage();

        expect(await screen.findByText(/no events found/i)).toBeInTheDocument();
    });

    it("should call events API on load with default params", async () => {
        renderPage();

        await waitFor(() => {
            expect(mockGetAllEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    pageSize: 4
                })
            );
        });
    });

    it("should switch to upcoming view", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [{ id: 3, title: "Upcoming Event" }],
                totalEvents: 1
            })
        );

        renderPage();

        await screen.findByText("Upcoming Event");

        await user.click(screen.getByRole("button", { name: /upcoming/i }));

        await waitFor(() => {
            expect(mockGetAllEvents).toHaveBeenCalled();
        });

        expect(await screen.findByText("Upcoming Event")).toBeInTheDocument();
    });

    it("should switch to archives view", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [{ id: 4, title: "Past Event" }],
                totalEvents: 1
            })
        );

        renderPage();

        await screen.findByText("Past Event");

        await user.click(screen.getByRole("button", { name: /archives/i }));

        await waitFor(() => {
            expect(mockGetAllEvents).toHaveBeenCalled();
        });

        expect(await screen.findByText("Past Event")).toBeInTheDocument();
    });

    it("should apply filters using filtered API", async () => {
        const user = userEvent.setup();

        mockGetFilteredEvents.mockResolvedValue(
            createResponse({
                events: [{ id: 5, title: "Filtered Event" }],
                totalEvents: 1
            })
        );

        renderPage();

        await screen.findByText(/no events found/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByPlaceholderText(/search events/i), "music");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await waitFor(() => {
            expect(mockGetFilteredEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: "music",
                    page: 1,
                    pageSize: 4
                })
            );
        });

        expect(await screen.findByText("Filtered Event")).toBeInTheDocument();
    });

    it("should go to next page", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [{ id: 1, title: "Event Page 1" }],
                page: 1,
                totalPages: 2,
                totalEvents: 5
            })
        );

        renderPage();

        expect(await screen.findByText("Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await waitFor(() => {
            expect(mockGetAllEvents).toHaveBeenCalled();
        });
    });
});