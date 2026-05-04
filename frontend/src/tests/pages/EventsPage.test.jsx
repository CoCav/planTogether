import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import EventsPage from "../../pages/EventsPage";

/* ==================================================
   EVENTS PAGE TESTS
   Tests event listing, filters, views, roles and pagination
================================================== */

const mockGetAllEvents = vi.fn();
const mockGetFilteredEvents = vi.fn();
const mockGetMyEvents = vi.fn();
const mockGetMyEventsWithRole = vi.fn(() => []);

let mockAuthState = {
    user: { userId: 1 }
};

vi.mock("../../api/eventApi", () => ({
    getAllEvents: (...args) => mockGetAllEvents(...args),
    getFilteredEvents: (...args) => mockGetFilteredEvents(...args)
}));

vi.mock("../../api/eventMembershipApi", () => ({
    getMyEvents: (...args) => mockGetMyEvents(...args)
}));

vi.mock("../../context/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../features/events/normalizeData.js", () => ({
    getNormalizedEvents: (response) => response?.data?.events || [],
    getMyEventsWithRole: (...args) => mockGetMyEventsWithRole(...args)
}));

vi.mock("../../components/events/EventCard", () => ({
    default: ({ event, role }) => (
        <div>
            <span>{event.title}</span>
            <span data-testid={`event-role-${event.id}`}>{role || "none"}</span>
        </div>
    )
}));

const createResponse = ({
    events = [],
    page = 1,
    pageSize = 4,
    totalPages = 1,
    totalEvents = events.length
} = {}) => ({
    data: {
        events,
        page,
        pageSize,
        totalPages,
        totalEvents
    }
});

const LocationDisplay = () => {
    const location = useLocation();

    return <span data-testid="location-search">{location.search}</span>;
};

const renderPage = (initialEntry = "/events") =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <EventsPage />
            <LocationDisplay />
        </MemoryRouter>
    );

describe("EventsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockAuthState = {
            user: { userId: 1 }
        };

        mockGetAllEvents.mockResolvedValue(createResponse());
        mockGetFilteredEvents.mockResolvedValue(createResponse());
        mockGetMyEvents.mockResolvedValue({ data: { events: [] } });
        mockGetMyEventsWithRole.mockReturnValue([]);
    });

    it("displays loading state initially", () => {
        renderPage();

        expect(screen.getByText(/loading events/i)).toBeInTheDocument();
    });

    it("displays events when API returns data", async () => {
        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [
                    { id: 1, title: "Event 1", creatorId: 2 },
                    { id: 2, title: "Event 2", creatorId: 2 }
                ],
                totalEvents: 2
            })
        );

        renderPage();

        expect(await screen.findByText("Event 1")).toBeInTheDocument();
        expect(screen.getByText("Event 2")).toBeInTheDocument();
        expect(screen.getByText("(2)")).toBeInTheDocument();
    });

    it("displays empty state when no events are returned", async () => {
        renderPage();

        expect(await screen.findByText(/no events found/i)).toBeInTheDocument();
    });

    it("calls events API on load with default params", async () => {
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

    it("switches to upcoming view", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [{ id: 3, title: "Upcoming Event", creatorId: 2 }],
                totalEvents: 1
            })
        );

        renderPage();

        expect(await screen.findByText("Upcoming Event")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /upcoming/i }));

        await waitFor(() => {
            expect(mockGetAllEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: "upcoming",
                    page: 1,
                    pageSize: 4
                })
            );
        });
    });

    it("switches to archives view", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [{ id: 4, title: "Past Event", creatorId: 2 }],
                totalEvents: 1
            })
        );

        renderPage();

        expect(await screen.findByText("Past Event")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /archives/i }));

        await waitFor(() => {
            expect(mockGetAllEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: "past",
                    page: 1,
                    pageSize: 4
                })
            );
        });
    });

    it("applies filters using filtered API", async () => {
        const user = userEvent.setup();

        mockGetFilteredEvents.mockResolvedValue(
            createResponse({
                events: [{ id: 5, title: "Filtered Event", creatorId: 2 }],
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

    it("resets filters", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no events found/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByPlaceholderText(/search events/i), "music");
        await user.click(screen.getByRole("button", { name: /reset/i }));

        await waitFor(() => {
            expect(mockGetAllEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: "",
                    page: 1,
                    pageSize: 4
                })
            );
        });
    });

    it("applies Today quick filter", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no events found/i);

        await user.click(screen.getByRole("button", { name: /today/i }));

        await waitFor(() => {
            expect(mockGetFilteredEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    date: expect.any(String),
                    page: 1,
                    pageSize: 4
                })
            );
        });
    });

    it("applies This Weekend quick filter", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no events found/i);

        await user.click(screen.getByRole("button", { name: /this weekend/i }));

        await waitFor(() => {
            expect(mockGetFilteredEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    startDate: expect.any(String),
                    endDate: expect.any(String),
                    page: 1,
                    pageSize: 4
                })
            );
        });
    });

    it("goes to next page", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [{ id: 1, title: "Event Page 1", creatorId: 2 }],
                page: 1,
                totalPages: 2,
                totalEvents: 5
            })
        );

        renderPage();

        expect(await screen.findByText("Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await waitFor(() => {
            expect(mockGetAllEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 2,
                    pageSize: 4
                })
            );
        });
    });

    it("keeps filters when moving to next page", async () => {
        const user = userEvent.setup();

        mockGetFilteredEvents
            .mockResolvedValueOnce(
                createResponse({
                    events: [{ id: 1, title: "Filtered Page 1", creatorId: 2 }],
                    page: 1,
                    totalPages: 2,
                    totalEvents: 5
                })
            )
            .mockResolvedValueOnce(
                createResponse({
                    events: [{ id: 2, title: "Filtered Page 2", creatorId: 2 }],
                    page: 2,
                    totalPages: 2,
                    totalEvents: 5
                })
            );

        renderPage();

        await screen.findByText(/no events found/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByPlaceholderText(/search events/i), "music");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        expect(await screen.findByText("Filtered Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await waitFor(() => {
            expect(mockGetFilteredEvents).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    search: "music",
                    page: 2,
                    pageSize: 4
                })
            );
        });

        expect(await screen.findByText("Filtered Page 2")).toBeInTheDocument();
    });

    it("loads events from URL query params", async () => {
        renderPage("/events?view=upcoming&creator=Luffy&page=2");

        await waitFor(() => {
            expect(mockGetFilteredEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    creator: "Luffy",
                    status: "upcoming",
                    page: 2,
                    pageSize: 4
                })
            );
        });
    });

    it("updates URL when applying filters", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no events found/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByPlaceholderText(/search events/i), "music");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("search=music");
        });
    });

    it("updates URL when switching view", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no events found/i);

        await user.click(screen.getByRole("button", { name: /upcoming/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("view=upcoming");
        });
    });

    it("updates URL when moving to next page", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [{ id: 1, title: "Event Page 1", creatorId: 2 }],
                page: 1,
                totalPages: 2,
                totalEvents: 5
            })
        );

        renderPage();

        expect(await screen.findByText("Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("page=2");
        });
    });

    it("shows login alert when user is not authenticated", async () => {
        mockAuthState = {
            user: null
        };

        renderPage();

        expect(await screen.findByText(/login to join events/i)).toBeInTheDocument();
    });

    it("passes organizer role to EventCard when current user is event creator", async () => {
        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [
                    {
                        id: 10,
                        title: "Created Event",
                        creatorId: 1
                    }
                ],
                totalEvents: 1
            })
        );

        renderPage();

        expect(await screen.findByText("Created Event")).toBeInTheDocument();
        expect(screen.getByTestId("event-role-10")).toHaveTextContent("organizer");
    });

    it("passes membership role to EventCard from current user events", async () => {
        mockGetAllEvents.mockResolvedValue(
            createResponse({
                events: [
                    {
                        id: 20,
                        title: "Joined Event",
                        creatorId: 99
                    }
                ],
                totalEvents: 1
            })
        );

        mockGetMyEventsWithRole.mockReturnValue([
            {
                id: 20,
                role: "participant"
            }
        ]);

        renderPage();

        expect(await screen.findByText("Joined Event")).toBeInTheDocument();
        expect(screen.getByTestId("event-role-20")).toHaveTextContent("participant");
    });
});
